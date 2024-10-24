import React, { useEffect, useMemo, useRef, useState } from 'react';
import { get as getValueOfPath } from 'object-path-immutable';
import * as yup from 'yup';
import { getMutableSingletonInstance } from '../utils/SingletonStore';
import Publisher, { usePublishedState } from '../utils/Publisher';

export type Validator = ((flatFieldName: string, value: any, formData: Object) => string) | yup.AnySchema;
export type ValidatorsMap = Record<string, Validator>;
type TouchedFields = Record<string, boolean>;

const getInitialValues = () => ({
    localErrors: {} as Record<string, string>,
    serverErrors: {} as Record<string, string>,
    touchedFields: undefined as TouchedFields | undefined,
    registeredValidators: {} as ValidatorsMap,
    publisher: new Publisher(),
});

const useValidation = <TValidatorsMap extends ValidatorsMap>(formData: Record<string, any>, options: Partial<UseValidationOptions> = defaultOptions, reuseId?: object): ValidatorContextValue<TValidatorsMap> => {
    type TValidatorKeys = keyof TValidatorsMap & string;
    const localId = useRef<any>({});
    let mutableSingletonValues = getMutableSingletonInstance(reuseId || localId.current, getInitialValues);

    const [localErrors, setLocalErrors] = usePublishedState<typeof mutableSingletonValues.localErrors>('localErrors', mutableSingletonValues);
    const [serverErrors, _setServerErrors] = usePublishedState<typeof mutableSingletonValues.serverErrors>('serverErrors', mutableSingletonValues);
    const [touchedFields, setTouchedFields] = usePublishedState<typeof mutableSingletonValues.touchedFields>('touchedFields', mutableSingletonValues);
    const registeredValidatorsRef = mutableSingletonValues.registeredValidators;

    useEffect(() => {
        // clean up singleton value on unmount when using localId
        return () => {
            localId.current = null;
        }
    }, [])

    useEffect(() => {
        validateAll();
    }, [formData]);

    const validateAll = () => {
        const allKeys = Object.keys(registeredValidatorsRef);
        validateMany(allKeys);
    };

    const validateMany = (validationKeys: Array<string>) => {
            setLocalErrors((oldErrors: Record<string, string>) => {
                const newErrors = validationKeys.reduce((accumulator: Record<string, string>, validationKey) => {
                    accumulator[validationKey] = validate(validationKey, undefined);
                    return accumulator;
                }, {});

                if (JSON.stringify(newErrors) !== JSON.stringify(oldErrors)) {
                    return newErrors;
                }

                return oldErrors;
            }
        );
    };

    const isValid = useMemo(() => {
        return Object.keys(registeredValidatorsRef).every((key) => !localErrors?.[key]);
    }, [localErrors]);

    const errors = useMemo(() => {
        const allErrors = {
            ...localErrors,
            ...serverErrors,
        };
        if (!touchedFields) {
            return allErrors;
        }

        const visibleErrors = Object.entries(allErrors).reduce(
            (accumulator: Record<string, string>, [field, error]) => {
                const newError = (!!touchedFields[field] ? localErrors?.[field] : serverErrors?.[field]);
                if (newError) {
                    accumulator[field] = newError;
                }
                return accumulator;
            },
            {}
        );

        return visibleErrors;
    }, [localErrors, serverErrors, touchedFields]);

    function registerValidators(validators: ValidatorsMap, initialTouchedState: boolean | undefined = undefined) {
        Object.assign(registeredValidatorsRef, validators);

        if (initialTouchedState !== undefined) {
            const fieldsNotInitialized = Object.keys(validators).filter((key) => touchedFields?.[key] === undefined);
            setTouched(fieldsNotInitialized, initialTouchedState)
        }

        validateAll();

        return () => {
            const keysToRemove = Object.keys(validators);

            keysToRemove.forEach((key) => {
                delete registeredValidatorsRef[key];
            });
            validateAll();
        };
    }

    function validate(flatFieldName: string, value?: any): string {
        const validator = registeredValidatorsRef[flatFieldName];
        if (!validator) {
            return '';
        }
        const valueToValidate = value === undefined ? getFormValue(flatFieldName) : value;

        if (typeof validator === 'object') {
            try {
                validator.validateSync(valueToValidate, {
                    context: formData,
                });
                return '';
            } catch (err: any) {
                return err.errors[0];
            }
        }

        return validator(flatFieldName, valueToValidate, formData);
    }

    function getFormValue(flatFieldName: TValidatorKeys) {
        return getValueOfPath(formData, flatFieldName);
    }

    const setTouched = (fields: Array<keyof TValidatorsMap> | 'ALL_FIELDS', isTouched: boolean) => {
        let fieldsToTouch: Array<keyof TValidatorsMap> = [];
        if (fields === 'ALL_FIELDS') {
            fieldsToTouch = Object.keys(registeredValidatorsRef);
            if (fieldsToTouch.length === 0) {
                console.warn('useValidation: not validation registered to touch');
            }
        } else {
            fieldsToTouch = fields;
        }

        setTouchedFields((oldTouchFields) => {
            const newTouchedFields = { ...oldTouchFields };
            fieldsToTouch.forEach((field) => {
                newTouchedFields[field as string] = isTouched;
            });

            return newTouchedFields;
        });
    };

    const setServerErrors = (errors: Record<string, string>) => {
        const newErrors = errors || {};
        _setServerErrors(newErrors);

        setTouched(Object.keys(newErrors), false);
    };

    return withBasePath<TValidatorsMap>({
        errors: errors as Record<keyof TValidatorsMap, string>,
        setServerErrors,
        setTouched,
        getFormValue,
        registerValidators,
        validate,
        isValid,
    }, options.basePath);
};

const stripPrefix = (prefix: string, fullString: string) => {
    if (fullString.startsWith(prefix)) {
        return fullString.replace(prefix, '');
    }

    return fullString;
}

const addPrefix = (prefix: string, stringPart: string) => {
    return `${prefix}${stringPart}`;
}

const withBasePath = <TValidatorsMap extends ValidatorsMap>(result: ReturnType<typeof useValidation<TValidatorsMap>>, basePath?: string): ReturnType<typeof useValidation<TValidatorsMap>> => {
    if(!basePath) {
        return result;
    }
    const baseWithDot = `${basePath}.`
    const errs = Object.fromEntries(Object.entries(result.errors)
        .filter(([key,]) => key.startsWith(baseWithDot))
        .map(([key, value]) => {
            return [stripPrefix(baseWithDot, key), value]
        })
    );
    return {
        errors: errs as Record<keyof TValidatorsMap, string>,
        setServerErrors: result.setServerErrors,
        setTouched: (fields, isTouched) => {
            if (fields === "ALL_FIELDS") {
                return result.setTouched(fields, isTouched);
            }

            return result.setTouched(fields.map((field) => addPrefix(baseWithDot, field)), isTouched);
        },
        getFormValue: (flatPath) => result.getFormValue(addPrefix(baseWithDot, flatPath)),
        registerValidators: (validators, initialTouchedState) => {
            const newValidators = Object.fromEntries(Object.entries(validators).map(([key, value]) => [addPrefix(baseWithDot, key), value]));

            return result.registerValidators(newValidators as TValidatorsMap, initialTouchedState);
        },
        validate: (flatFieldName, value?) => result.validate(addPrefix(baseWithDot, flatFieldName), value),
        isValid: result.isValid,
    }
}

export interface ValidatorContextValue<TValidatorsMap extends ValidatorsMap> {
    errors: Partial<Record<keyof TValidatorsMap & string, string>>;
    setServerErrors: (errors: Record<string, string>) => void;
    setTouched: (fields: Array<keyof TValidatorsMap & string> | 'ALL_FIELDS', isTouched: boolean) => void;
    getFormValue: (flatPath: keyof TValidatorsMap & string) => any;
    registerValidators: (validators: TValidatorsMap, initialTouchedState?: boolean) => () => void;
    validate: (flatPath: keyof TValidatorsMap & string, valueToValidate?: any) => string;
    isValid: boolean;
}

export interface UseValidationOptions {
    basePath: string;
}

const defaultOptions: UseValidationOptions = {
    basePath: ''
}

export default useValidation;

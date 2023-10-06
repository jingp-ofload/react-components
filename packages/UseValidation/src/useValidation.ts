import React, { useEffect, useMemo, useRef, useState } from 'react';
import { get as getValueOfPath } from 'object-path-immutable';
import * as yup from 'yup';

export type Validator = ((flatFieldName: string, value: any, formData: Object) => string) | yup.AnySchema;
type ValidatorsMap = Record<string, Validator>;
type TouchedFields = Record<string, boolean>;

const useValidation = (formData: Record<string, any>, options: Partial<UseValidationOptions> = defaultOptions): ValidatorContextValue => {
    const { basePath = '' } = options;
    const initialErrors: Record<string, string> = {};

    const [localErrors, setLocalErrors] = useState(initialErrors);
    const [serverErrors, _setServerErrors] = useState(initialErrors);

    const [touchedFields, setTouchFields] = useState<TouchedFields | undefined>();

    const registeredValidatorsRef = useRef<ValidatorsMap>({});

    useEffect(() => {
        validateAll();
    }, [formData]);

    const validateAll = () => {
        const allKeys = Object.keys(registeredValidatorsRef.current);
        validateMany(allKeys);
    };

    const validateMany = (validationKeys: Array<string>) => {
        setLocalErrors((oldErrors) => {
            const newErrors = validationKeys.reduce((accumulator: Record<string, string>, validationKey) => {
                accumulator[validationKey] = validate(validationKey);
                return accumulator;
            }, {});

            if (JSON.stringify(newErrors) !== JSON.stringify(oldErrors)) {
                return newErrors;
            }

            return oldErrors;
        });
    };

    const isValid = useMemo(() => {
        return Object.keys(registeredValidatorsRef.current).every((key) => !localErrors?.[key]);
    }, [localErrors]);

    const errors = useMemo(() => {
        if (!touchedFields) {
            return {
                ...localErrors,
                ...serverErrors,
            };
        }

        const visibleLocalErrors = Object.entries(touchedFields).reduce(
            (accumulator: Record<string, string>, [field, isTouched]) => {
                accumulator[field] = (isTouched ? localErrors[field] : serverErrors?.[field]) || '';

                return accumulator;
            },
            {}
        );

        return visibleLocalErrors;
    }, [localErrors, serverErrors, touchedFields]);

    function registerValidators(validators: ValidatorsMap) {
        Object.assign(registeredValidatorsRef.current, validators);
        validateAll();

        return () => {
            const keysToRemove = Object.keys(validators);

            keysToRemove.forEach((key) => {
                delete registeredValidatorsRef.current[key];
            });
            validateAll();
        };
    }

    function validate(flatFieldName: string, value?: any): string {
        const validator = registeredValidatorsRef.current[flatFieldName];
        if (!validator) {
            return '';
        }
        const valueToValidate = value === undefined ? getFormValue(flatFieldName) : value;

        if (typeof validator === 'object') {
            try {
                validator.validateSync(valueToValidate);
                return '';
            } catch (err: any) {
                return err.errors[0];
            }
        }

        return validator(flatFieldName, valueToValidate, formData);
    }

    function getFormValue(flatFieldName: string) {
        return getValueOfPath(formData, `${basePath}.${flatFieldName}`);
    }

    /**
     * @param { Array<string> | 'ALL_FIELDS' }  fields
     * @param { boolean }  isTouched
     */
    const setTouched = (fields: Array<string> | 'ALL_FIELDS', isTouched: boolean) => {
        let fieldsToTouch: Array<string> = [];
        if (fields === 'ALL_FIELDS') {
            fieldsToTouch = Object.keys(registeredValidatorsRef.current);
            if (fieldsToTouch.length === 0) {
                console.warn('useValidation: not validation registered to touch');
            }
        } else {
            fieldsToTouch = fields;
        }

        setTouchFields((oldTouchFields) => {
            const newTouchedFields = { ...oldTouchFields };
            fieldsToTouch.forEach((field) => {
                newTouchedFields[field] = isTouched;
            });

            return newTouchedFields;
        });
    };

    const setServerErrors = (errors: Record<string, string>) => {
        const newErrors = errors || {};
        _setServerErrors(newErrors);

        setTouched(Object.keys(newErrors), false);
    };

    return {
        errors,
        setServerErrors,
        setTouched,
        getFormValue,
        registerValidators,
        validate,
        isValid,
    };
};

export interface ValidatorContextValue {
    errors: Record<string, string>;
    setServerErrors: (errors: Record<string, string>) => void;
    setTouched: (fields: Array<string> | 'ALL_FIELDS', isTouched: boolean) => void;
    getFormValue: (flatPath: string) => any;
    registerValidators: (validators: ValidatorsMap) => () => void;
    validate: (flatPath: string, valueToValidate?: any) => string;
    isValid: boolean;
}

export interface UseValidationOptions {
    basePath: string;
}

const defaultOptions: UseValidationOptions = {
    basePath: ''
}

export default useValidation;

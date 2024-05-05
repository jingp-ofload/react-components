import { useEffect, useMemo, useRef, useState } from "react";
import * as immutable from 'object-path-immutable';
import useValidation, { Validator, ValidatorsMap } from "../validation/useValidation";
import Publisher, { usePublishedState } from "../utils/Publisher";
import { getMutableSingletonInstance } from "../utils/SingletonStore";
import { deepFreeze } from "../utils/deepFreeze";

function getFieldValue(formData: any, baseDottedPath: string) {
    return immutable.get(formData, baseDottedPath)
}

const getInitialValues = <T extends object>(initialData: T) => ({
    formData: deepFreeze({...initialData}),
    publisher: new Publisher(),
})

export const useFormData = <TFormData extends object>(initialData: any, baseDottedPath?: string, reuseId?: object) => {
    const localId = useRef<any>({});
    const savedValues = getMutableSingletonInstance(reuseId || localId.current, () => getInitialValues(initialData));
    const [fullFormData, setFormData] = usePublishedState('formData', savedValues)

    useEffect(() => {
        // clean up singleton value on unmount when using localId
        return () => {
            localId.current = null;
        }
    }, []);

    const currentFormData = useMemo(() => {
        if (!baseDottedPath) {
            return fullFormData as TFormData;
        }

        return getFieldValue(fullFormData, baseDottedPath);
    }, [baseDottedPath, fullFormData]);

    const setFieldValue = (relativeDottedPath: string, valueOrCallback:any) => {
        // const dottedPath = baseDottedPath ? `${baseDottedPath}.${relativeDottedPath}` : relativeDottedPath;
        const dottedPath = [baseDottedPath, relativeDottedPath].filter((pathPart) => !!pathPart).join('.');
        let value = valueOrCallback;
        if (typeof valueOrCallback === 'function') {
            value = valueOrCallback(immutable.get(savedValues.formData, dottedPath));
        }

        const newFormData = immutable.set(savedValues.formData, dottedPath, value);
        setFormData(newFormData);
    }

    const resetForm = (newFormData?: TFormData) => {
        setFormData({...(newFormData || initialData)})
    }

    return {
        formData: (baseDottedPath ? currentFormData : fullFormData) as TFormData,
        setFieldValue,
        resetForm: (baseDottedPath ? () => { throw Error("Can't reset form when using partial form data")} : resetForm),
    };
};

/**
 * @deprecated Use [CreateSharedFormDataHookWithCleanUp] so that client can clean-up
 * memory after it is no longer needed.
 */
export const CreateSharedFormDataHook = (initialData: any) => {
    const reuseId = {};

    return (<TFormData extends object>(baseDottedPath?: string) => useFormData<TFormData>(initialData, baseDottedPath, reuseId));
}

/**
 * @deprecated Use [CreateSharedFormValidationHookWithCleanUp] so that client can clean-up
 * memory after it is no longer needed.
 */
export const CreateSharedFormValidationHook = <TFormData extends object>(useFormDataHook: ReturnType<typeof CreateSharedFormDataHook>) => {
    const reuseId = {};

    return <TValidatorsMap extends ValidatorsMap>(dottedBasePath?: string) => {
        const { formData } = useFormDataHook<TFormData>();

        return useValidation<TValidatorsMap>(formData as Record<string, any>, { basePath: dottedBasePath }, reuseId)
    }
}

/**
 * @returns a hook and cleanUp function. cleanUp function can be called when
 * root component is unmounted to allow garbage collection of form data.
 */
export const CreateSharedFormDataHookWithCleanUp = (initialData: any) => {
    let reuseId: object | undefined = {};

    const hook = (<TFormData extends object>(baseDottedPath?: string) => {
        if(!reuseId) {
            reuseId = {};
        }

        return useFormData<TFormData>(initialData, baseDottedPath, reuseId)
    });

    const cleanUp = () => {
        reuseId = undefined;
    }

    return {hook, cleanUp}
}


/**
 * @returns a hook and cleanUp function. cleanUp function can be called when
 * root component is unmounted to allow garbage collection of validation data.
 */
export const CreateSharedFormValidationHookWithCleanUp = <TFormData extends object>(useFormDataHook: ReturnType<typeof CreateSharedFormDataHookWithCleanUp>['hook']) => {
    let reuseId: object | undefined = {};

    const hook = <TValidatorsMap extends ValidatorsMap>(dottedBasePath?: string) => {
        const { formData } = useFormDataHook<TFormData>();
        if(!reuseId) {
            reuseId = {};
        }

        return useValidation<TValidatorsMap>(formData as Record<string, any>, { basePath: dottedBasePath }, reuseId)
    }

    const cleanUp = () => {
        reuseId = undefined;
    }

    return {hook, cleanUp}
}

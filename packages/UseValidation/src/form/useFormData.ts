import { useEffect, useMemo, useRef, useState } from "react";
import * as immutable from 'object-path-immutable';
import useValidation from "../validation/useValidation";
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
    const localId = useRef({});
    const savedValues = getMutableSingletonInstance(reuseId || localId.current, () => getInitialValues(initialData));
    const [fullFormData, setFormData] = usePublishedState('formData', savedValues)

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

    const resetForm = () => {
        setFormData({...initialData})
    }

    return {
        formData: (baseDottedPath ? currentFormData : fullFormData) as TFormData,
        setFieldValue,
        resetForm: (baseDottedPath ? () => { throw Error("Can't reset form when using partial form data")} : resetForm),
    };
};

export const CreateSharedFormDataHook = (initialData: any) => {
    const reuseId = {};

    return (<TFormData extends object>(baseDottedPath?: string) => useFormData<TFormData>(initialData, baseDottedPath, reuseId));
}

export const CreateSharedFormValidationHook = <TFormData extends object>(useFormDataHook: ReturnType<typeof CreateSharedFormDataHook>) => {
    const reuseId = {};

    return (dottedBasePath?: string) => {
        const { formData } = useFormDataHook<TFormData>();

        return useValidation(formData as Record<string, any>, { basePath: dottedBasePath }, reuseId)
    }
}

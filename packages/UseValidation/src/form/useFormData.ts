import { useEffect, useMemo, useRef, useState } from "react";
import * as immutable from 'object-path-immutable';
import useValidation from "../validation/useValidation";
import Publisher, { usePublishedState } from "../utils/Publisher";
import { getSingletonInstance } from "../utils/SingletonStore";

function getFieldValue(formData: any, baseDottedPath: string) {
    return immutable.get(formData, baseDottedPath)
}

const useFormData = <TFormData>(initialData: TFormData, baseDottedPath?: string, reuseId?: object) => {
    const localId = useRef({});
    const savedValues = getSingletonInstance(reuseId || localId.current, () => ({formData: initialData, publisher: new Publisher()}));
    const [fullFormData, setFormData] = usePublishedState('formData', savedValues)

    const currentFormData = useMemo(() => {
        if (!baseDottedPath) {
            return fullFormData as TFormData;
        }

        return getFieldValue(fullFormData, baseDottedPath);
    }, [baseDottedPath, fullFormData]);

    const setFieldValue = (relativeDottedPath: string, value:any) => {
        const dottedPath = baseDottedPath ? `${baseDottedPath}.${relativeDottedPath}` : relativeDottedPath;
        const newFormData = immutable.set(savedValues.formData, dottedPath, value);
        setFormData(newFormData);
    }

    const resetForm = () => {
        setFormData(initialData)
    }

    return {
        formData: (baseDottedPath ? currentFormData : fullFormData) as TFormData,
        setFieldValue,
        resetForm,
    };
}

export const CreateFormDataHook = (initialData: any) => {
    const reuseId = {};

    return (<TFormData>(baseDottedPath?: string) => useFormData<TFormData>(initialData, baseDottedPath, reuseId));
}

export const CreateFormValidationHook = <TFormData>(useFormDataHook: ReturnType<typeof CreateFormDataHook>) => {
    const reuseId = {};

    return (dottedBasePath?: string) => {
        const { formData } = useFormDataHook<TFormData>();

        return useValidation(formData as Record<string, any>, { basePath: dottedBasePath }, reuseId)
    }
}

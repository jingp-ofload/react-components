import { useEffect, useMemo, useState } from "react";
import * as immutable from 'object-path-immutable';

const weakMap = new WeakMap();

class FormHelper<TFormData> {
    private subscribers = new Set<React.Dispatch<React.SetStateAction<TFormData>>>();
    #formData: TFormData;

    constructor(ref: Object, initialData: TFormData) {
        weakMap.set(ref, this);
        this.#formData = initialData;
    }

    public get formData() {
        return this.#formData;
    }

    resetForm(initialData: TFormData) {
        this.#formData = initialData;
        this.subscribers.forEach((subscriber) => {
            subscriber(initialData)
        })
    };

    setFieldValue(dottedPath: string, value: any) {
        this.#formData = immutable.set(this.#formData, dottedPath, value)
        this.subscribers.forEach((subscriber) => {
            subscriber(this.#formData)
        })
    };

    getFieldValue(data: TFormData, dottedPath: string) {
        return immutable.get(data, dottedPath)
    };

    subscribe(onChanged: React.Dispatch<React.SetStateAction<TFormData>>) {
        this.subscribers.add(onChanged);

        return () => {this.subscribers.delete(onChanged)}
    }
}


const useFormData = <TFormData>(uniqueId: Object, initialData: TFormData, baseDottedPath?: string) => {
    const [fullFormData, setFormData] = useState<TFormData>(initialData);
    const refObj: FormHelper<TFormData> = weakMap.has(uniqueId) ? weakMap.get(uniqueId) : new FormHelper(uniqueId, fullFormData);

    useEffect(() => {
        setFormData(refObj.formData)
        return refObj.subscribe(setFormData)
    }, [])

    const currentFormData = useMemo(() => {
        if (!baseDottedPath) {
            return fullFormData as TFormData;
        }

        return refObj.getFieldValue(fullFormData, baseDottedPath);
    }, [baseDottedPath, fullFormData]);

    const setFieldValue = (relativeDottedPath: string, value:any) => {
        refObj.setFieldValue(baseDottedPath ? `${baseDottedPath}.${relativeDottedPath}` : relativeDottedPath, value);
    }

    const resetForm = () => {
        refObj.resetForm(initialData)
    }

    return {
        formData: (baseDottedPath ? currentFormData : fullFormData) as TFormData,
        setFieldValue,
        resetForm,
    };
}

const CreateFormDataHook = (initialData: any) => {
    const uniqueId = Symbol();
    const newHook = (<TFormData>(baseDottedPath?: string) => useFormData<TFormData>(uniqueId, initialData, baseDottedPath));

    return newHook;
}


export default CreateFormDataHook;

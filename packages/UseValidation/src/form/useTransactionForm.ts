import {CreateFormDataHook, CreateFormValidationHook} from "./useFormData";

export const InitialData = {
    date: null as Date | null,
    amount: 0,
    user: {
        firstName: '',
        lastName: '',
        email: '',
        age: 0,
    }
}

export const useTransactionForm = CreateFormDataHook(InitialData);
export const useTransactionValidation = CreateFormValidationHook(useTransactionForm);

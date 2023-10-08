import {CreateSharedFormDataHook, CreateSharedFormValidationHook} from "./useFormData";

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

export const useTransactionForm = CreateSharedFormDataHook(InitialData);
export const useTransactionValidation = CreateSharedFormValidationHook(useTransactionForm);

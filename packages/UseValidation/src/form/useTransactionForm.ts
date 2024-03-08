import { CreateSharedFormDataHookWithCleanup, CreateSharedFormValidationHookWithCleanup} from "./useFormData";

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

export const {hook: useTransactionForm, cleanup: cleanupTransactionForm} = CreateSharedFormDataHookWithCleanup(InitialData);
export const {hook: useTransactionValidation, cleanup: cleanupTransactionValidation} = CreateSharedFormValidationHookWithCleanup(useTransactionForm);

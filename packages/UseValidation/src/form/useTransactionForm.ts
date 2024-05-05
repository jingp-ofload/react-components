import { CreateSharedFormDataHookWithCleanUp, CreateSharedFormValidationHookWithCleanUp} from "./useFormData";

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

export const {hook: useTransactionForm, cleanUp: cleanUpTransactionForm} = CreateSharedFormDataHookWithCleanUp(InitialData);
export const {hook: useTransactionValidation, cleanUp: cleanUpTransactionValidation} = CreateSharedFormValidationHookWithCleanUp(useTransactionForm);

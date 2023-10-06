import { object } from "yup";
import CreateFormDataHook from "./useFormData";

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

const useTransactionForm = CreateFormDataHook(InitialData);

export default useTransactionForm;

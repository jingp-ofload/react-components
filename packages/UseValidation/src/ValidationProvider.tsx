import React, { ReactNode, createContext, useContext } from "react";
import useValidation, {ValidatorContextValue} from "./useValidation";

const defaultContext: ValidatorContextValue = {
    errors: {},
    setServerErrors: () => {},
    setTouched: () => {},
    getFormValue: () => '',
    registerValidators: () => () => {},
    validate: () => '',
    isValid: false,
};

interface ValidationProviderProps {
    children: ReactNode,
    formData: Record<string, any>
}

export const ValidationContext = createContext(defaultContext);
const ValidationProvider = ({ children, formData }: ValidationProviderProps) => {

    const validatorContext = useValidation(formData);

    return (
        <ValidationContext.Provider
            value={validatorContext}
            children={children}
        />
    );
};

export default ValidationProvider;
export const useValidationFromProvider = () => useContext(ValidationContext)

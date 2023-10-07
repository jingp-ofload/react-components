import React, { ChangeEventHandler, useEffect } from 'react';
import css from '../story.module.css';
import { useTransactionForm, InitialData, useTransactionValidation } from './useTransactionForm';
import * as yup from 'yup';

const TransactionForm = () => {
    const {formData, setFieldValue} = useTransactionForm<typeof InitialData>();
    const { registerValidators, errors } = useTransactionValidation();

    useEffect(() => {
        return registerValidators({
            amount: yup.number().min(1)
        })
    }, [])
    const setFormValue: ChangeEventHandler<HTMLInputElement> = (e) => {
        setFieldValue(e.target.name, e.target.value);
    }

    return (
        <form className={css.form}>
            <label htmlFor="date">Transaction Date</label>
            <input type="date" name="date" id="date" onChange={setFormValue} value={(formData?.date || '')} />

            <label htmlFor="amount">Amount</label>
            <input name="amount" id="amount" onChange={setFormValue} value={(formData?.amount || '')} />
            <div className={css.errorBlock}>
                {
                    Object.entries(errors).map(([key, value]) => (
                        <span><br/>{key}: {value}</span>
                    ))
                }
                <br/>
            </div>
        </form>
    );
}

export default TransactionForm;

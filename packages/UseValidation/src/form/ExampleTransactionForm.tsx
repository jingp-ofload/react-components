import React, { ChangeEventHandler } from 'react';
import css from '../story.module.css';
import useTransactionForm, { InitialData } from './useTransactionForm';

const TransactionForm = () => {
    const {formData, setFieldValue} = useTransactionForm<typeof InitialData>();

    const setFormValue: ChangeEventHandler<HTMLInputElement> = (e) => {
        setFieldValue(e.target.name, e.target.value);
    }

    return (
        <form className={css.form}>
            <label htmlFor="date">Transaction Date</label>
            <input type="date" name="date" id="date" onChange={setFormValue} value={(formData?.date || '')} />

            <label htmlFor="amount">Amount</label>
            <input name="amount" id="amount" onChange={setFormValue} value={(formData?.amount || '')} />
        </form>
    );
}

export default TransactionForm;

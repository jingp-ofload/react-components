import React, { ChangeEventHandler } from 'react';
import css from '../story.module.css';
import useTransactionForm, { InitialData } from './useTransactionForm';

const UserForm = () => {
    const {formData: user, setFieldValue} = useTransactionForm<typeof InitialData.user>('user');

    const setFormValue: ChangeEventHandler<HTMLInputElement> = (e) => {
        setFieldValue(e.target.name, e.target.value);
    }

    return (
        <form className={css.form}>
            <label htmlFor="firstName">First Name</label>
            <input name="firstName" id="firstName" onChange={setFormValue} value={(user?.firstName || '')} />

            <label htmlFor="lastName">Last Name</label>
            <input name="lastName" id="lastName" onChange={setFormValue} value={(user?.lastName || '')} />

            <label htmlFor="email">Email</label>
            <input name="email" id="email" onChange={setFormValue} value={(user?.email || "")} />
        </form>
    );
}

export default UserForm;

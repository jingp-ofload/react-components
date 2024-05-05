import React, { ChangeEventHandler, useEffect } from 'react';
import css from '../story.module.css';
import {useTransactionForm, useTransactionValidation, InitialData } from './useTransactionForm';
import * as yup from 'yup';

const UserForm = () => {
    const {formData: user, setFieldValue} = useTransactionForm<typeof InitialData.user>('user');
    const { registerValidators, errors } = useTransactionValidation<typeof UserValidators>('user');

    useEffect(() => {
         return registerValidators(UserValidators)
    }, [])

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

const UserValidators = {
    firstName: yup.string().required().min(2),
    lastName: yup.string().required().min(2),
    email: yup.string().required().email(),
}

export default UserForm;

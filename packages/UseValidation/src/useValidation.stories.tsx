import React, { ChangeEventHandler, useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import css from './story.module.css';
import { Validator } from './useValidation';
import * as immutable from 'object-path-immutable';
import * as yup from 'yup';
import ValidationProvider, { useValidationFromProvider } from './ValidationProvider';

const useFormData = () => {
    const [formData, setFormData] = useState<Record<string, any>>({});

    const setFormValue: ChangeEventHandler<HTMLInputElement> = (e) => {
        setFormData((oldFormData) => immutable.set(oldFormData, e.target.name, e.target.value));
    }

    return {
        formData,
        setFormValue,
    }
}

const UserForm = ({ validators, formHook }: {validators: Record<string, Validator>, formHook?: ReturnType<typeof useFormData>}) => {
    const { formData, setFormValue } = formHook || useFormData();
    const { registerValidators, errors } = useValidationFromProvider()

    useEffect(() => {
        return registerValidators(validators)
    }, []);

    return (
        <form className={css.form}>
            <label htmlFor="user.firstName">First Name</label>
            <input name="user.firstName" id="user.firstName" onChange={setFormValue} value={(formData.user?.firstName || '')} />
            {errors["user.firstName"] && <><span className='blank'></span><span className={css.error}>{errors["user.firstName"]}</span></>}

            <label htmlFor="user.lastName">Last Name</label>
            <input name="user.lastName" id="user.lastName" onChange={setFormValue} value={(formData.user?.lastName || '')} />
            {errors["user.lastName"] && <><span className='blank'></span><span className={css.error}>{errors["user.lastName"]}</span></>}

            <label htmlFor="user.email">Email</label>
            <input name="user.email" id="user.email" onChange={setFormValue} value={(formData.user?.email || "")} />
            {errors["user.email"] && <><span className='blank'></span><span className={css.error}>{errors["user.email"]}</span></>}
        </form>
    );
}

const TransactionForm = ({formHook}: {formHook: ReturnType<typeof useFormData>}) => {
    const validators = {
        'amount': yup
            .number()
            .required('Amount is required')
            .min(100, 'amount must be more than 100')
            .max(10000, 'amount must be less than 10000'),
        'date': yup.date()
            .max(new Date(), "Please enter date in past")
            .required(),
    }
    const { formData, setFormValue } = formHook;
    const { registerValidators, errors } = useValidationFromProvider();

    useEffect(() => {
        return registerValidators(validators)
    }, []);

    return (
        <form className={css.form}>
            <label htmlFor="date">Transaction Date</label>
            <input type="date" name="date" id="date" onChange={setFormValue} value={(formData.date || '')} />
            {errors["date"] && <><span className='blank'></span><span className={css.error}>{errors["date"]}</span></>}

            <label htmlFor="amount">Amount</label>
            <input name="amount" id="amount" onChange={setFormValue} value={(formData.amount || '')} />
            {errors["amount"] && <><span className='blank'></span><span className={css.error}>{errors["amount"]}</span></>}
        </form>
    );
}

const SingleForm = ({ validators }: {validators: Record<string, Validator>, formHook?: ReturnType<typeof useFormData>}) => {
    const formHook = useFormData();

    return (
        <ValidationProvider formData={formHook.formData}>
            <UserForm validators={validators} />
        </ValidationProvider>
    )
}

const MultiStepForm = ({formHook}: {formHook: ReturnType<typeof useFormData>}) => {
    const [curStep, setCurStep] = useState(0);
    const { isValid } = useValidationFromProvider();

    const changeStep = (step: number) => {
        setCurStep((oldStep) => {
            const newStep = oldStep + step;

            if (newStep >= 0 && newStep < 2) {
                return newStep
            }

            return oldStep;
        })
    }

    return (
        <div>
            { curStep === 0 && <UserForm validators={yupValidators} formHook={formHook} />}
            { curStep === 1 && <TransactionForm formHook={formHook} />}
            <div>
                <button onClick={() => changeStep(-1)}>Prev</button>
                <button onClick={() => changeStep(1)} disabled={!isValid}>Next</button>
            </div>
        </div>
    )
}

const functionValidators: Record<string, Validator> = {
    'user.firstName': (fieldName: string, value: string) => (!!value ? '' : 'First name is required'),
    'user.lastName': (fieldName: string, value: string) => (!!value ? '' : 'Last name is required'),
    'user.email': (fieldName: string, value: string) => (!!value ? '' : 'Email is required'),
}

const yupValidators: Record<string, Validator> = {
    'user.firstName': yup
        .string()
        .required('First name is required')
        .min(2, 'First name should be at least 2 letter'),
    'user.lastName': yup
        .string()
        .required('Last name is required')
        .min(2, 'Last name should be at least 2 letter'),
    'user.email': yup.string().required('Email is required').email('Must be a valid email address'),
}

const meta = {
    title: 'UseValidation',
    component: SingleForm,
    parameters: {
      layout: 'centered',
    },
  } satisfies Meta<typeof SingleForm>;

  export default meta;


  type Story = StoryObj<typeof meta>;

export const FunctionValidators: Story = {
  args: {
    validators: functionValidators,
  },
};

export const YupValidators: Story = {
    args: {
      validators: yupValidators,
    },
  };


export const MultiStepForms: Story = {
    args: {
        validators: yupValidators,
    },
    render: () => {
        const formHook = useFormData();

        return (<ValidationProvider formData={formHook.formData}>
            <MultiStepForm formHook={formHook}/>
        </ValidationProvider>
        )
    }
}

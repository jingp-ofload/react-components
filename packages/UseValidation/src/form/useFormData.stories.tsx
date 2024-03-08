import type { Meta, StoryObj } from '@storybook/react';
import React, { useEffect, useState } from 'react';
import UserForm from './ExampleUserForm';
import TransactionForm from './ExampleTransactionForm';
import { useTransactionValidation, cleanupTransactionForm, cleanupTransactionValidation } from './useTransactionForm';

const SingleStepForm = ({}) => {
    useEffect(() => {
        return () => {
            cleanupTransactionForm();
            cleanupTransactionValidation();
        }
    }, []);

    return <UserForm />;
}

const MultiStepForm = ({}) => {
    const [curStep, setCurStep] = useState(0);
    const { isValid } = useTransactionValidation();

    useEffect(() => {
        return () => {
            cleanupTransactionForm();
            cleanupTransactionValidation();
        }
    }, [])

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
            { curStep === 0 && <UserForm />}
            { curStep === 1 && <TransactionForm />}
            <div>
                <button onClick={() => changeStep(-1)} >Prev</button>
                <button onClick={() => changeStep(1)}>Next</button>
            </div>
        </div>
    )
}

const meta: Meta<typeof MultiStepForm> = {
    title: 'useFormData',
    args: {},
    parameters: {
        layout: 'centered',
    },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const SingleForm: Story = {
    // @ts-ignore
    render: () => <SingleStepForm />
}

export const MultiStepFormExample: Story = {
    // @ts-ignore
    render: () => <MultiStepForm />
}

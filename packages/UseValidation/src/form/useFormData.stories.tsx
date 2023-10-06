import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import UserForm from './ExampleUserForm';
import TransactionForm from './ExampleTransactionForm';

const MultiStepForm = () => {
    const [curStep, setCurStep] = useState(0);

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
                <button onClick={() => changeStep(-1)}>Prev</button>
                <button onClick={() => changeStep(1)} >Next</button>
            </div>
        </div>
    )
}

const meta: Meta<typeof MultiStepForm> = {
    title: 'useFormData',
    component: MultiStepForm,
    args: {},
    parameters: {
        layout: 'centered',
    },
};

export default meta;

type Story = StoryObj<typeof meta>;


export const BasicUsage = {

}

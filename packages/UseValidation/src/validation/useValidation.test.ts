import useValidation, { UseValidationOptions } from './useValidation';
import React from 'react';
import { act, waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react';

import * as yup from 'yup';

describe('useValidation', () => {
    let result: any;
    let unmount: () => void;
    let rerender: (rerenderCallbackProps: any) => void;

    beforeEach(() => {
        ({ result, rerender, unmount } = renderHook(useValidation, {
            initialProps: {
                user: {
                    firstName: '',
                    lastName: '',
                    age: 0,
                },
                amount: 0,
            },
        }));

        act(() => {
            result.current?.registerValidators({
                'user.firstName': (fieldName: string, value: string) => (!!value ? '' : 'First name is required'),
                'user.lastName': (fieldName: string, value: string) => (!!value ? '' : 'Last name is required'),
                'user.age': (fieldName: string, age: number) => (age > 0 ? '' : 'Age should be greater than 0'),
                'amount': (fieldName: string, amount: number) => (amount > 0 ? '' : 'Amount should be greater than 0'),
            });
        });
    });

    afterEach(() => {
        unmount();
    });

    test('hook returns correct initial value', () => {
        const { result } = renderHook(() => useValidation({}));

        expect(result.current).toMatchObject({
            errors: {},
            isValid: true,
        });
    });

    it('should validate form data when validator is registered', () => {
        expect(result.current?.errors).toEqual({
            'user.age': 'Age should be greater than 0',
            'user.firstName': 'First name is required',
            'user.lastName': 'Last name is required',
            'amount': 'Amount should be greater than 0',
        });
    });

    test('Can set fields as not touched when registering validators', async () => {
        await act(async () => {
            result.current?.registerValidators({
                'user.firstName': (fieldName: string, value: string) => (!!value ? '' : 'First name is required'),
                'user.lastName': (fieldName: string, value: string) => (!!value ? '' : 'Last name is required'),
            }, false);
        })

        expect(result.current?.errors).toEqual({});
    })

    test('can set all fields to be not touched', () => {
        act(() => {
            result.current?.setTouched('ALL_FIELDS', false);
        });

        expect(result.current?.errors).toEqual({});
    });

    test('when touched field are set, it should only validate touched fields', () => {
        act(() => {
            result.current?.setTouched(['user.age'], true);
        });

        expect(result.current?.errors).toEqual({
            'user.age': 'Age should be greater than 0',
        });
    });

    test('Can set validation error coming from server', () => {
        act(() => {
            result.current?.setServerErrors({ 'user.age': 'age should ate least be 16' });
        });

        expect(result.current?.errors).toEqual({
            'user.age': 'age should ate least be 16',
        });
    });

    test('isValid is false initially and then become true when all fields are valid', () => {
        expect(result.current?.isValid).toBeFalsy();

        rerender({
            user: {
                firstName: 'Dev',
                lastName: 'Khadka',
                age: 33,
            },
            amount: 40,
        });

        waitFor(() => expect(result.current?.isValid).toBeTruthy());
    });

    test('can unregister validators by calling function returned by registerValidators', () => {
        const { result: localResult } = renderHook(() => useValidation({amount: 99}));

        let unregisterValidators: () => void;
        act(() => {
            unregisterValidators = localResult.current.registerValidators({
                'user.firstName': (fieldName: string, value: string) => (!!value ? '' : 'First name is required'),
                'user.lastName': (fieldName: string, value: string) => (!!value ? '' : 'Last name is required'),
            })
            localResult.current.setTouched("ALL_FIELDS", true);
        });

        expect(localResult.current.errors).toEqual({
               "user.firstName": "First name is required",
               "user.lastName": "Last name is required",
        });

        act(() => {
            unregisterValidators();
        })

        expect(localResult.current.errors).toEqual({});
    })
});

describe('useValidation with yup schema', () => {
    let result: any;
    let unmount: () => void;
    let rerender: (rerenderCallbackProps: any) => void;

    beforeEach(() => {
        ({ result, rerender, unmount } = renderHook(useValidation, {
            initialProps: {
                user: {
                    firstName: '',
                    lastName: '',
                    email: '',
                },
                amount: null,
            },
        }));

        act(() => {
            result.current?.registerValidators({
                'user.firstName': yup
                    .string()
                    .required('First name is required')
                    .min(2, 'First name should be at least 2 letter'),
                'user.lastName': yup
                    .string()
                    .required('Last name is required')
                    .min(2, 'Last name should be at least 2 letter'),
                'user.email': yup.string().required('Email is required').email('Must be a valid email address'),
                'amount': yup
                    .number()
                    .required('Amount is required')
                    .min(100, 'amount must be more than 100')
                    .max(10000, 'amount must be less than 10000'),
            });
        });
    });

    afterEach(() => {
        unmount();
    });

    it('should validate empty form data when validator is registered', () => {
        expect(result.current?.errors).toEqual({
            'user.firstName': 'First name is required',
            'user.lastName': 'Last name is required',
            'user.email': 'Email is required',
            'amount': 'Amount is required',
        });
    });

    it('should validate invalid form data when validator is registered', () => {
        act(() => {
            rerender({ user: { firstName: 'jo', lastName: 'T', email: 'wrong-email' }, amount: 150 });
        });

        waitFor(() => expect(result.current?.errors).toEqual({
            'user.firstName': '',
            'user.lastName': 'Last name should be at least 2 letter',
            'user.email': 'Must be a valid email address',
            'amount': '',
        }));
    });
});

describe('useValidation with basePath', () => {
    let result: any;
    let unmount: () => void;
    let rerender: (rerenderCallbackProps: any) => void;

    beforeEach(() => {
        ({ result, rerender, unmount } = renderHook(({formData, options}: {formData: any, options: UseValidationOptions}) => useValidation(formData, options), {
            initialProps: {
                formData: {
                    user: {
                        firstName: '',
                        lastName: '',
                        age: 0,
                    },
                    amount: 0,
                },
                options: {
                    basePath: 'user'
                }
            },
        }));

        act(() => {
            result.current?.registerValidators({
                'firstName': (fieldName: string, value: string) => (!!value ? '' : 'First name is required'),
                'lastName': (fieldName: string, value: string) => (!!value ? '' : 'Last name is required'),
                'age': (fieldName: string, age: number) => (age > 0 ? '' : 'Age should be greater than 0'),
            });
        });
    });

    test("Can register validators with relative form path", () => {
        expect(result.current).toMatchObject({
            errors: {},
            isValid: false,
        });
    });

    test('Can set fields as not touched when registering validators with base path', async () => {
        await act(async () => {
            result.current?.registerValidators({
                'firstName': (fieldName: string, value: string) => (!!value ? '' : 'First name is required'),
                'lastName': (fieldName: string, value: string) => (!!value ? '' : 'Last name is required'),
            }, false);
        })

        expect(result.current?.errors).toEqual({});
    })

    test("Should get all errors with relative fields", () => {
        act(() => {
            result.current.setTouched("ALL_FIELDS", true);
        })

        expect(result.current.errors).toEqual({
            "age": "Age should be greater than 0",
            "firstName": "First name is required",
            "lastName": "Last name is required",
        });
    });
})

describe('Reuse useValidation', () => {
    test('setTouched with relative path only set fields starting with basePath', async () => {
        const uniqueRef = {};
        const formData = {
            user: {
                firstName: '',
                lastName: '',
                age: 0,
            },
            amount: 0,
        }
        const { result: resultFullForm } = renderHook(() => useValidation(formData, undefined, uniqueRef));
        act(() => resultFullForm.current?.registerValidators({
            'user.firstName': (fieldName: string, value: string) => (!!value ? '' : 'First name is required'),
            'user.lastName': (fieldName: string, value: string) => (!!value ? '' : 'Last name is required'),
            'user.age': (fieldName: string, age: number) => (age > 0 ? '' : 'Age should be greater than 0'),
            'amount': (fieldName: string, amount: number) => (amount > 0 ? '' : 'Amount should be greater than 0'),
        }));
        const { result: resultUserOnly } = renderHook(() => useValidation(formData, {basePath: 'user'}, uniqueRef));

        await act(async () => {
            resultFullForm.current?.setTouched('ALL_FIELDS', false);
        });

        await act(async () => {
            resultUserOnly.current?.setTouched('ALL_FIELDS', true);
        });

        expect(resultUserOnly.current?.errors).toEqual({
            "age": "Age should be greater than 0",
            "firstName": "First name is required",
            "lastName": "Last name is required",
        });

        expect(resultFullForm.current?.errors).toEqual({
            'user.age': 'Age should be greater than 0',
            'user.firstName': 'First name is required',
            'user.lastName': 'Last name is required',
            'amount': 'Amount should be greater than 0',
        });

    })
})

import { RenderHookResult, act, renderHook } from "@testing-library/react"
import { useFormData } from "./useFormData"

const TransactionDefault = {
    amount: 0,
    date: '' as Date | '',
    toUser: {
        firstName: '',
        lastName: '',
        email: '',
    }
};

type RenderResult = RenderHookResult<ReturnType<typeof useFormData<typeof TransactionDefault>>, void>;

describe('useFormData in single component', () => {
    let result: RenderResult["result"];
    let rerender: RenderResult["rerender"];
    let unmount: RenderResult["unmount"];
    beforeEach(() => {
        ({ result, rerender, unmount } = renderHook(() => useFormData<typeof TransactionDefault>(TransactionDefault)));
    });

    test('Can use form data independently without giving reuseId', async () => {
        const { result: localResult } = renderHook(() => useFormData(TransactionDefault));

        await act(() => {
            return new Promise((resolve) => {
                result.current.setFieldValue('amount', 51);
                result.current.setFieldValue('toUser.firstName', 'Doom');

                localResult.current.setFieldValue('amount', 81);
                localResult.current.setFieldValue('toUser.firstName', 'Boom');
                resolve('');
            })
        })
        const expectedResult = {...TransactionDefault};
        expectedResult.amount = 51;
        expectedResult.toUser = {
            ...expectedResult.toUser,
            firstName: 'Doom'
        }

        expect(result.current.formData).toStrictEqual(expectedResult);


        const expectedLocalResult = {...TransactionDefault};
        expectedLocalResult.amount = 81;
        expectedLocalResult.toUser = {
            ...expectedLocalResult.toUser,
            firstName: 'Boom'
        }
        expect(localResult.current.formData).toStrictEqual(expectedLocalResult);
    })

    test('Can reset form data with default value', async () => {
        await act(() => {
            return new Promise((resolve) => {
                result.current.setFieldValue('amount', 51);
                result.current.setFieldValue('toUser.firstName', 'Doom');

                resolve('');
            })
        })

        const expectedResult = {...TransactionDefault};
        expectedResult.amount = 51;
        expectedResult.toUser = {
            ...expectedResult.toUser,
            firstName: 'Doom'
        }

        expect(result.current.formData).toStrictEqual(expectedResult);

        act(() => {
            result.current.resetForm();
        });

        expect(result.current.formData).toStrictEqual(TransactionDefault);
        expect(result.current.formData).not.toBe(TransactionDefault);
    })

    test('Can use relative path by setting base path', async () => {
        const { result: localResult } = renderHook(() => useFormData(TransactionDefault, 'toUser'));

        await act(() => {
            return new Promise((resolve) => {
                localResult.current.setFieldValue('firstName', 'Doom');
                localResult.current.setFieldValue('email', 'doom@example.com');

                resolve('');
            })
        })

        const expectedLocalResult = {...TransactionDefault.toUser};
        expectedLocalResult.firstName = 'Doom'
        expectedLocalResult.email = 'doom@example.com'

        expect(localResult.current.formData).toStrictEqual(expectedLocalResult);
    })

    test('Reset is disabled when using relative path', async () => {
        const { result: localResult } = renderHook(() => useFormData(TransactionDefault, 'toUser'));

        await act(() => {
            return new Promise((resolve) => {
                localResult.current.setFieldValue('firstName', 'Doom');
                localResult.current.setFieldValue('email', 'doom@example.com');

                resolve('');
            })
        })

        expect(() => localResult.current.resetForm()).toThrow();
    })

    test('Can use callback function to set field value', () => {
        act(() => {
            result.current.setFieldValue('amount', (value: number) => value + 5);
            result.current.setFieldValue('amount', (value: number) => value + 12);
        })

        expect(result.current.formData.amount).toBe(17);
    })

    test('Can use callback function to set field value with base path', async () => {
        const { result: localResult } = renderHook(() => useFormData<typeof TransactionDefault.toUser>(TransactionDefault, 'toUser'));

        await act(() => {
            return new Promise((resolve) => {
                localResult.current.setFieldValue('firstName', (value: string) => value + 'Dev');
                localResult.current.setFieldValue('firstName', (value: string) => value + 'Khadka');

                resolve('');
            })
        })

        expect(localResult.current.formData.firstName).toBe('DevKhadka');
    })

    test('Can set root object value with empty path with base path', () => {
        const { result: localResult } = renderHook(() => useFormData<typeof TransactionDefault.toUser>(TransactionDefault, 'toUser'));

        act(() => {
            localResult.current.setFieldValue('', (root: any) => ({...root, firstName: 'Dev'}));
        })

        expect(localResult.current.formData).toEqual({"email": "", "firstName": "Dev", "lastName": ""});
    })

    test('Can set root object value with empty path without base path', () => {
        act(() => {
            result.current.setFieldValue('', (root: any) => ({...root, amount: 100}));
        })

        expect(result.current.formData).toEqual({"amount": 100, "date": "", "toUser": {"email": "", "firstName": "", "lastName": ""}});
    })

    test("Can't mutate form data", () => {
        expect(() => {result.current.formData.amount = 50}).toThrow("read only property");
    })
})

describe('useFormData reuse in multiple components', () => {
    test("Multiple hooks can use same form data", async () => {
        const uniqueRef = {};
        const { result: localResult1 } = renderHook(() => useFormData(TransactionDefault, undefined, uniqueRef));
        const { result: localResult2 } = renderHook(() => useFormData(TransactionDefault, undefined, uniqueRef));

        await act(() => {
            return new Promise((resolve) => {
                localResult1.current.setFieldValue('toUser.firstName', 'Doom');
                localResult2.current.setFieldValue('toUser.email', 'doom@example.com');
                localResult2.current.setFieldValue('amount', 91);

                resolve('');
            })
        })

        const expectedLocalResult = {...TransactionDefault};
        expectedLocalResult.toUser = {
            ...expectedLocalResult.toUser,
            firstName: 'Doom',
            email: 'doom@example.com',
        }
        expectedLocalResult.amount = 91;

        expect(localResult1.current.formData).toStrictEqual(expectedLocalResult);
        expect(localResult2.current.formData).toStrictEqual(expectedLocalResult);
    })

    test("Can use multiple path type with same form data", async () => {
        const uniqueRef = {};
        const { result: transactionResult } = renderHook(() => useFormData(TransactionDefault, undefined, uniqueRef));
        const { result: userResult } = renderHook(() => useFormData(TransactionDefault, 'toUser', uniqueRef));

        await act(() => {
            return new Promise((resolve) => {
                userResult.current.setFieldValue('firstName', 'Doom');
                userResult.current.setFieldValue('email', 'doom@example.com');
                transactionResult.current.setFieldValue('amount', 91);

                resolve('');
            })
        })

        const expectedLocalResult = {...TransactionDefault};
        expectedLocalResult.toUser = {
            ...expectedLocalResult.toUser,
            firstName: 'Doom',
            email: 'doom@example.com',
        }
        expectedLocalResult.amount = 91;

        expect(transactionResult.current.formData).toStrictEqual(expectedLocalResult);
    })

    test("Can reset form data of multiple hooks", async () => {
        const uniqueRef = {};
        const { result: transactionResult } = renderHook(() => useFormData(TransactionDefault, undefined, uniqueRef));
        const { result: userResult } = renderHook(() => useFormData(TransactionDefault, 'toUser', uniqueRef));

        await act(() => {
            return new Promise((resolve) => {
                userResult.current.setFieldValue('firstName', 'Doom');
                userResult.current.setFieldValue('email', 'doom@example.com');
                transactionResult.current.setFieldValue('amount', 91);

                resolve('');
            })
        })

        const expectedLocalResult = {...TransactionDefault};
        expectedLocalResult.toUser = {
            ...expectedLocalResult.toUser,
            firstName: 'Doom',
            email: 'doom@example.com',
        }
        expectedLocalResult.amount = 91;

        expect(transactionResult.current.formData).toStrictEqual(expectedLocalResult);

        await act(() => {
            return new Promise((resolve) => {
                transactionResult.current.resetForm();

                resolve('')
            })
        })

        expect(transactionResult.current.formData).toStrictEqual(TransactionDefault);
        expect(userResult.current.formData).toStrictEqual(TransactionDefault.toUser);
    })
})

import { act, renderHook } from "@testing-library/react";
import Publisher, { usePublishedState } from "./Publisher";

describe('usePublishedState', () => {
    let sharedObject = {
        title: 'Domain driven design',
        author: {
            name: 'Eric evans',
            otherTitles: ['Domain driven design reference', 'Pattern summaries']
        },
        publisher: new Publisher(),
    };
    beforeEach(() => {
        sharedObject = {
            title: 'Domain driven design',
            author: {
                name: 'Eric evans',
                otherTitles: ['Domain driven design reference', 'Pattern summaries']
            },
            publisher: new Publisher(),
        }
    })

    test('Can publish state to multiple hooks', () => {
        const { result: result1 } = renderHook(() => usePublishedState<typeof sharedObject.author>('author', sharedObject));
        const { result: result2 } = renderHook(() => usePublishedState<typeof sharedObject.author>('author', sharedObject));
        const { result: result3 } = renderHook(() => usePublishedState<typeof sharedObject.author>('author', sharedObject));
        const { result: result4 } = renderHook(() => usePublishedState<typeof sharedObject.author>('title', sharedObject));

        const setValue = result1.current[1];
        act(() => {
            setValue((oldAuthor) => ({...oldAuthor, name: 'changed author'}));
        })

        expect(result1.current[0].name).toBe('changed author');
        expect(result1.current[0]).toBe(result2.current[0]);
        expect(result1.current[0]).toBe(result3.current[0]);
        expect(result4.current[0]).toBe('Domain driven design');

    });

    test('Mutates sharedObject when shared state set', () => {
        const { result } = renderHook(() => usePublishedState<typeof sharedObject.author>('author', sharedObject));

        const setValue = result.current[1];
        act(() => {
            setValue((oldAuthor) => ({...oldAuthor, name: 'new author'}));
        });

        expect(sharedObject.author.name).toBe('new author');
    })
})

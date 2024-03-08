import { useEffect, useState } from "react";

interface IEvent {
    (...args: any[]): void;
}
class Publisher<TEvent extends string = string> {
    #subscribers: Record<TEvent, IEvent[]> = {} as Record<TEvent, IEvent[]>;

    subscribe(event: TEvent, handler: IEvent) {
        if (!this.#subscribers[event]) {
            this.#subscribers[event] = []
        }

        this.#subscribers[event].push(handler);
    }

    unsubscribe(event: TEvent, handler: IEvent) {
        if (!this.#subscribers[event]) {
            return;
        }

        this.#subscribers[event].filter((curHandler) => handler !== curHandler )
    }

    publish(event: TEvent, ...args: any[]) {
        this.#subscribers[event]?.forEach((handler) => handler(...(args || [])))
    }
}

export const usePublishedState = <TValue>(valueKey: string, savedMutableValues: {publisher: Publisher, [key: string]: any}) => {
    const [value, setValue] = useState<TValue>(savedMutableValues[valueKey]);

    useEffect(() => {
        setValue(savedMutableValues[valueKey]);
        savedMutableValues.publisher.subscribe(valueKey as string, setValue);

        return savedMutableValues.publisher.unsubscribe(valueKey, setValue);
    }, [])

    return [
        value,
        ((valueOrUpdater) => {
            savedMutableValues[valueKey] = typeof valueOrUpdater === 'function' ? (valueOrUpdater as (prevState: TValue) => TValue)(savedMutableValues[valueKey]) : valueOrUpdater;
            savedMutableValues.publisher.publish(valueKey as string, savedMutableValues[valueKey]);
        }) as typeof setValue,
    ] as const;
}

export default Publisher;

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

export const usePublishedState = <TValue>(event: string, savedValues: {publisher: Publisher, [key: string]: any}) => {
    const [value, setValue] = useState<TValue>(savedValues[event]);

    useEffect(() => {
        setValue(savedValues[event]);
        savedValues.publisher.subscribe(event as string, setValue);

        return savedValues.publisher.unsubscribe(event, setValue);
    }, [])

    return [
        value,
        ((valueOrUpdater) => {
            savedValues[event] = typeof valueOrUpdater === 'function' ? (valueOrUpdater as (prevState: TValue) => TValue)(savedValues[event]) : valueOrUpdater;
            savedValues.publisher.publish(event as string, savedValues[event]);
        }) as typeof setValue,
    ] as const;
}

export default Publisher;

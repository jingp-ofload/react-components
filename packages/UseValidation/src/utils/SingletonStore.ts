
const weakMap = new WeakMap();

export const getSingletonInstance = <T>(uniqueId: object, getInitialValue: () => T): T => {
    if (!uniqueId) {
        return getInitialValue();
    }

    if (!weakMap.has(uniqueId)) {
        weakMap.set(uniqueId, getInitialValue());
    }

    return weakMap.get(uniqueId);
}

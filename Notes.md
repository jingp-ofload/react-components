API

```
const { formData, setFieldValue, resetForm } = useFormData("unique-id", initialData);

const {} = useValidation(formData, basePath)
```

Implementation `useFormData`
```
const weakMap = new WeakMap();

class FormData {
    subscribers: Set();
    constructor(initialData = {}) {
        data = initialData;
    }

    reset(initialData) {
        subscribers.forEach((subscriber) => {
            subscriber((oldData) => (initialData))
        })
    };
    setFieldValue(data, field, value) {
        subscribers.forEach((subscriber) => {
            subscriber((oldData) => (newData))
        })
    };
    getFieldValue(data, field);
    subscribe(onChanged) {
        subscribers.add(onChanged);

        return () => subscribers.delete(onChanged)
    }
}


const useFormData = (uniqueId, initialData) => {
    const refObj = useRef(weakMap.has(uniqueId) ? wekMap.get(uniqueId) : new FormData());

    const [formData, setFormData] = useState();

    useEffect(() => {
        return refObj.subscribe(ref, setFormData)
    }, [])

    setFieldValue(field, value) {
        refObj.setFieldValue(field, value);
    }

    resetForm() {

    }

}

```

import { ChangeEventHandler, useState, useEffect } from 'react'
import './App.css'
import useValidation, { Validator } from '@devnepal/use-validation';
import * as immutable from 'object-path-immutable';


function App() {

  return (
    <>
      <UserForm validators={functionValidators} />
    </>
  )
}

const UserForm = ({ validators }: {validators: Record<string, Validator>}) => {
    const css: Record<string, string> = {};
    const [formData, setFormData] = useState({});
    const { registerValidators, errors } = useValidation(formData)

    const setFormValue: ChangeEventHandler<HTMLInputElement> = (e) => {
        setFormData((oldFormData) => immutable.set(oldFormData, e.target.name, e.target.value));
    }

    useEffect(() => {
        return registerValidators(validators)
    }, []);

    return (
        <form>
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

// We can define plan function as validator which return validation error message when validation fails
const functionValidators: Record<string, Validator> = {
    'user.firstName': (fieldName: string, value: string) => (value ? '' : 'First name is required'),
    'user.lastName': (fieldName: string, value: string) => (value ? '' : 'Last name is required'),
    'user.email': (fieldName: string, value: string) => (value ? '' : 'Email is required'),
}

export default App

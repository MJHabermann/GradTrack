import "./sign.css";
import React, {useState} from "react";
import logo from "../assets/grad.png";

export default function Signup() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirm: "",
        agree: false,
    });
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const sendRegister = (e) => {
        e.preventDefault();
        console.log(form.name);
        console.log(form.email);
        console.log(form.password);
        console.log(form.confirm);

    }
    return (
        <div className="login-page">
            <img src={logo} alt="Logo" className= "logo" />
            <h1>Sign Up</h1>
            <form onSubmit={sendRegister}>
                <input type="text" name = "name" className="name" placeholder="Name" value = {form.name} onChange={(handleChange)} required/>
                <input type="email" name = "email" className="email" placeholder="E-mail" value={form.email} onChange={(handleChange)} required/>
                <input type="password" name="password" className="password" placeholder="Password" value={form.password} onChange={(handleChange)} required/>
                <input type="password" name="confirm" className="confirm" placeholder="Confirm" value={form.confirm} onChange={(handleChange)} required/>
                <label>
                    <input type="checkbox" name = "agree" className="agree" placeholder="Confirm" value={form.agree} onChange={(handleChange)} required/>
                    I agree to the terms and conditions.
                </label>
                <button type="submit">Register</button>
            </form>
        </div>
    );
}
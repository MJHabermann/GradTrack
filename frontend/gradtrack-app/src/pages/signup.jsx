import "./sign.css";
import React, {useState, useContext} from "react";
import logo from "../assets/grad.png";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import API_CONFIG from "../api/config";

export default function Signup() {
    const navigate = useNavigate();
    const { login } = useContext(UserContext);
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirm: "",
        agree: false,
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const sendRegister = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        // Basic validation
        if (form.password !== form.confirm) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        if (!form.agree) {
            setError("Please agree to the terms and conditions");
            setLoading(false);
            return;
        }

        try {
            const response = await API_CONFIG.request(API_CONFIG.ENDPOINTS.REGISTER, {
                method: 'POST',
                body: JSON.stringify({ 
                    name: form.name, 
                    email: form.email, 
                    password: form.password, 
                    password_confirmation: form.confirm 
                }),
            });

            const data = await response.json();
            
            // Use UserContext to handle login
            login(data.user);
            
            // Navigate to dashboard
            navigate('/dashboard');
        } catch (error) {
            setError(error.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className="login-page">
            <img src={logo} alt="Logo" className= "logo" />
            <h1>Sign Up</h1>
            <form onSubmit={sendRegister}>
                {error && <div style={{color: 'red', marginBottom: '1rem'}}>{error}</div>}
                <input type="text" name = "name" className="name" placeholder="Name" value = {form.name} onChange={(handleChange)} required/>
                <input type="email" name = "email" className="email" placeholder="E-mail" value={form.email} onChange={(handleChange)} required/>
                <input type="password" name="password" className="password" placeholder="Password" value={form.password} onChange={(handleChange)} required/>
                <input type="password" name="confirm" className="confirm" placeholder="Confirm" value={form.confirm} onChange={(handleChange)} required/>
                <label>
                    <input type="checkbox" name = "agree" className="agree" checked={form.agree} onChange={(handleChange)} required/>
                    I agree to the terms and conditions.
                </label>
                <button type="submit" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Register'}
                </button>
            </form>
        </div>
    );
}
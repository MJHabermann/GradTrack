import "./sign.css";
import React, {useState, useContext} from "react";
import logo from "../assets/grad.png";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import API_CONFIG from "../api/config";

export default function Signin() {
    const navigate = useNavigate();
    const { login } = useContext(UserContext);
    const [form, setForm] = useState({
        email:"",
        password: ""
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

    const sendSignIn = async (email, password) => {
        setLoading(true);
        setError("");
        
        try {
            const response = await API_CONFIG.request(API_CONFIG.ENDPOINTS.LOGIN, {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            
            // Use UserContext to handle login
            login(data.user, data.token);
            
            // Navigate to dashboard
            navigate('/dashboard');
        } catch (error) {
            setError(error.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-page">
            <img src={logo} alt="Logo" className= "logo" />
            <h1>Sign In</h1>
            <form onSubmit={(e) => {e.preventDefault(); sendSignIn(form.email, form.password)}}>
                {error && <div style={{color: 'red', marginBottom: '1rem'}}>{error}</div>}
                <input type="email" name="email" placeholder="E-mail" value={form.email} onChange={(handleChange)} required/>
                <input type="password" name="password" placeholder="Password" value={form.password} onChange={(handleChange)} required/>
                <button type="submit" disabled={loading}>
                    {loading ? 'Signing In...' : 'Login'}
                </button>
            </form>
        </div>
    );
}
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
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        password_confirmation: "",
        department: "",
        role: "student",
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
        if (form.password !== form.password_confirmation) {
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
            const requestData = { 
                first_name: form.firstName, 
                last_name: form.lastName,
                email: form.email, 
                password: form.password, 
                password_confirmation: form.password_confirmation,
                department: form.department || null,
                role: form.role
            };
            
            console.log('POST submission data:', requestData);
            console.log('API endpoint:', API_CONFIG.ENDPOINTS.REGISTER);
            console.log('Full URL:', API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.REGISTER));
            
            const response = await API_CONFIG.request(API_CONFIG.ENDPOINTS.REGISTER, {
                method: 'POST',
                body: JSON.stringify(requestData),
            });

            const data = await response.json();
            
            console.log('Response status:', response.status);
            console.log('Response data:', data);
            
            // Use UserContext to handle login
            login(data.user, data.token);
            
            // Navigate to dashboard
            if(data.user.role === 'student') {
                navigate('/dashboard');
            } else if(data.user.role === 'faculty') {
                navigate('/faculty-dashboard');
            } else if(data.user.role === 'admin') {
                navigate('/admin-dashboard');
            }
        } catch (error) {
            console.error('Registration error:', error);
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
                <input type="text" name="firstName" className="name" placeholder="First Name" value={form.firstName} onChange={(handleChange)} required/>
                <input type="text" name="lastName" className="name" placeholder="Last Name" value={form.lastName} onChange={(handleChange)} required/>
                <input type="email" name="email" className="email" placeholder="E-mail" value={form.email} onChange={(handleChange)} required/>
                <select name="role" className="role" value={form.role} onChange={handleChange} required>
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                </select>
                <input type="text" name="department" className="department" placeholder="Department (Optional)" value={form.department} onChange={(handleChange)}/>
                <input type="password" name="password" className="password" placeholder="Password" value={form.password} onChange={(handleChange)} required/>
                <input type="password" name="password_confirmation" className="confirm" placeholder="Confirm Password" value={form.password_confirmation} onChange={(handleChange)} required/>
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
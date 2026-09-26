import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { registerUser } from '../services/authService';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.password) newErrors.password = 'Password is required';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');
        if (!validateForm()) return;
        setIsSubmitting(true);
        try {
            await registerUser(formData);
            navigate('/login', { state: { message: 'Registration successful! Please login.' } });
        } catch (error) {
            if (error.status === 409) setSubmitError('This email is already registered.');
            else if (error.errors) setErrors(error.errors);
            else setSubmitError(error.message || 'Registration failed.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-slate-200 flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />
            <div className="w-full max-w-md relative z-10">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Join PMS</h1>
                    </div>
                    {submitError && (
                        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-200 leading-relaxed">{submitError}</p>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Full Name</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-5 w-5 text-slate-500" /></div>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your full name" className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-xl outline-none text-slate-200" />
                            </div>
                            {errors.name && <p className="mt-1.5 text-xs text-red-400 ml-1">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-slate-500" /></div>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-xl outline-none text-slate-200" />
                            </div>
                            {errors.email && <p className="mt-1.5 text-xs text-red-400 ml-1">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-slate-500" /></div>
                                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Create a password" className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-xl outline-none text-slate-200" />
                            </div>
                            {errors.password && <p className="mt-1.5 text-xs text-red-400 ml-1">{errors.password}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Confirm Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-slate-500" /></div>
                                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm your password" className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-xl outline-none text-slate-200" />
                            </div>
                            {errors.confirmPassword && <p className="mt-1.5 text-xs text-red-400 ml-1">{errors.confirmPassword}</p>}
                        </div>
                        <button type="submit" disabled={isSubmitting} className="w-full mt-6 py-3 px-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl flex justify-center items-center">
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Register'}
                        </button>
                    </form>
                    <div className="mt-8 text-center text-sm text-slate-400">
                        Already have an account? <Link to="/login" className="text-indigo-400 hover:text-indigo-300">Log in here</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default RegisterPage;

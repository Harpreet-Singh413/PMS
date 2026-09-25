import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, AlertCircle, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { loginUser } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isAuthenticated } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    
    const [submitError, setSubmitError] = useState('');
    const [successMessage, setSuccessMessage] = useState(location.state?.message || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');
        setSuccessMessage('');
        if (!formData.email || !formData.password) {
            setSubmitError('Please fill in both email and password.');
            return;
        }
        setIsSubmitting(true);
        try {
            const data = await loginUser(formData);
            login(data.token, data.user);
            navigate('/dashboard', { replace: true });
        } catch (error) {
            if (error.status === 401) setSubmitError('Invalid email or password.');
            else setSubmitError(error.message || 'Login failed. Please try again.');
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
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Welcome Back</h1>
                    </div>
                    {successMessage && (
                        <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-green-200 leading-relaxed">{successMessage}</p>
                        </div>
                    )}
                    {submitError && (
                        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-200 leading-relaxed">{submitError}</p>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-slate-500" /></div>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-xl outline-none text-slate-200" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-slate-500" /></div>
                                <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-xl outline-none text-slate-200" />
                            </div>
                        </div>
                        <button type="submit" disabled={isSubmitting} className="w-full mt-6 py-3 px-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl flex justify-center items-center">
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log In'}
                        </button>
                    </form>
                    <div className="mt-8 text-center text-sm text-slate-400">
                        Don't have an account? <Link to="/register" className="text-indigo-400 hover:text-indigo-300">Register here</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default LoginPage;

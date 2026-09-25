import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Package, ShieldCheck } from 'lucide-react';

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname.startsWith(path);

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-slate-200">
            <nav className="border-b border-white/10 bg-white/5 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-8">
                            <Link to="/dashboard" className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                <Package className="w-6 h-6 text-indigo-400" />
                                PMS
                            </Link>
                            <div className="hidden md:flex space-x-2">
                                <Link 
                                    to="/dashboard" 
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isActive('/dashboard') ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-white/5 text-slate-300 hover:text-white'}`}
                                >
                                    <LayoutDashboard className="w-4 h-4" />
                                    Dashboard
                                </Link>
                                <Link 
                                    to="/products" 
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isActive('/products') ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-white/5 text-slate-300 hover:text-white'}`}
                                >
                                    <Package className="w-4 h-4" />
                                    Products
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                {user?.role === 'ADMIN' && <ShieldCheck className="w-4 h-4 text-purple-400" title="Admin privileges" />}
                                <span>{user?.name}</span>
                            </div>
                            <div className="w-px h-6 bg-white/10 hidden sm:block"></div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-colors text-sm text-slate-300"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
                <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
                <div className="relative z-10">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;

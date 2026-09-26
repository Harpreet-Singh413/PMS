import { useState, useEffect } from 'react';
import { Package, CheckCircle, Tags, AlertTriangle, IndianRupee, Loader2 } from 'lucide-react';
import { getDashboardSummary } from '../services/dashboardService';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl transition-all hover:bg-white/10">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-slate-400">{title}</p>
                <p className="text-3xl font-bold mt-2 text-slate-100">{value}</p>
            </div>
            <div className={`p-4 rounded-xl bg-white/5 border border-white/5 ${colorClass}`}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
    </div>
);

const DashboardPage = () => {
    const { user } = useAuth();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const data = await getDashboardSummary();
                setSummary(data);
            } catch (err) {
                setError('Failed to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">Overview</h1>
                    <p className="text-slate-400 text-sm mt-1">Welcome back, {user?.name}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard 
                    title="Total Products" 
                    value={summary?.totalProducts || 0} 
                    icon={Package} 
                    colorClass="text-indigo-400" 
                />
                <StatCard 
                    title="Available Products" 
                    value={summary?.availableProducts || 0} 
                    icon={CheckCircle} 
                    colorClass="text-emerald-400" 
                />
                <StatCard 
                    title="Total Categories" 
                    value={summary?.totalCategories || 0} 
                    icon={Tags} 
                    colorClass="text-purple-400" 
                />
                
                {user?.role === 'ADMIN' && (
                    <>
                        <StatCard 
                            title="Low Stock Alerts" 
                            value={summary?.lowStockCount || 0} 
                            icon={AlertTriangle} 
                            colorClass="text-amber-400" 
                        />
                        <StatCard 
                            title="Total Inventory Value" 
                            value={`₹${summary?.totalInventoryValue?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) || '0.00'}`} 
                            icon={IndianRupee} 
                            colorClass="text-blue-400" 
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;

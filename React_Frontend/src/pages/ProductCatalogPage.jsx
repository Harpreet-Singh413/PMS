import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Loader2, AlertCircle, PackageX } from 'lucide-react';
import { getProducts, deleteProduct } from '../services/productService';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ProductCatalogPage = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getProducts(page, 10, searchQuery, categoryFilter);
            setProducts(data.content);
            setTotalPages(data.totalPages);
        } catch (err) {
            setError('Failed to load products.');
        } finally {
            setLoading(false);
        }
    }, [page, searchQuery, categoryFilter]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get('/products/categories');
                setCategories(res.data);
            } catch (err) {
                console.error('Failed to fetch categories');
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(0);
        setSearchQuery(searchInput);
    };

    const handleCategoryChange = (e) => {
        setPage(0);
        setCategoryFilter(e.target.value);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await deleteProduct(id);
            fetchProducts();
        } catch (err) {
            alert('Failed to delete product.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">Product Catalog</h1>
                    <p className="text-slate-400 text-sm mt-1">Manage and view your inventory</p>
                </div>
                {isAdmin && (
                    <Link
                        to="/products/new"
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Add Product
                    </Link>
                )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-xl">
                <form onSubmit={handleSearch} className="flex-1 relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name or SKU..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none text-slate-200 placeholder:text-slate-500"
                    />
                </form>
                <select
                    value={categoryFilter}
                    onChange={handleCategoryChange}
                    className="sm:w-48 px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none text-slate-200"
                >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="bg-slate-900/50 text-slate-400 font-medium border-b border-white/10">
                            <tr>
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">SKU</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Stock</th>
                                {isAdmin && <th className="px-6 py-4 text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={isAdmin ? 6 : 5} className="px-6 py-12 text-center">
                                        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan={isAdmin ? 6 : 5} className="px-6 py-12 text-center text-slate-500">
                                        <PackageX className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        No products found
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-200">{product.name}</td>
                                        <td className="px-6 py-4 text-slate-400 font-mono text-xs">{product.sku}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded-full bg-slate-800 text-xs font-medium border border-white/10">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-emerald-400 font-medium">${product.price.toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <span className={product.stock < 10 ? 'text-amber-400 font-medium' : ''}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        {isAdmin && (
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <Link
                                                    to={`/products/edit/${product.id}`}
                                                    className="inline-flex items-center p-2 rounded-lg hover:bg-indigo-500/20 text-indigo-400 transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="inline-flex items-center p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-white/10 bg-slate-900/50 flex items-center justify-between">
                        <button
                            disabled={page === 0}
                            onClick={() => setPage(p => p - 1)}
                            className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-slate-400">
                            Page {page + 1} of {totalPages}
                        </span>
                        <button
                            disabled={page === totalPages - 1}
                            onClick={() => setPage(p => p + 1)}
                            className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductCatalogPage;

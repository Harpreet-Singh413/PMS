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
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Product Catalog</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage and view your inventory</p>
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

            <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/10 backdrop-blur-xl shadow-sm dark:shadow-none">
                <form onSubmit={handleSearch} className="flex-1 relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name or SKU..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                </form>
                <select
                    value={categoryFilter}
                    onChange={handleCategoryChange}
                    className="sm:w-48 px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none text-slate-900 dark:text-slate-200"
                >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading ? (
                    <div className="col-span-full py-12 text-center">
                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
                    </div>
                ) : products.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-slate-500 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                        <PackageX className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        No products found
                    </div>
                ) : (
                    products.map((product) => (
                        <div key={product.id} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-sm hover:shadow-md transition-all flex flex-col group">
                            <div className="aspect-square bg-slate-100 dark:bg-slate-800/50 relative overflow-hidden flex items-center justify-center">
                                {product.imageUrl ? (
                                    <img src={product.imageUrl.startsWith('http') ? product.imageUrl : api.defaults.baseURL.replace('/api', '') + product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                ) : (
                                    <PackageX className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                                )}
                                {product.stock < 10 && product.stock > 0 && (
                                    <span className="absolute top-3 right-3 px-2.5 py-1 bg-amber-500 text-white text-xs font-bold rounded-lg shadow-sm backdrop-blur-md">
                                        Low Stock
                                    </span>
                                )}
                                {product.stock === 0 && (
                                    <span className="absolute top-3 right-3 px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-lg shadow-sm backdrop-blur-md">
                                        Out of Stock
                                    </span>
                                )}
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-2" title={product.name}>{product.name}</h3>
                                </div>
                                <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">₹{product.price.toFixed(2)}</div>
                                <div className="text-sm text-slate-500 dark:text-slate-400 mb-4 font-mono">{product.sku}</div>
                                
                                <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100 dark:border-white/5">
                                    <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-white/10 truncate max-w-[120px]">
                                        {product.category}
                                    </span>
                                    <div className="text-sm text-slate-600 dark:text-slate-400">
                                        Stock: <span className={`font-medium ${product.stock < 10 ? 'text-amber-600 dark:text-amber-400' : ''}`}>{product.stock}</span>
                                    </div>
                                </div>
                                {isAdmin && (
                                    <div className="mt-4 flex gap-2 pt-4 border-t border-slate-100 dark:border-white/5">
                                        <Link
                                            to={`/products/edit/${product.id}`}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 font-medium transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" /> Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="p-2 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                                            title="Delete product"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {!loading && totalPages > 1 && (
                <div className="flex items-center justify-between p-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl backdrop-blur-xl">
                    <button
                        disabled={page === 0}
                        onClick={() => setPage(p => p - 1)}
                        className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                        Page {page + 1} of {totalPages}
                    </span>
                    <button
                        disabled={page === totalPages - 1}
                        onClick={() => setPage(p => p + 1)}
                        className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProductCatalogPage;

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Save, AlertCircle } from 'lucide-react';
import { getProductById, createProduct, updateProduct } from '../services/productService';

const ProductFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        category: '',
        description: '',
        price: '',
        stock: '',
        supplier: ''
    });

    const [loading, setLoading] = useState(isEditMode);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        if (isEditMode) {
            const fetchProduct = async () => {
                try {
                    const data = await getProductById(id);
                    setFormData({
                        name: data.name,
                        sku: data.sku,
                        category: data.category,
                        description: data.description || '',
                        price: data.price,
                        stock: data.stock,
                        supplier: data.supplier || ''
                    });
                } catch (err) {
                    setError('Failed to load product details.');
                } finally {
                    setLoading(false);
                }
            };
            fetchProduct();
        }
    }, [id, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (validationErrors[name]) {
            setValidationErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setValidationErrors({});

        try {
            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock, 10)
            };

            if (isEditMode) {
                await updateProduct(id, payload);
            } else {
                await createProduct(payload);
            }
            navigate('/products');
        } catch (err) {
            if (err.status === 409) {
                setError('A product with this SKU already exists.');
            } else if (err.status === 400 && err.errors) {
                setValidationErrors(err.errors);
            } else {
                setError(err.message || 'Failed to save product.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/products')}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">
                        {isEditMode ? 'Edit Product' : 'Add New Product'}
                    </h1>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Product Name *</label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full px-4 py-2.5 bg-slate-900/50 border ${validationErrors.name ? 'border-red-500/50' : 'border-white/10'} rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none text-slate-200`}
                        />
                        {validationErrors.name && <p className="text-xs text-red-400 mt-1 ml-1">{validationErrors.name}</p>}
                    </div>

                    {/* SKU */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">SKU *</label>
                        <input
                            type="text"
                            name="sku"
                            required
                            placeholder="e.g. PROD-123"
                            value={formData.sku}
                            onChange={handleChange}
                            className={`w-full px-4 py-2.5 bg-slate-900/50 border ${validationErrors.sku ? 'border-red-500/50' : 'border-white/10'} rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none text-slate-200 font-mono`}
                        />
                        {validationErrors.sku && <p className="text-xs text-red-400 mt-1 ml-1">{validationErrors.sku}</p>}
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Category *</label>
                        <input
                            type="text"
                            name="category"
                            required
                            value={formData.category}
                            onChange={handleChange}
                            className={`w-full px-4 py-2.5 bg-slate-900/50 border ${validationErrors.category ? 'border-red-500/50' : 'border-white/10'} rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none text-slate-200`}
                        />
                        {validationErrors.category && <p className="text-xs text-red-400 mt-1 ml-1">{validationErrors.category}</p>}
                    </div>

                    {/* Price */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Price (₹) *</label>
                        <input
                            type="number"
                            name="price"
                            required
                            min="0.01"
                            step="0.01"
                            value={formData.price}
                            onChange={handleChange}
                            className={`w-full px-4 py-2.5 bg-slate-900/50 border ${validationErrors.price ? 'border-red-500/50' : 'border-white/10'} rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none text-slate-200`}
                        />
                        {validationErrors.price && <p className="text-xs text-red-400 mt-1 ml-1">{validationErrors.price}</p>}
                    </div>

                    {/* Stock */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Initial Stock *</label>
                        <input
                            type="number"
                            name="stock"
                            required
                            min="0"
                            step="1"
                            value={formData.stock}
                            onChange={handleChange}
                            className={`w-full px-4 py-2.5 bg-slate-900/50 border ${validationErrors.stock ? 'border-red-500/50' : 'border-white/10'} rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none text-slate-200`}
                        />
                        {validationErrors.stock && <p className="text-xs text-red-400 mt-1 ml-1">{validationErrors.stock}</p>}
                    </div>

                    {/* Supplier */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Supplier (Optional)</label>
                        <input
                            type="text"
                            name="supplier"
                            value={formData.supplier}
                            onChange={handleChange}
                            className={`w-full px-4 py-2.5 bg-slate-900/50 border ${validationErrors.supplier ? 'border-red-500/50' : 'border-white/10'} rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none text-slate-200`}
                        />
                        {validationErrors.supplier && <p className="text-xs text-red-400 mt-1 ml-1">{validationErrors.supplier}</p>}
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Description (Optional)</label>
                        <textarea
                            name="description"
                            rows="4"
                            value={formData.description}
                            onChange={handleChange}
                            className={`w-full px-4 py-2.5 bg-slate-900/50 border ${validationErrors.description ? 'border-red-500/50' : 'border-white/10'} rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none text-slate-200 resize-none`}
                        ></textarea>
                        {validationErrors.description && <p className="text-xs text-red-400 mt-1 ml-1">{validationErrors.description}</p>}
                    </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/products')}
                        className="px-6 py-2.5 rounded-xl font-medium text-slate-300 hover:bg-white/10 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {submitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        {isEditMode ? 'Save Changes' : 'Create Product'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductFormPage;

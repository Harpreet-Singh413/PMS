import api from './api';

export const getProducts = async (page = 0, size = 10, search = '', category = '') => {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (size) params.append('size', size);
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    
    const response = await api.get(`/products?${params.toString()}`);
    return response.data;
};

export const getProductById = async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
};

export const createProduct = async (productData) => {
    try {
        const response = await api.post('/products', productData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const updateProduct = async (id, productData) => {
    try {
        const response = await api.put(`/products/${id}`, productData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const deleteProduct = async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
};

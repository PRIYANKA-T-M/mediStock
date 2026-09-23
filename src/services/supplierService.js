import api from './api';

const supplierService = {
  async getAll(params = {}) {
    const response = await api.get('/api/suppliers', { params });
    return response.data;
  },
  async create(payload) {
    const response = await api.post('/api/suppliers', payload);
    return response.data;
  },
  async update(id, payload) {
    const response = await api.put(`/api/suppliers/${id}`, payload);
    return response.data;
  },
  async remove(id) {
    await api.delete(`/api/suppliers/${id}`);
  },
};

export default supplierService;

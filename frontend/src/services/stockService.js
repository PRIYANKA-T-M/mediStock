import api from './api';

const stockService = {
  async getAll() {
    const response = await api.get('/api/stock');
    return response.data;
  },
  async updateQuantity(id, quantity) {
    const response = await api.patch(`/api/stock/${id}`, { quantity });
    return response.data;
  },
  async refreshAlerts() {
    await api.post('/api/stock/refresh-alerts');
  },
};

export default stockService;

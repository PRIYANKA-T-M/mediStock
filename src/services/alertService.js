import api from './api';

const alertService = {
  async getAll(params = {}) {
    const response = await api.get('/api/alerts', { params });
    return response.data;
  },
  async acknowledge(id) {
    const response = await api.patch(`/api/alerts/${id}/acknowledge`);
    return response.data;
  },
  async resolve(id) {
    const response = await api.patch(`/api/alerts/${id}/resolve`);
    return response.data;
  },
  async remove(id) {
    await api.delete(`/api/alerts/${id}`);
  },
  async detectLowStock(items) {
    const response = await api.post('/api/alerts/detect-low-stock', { items });
    return response.data;
  },
};

export default alertService;

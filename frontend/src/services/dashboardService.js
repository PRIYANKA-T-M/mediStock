import api from './api';

const dashboardService = {
  async getSummary() {
    const response = await api.get('/api/dashboard/summary');
    return response.data;
  },
};

export default dashboardService;

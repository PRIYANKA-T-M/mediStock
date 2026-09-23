import api from "./api";

const notificationService = {

  async getNotifications(params = {}) {
    const response = await api.get(
      "/api/alerts",
      { params }
    );

    return response.data;
  },

  async getUnreadCount() {
    const response = await api.get(
      "/api/alerts",
      {
        params: {
          status: "OPEN",
        },
      }
    );

    return response.data.length;
  },

  async acknowledge(id) {
    const response = await api.patch(
      `/api/alerts/${id}/acknowledge`
    );

    return response.data;
  },

  async resolve(id) {
    const response = await api.patch(
      `/api/alerts/${id}/resolve`
    );

    return response.data;
  },
};

export default notificationService;
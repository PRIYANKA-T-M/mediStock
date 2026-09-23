import api from "./api";

const authService = {

  async login(credentials) {
    const response = await api.post(
      "/api/auth/login",
      credentials
    );

    return response.data;
  },

  async register(userData) {
    const response = await api.post(
      "/api/auth/register",
      userData
    );

    return response.data;
  },

  getCurrentUser() {
    try {
      const storedUser = localStorage.getItem("user");

      return storedUser
        ? JSON.parse(storedUser)
        : null;

    } catch (error) {
      console.error(
        "Unable to read current user:",
        error
      );

      return null;
    }
  },

  logout() {
    localStorage.removeItem("user");
  },

  handleError(error) {

    if (!error.response) {
      return "Unable to connect to the server. Please check your network or try again later.";
    }

    const { status, data } = error.response;

    if (
      data &&
      typeof data === "object" &&
      data.message
    ) {
      return data.message;
    }

    if (data && typeof data === "string") {
      return data;
    }

    switch (status) {

      case 400:
        return "Invalid request. Please check your details.";

      case 401:
        return "Invalid email or password.";

      case 403:
        return "Access forbidden. You do not have permission.";

      case 404:
        return "Requested endpoint not found.";

      case 409:
        return "An account with this email already exists.";

      case 500:
        return "Server error. Please try again later.";

      default:
        return "Something went wrong. Please try again.";

    }
  },
};
export default authService;


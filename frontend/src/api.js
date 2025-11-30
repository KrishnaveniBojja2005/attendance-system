import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "https://attendance-backend-adt2.onrender.com/api";

const instance = axios.create({
  baseURL: API_BASE
});

// set token automatically
export const setToken = (token) => {
  if (token) {
    instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete instance.defaults.headers.common["Authorization"];
  }
};

export default instance;

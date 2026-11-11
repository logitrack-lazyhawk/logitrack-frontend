import axios from "axios";

// Instancia de Axios apuntando al API Gateway
const axiosClient = axios.create({
    baseURL: "http://localhost:8066",
    headers: {
        "Content-Type": "application/json",
    },
});

// INTERCEPTOR DE PETICIÓN: Adjunta el token JWT automáticamente
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// INTERCEPTOR DE RESPUESTA: Manejo de errores
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const isAuthRequest =
            error.config?.url?.includes("/api/auth/login") ||
            error.config?.url?.includes("/realms/") ||
            error.config?.url?.includes("/openid-connect/token");

        // Si es una petición de login, dejamos que el componente Login maneje el error sin forzar recarga
        if (isAuthRequest) {
            return Promise.reject(error);
        }

        // Si el token expiró o fue rechazado en una ruta protegida (401)
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("rol");
            localStorage.removeItem("email");

            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);

export default axiosClient;

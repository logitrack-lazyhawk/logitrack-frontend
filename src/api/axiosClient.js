import axios from "axios";

// Creamos una instancia de Axios apuntando al API Gateway
const axiosClient = axios.create({
    baseURL: "http://localhost:8066", // El puerto del Gateway
    headers: {
        "Content-Type": "application/json",
    },
});

// INTERCEPTOR DE PETICIÓN: Adjunta el token automáticamente
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

// INTERCEPTOR DE RESPUESTA: Manejo global de errores (F30)
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Si el token expiró o no es válido (401), sacamos al usuario
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login"; // Redirección forzada
        }

        // Si es un 403 (sin permisos), o 400/500, mostramos un mensaje amigable
        if (error.response && error.response.status === 403) {
            alert("No tienes permisos para realizar esta acción.");
        } else if (error.response && error.response.data && error.response.data.message) {
            // El backend (ProblemDetail) envía un campo 'message'
            alert(`Error: ${error.response.data.message}`);
        } else if (error.request) {
            alert("Error de conexión con el servidor. Intenta más tarde.");
        }

        return Promise.reject(error);
    }
);

export default axiosClient;
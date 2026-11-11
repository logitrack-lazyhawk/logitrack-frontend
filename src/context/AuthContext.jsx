import { createContext, useContext, useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";

const AuthContext = createContext(null);

// Cuentas oficiales del Realm LazyHawk (Keycloak / Local)
const CUENTAS_AUTORIZADAS = [
    { email: "admin@logitrack.com", pass: "admin123", rol: "ADMIN" },
    { email: "repartidor@logitrack.com", pass: "repartidor123", rol: "REPARTIDOR" },
    { email: "cliente@logitrack.com", pass: "cliente123", rol: "CLIENTE" },
    { email: "vendedor@logitrack.com", pass: "vendedor123", rol: "VENDEDOR" },
];

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem("token") || "");
    const [user, setUser] = useState(() => {
        const storedToken = localStorage.getItem("token");
        const email = localStorage.getItem("email");
        const rol = localStorage.getItem("rol");
        if (storedToken && email && rol) {
            return { email, rol, activo: true };
        }
        return null;
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (!storedToken) {
            setUser(null);
            return;
        }

        // Intenta validar la sesión contra /api/auth/me si existe backend
        axiosClient
            .get("/api/auth/me")
            .then((res) => {
                if (res.data?.datos) {
                    setUser(res.data.datos);
                    localStorage.setItem("rol", res.data.datos.rol || "ADMIN");
                    localStorage.setItem("email", res.data.datos.email || "");
                }
            })
            .catch((err) => {
                // Si el servidor rechaza el token explícitamente con 401
                if (err.response?.status === 401) {
                    logout();
                }
            });
    }, [token]);

    const login = async (email, password) => {
        const emailLimpio = String(email || "").trim().toLowerCase();
        const passLimpio = String(password || "").trim();

        if (!emailLimpio || !passLimpio) {
            return {
                success: false,
                error: "Debes ingresar tu correo electrónico y contraseña.",
            };
        }

        // 1. Intento de autenticación contra el backend / Keycloak
        try {
            // Intentar primero formato JSON (security-service)
            const res = await axiosClient.post("/api/auth/login", {
                email: emailLimpio,
                password: passLimpio,
            });

            const data = res.data;
            const authToken = data.token || data.access_token;
            if (authToken) {
                const userRole = data.rol || "ADMIN";
                const userEmail = data.email || emailLimpio;

                localStorage.setItem("token", authToken);
                localStorage.setItem("rol", userRole);
                localStorage.setItem("email", userEmail);

                setToken(authToken);
                setUser({ email: userEmail, rol: userRole, activo: true });
                return { success: true };
            }
        } catch (errBackend) {
            // Si el backend respondió 401 o 400 (Credenciales rechazadas por Keycloak / Spring)
            if (errBackend.response && (errBackend.response.status === 401 || errBackend.response.status === 400)) {
                return {
                    success: false,
                    error: "Credenciales inválidas. Verifica tu correo y contraseña.",
                };
            }

            // Si el backend no está disponible (error de red o fuera de línea),
            // verificamos ESTRICTAMENTE contra las cuentas autorizadas del Realm
            console.warn("Backend offline o inaccesible, validando contra usuarios del realm:", errBackend.message);
        }

        // 2. Validación estricta contra las cuentas oficiales del realm
        const cuentaValida = CUENTAS_AUTORIZADAS.find(
            (c) => c.email.toLowerCase() === emailLimpio && c.pass === passLimpio
        );

        if (!cuentaValida) {
            return {
                success: false,
                error: "Credenciales inválidas. El usuario o contraseña ingresados no existen en el sistema.",
            };
        }

        // Credenciales correctas
        const sessionToken = `jwt-${cuentaValida.rol.toLowerCase()}-${Date.now()}`;
        localStorage.setItem("token", sessionToken);
        localStorage.setItem("rol", cuentaValida.rol);
        localStorage.setItem("email", cuentaValida.email);

        setToken(sessionToken);
        setUser({ email: cuentaValida.email, rol: cuentaValida.rol, activo: true });
        return { success: true };
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("rol");
        localStorage.removeItem("email");
        setToken("");
        setUser(null);
    };

    const hasRole = (allowedRoles = []) => {
        if (!user || !user.rol) return false;
        if (allowedRoles.length === 0) return true;
        return allowedRoles.includes(user.rol);
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                loading,
                login,
                logout,
                hasRole,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    return context;
}

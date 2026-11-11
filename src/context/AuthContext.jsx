import { createContext, useContext, useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem("token") || "");
    const [user, setUser] = useState(() => {
        const email = localStorage.getItem("email") || "admin@logitrack.com";
        const rol = localStorage.getItem("rol") || "ADMIN";
        return token ? { email, rol, activo: true } : null;
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function verifySession() {
            const storedToken = localStorage.getItem("token");
            if (!storedToken) {
                if (isMounted) {
                    setUser(null);
                    setLoading(false);
                }
                return;
            }

            try {
                // Intenta validar contra el endpoint oficial de security-service
                const response = await axiosClient.get("/api/auth/me");
                if (isMounted && response.data?.datos) {
                    setUser(response.data.datos);
                    localStorage.setItem("rol", response.data.datos.rol || "ADMIN");
                    localStorage.setItem("email", response.data.datos.email || "");
                }
            } catch (err) {
                // Si el backend no está disponible o es token local demo, preserva datos locales
                console.warn("No se pudo verificar /api/auth/me en vivo, usando datos de sesión local.");
                if (isMounted) {
                    const email = localStorage.getItem("email") || "admin@logitrack.com";
                    const rol = localStorage.getItem("rol") || "ADMIN";
                    setUser({ email, rol, activo: true });
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        verifySession();

        return () => {
            isMounted = false;
        };
    }, [token]);

    const login = async (email, password, demoRole = null) => {
        if (demoRole) {
            // Acceso de prueba / demostración rápida
            const demoToken = `demo-token-${demoRole.toLowerCase()}-${Date.now()}`;
            localStorage.setItem("token", demoToken);
            localStorage.setItem("rol", demoRole);
            localStorage.setItem("email", email || `${demoRole.toLowerCase()}@logitrack.com`);
            setToken(demoToken);
            setUser({ email: email || `${demoRole.toLowerCase()}@logitrack.com`, rol: demoRole, activo: true });
            return { success: true };
        }

        try {
            const response = await axiosClient.post("/api/auth/login", { email, password });
            const data = response.data;
            const authToken = data.token || data.access_token || "token-auth";
            const userRole = data.rol || "ADMIN";
            const userEmail = data.email || email;

            localStorage.setItem("token", authToken);
            localStorage.setItem("rol", userRole);
            localStorage.setItem("email", userEmail);

            setToken(authToken);
            setUser({ email: userEmail, rol: userRole, activo: true });
            return { success: true };
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.response?.data?.detail || "Error al iniciar sesión.";
            return { success: false, error: errorMsg };
        }
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
        <AuthContext.Provider value={{ token, user, loading, login, logout, hasRole, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe utilizarse dentro de un AuthProvider");
    }
    return context;
}

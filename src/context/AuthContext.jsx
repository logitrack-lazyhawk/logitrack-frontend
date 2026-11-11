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
            // El API Gateway enruta /api/auth/login a Keycloak Token Endpoint (/realms/lazyhawk/protocol/openid-connect/token)
            // Keycloak requiere Content-Type application/x-www-form-urlencoded y los parámetros client_id, grant_type, username y password
            const params = new URLSearchParams();
            params.append('client_id', 'logitrack-frontend');
            params.append('grant_type', 'password');
            params.append('username', emailLimpio);
            params.append('password', passLimpio);

            const res = await axiosClient.post("/api/auth/login", params, {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            });

            const data = res.data;
            const authToken = data.access_token || data.token;
            if (authToken) {
                // Decodificar el rol y datos desde el JWT devuelto por Keycloak
                let userRole = data.rol;
                let userEmail = emailLimpio;

                try {
                    const partes = authToken.split('.');
                    if (partes.length === 3) {
                        const payload = JSON.parse(atob(partes[1].replace(/-/g, '+').replace(/_/g, '/')));
                        const lista = valor => Array.isArray(valor) ? valor : typeof valor === 'string' ? [valor] : [];
                        const roles = [...lista(payload.roles), ...lista(payload.realm_access?.roles),
                            ...Object.values(payload.resource_access ?? {}).flatMap(client => lista(client?.roles))]
                            .filter(rol => typeof rol === 'string').map(rol => rol.toUpperCase().replace(/^ROLE_/, ''));
                        if (roles.includes('ADMIN')) userRole = 'ADMIN';
                        else if (roles.includes('CLIENTE')) userRole = 'CLIENTE';
                        else if (roles.includes('REPARTIDOR')) userRole = 'REPARTIDOR';
                        else if (roles.includes('VENDEDOR')) userRole = 'VENDEDOR';
                        else if (roles.length > 0) userRole = roles[0];
                        userEmail = payload.email || payload.preferred_username || emailLimpio;
                    }
                } catch (e) {
                    console.warn("No se pudo decodificar el payload del token:", e);
                }

                userRole = userRole || "ADMIN";

                localStorage.setItem("token", authToken);
                localStorage.setItem("rol", userRole);
                localStorage.setItem("email", userEmail);
                window.dispatchEvent(new Event('logitrack:sesion'));

                setToken(authToken);
                setUser({ email: userEmail, rol: userRole, activo: true });
                return { success: true };
            }
        } catch (errBackend) {
            // Si el backend/Keycloak respondió 401 o 400 (Credenciales rechazadas por Keycloak)
            if (errBackend.response && (errBackend.response.status === 401 || errBackend.response.status === 400)) {
                const desc = errBackend.response.data?.error_description || "Credenciales inválidas. Verifica tu correo y contraseña.";
                return {
                    success: false,
                    error: desc,
                };
            }

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

    const registerClient = async ({ nombre, dni, telefono, email, password }) => {
        setLoading(true);
        const emailLimpio = String(email || "").trim().toLowerCase();
        const passLimpio = String(password || "").trim();
        const nombreLimpio = String(nombre || "").trim();
        const dniLimpio = String(dni || "").trim().replace(/\D/g, "");
        const telLimpio = String(telefono || "").trim();

        if (!emailLimpio || !passLimpio || !nombreLimpio || !dniLimpio || !telLimpio) {
            setLoading(false);
            return {
                success: false,
                error: "Todos los campos son obligatorios para el registro del cliente.",
            };
        }

        // 1. Registro en IAM / Keycloak vía API Gateway
        try {
            const payload = {
                username: emailLimpio,
                email: emailLimpio,
                password: passLimpio,
                firstName: nombreLimpio,
                lastName: "Cliente",
                rol: "CLIENTE",
            };
            await axiosClient.post("/api/auth/registro", payload);
        } catch (errAuth) {
            setLoading(false);
            if (errAuth.response?.status === 409) {
                return {
                    success: false,
                    error: "El correo electrónico ya se encuentra registrado en el sistema.",
                };
            }
            const msgError = errAuth.response?.data?.error || errAuth.response?.data?.mensaje || errAuth.message;
            return {
                success: false,
                error: `Error al registrar usuario en el servidor: ${msgError}`,
            };
        }

        // 2. Iniciar sesión para obtener credenciales y token
        const loginRes = await login(emailLimpio, passLimpio);
        if (!loginRes.success) {
            setLoading(false);
            return {
                success: false,
                error: loginRes.error || "Usuario registrado, pero ocurrió un problema al iniciar sesión. Intenta ingresar desde el Login.",
            };
        }

        // 3. Crear el perfil de cliente en shipment-service (/api/v1/clientes)
        try {
            await axiosClient.post("/api/v1/clientes", {
                nombre: nombreLimpio,
                dni: dniLimpio,
                telefono: telLimpio,
                email: emailLimpio,
            });
        } catch (errPerfil) {
            console.warn("No se pudo sincronizar la ficha de cliente en shipment-service:", errPerfil.message);
        }

        setLoading(false);
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
                registerClient,
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

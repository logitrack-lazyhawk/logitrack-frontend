import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();

        // SIMULACIÓN: Aquí Luis luego conectará Keycloak.
        // Por ahora, si el email y pass no están vacíos, guardamos un token falso.
        if (email && password) {
            localStorage.setItem("token", "token-falso-para-probar");
            localStorage.setItem("rol", "ADMIN"); // Simulamos que es admin
            navigate("/"); // Redirigimos al Dashboard
        } else {
            alert("Por favor, ingresa email y contraseña");
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#ecf0f1' }}>
            <form onSubmit={handleLogin} style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', width: '300px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>LogiTrack Login</h2>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Contraseña:</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                </div>

                <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Iniciar Sesión
                </button>
            </form>
        </div>
    );
}
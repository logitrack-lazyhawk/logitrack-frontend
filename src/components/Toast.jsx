export default function Toast({ message, type = "error", onClose }) {
    if (!message) return null;

    const bgColor = type === "error" ? "#e74c3c" : "#2ecc71";

    return (
        <div style={{
            position: "fixed", top: "20px", right: "20px",
            backgroundColor: bgColor, color: "white",
            padding: "15px 25px", borderRadius: "5px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)", zIndex: 1000,
            display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px"
        }}>
            <span>{message}</span>
            <button onClick={onClose} style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontWeight: "bold" }}>X</button>
        </div>
    );
}
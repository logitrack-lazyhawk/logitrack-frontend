export default function Toast({ message, type = 'error', onClose }) {
    if (!message) return null;
    return <div className={`toast toast--${type}`} role={type === 'error' ? 'alert' : 'status'}>
        <span>{message}</span><button type="button" onClick={onClose} aria-label="Cerrar notificación">×</button>
    </div>;
}

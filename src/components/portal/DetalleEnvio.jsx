import { ETIQUETAS_ESTADO, formatearDireccion } from '../../contracts/envioContract';
import Icon from './Icon';

const ESTADOS = ['PENDIENTE', 'EN_RUTA', 'ENTREGADO'];
const DESCRIPCIONES = ['Recibimos tu solicitud', 'Camino a su destino', 'Entrega completada'];

function EstadoBadge({ estado }) {
    const conocido = Object.hasOwn(ETIQUETAS_ESTADO, estado) ? estado : 'DESCONOCIDO';
    return (
        <span className={`estado-badge estado-badge--${conocido.toLowerCase()}`}>
            {ETIQUETAS_ESTADO[conocido]}
        </span>
    );
}

function Seguimiento({ estado }) {
    if (estado === 'CANCELADO') {
        return <p className="notice notice--error" role="status">Este envío fue cancelado. Su recorrido no continuará.</p>;
    }
    const actual = ESTADOS.indexOf(estado);
    if (actual < 0) return <p className="notice">El estado de este envío todavía no está disponible.</p>;
    return (
        <ol className="tracking-timeline" aria-label="Progreso del envío">
            {ESTADOS.map((paso, indice) => (
                <li key={paso} className={indice <= actual ? 'is-complete' : ''}
                    aria-current={paso === estado ? 'step' : undefined}>
                    <span className="timeline-dot">{indice < actual ? <Icon name="check" size={16} /> : indice + 1}</span>
                    <strong>{ETIQUETAS_ESTADO[paso]}</strong>
                    <small>{DESCRIPCIONES[indice]}</small>
                </li>
            ))}
        </ol>
    );
}

export default function DetalleEnvio({ envio }) {
    const dimensionesDisponibles = [envio.ancho, envio.alto, envio.largo].every(valor => valor != null);
    return (
        <article className="shipment-detail">
            <div className="section-heading">
                <div><p className="eyebrow">CÓDIGO DE SEGUIMIENTO</p><h2>{envio.codigoSeguimiento}</h2></div>
                <EstadoBadge estado={envio.estado} />
            </div>
            <Seguimiento estado={envio.estado} />
            <div className="address-summary">
                <div><span className="eyebrow">ORIGEN</span><p>{formatearDireccion(envio.origen)}</p></div>
                <Icon name="arrow" />
                <div><span className="eyebrow">DESTINO</span><p>{formatearDireccion(envio.destino)}</p></div>
            </div>
            <dl className="shipment-facts">
                <div><dt>Peso</dt><dd>{envio.peso != null ? `${envio.peso} kg` : 'No informado'}</dd></div>
                <div><dt>Dimensiones</dt><dd>{dimensionesDisponibles ? `${envio.ancho} × ${envio.alto} × ${envio.largo} cm` : 'No informadas'}</dd></div>
                {envio.tarifa != null && (
                    <div><dt>Tarifa</dt><dd>{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(envio.tarifa)}</dd></div>
                )}
            </dl>
        </article>
    );
}

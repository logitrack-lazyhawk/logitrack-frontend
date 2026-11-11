import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Icon from '../components/portal/Icon';

export default function InicioCliente() {
    const [codigo, setCodigo] = useState('');
    const navigate = useNavigate();

    function buscar(event) {
        event.preventDefault();
        if (codigo.trim()) navigate(`/mis-envios?tracking=${encodeURIComponent(codigo.trim())}`);
    }

    return (
        <div className="client-home">
            <section className="hero">
                <div className="hero-content">
                    <p className="eyebrow">TU ENVÍO. TU TRANQUILIDAD.</p>
                    <h1>Conectamos destinos.<br /><span>Acercamos personas.</span></h1>
                    <p>Desde el primer paso hasta la entrega. Organizá tus envíos y seguí su recorrido, todo en un solo lugar.</p>
                    <Link to="/crear-envio" className="button button--light">
                        <Icon name="plus" />Crear nuevo envío<Icon name="arrow" />
                    </Link>
                    <span className="hero-caption">Simple de enviar. Fácil de seguir.</span>
                </div>
                <div className="parcel-scene" aria-hidden="true">
                    <div className="orbit orbit-one" /><div className="orbit orbit-two" />
                    <span className="scene-label">ORIGEN <span>··········</span> DESTINO</span>
                    <div className="parcel"><div className="parcel-tape" /><Icon size={64} /><span>LAZYHAWK</span></div>
                    <div className="delivery-chip"><span className="delivery-dot" />Cada paso, a tu alcance<Icon name="check" /></div>
                </div>
            </section>
            <section className="home-tracking portal-panel">
                <div>
                    <p className="eyebrow">¿DÓNDE ESTÁ TU PAQUETE?</p>
                    <h2>Seguí su recorrido</h2>
                    <p>Consultá el estado de un envío de tu cuenta.</p>
                </div>
                <form onSubmit={buscar}>
                    <label htmlFor="home-tracking">Código de seguimiento</label>
                    <div className="search-row">
                        <input id="home-tracking" required maxLength={50} value={codigo}
                            onChange={event => setCodigo(event.target.value)} placeholder="Ej. LT-458921-A3F9B" />
                        <button className="button" type="submit"><Icon name="search" /><span>Buscar envío</span></button>
                    </div>
                </form>
            </section>
            <section className="home-actions" aria-label="Tus próximos pasos">
                <Link to="/crear-envio" className="action-card">
                    <span className="action-icon"><Icon name="plus" size={26} /></span>
                    <h2>Un nuevo destino</h2>
                    <p>Ingresá los datos de tu paquete y las direcciones. Nosotros calculamos la tarifa.</p>
                    <span className="action-link">Crear envío <Icon name="arrow" /></span>
                </Link>
                <Link to="/mis-envios" className="action-card">
                    <span className="action-icon action-icon--blue"><Icon name="box" size={26} /></span>
                    <h2>Todos tus envíos</h2>
                    <p>Encontrá tus paquetes, consultá los detalles y conocé el estado de cada entrega.</p>
                    <span className="action-link">Ver mis envíos <Icon name="arrow" /></span>
                </Link>
            </section>
            <p className="home-signature"><Icon name="truck" />Del origen al destino, con vos en cada paso.</p>
        </div>
    );
}

import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { obtenerMisEnvios, obtenerMiEnvioPorTracking } from '../api/enviosApi';
import { obtenerMensajeError } from '../api/errors';
import EnvioCardWeb from '../components/EnvioCardWeb';
import DetalleEnvio from '../components/portal/DetalleEnvio';
import Icon from '../components/portal/Icon';

const PAGE_SIZE = 8;

export default function MisEnvios() {
    const [params, setParams] = useSearchParams();
    const tracking = params.get('tracking') || '';
    const [codigo, setCodigo] = useState(tracking);
    const [pagina, setPagina] = useState(0);
    const [revision, setRevision] = useState(0);
    const [listado, setListado] = useState({ envios: [], totalPaginas: 0, total: 0, cargando: true, error: '' });
    const [detalle, setDetalle] = useState({ envio: null, cargando: false, error: '', codigo: '' });
    const [errorCodigo, setErrorCodigo] = useState('');
    const detalleRef = useRef(null);
    const resultado = tracking && detalle.codigo !== tracking
        ? { envio: null, cargando: true, error: '' }
        : detalle;

    useEffect(() => {
        const controller = new AbortController();
        obtenerMisEnvios(pagina, PAGE_SIZE, controller.signal).then(datos => {
            if (!controller.signal.aborted) {
                setListado({ envios: datos.content ?? [], totalPaginas: datos.totalPages ?? 0,
                    total: datos.totalElements ?? 0, cargando: false, error: '' });
            }
        }).catch(error => {
            if (!controller.signal.aborted) {
                setListado({ envios: [], totalPaginas: 0, total: 0, cargando: false, error: obtenerMensajeError(error) });
            }
        });
        return () => controller.abort();
    }, [pagina, revision]);

    useEffect(() => {
        if (!tracking.trim()) return;
        const controller = new AbortController();
        obtenerMiEnvioPorTracking(tracking, controller.signal).then(envio => {
            if (!controller.signal.aborted) {
                setDetalle({ envio, cargando: false, error: '', codigo: tracking });
                requestAnimationFrame(() => detalleRef.current?.focus({ preventScroll: true }));
            }
        }).catch(error => {
            if (!controller.signal.aborted) {
                setDetalle({ envio: null, cargando: false, error: obtenerMensajeError(error), codigo: tracking });
            }
        });
        return () => controller.abort();
    }, [tracking, revision]);

    function buscar(event) {
        event.preventDefault();
        if (!codigo.trim()) {
            setErrorCodigo('Ingresá un código de seguimiento.');
            return;
        }
        setErrorCodigo('');
        setDetalle({ envio: null, cargando: true, error: '', codigo: codigo.trim() });
        setParams({ tracking: codigo.trim() });
        if (codigo.trim() === tracking) setRevision(valor => valor + 1);
    }

    function actualizar() {
        setListado(prev => ({ ...prev, cargando: true, error: '' }));
        if (tracking) setDetalle({ envio: null, cargando: true, error: '', codigo: tracking });
        setRevision(valor => valor + 1);
    }

    function cambiarPagina(valor) {
        setListado(prev => ({ ...prev, cargando: true, error: '' }));
        setPagina(valor);
    }

    function seleccionarEnvio({ id }) {
        const envio = listado.envios.find(item => String(item.id) === id);
        if (!envio) return;
        setDetalle({ envio, cargando: false, error: '', codigo: envio.codigoSeguimiento });
        setCodigo(envio.codigoSeguimiento);
        setParams({ tracking: envio.codigoSeguimiento });
        requestAnimationFrame(() => {
            detalleRef.current?.focus({ preventScroll: true });
            detalleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    return (
        <section>
            <header className="page-heading section-heading">
                <div>
                    <p className="eyebrow">CADA PAQUETE, UNA HISTORIA</p>
                    <h1>Mis envíos</h1>
                    <p>Todo lo que enviaste, en un solo lugar.</p>
                </div>
                <Link className="button" to="/crear-envio"><Icon name="plus" />Crear envío</Link>
            </header>
            <section className="portal-panel tracking-search">
                <div className="section-heading">
                    <div><h2>¿Cómo va tu envío?</h2><p>Ingresá el código para conocer su recorrido.</p></div>
                    <span className="action-icon"><Icon name="search" /></span>
                </div>
                <form onSubmit={buscar} noValidate>
                    <label htmlFor="codigo-tracking">Código de seguimiento</label>
                    <div className="search-row">
                        <input id="codigo-tracking" value={codigo} maxLength={50}
                            onChange={event => { setCodigo(event.target.value); setErrorCodigo(''); }}
                            placeholder="Ej. LT-458921-A3F9B" aria-invalid={Boolean(errorCodigo)}
                            aria-describedby={errorCodigo ? 'codigo-error' : undefined} />
                        <button className="button" disabled={resultado.cargando} type="submit">
                            <Icon name="search" />{resultado.cargando ? 'Buscando…' : 'Buscar envío'}
                        </button>
                    </div>
                    {errorCodigo && <p id="codigo-error" className="field-error" role="alert">{errorCodigo}</p>}
                </form>
            </section>
            {tracking && (
                <section className="portal-panel tracking-result" ref={detalleRef} tabIndex={-1}
                    aria-label="Resultado del seguimiento" aria-busy={resultado.cargando}>
                    {resultado.cargando && <p className="loading-state" role="status">Buscando tu envío…</p>}
                    {resultado.error && <p className="notice notice--error" role="alert">{resultado.error}</p>}
                    {!resultado.cargando && resultado.envio && <DetalleEnvio envio={resultado.envio} />}
                </section>
            )}
            <section className="shipments-section" aria-busy={listado.cargando}>
                <div className="section-heading">
                    <h2>Tus paquetes {!listado.cargando && !listado.error && <span className="count-badge">{listado.total}</span>}</h2>
                    <button className="button button--secondary" onClick={actualizar} disabled={listado.cargando}>Actualizar</button>
                </div>
                {listado.cargando && (
                    <div className="loading-state portal-panel" role="status"><span className="loading-dot" />Cargando tus envíos…</div>
                )}
                {listado.error && (
                    <div className="notice notice--error" role="alert">
                        <p>{listado.error}</p><button className="button button--secondary" onClick={actualizar}>Reintentar</button>
                    </div>
                )}
                {!listado.cargando && !listado.error && !listado.envios.length && (
                    <div className="empty-state portal-panel">
                        <span className="action-icon"><Icon name="box" size={32} /></span>
                        <h2>Tu próximo destino empieza acá</h2>
                        <p>Cuando registres tu primer envío, vas a encontrarlo en este espacio.</p>
                        <Link to="/crear-envio" className="button">Crear mi primer envío<Icon name="arrow" /></Link>
                    </div>
                )}
                {!listado.cargando && !listado.error && listado.envios.length > 0 && (
                    <>
                        <div className="shipments-grid">
                            {listado.envios.map(envio => (
                                <EnvioCardWeb key={envio.id} envio={envio} contexto="cliente" onSeleccionar={seleccionarEnvio} />
                            ))}
                        </div>
                        <nav className="pagination" aria-label="Páginas de mis envíos">
                            <button className="button button--secondary" disabled={pagina === 0}
                                onClick={() => cambiarPagina(pagina - 1)}>Anterior</button>
                            <span>Página {pagina + 1} de {Math.max(listado.totalPaginas, 1)}</span>
                            <button className="button button--secondary" disabled={pagina + 1 >= listado.totalPaginas}
                                onClick={() => cambiarPagina(pagina + 1)}>Siguiente</button>
                        </nav>
                    </>
                )}
            </section>
        </section>
    );
}

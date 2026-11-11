import { useRef, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { crearMiEnvio } from '../api/enviosApi';
import { obtenerMensajeError } from '../api/errors';
import { CAMPOS_DIRECCION, DIMENSIONES, crearPeticion, nuevoFormulario, validarFormulario } from '../utils/crearEnvio';
import DetalleEnvio from '../components/portal/DetalleEnvio';
import Icon from '../components/portal/Icon';

function Campo({ id, label, error, ...props }) {
    return (
        <div className="form-field">
            <label htmlFor={id}>
                {label}{props.required ? <span aria-hidden="true"> *</span> : <span className="optional"> (opcional)</span>}
            </label>
            <input id={id} name={id} aria-invalid={Boolean(error)}
                aria-describedby={error ? `${id}-error` : undefined} {...props} />
            {error && <small id={`${id}-error`} className="field-error">{error}</small>}
        </div>
    );
}

export default function CrearEnvio() {
    const { showToast } = useOutletContext();
    const [formulario, setFormulario] = useState(nuevoFormulario);
    const [errores, setErrores] = useState({});
    const [errorGeneral, setErrorGeneral] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [resultado, setResultado] = useState(null);
    const bloqueo = useRef(false);
    const formRef = useRef(null);
    const confirmacionRef = useRef(null);

    function actualizar(nombre, valor, seccion) {
        const clave = seccion ? `${seccion}.${nombre}` : nombre;
        setFormulario(prev => seccion ? { ...prev, [seccion]: { ...prev[seccion], [nombre]: valor } } : { ...prev, [nombre]: valor });
        setErrores(prev => ({ ...prev, [clave]: '' }));
    }

    async function registrar(event) {
        event.preventDefault();
        if (bloqueo.current) return;
        const validaciones = validarFormulario(formulario);
        setErrores(validaciones);
        setErrorGeneral('');
        if (Object.keys(validaciones).length) {
            setErrorGeneral('Revisá los campos señalados antes de registrar el envío.');
            formRef.current.elements.namedItem(Object.keys(validaciones)[0])?.focus();
            return;
        }
        bloqueo.current = true;
        setEnviando(true);
        try {
            const envio = await crearMiEnvio(crearPeticion(formulario));
            setResultado(envio);
            showToast('Tu envío se registró correctamente.', 'success');
            requestAnimationFrame(() => confirmacionRef.current?.focus());
        } catch (error) {
            setErrorGeneral(obtenerMensajeError(error));
            const campos = error.response?.data?.fieldErrors;
            if (campos && typeof campos === 'object' && !Array.isArray(campos)) {
                setErrores(Object.fromEntries(Object.entries(campos).filter(([, valor]) => typeof valor === 'string')));
            }
        } finally {
            bloqueo.current = false;
            setEnviando(false);
        }
    }

    if (resultado) {
        return (
            <section className="creation-success" ref={confirmacionRef} tabIndex={-1}>
                <span className="success-icon"><Icon name="check" size={32} /></span>
                <p className="eyebrow">TODO LISTO</p>
                <h1>Tu envío ya tiene destino.</h1>
                <p>Guardá tu código de seguimiento. Podés consultar su estado cuando quieras en Mis envíos.</p>
                <div className="portal-panel"><DetalleEnvio envio={resultado} /></div>
                <div className="form-actions">
                    <button className="button button--secondary" onClick={() => {
                        setResultado(null);
                        setFormulario(nuevoFormulario());
                        setErrores({});
                    }}>Crear otro envío</button>
                    <Link className="button" to="/mis-envios">Ver mis envíos<Icon name="arrow" /></Link>
                </div>
            </section>
        );
    }

    return (
        <section>
            <header className="page-heading">
                <Link className="back-link" to="/">← Volver al inicio</Link>
                <p className="eyebrow">UN NUEVO DESTINO</p>
                <h1>Creá tu próximo envío</h1>
                <p>Contanos qué enviás y a dónde va. Nosotros nos encargamos de acercarlo.</p>
            </header>
            <div className="creation-layout">
                <form ref={formRef} onSubmit={registrar} noValidate aria-busy={enviando}>
                    <fieldset className="portal-panel form-section" disabled={enviando}>
                        <legend><span className="section-number">01</span>Datos del paquete</legend>
                        <p>Peso en kilogramos y dimensiones en centímetros. Todos los campos son obligatorios.</p>
                        <div className="form-grid form-grid--package">
                            {DIMENSIONES.map(campo => (
                                <Campo key={campo.name} id={campo.name} label={`${campo.label} (${campo.unit})`}
                                    required inputMode="decimal" type="text"
                                    placeholder={campo.name === 'peso' ? 'Ej. 2,5' : 'Ej. 20'}
                                    value={formulario[campo.name]} error={errores[campo.name]}
                                    onChange={event => actualizar(campo.name, event.target.value)} />
                            ))}
                        </div>
                    </fieldset>
                    {['origen', 'destino'].map((seccion, indice) => (
                        <fieldset className="portal-panel form-section" disabled={enviando} key={seccion}>
                            <legend><span className="section-number">0{indice + 2}</span>Dirección de {seccion}</legend>
                            <p>{seccion === 'origen' ? '¿Dónde retiramos tu paquete?' : '¿Dónde lo entregamos?'} Los campos con * son obligatorios.</p>
                            <div className="form-grid">
                                {CAMPOS_DIRECCION.map(campo => (
                                    <Campo key={campo.name} id={`${seccion}.${campo.name}`} label={campo.label}
                                        required={campo.required} maxLength={campo.max}
                                        value={formulario[seccion][campo.name]} error={errores[`${seccion}.${campo.name}`]}
                                        onChange={event => actualizar(campo.name, event.target.value, seccion)} />
                                ))}
                            </div>
                        </fieldset>
                    ))}
                    <section className="portal-panel form-confirm">
                        <div className="section-title"><span className="section-number">04</span><h2>Confirmá tu envío</h2></div>
                        <p>Revisá las direcciones y las medidas antes de continuar. La tarifa se calcula al registrar el envío y aparecerá en la confirmación.</p>
                        {errorGeneral && <p className="notice notice--error" role="alert">{errorGeneral}</p>}
                        <div className="form-actions">
                            <Link to="/mis-envios" className="text-link">Volver a mis envíos</Link>
                            <button className="button" type="submit" disabled={enviando}>
                                {enviando ? 'Registrando…' : 'Registrar envío'}<Icon name="arrow" />
                            </button>
                        </div>
                    </section>
                </form>
                <aside className="creation-help">
                    <div className="help-illustration"><Icon size={64} /></div>
                    <p className="eyebrow">DE ACÁ, PARA ALLÁ</p>
                    <h2>Prepará tu paquete para el viaje.</h2>
                    <p>Usá un embalaje resistente y protegé el contenido. Verificá que los datos de entrega sean correctos.</p>
                    <div className="help-note"><Icon name="check" /><span>Tu código de seguimiento se genera al confirmar el registro.</span></div>
                    <div className="help-note"><Icon name="check" /><span>El envío queda vinculado a tu cuenta de cliente.</span></div>
                </aside>
            </div>
        </section>
    );
}

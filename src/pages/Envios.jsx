
import { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { crearMiEnvio } from "../api/enviosApi";
import "./Envios.css";

const CAMPOS_DIRECCION = [
    { name: "calle", label: "Calle", required: true },
    { name: "numero", label: "Número", required: true },
    { name: "ciudad", label: "Ciudad", required: true },
    { name: "provincia", label: "Provincia", required: true },
    { name: "codigoPostal", label: "Código postal", required: true },
    { name: "localidad", label: "Localidad", required: false },
    { name: "descripcion", label: "Referencia adicional", required: false },
];

const DIMENSIONES = [
    { name: "peso", label: "Peso", unit: "kg" },
    { name: "ancho", label: "Ancho", unit: "cm" },
    { name: "alto", label: "Alto", unit: "cm" },
    { name: "largo", label: "Largo", unit: "cm" },
];

function nuevaDireccion() {
    return {
        calle: "",
        numero: "",
        ciudad: "",
        codigoPostal: "",
        provincia: "",
        localidad: "",
        descripcion: "",
    };
}

function nuevoFormulario() {
    return {
        peso: "",
        ancho: "",
        alto: "",
        largo: "",
        origen: nuevaDireccion(),
        destino: nuevaDireccion(),
    };
}

function convertirNumero(valor) {
    return Number(String(valor).trim().replace(",", "."));
}

function validarFormulario(datos) {
    const errores = {};

    for (const campo of DIMENSIONES) {
        const valor = convertirNumero(datos[campo.name]);

        if (!String(datos[campo.name]).trim()) {
            errores[campo.name] = "Este campo es obligatorio.";
        } else if (!Number.isFinite(valor) || valor <= 0) {
            errores[campo.name] = "Ingresá un número mayor que cero.";
        }
    }

    for (const seccion of ["origen", "destino"]) {
        for (const campo of CAMPOS_DIRECCION) {
            const valor = datos[seccion][campo.name].trim();

            if (campo.required && !valor) {
                errores[`${seccion}.${campo.name}`] =
                    "Este campo es obligatorio.";
            }

            const limite = campo.name === "descripcion" ? 255 :
                campo.name === "numero" || campo.name === "codigoPostal"
                    ? 20 : 100;

            if (valor.length > limite) {
                errores[`${seccion}.${campo.name}`] =
                    `Máximo ${limite} caracteres.`;
            }
        }
    }

    return errores;
}

function limpiarDireccion(direccion) {
    return Object.fromEntries(
        Object.entries(direccion).map(
            ([clave, valor]) => [clave, valor.trim()]
        )
    );
}

function obtenerMensajeError(error) {
    if (!error.response) {
        return "No se pudo conectar con el servidor.";
    }

    const { status, data } = error.response;

    if (status === 401) {
        return "Tu sesión expiró. Iniciá sesión nuevamente.";
    }

    if (status === 403) {
        return "No tenés permisos para crear envíos.";
    }

    if (status === 422) {
        return data?.message || "No se encontró tu ficha de cliente.";
    }

    return (
        data?.message ||
        data?.detail ||
        data?.error ||
        "No se pudo registrar el envío."
    );
}

function CampoDireccion({
                            seccion,
                            campo,
                            valor,
                            error,
                            onChange,
                        }) {
    const id = `${seccion}-${campo.name}`;

    return (
        <div className="ce-campo">
            <label htmlFor={id}>
                {campo.label}
                {campo.required && <span> *</span>}
            </label>

            <input
                id={id}
                type="text"
                value={valor}
                onChange={(event) =>
                    onChange(seccion, campo.name, event.target.value)
                }
                placeholder={campo.label}
                maxLength={campo.name === "descripcion" ? 255 : 150}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${id}-error` : undefined}
            />

            {error && (
                <small id={`${id}-error`} className="ce-error-campo">
                    {error}
                </small>
            )}
        </div>
    );
}

export default function Envios() {
    const { showToast } = useOutletContext();

    const [formulario, setFormulario] = useState(nuevoFormulario);
    const [errores, setErrores] = useState({});
    const [errorGeneral, setErrorGeneral] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [resultado, setResultado] = useState(null);

    function actualizarCampo(nombre, valor) {
        setFormulario((anterior) => ({
            ...anterior,
            [nombre]: valor,
        }));

        setErrores((anterior) => ({
            ...anterior,
            [nombre]: "",
        }));
    }

    function actualizarDireccion(seccion, campo, valor) {
        setFormulario((anterior) => ({
            ...anterior,
            [seccion]: {
                ...anterior[seccion],
                [campo]: valor,
            },
        }));

        setErrores((anterior) => ({
            ...anterior,
            [`${seccion}.${campo}`]: "",
        }));
    }

    async function registrarEnvio(event) {
        event.preventDefault();

        if (enviando) return;

        setErrorGeneral("");
        setResultado(null);

        const nuevosErrores = validarFormulario(formulario);
        setErrores(nuevosErrores);

        if (Object.keys(nuevosErrores).length > 0) {
            setErrorGeneral("Revisá los campos señalados.");
            return;
        }

        const datos = {
            peso: convertirNumero(formulario.peso),
            ancho: convertirNumero(formulario.ancho),
            alto: convertirNumero(formulario.alto),
            largo: convertirNumero(formulario.largo),
            origen: limpiarDireccion(formulario.origen),
            destino: limpiarDireccion(formulario.destino),
        };

        setEnviando(true);

        try {
            const envio = await crearMiEnvio(datos);

            setResultado(envio);
            setFormulario(nuevoFormulario());
            setErrores({});

            showToast(
                "El envío se registró correctamente.",
                "success"
            );
        } catch (error) {
            const mensaje = obtenerMensajeError(error);

            setErrorGeneral(mensaje);
            setErrores(error.response?.data?.fieldErrors ?? {});
        } finally {
            setEnviando(false);
        }
    }

    return (
        <section className="ce-contenedor">
            <header className="ce-encabezado">
                <p className="ce-subtitulo">PORTAL DE CLIENTES</p>
                <h2>Crear nuevo envío</h2>
                <p>
                    Completá los datos del paquete y las direcciones.
                    LogiTrack calculará la tarifa y generará
                    automáticamente tu código de seguimiento.
                </p>
            </header>

            {resultado && (
                <section className="ce-confirmacion" role="status">
                    <div className="ce-confirmacion-icono">✓</div>
                    <h3>¡Envío registrado!</h3>

                    <p>
                        Tu paquete fue registrado correctamente.
                    </p>

                    <div className="ce-codigo">
                        <small>Código de seguimiento</small>
                        <strong>{resultado.codigoSeguimiento}</strong>
                    </div>

                    <div className="ce-resumen">
                        <span>
                            Estado:
                            <strong className="ce-badge">
                                {resultado.estado}
                            </strong>
                        </span>

                        <span>
                            Tarifa calculada:
                            <strong>
                                ${Number(resultado.tarifa).toFixed(2)}
                            </strong>
                        </span>
                    </div>

                    <p>
                        Guardá el código para consultar el estado
                        de tu paquete.
                    </p>

                    <Link to="/mis-envios" className="ce-enlace">
                        Ver mis envíos
                    </Link>
                </section>
            )}

            <form onSubmit={registrarEnvio} noValidate>
                <section className="ce-tarjeta">
                    <div className="ce-tarjeta-titulo">
                        <span className="ce-numero">01</span>
                        <div>
                            <h3>Datos del paquete</h3>
                            <p>Ingresá el peso y las dimensiones.</p>
                        </div>
                    </div>

                    <div className="ce-grid">
                        {DIMENSIONES.map((campo) => (
                            <div className="ce-campo" key={campo.name}>
                                <label htmlFor={campo.name}>
                                    {campo.label} ({campo.unit}) *
                                </label>

                                <input
                                    id={campo.name}
                                    type="text"
                                    inputMode="decimal"
                                    placeholder="Ej. 2.5"
                                    value={formulario[campo.name]}
                                    onChange={(event) =>
                                        actualizarCampo(
                                            campo.name,
                                            event.target.value
                                        )
                                    }
                                    aria-invalid={Boolean(
                                        errores[campo.name]
                                    )}
                                />

                                {errores[campo.name] && (
                                    <small className="ce-error-campo">
                                        {errores[campo.name]}
                                    </small>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {["origen", "destino"].map((seccion, indice) => (
                    <section className="ce-tarjeta" key={seccion}>
                        <div className="ce-tarjeta-titulo">
                            <span className="ce-numero">
                                {indice === 0 ? "02" : "03"}
                            </span>

                            <div>
                                <h3>
                                    Dirección de {seccion}
                                </h3>
                                <p>
                                    {seccion === "origen"
                                        ? "Lugar donde se retira el paquete."
                                        : "Lugar donde se entregará el paquete."}
                                </p>
                            </div>
                        </div>

                        <div className="ce-grid">
                            {CAMPOS_DIRECCION.map((campo) => (
                                <CampoDireccion
                                    key={campo.name}
                                    seccion={seccion}
                                    campo={campo}
                                    valor={
                                        formulario[seccion][campo.name]
                                    }
                                    error={
                                        errores[
                                            `${seccion}.${campo.name}`
                                            ]
                                    }
                                    onChange={actualizarDireccion}
                                />
                            ))}
                        </div>
                    </section>
                ))}

                {errorGeneral && (
                    <div className="ce-error" role="alert">
                        {errorGeneral}
                    </div>
                )}

                <footer className="ce-acciones">
                    <button
                        type="button"
                        className="ce-boton-secundario"
                        disabled={enviando}
                        onClick={() => {
                            setFormulario(nuevoFormulario());
                            setErrores({});
                            setErrorGeneral("");
                        }}
                    >
                        Limpiar formulario
                    </button>

                    <button
                        type="submit"
                        className="ce-boton-principal"
                        disabled={enviando}
                    >
                        {enviando
                            ? "Registrando envío..."
                            : "Registrar envío"}
                    </button>
                </footer>
            </form>
        </section>
    );
}

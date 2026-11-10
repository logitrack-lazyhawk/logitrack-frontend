
import { useEffect, useRef } from "react";
import { EVENTO_SELECCION_ENVIO } from "../contracts/envioContract.js";

export default function EnvioCardWeb({
                                         envio,
                                         contexto = "cliente",
                                         onSeleccionar,
                                     }) {
    const elementoRef = useRef(null);

    useEffect(() => {
        if (elementoRef.current) {
            elementoRef.current.envio = envio;
        }
    }, [envio]);

    useEffect(() => {
        const elemento = elementoRef.current;
        if (!elemento) return;

        const manejarSeleccion = (evento) => {
            onSeleccionar?.(evento.detail);
        };

        elemento.addEventListener(
            EVENTO_SELECCION_ENVIO,
            manejarSeleccion
        );

        return () => {
            elemento.removeEventListener(
                EVENTO_SELECCION_ENVIO,
                manejarSeleccion
            );
        };
    }, [onSeleccionar]);

    return (
        <lt-envio-card
            ref={elementoRef}
            contexto={contexto}
        />
    );
}

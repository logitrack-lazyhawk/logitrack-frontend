/*
    * registrarWebComponents.js
    * Archivo encargado de registrar los componentes web personalizados utilizados en la aplicación.
    * @author: Equipo de LazyHawks
    * @version: 1.0.0
 */
import { LtEnvioCard } from "./LtEnvioCard.js";

if (!customElements.get("lt-envio-card")) {
    customElements.define("lt-envio-card", LtEnvioCard);
}

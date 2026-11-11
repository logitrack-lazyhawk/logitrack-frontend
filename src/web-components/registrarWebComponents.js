import { LtEnvioCard } from "./LtEnvioCard.js";

if (!customElements.get("lt-envio-card")) {
    customElements.define("lt-envio-card", LtEnvioCard);
}

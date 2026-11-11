import {
    normalizarEnvio,
    crearDetalleSeleccion,
    ETIQUETAS_ESTADO,
    EVENTO_SELECCION_ENVIO,
} from "../contracts/envioContract.js";

export class LtEnvioCard extends HTMLElement {
    static get observedAttributes() {
        return ["contexto"];
    }

    constructor() {
        super();

        this._envio = null;
        this.attachShadow({ mode: "open" });

        this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: inherit;
          color: #20332f;
        }

        * {
          box-sizing: border-box;
        }

        .card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 18px;
          padding: 20px;
          height: 100%;
          min-height: 190px;
          transition: border-color .18s ease, box-shadow .18s ease;
          background: white;
          border: 1px solid #dfe7e2;
          border-radius: 16px;
        }

        .card:hover { border-color: #aac7b4; box-shadow: 0 6px 18px #20332f08; }

        :host([contexto="cliente"]) .card { align-items: stretch; flex-direction: column; }
        :host([contexto="cliente"]) .acciones { justify-content: space-between; }

        .card[hidden] {
          display: none;
        }

        .contenido {
          flex: 1;
          min-width: min(180px, 100%);
          overflow-wrap: anywhere;
        }

        .contexto {
          font-size: 10px;
          font-weight: 700;
          color: #63736d;
          letter-spacing: 1px;
        }

        .codigo {
          display: block;
          margin-top: 5px;
          font-size: 16px;
          overflow-wrap: anywhere;
        }

        .destino,
        .peso {
          margin: 6px 0 0;
          font-size: 13px;
          color: #63736d;
        }

        .acciones {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        .estado {
          padding: 7px 12px;
          border-radius: 20px;
          background: #f1f5f9;
          color: #334155;
          font-size: 12px;
          font-weight: 700;
        }

        .estado[data-estado="PENDIENTE"] {
          background: #fef3c7;
          color: #92400e;
        }

        .estado[data-estado="EN_RUTA"] {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .estado[data-estado="ENTREGADO"] {
          background: #dcfce7;
          color: #166534;
        }

        .estado[data-estado="CANCELADO"] {
          background: #fee2e2;
          color: #991b1b;
        }

        button {
          padding: 9px 14px;
          border: 1px solid #d5e4d7;
          border-radius: 8px;
          background: #edf4ed;
          color: #17634a;
          font: inherit;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        button:hover {
          background: #dfeddf;
        }

        button:focus-visible {
          outline: 3px solid #2563eb;
          outline-offset: 3px;
        }

        @media (max-width: 600px) {
          .card,
          .acciones {
            align-items: stretch;
            flex-direction: column;
          }
        }
      </style>

      <article class="card" hidden>
        <div class="contenido">
          <span class="contexto"></span>
          <strong class="codigo"></strong>
          <p class="destino"></p>
          <p class="peso"></p>
        </div>

        <div class="acciones">
          <span class="estado"></span>
          <button type="button">Ver detalle</button>
        </div>
      </article>
    `;

        this.shadowRoot
            .querySelector("button")
            .addEventListener("click", () => this.seleccionar());
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        this.render();
    }

    set envio(valor) {
        this._envio = valor ? normalizarEnvio(valor) : null;
        this.render();
    }

    get envio() {
        return this._envio;
    }

    seleccionar() {
        if (!this._envio) return;

        const detalle = crearDetalleSeleccion(
            this._envio,
            this.getAttribute("contexto")
        );

        this.dispatchEvent(
            new CustomEvent(EVENTO_SELECCION_ENVIO, {
                detail: detalle,
                bubbles: true,
                composed: true,
            })
        );
    }

    render() {
        const card = this.shadowRoot.querySelector(".card");

        card.hidden = !this._envio;
        if (!this._envio) return;

        const contexto =
            this.getAttribute("contexto") === "admin"
                ? "admin"
                : "cliente";

        const envio = this._envio;

        this.shadowRoot.querySelector(".contexto").textContent =
            contexto === "admin"
                ? "BACKOFFICE"
                : "TU ENVÍO";

        this.shadowRoot.querySelector(".codigo").textContent =
            envio.codigoSeguimiento;

        this.shadowRoot.querySelector(".destino").textContent =
            `Destino: ${envio.destino}`;

        this.shadowRoot.querySelector(".peso").textContent =
            envio.peso === null
                ? "Peso no informado"
                : `Peso: ${envio.peso} kg`;

        const estado = this.shadowRoot.querySelector(".estado");

        estado.textContent = ETIQUETAS_ESTADO[envio.estado];
        estado.dataset.estado = envio.estado;

        this.shadowRoot.querySelector("button").textContent =
            contexto === "admin" ? "Abrir envío" : "Ver detalle";
    }
}

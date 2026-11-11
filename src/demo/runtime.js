import { DEMO_HABILITADO } from './entorno.js';
import { crearControlDemo } from './controlDemo.js';

const control = crearControlDemo(DEMO_HABILITADO);

export const demoActiva = control.estaActivo;
export const entrarDemo = control.entrar;
export const salirDemo = control.salir;
export const suscribirDemo = control.suscribir;

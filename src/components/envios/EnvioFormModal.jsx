import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";
import axiosClient from "../../api/axiosClient";

const envioSchema = z.object({
    clienteId: z
        .string()
        .min(1, "El cliente solicitante es obligatorio"),
    peso: z
        .coerce
        .number({ invalid_type_error: "Debe ser un número válido" })
        .positive("El peso debe ser mayor a 0 kg"),
    ancho: z
        .coerce
        .number({ invalid_type_error: "Debe ser un número válido" })
        .positive("El ancho debe ser mayor a 0 cm"),
    alto: z
        .coerce
        .number({ invalid_type_error: "Debe ser un número válido" })
        .positive("El alto debe ser mayor a 0 cm"),
    largo: z
        .coerce
        .number({ invalid_type_error: "Debe ser un número válido" })
        .positive("El largo debe ser mayor a 0 cm"),
    origen: z.object({
        calle: z.string().min(1, "La calle de origen es obligatoria"),
        numero: z.string().min(1, "El número es obligatorio"),
        ciudad: z.string().min(1, "La ciudad es obligatoria"),
        provincia: z.string().min(1, "La provincia es obligatoria"),
        codigoPostal: z.string().min(1, "El código postal es obligatorio"),
        localidad: z.string().optional(),
        descripcion: z.string().optional(),
    }),
    destino: z.object({
        calle: z.string().min(1, "La calle de destino es obligatoria"),
        numero: z.string().min(1, "El número es obligatorio"),
        ciudad: z.string().min(1, "La ciudad es obligatoria"),
        provincia: z.string().min(1, "La provincia es obligatoria"),
        codigoPostal: z.string().min(1, "El código postal es obligatorio"),
        localidad: z.string().optional(),
        descripcion: z.string().optional(),
    }),
});

export default function EnvioFormModal({ isOpen, onClose, onSave, cargando = false }) {
    const [clientes, setClientes] = useState([]);
    const [cargandoClientes, setCargandoClientes] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(envioSchema),
        defaultValues: {
            clienteId: "",
            peso: 1.5,
            ancho: 15,
            alto: 10,
            largo: 20,
            origen: {
                calle: "Av. Corrientes",
                numero: "1234",
                ciudad: "Buenos Aires",
                provincia: "CABA",
                codigoPostal: "1043",
                localidad: "San Nicolás",
                descripcion: "Piso 4 Oficina B",
            },
            destino: {
                calle: "Av. Santa Fe",
                numero: "3456",
                ciudad: "Buenos Aires",
                provincia: "CABA",
                codigoPostal: "1425",
                localidad: "Palermo",
                descripcion: "Timbre 2",
            },
        },
    });

    useEffect(() => {
        if (!isOpen) return;

        let activo = true;
        setCargandoClientes(true);
        axiosClient
            .get("/api/v1/clientes", { params: { size: 50 } })
            .then(({ data }) => {
                if (activo) {
                    const listado = data?.content || (Array.isArray(data) ? data : []);
                    setClientes(listado);
                }
            })
            .catch(() => {
                if (activo) setClientes([]);
            })
            .finally(() => {
                if (activo) setCargandoClientes(false);
            });

        return () => {
            activo = false;
        };
    }, [isOpen]);

    const onSubmit = (data) => {
        onSave(data);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Registrar Nuevo Envío"
            maxWidth="max-w-2xl"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Selección de Cliente */}
                <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Cliente Solicitante
                    </label>
                    {clientes.length > 0 ? (
                        <select
                            className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                            {...register("clienteId")}
                        >
                            <option value="">-- Seleccionar cliente registrado --</option>
                            {clientes.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.nombre} (DNI: {c.dni} - {c.email})
                                </option>
                            ))}
                        </select>
                    ) : (
                        <Input
                            placeholder="Ingrese UUID del cliente (ej. 123e4567-e89b-12d3-a456-426614174000)"
                            error={errors.clienteId?.message}
                            helperText={
                                cargandoClientes
                                    ? "Cargando clientes..."
                                    : "No se encontraron clientes registrados; ingrese el UUID manualmente."
                            }
                            {...register("clienteId")}
                        />
                    )}
                    {errors.clienteId && (
                        <p className="mt-1 text-xs text-rose-600 font-medium">
                            {errors.clienteId.message}
                        </p>
                    )}
                </div>

                {/* Dimensiones y Peso */}
                <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                        Dimensiones y Peso del Paquete
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <Input
                            label="Peso (kg)"
                            type="number"
                            step="0.1"
                            error={errors.peso?.message}
                            {...register("peso")}
                        />
                        <Input
                            label="Ancho (cm)"
                            type="number"
                            step="1"
                            error={errors.ancho?.message}
                            {...register("ancho")}
                        />
                        <Input
                            label="Alto (cm)"
                            type="number"
                            step="1"
                            error={errors.alto?.message}
                            {...register("alto")}
                        />
                        <Input
                            label="Largo (cm)"
                            type="number"
                            step="1"
                            error={errors.largo?.message}
                            {...register("largo")}
                        />
                    </div>
                </div>

                {/* Dirección de Origen */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Punto de Retiro / Origen
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                            <Input
                                label="Calle"
                                error={errors.origen?.calle?.message}
                                {...register("origen.calle")}
                            />
                        </div>
                        <div>
                            <Input
                                label="Número"
                                error={errors.origen?.numero?.message}
                                {...register("origen.numero")}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Input
                            label="Ciudad"
                            error={errors.origen?.ciudad?.message}
                            {...register("origen.ciudad")}
                        />
                        <Input
                            label="Provincia"
                            error={errors.origen?.provincia?.message}
                            {...register("origen.provincia")}
                        />
                        <Input
                            label="Código Postal"
                            error={errors.origen?.codigoPostal?.message}
                            {...register("origen.codigoPostal")}
                        />
                    </div>
                </div>

                {/* Dirección de Destino */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Punto de Entrega / Destino
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                            <Input
                                label="Calle"
                                error={errors.destino?.calle?.message}
                                {...register("destino.calle")}
                            />
                        </div>
                        <div>
                            <Input
                                label="Número"
                                error={errors.destino?.numero?.message}
                                {...register("destino.numero")}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Input
                            label="Ciudad"
                            error={errors.destino?.ciudad?.message}
                            {...register("destino.ciudad")}
                        />
                        <Input
                            label="Provincia"
                            error={errors.destino?.provincia?.message}
                            {...register("destino.provincia")}
                        />
                        <Input
                            label="Código Postal"
                            error={errors.destino?.codigoPostal?.message}
                            {...register("destino.codigoPostal")}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="primary" disabled={cargando}>
                        {cargando ? "Registrando Envío..." : "Crear y Generar Tracking"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}


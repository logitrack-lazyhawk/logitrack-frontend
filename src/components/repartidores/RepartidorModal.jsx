import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";

const repartidorSchema = z.object({
    nombre: z
        .string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(100, "Máximo 100 caracteres"),
    dni: z
        .string()
        .regex(/^\d{7,8}$/, "El DNI debe contener 7 u 8 dígitos numéricos sin puntos"),
    email: z
        .string()
        .email("Debe ser un correo electrónico válido")
        .max(100, "Máximo 100 caracteres"),
    telefono: z
        .string()
        .regex(
            /^\+54\d{8,11}$/,
            "Formato internacional E.164 requerido (ej: +5491123456789)"
        ),
    tipoVehiculo: z
        .string()
        .min(2, "Especifica el tipo de vehículo")
        .max(50, "Máximo 50 caracteres"),
    estado: z.enum(["ACTIVO", "INACTIVO"]).default("ACTIVO"),
});

export default function RepartidorModal({
    isOpen,
    onClose,
    onSave,
    repartidorActual = null,
    cargando = false,
}) {
    const isEdit = !!repartidorActual?.id;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(repartidorSchema),
        defaultValues: {
            nombre: "",
            dni: "",
            email: "",
            telefono: "+54",
            tipoVehiculo: "MOTO",
            estado: "ACTIVO",
        },
    });

    useEffect(() => {
        if (repartidorActual) {
            reset({
                nombre: repartidorActual.nombre || "",
                dni: repartidorActual.dni || "",
                email: repartidorActual.email || "",
                telefono: repartidorActual.telefono || "+54",
                tipoVehiculo: repartidorActual.tipoVehiculo || "MOTO",
                estado: repartidorActual.estado || "ACTIVO",
            });
        } else {
            reset({
                nombre: "",
                dni: "",
                email: "",
                telefono: "+54",
                tipoVehiculo: "MOTO",
                estado: "ACTIVO",
            });
        }
    }, [repartidorActual, reset, isOpen]);

    const onSubmit = (data) => {
        onSave(data, repartidorActual?.id);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? "Editar Repartidor" : "Registrar Nuevo Repartidor"}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                    label="Nombre Completo"
                    placeholder="Ej. Lucas García"
                    error={errors.nombre?.message}
                    {...register("nombre")}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                        label="DNI / Documento"
                        placeholder="Ej. 38456123"
                        error={errors.dni?.message}
                        {...register("dni")}
                    />

                    <Input
                        label="Teléfono (E.164)"
                        placeholder="+5491123456789"
                        error={errors.telefono?.message}
                        helperText="Incluir +54 y código de área"
                        {...register("telefono")}
                    />
                </div>

                <Input
                    label="Correo Electrónico"
                    type="email"
                    placeholder="repartidor@correo.com"
                    error={errors.email?.message}
                    {...register("email")}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                            Tipo de Vehículo
                        </label>
                        <select
                            className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                            {...register("tipoVehiculo")}
                        >
                            <option value="MOTO">Moto</option>
                            <option value="AUTO">Automóvil</option>
                            <option value="CAMIONETA">Camioneta / Furgón</option>
                            <option value="BICICLETA">Bicicleta</option>
                        </select>
                        {errors.tipoVehiculo && (
                            <p className="mt-1 text-xs text-rose-600 font-medium">
                                {errors.tipoVehiculo.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                            Estado Operativo Inicial
                        </label>
                        <select
                            className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                            {...register("estado")}
                        >
                            <option value="ACTIVO">Activo (Disponible)</option>
                            <option value="INACTIVO">Inactivo</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="primary" disabled={cargando}>
                        {cargando ? "Guardando..." : isEdit ? "Actualizar Repartidor" : "Registrar Repartidor"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}


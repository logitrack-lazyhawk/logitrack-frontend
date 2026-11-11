import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";

const clienteSchema = z.object({
    nombre: z
        .string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(100, "Máximo 100 caracteres"),
    dni: z
        .string()
        .regex(/^\d{7,8}$/, "El DNI debe contener 7 u 8 dígitos numéricos sin puntos"),
    telefono: z
        .string()
        .regex(
            /^\+54\d{8,11}$/,
            "Formato internacional E.164 requerido (ej: +5491123456789)"
        ),
    email: z
        .string()
        .email("Debe ser un correo electrónico válido")
        .max(150, "Máximo 150 caracteres"),
});

export default function ClienteModal({
    isOpen,
    onClose,
    onSave,
    clienteActual = null,
    cargando = false,
}) {
    const isEdit = !!clienteActual?.id;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(clienteSchema),
        defaultValues: {
            nombre: "",
            dni: "",
            telefono: "+54",
            email: "",
        },
    });

    useEffect(() => {
        if (clienteActual) {
            reset({
                nombre: clienteActual.nombre || "",
                dni: clienteActual.dni || "",
                telefono: clienteActual.telefono || "+54",
                email: clienteActual.email || "",
            });
        } else {
            reset({
                nombre: "",
                dni: "",
                telefono: "+54",
                email: "",
            });
        }
    }, [clienteActual, reset, isOpen]);

    const onSubmit = (data) => {
        onSave(data, clienteActual?.id);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? "Editar Cliente" : "Registrar Nuevo Cliente (Perfil de Negocio)"}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200/80 text-xs text-blue-800">
                    <strong>Modelo Híbrido:</strong> Los datos de contacto y entrega se gestionan en este servicio logístico y se enlazan con la identidad del usuario en Keycloak mediante su correo electrónico.
                </div>

                <Input
                    label="Nombre Completo o Razón Social"
                    placeholder="Ej. Distribuidora Gómez S.A."
                    error={errors.nombre?.message}
                    {...register("nombre")}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                        label="DNI / Documento"
                        placeholder="Ej. 35123456"
                        error={errors.dni?.message}
                        {...register("dni")}
                    />

                    <Input
                        label="Teléfono de Contacto (E.164)"
                        placeholder="+5491123456789"
                        error={errors.telefono?.message}
                        helperText="Incluir prefijo internacional +54"
                        {...register("telefono")}
                    />
                </div>

                <Input
                    label="Correo Electrónico (Usuario Keycloak)"
                    type="email"
                    placeholder="cliente@correo.com"
                    error={errors.email?.message}
                    helperText="Este email debe coincidir con el usuario registrado en Keycloak"
                    {...register("email")}
                />

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="primary" disabled={cargando}>
                        {cargando ? "Guardando..." : isEdit ? "Actualizar Cliente" : "Registrar Cliente"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}


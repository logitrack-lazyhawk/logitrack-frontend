import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";

const productoSchema = z.object({
    nombre: z.string().min(2, "El nombre del producto es obligatorio"),
    descripcion: z.string().optional(),
    precio: z
        .coerce
        .number({ invalid_type_error: "Debe ser un número válido" })
        .positive("El precio debe ser mayor a 0"),
    stock: z
        .coerce
        .number({ invalid_type_error: "Debe ser un número entero" })
        .min(0, "El stock no puede ser negativo"),
    categoria: z.string().min(1, "La categoría es obligatoria"),
    imagenUrl: z.string().optional(),
    weight: z
        .coerce
        .number({ invalid_type_error: "Debe ser un número válido" })
        .positive("El peso debe ser mayor a 0 kg"),
    dimensiones: z.object({
        ancho: z.coerce.number().positive("Ancho mayor a 0"),
        alto: z.coerce.number().positive("Alto mayor a 0"),
        largo: z.coerce.number().positive("Largo mayor a 0"),
    }),
});

export default function ProductoModal({ isOpen, onClose, onSave, cargando = false }) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(productoSchema),
        defaultValues: {
            nombre: "",
            descripcion: "",
            precio: 1500,
            stock: 20,
            categoria: "Tecnología",
            imagenUrl: "",
            weight: 0.8,
            dimensiones: {
                ancho: 10,
                alto: 5,
                largo: 15,
            },
        },
    });

    const onSubmit = (data) => {
        onSave(data);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Publicar Nuevo Producto en Catálogo"
            maxWidth="max-w-xl"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                    label="Nombre del Producto"
                    placeholder="Ej. Auriculares Bluetooth Pro"
                    error={errors.nombre?.message}
                    {...register("nombre")}
                />

                <Input
                    label="Descripción"
                    placeholder="Breve detalle del producto..."
                    error={errors.descripcion?.message}
                    {...register("descripcion")}
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input
                        label="Precio ($ ARS)"
                        type="number"
                        step="0.01"
                        error={errors.precio?.message}
                        {...register("precio")}
                    />
                    <Input
                        label="Stock Inicial"
                        type="number"
                        error={errors.stock?.message}
                        {...register("stock")}
                    />
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                            Categoría
                        </label>
                        <select
                            className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                            {...register("categoria")}
                        >
                            <option value="Tecnología">Tecnología</option>
                            <option value="Indumentaria">Indumentaria</option>
                            <option value="Hogar">Hogar</option>
                            <option value="Alimentos">Alimentos</option>
                            <option value="Herramientas">Herramientas</option>
                        </select>
                    </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Logística y Empaque (Envío)
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <Input
                            label="Peso (kg)"
                            type="number"
                            step="0.1"
                            error={errors.weight?.message}
                            {...register("weight")}
                        />
                        <Input
                            label="Ancho (cm)"
                            type="number"
                            step="1"
                            error={errors.dimensiones?.ancho?.message}
                            {...register("dimensiones.ancho")}
                        />
                        <Input
                            label="Alto (cm)"
                            type="number"
                            step="1"
                            error={errors.dimensiones?.alto?.message}
                            {...register("dimensiones.alto")}
                        />
                        <Input
                            label="Largo (cm)"
                            type="number"
                            step="1"
                            error={errors.dimensiones?.largo?.message}
                            {...register("dimensiones.largo")}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="primary" disabled={cargando}>
                        {cargando ? "Guardando..." : "Crear Producto"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}


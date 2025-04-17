
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";
import { Employee } from "@/types/employees";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { FileUp, Trash2 } from "lucide-react";

const employeeFormSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  position: z.string().min(1, {
    message: "Debes seleccionar una posición.",
  }),
  phone: z.string().min(1, {
    message: "El teléfono es requerido.",
  }),
  address: z.string().min(1, {
    message: "La dirección es requerida.",
  }),
  emergency_contact: z.string().optional(),
  email: z.string().email({
    message: "Por favor ingresa un correo electrónico válido.",
  }).optional().or(z.literal("")),
  documentId: z.string().optional(),
  birthday: z.string().optional(),
  bankAccount: z.string().optional(),
});

type EmployeeProfileDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  onSave: (employee: Employee | Partial<Employee>) => void;
  newEmployeeData: Partial<Employee>;
  setNewEmployeeData: (data: Partial<Employee>) => void;
};

type DocumentType = "salary" | "contract" | "other";

export default function EmployeeProfileDialog({
  open,
  onOpenChange,
  employee,
  onSave,
  newEmployeeData,
  setNewEmployeeData,
}: EmployeeProfileDialogProps) {
  const [activeTab, setActiveTab] = useState("personal");
  const [documents, setDocuments] = useState<{
    id: number;
    name: string;
    date: string;
    type: DocumentType;
    url: string;
  }[]>(
    (employee?.documents as {
      id: number;
      name: string;
      date: string;
      type: DocumentType;
      url: string;
    }[]) || []
  );
  const [fileUpload, setFileUpload] = useState<{
    name: string;
    type: DocumentType;
  }>({
    name: "",
    type: "salary",
  });

  const form = useForm<z.infer<typeof employeeFormSchema>>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      name: employee?.name || "",
      position: employee?.position || "Estilista",
      phone: employee?.phone || "",
      email: employee?.email || "",
      address: employee?.address || "",
      emergency_contact: employee?.contact || "",
      documentId: employee?.documentId || "",
      birthday: employee?.birthday || "",
      bankAccount: employee?.bankAccount || "",
    },
  });

  const handleSave = (values: z.infer<typeof employeeFormSchema>) => {
    if (employee) {
      // Update existing employee
      onSave({
        ...employee,
        ...values,
        documents,
      });
    } else {
      // Create new employee with properly typed status
      onSave({
        ...values,
        status: "active" as "active" | "inactive", // Explicitly cast to the union type
        joinDate: new Date().toLocaleDateString("es-AR"),
        documents: [],
      });
    }
    onOpenChange(false);
  };

  const handleAddDocument = () => {
    if (!fileUpload.name) {
      toast.error("Por favor proporciona un nombre para el documento");
      return;
    }

    const newDocument = {
      id: Date.now(),
      name: fileUpload.name,
      date: new Date().toLocaleDateString("es-AR"),
      type: fileUpload.type,
      url: "#", // Would be replaced with actual file upload URL
    };

    const updatedDocuments = [...documents, newDocument];
    setDocuments(updatedDocuments);

    if (employee) {
      // If editing an existing employee, update their documents
      employee.documents = updatedDocuments as Employee["documents"];
    }

    // Reset the file upload form
    setFileUpload({
      name: "",
      type: "salary",
    });

    toast.success("Documento agregado exitosamente");
  };

  const handleRemoveDocument = (id: number) => {
    const updatedDocuments = documents.filter((doc) => doc.id !== id);
    setDocuments(updatedDocuments);

    if (employee) {
      // If editing an existing employee, update their documents
      employee.documents = updatedDocuments as Employee["documents"];
    }

    toast.success("Documento eliminado exitosamente");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {employee ? `Editar Empleado: ${employee.name}` : "Nuevo Empleado"}
          </DialogTitle>
          <DialogDescription>
            Completa la información del empleado. Los campos marcados con * son obligatorios.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Completo *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nombre del empleado" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Posición *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar posición" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Estilista">Estilista</SelectItem>
                        <SelectItem value="Manicurista">Manicurista</SelectItem>
                        <SelectItem value="Recepcionista">Recepcionista</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="11-1234-5678" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="email@ejemplo.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Domicilio *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Dirección completa" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emergency_contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contacto de Emergencia</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nombre y teléfono de contacto" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {employee ? "Actualizar" : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

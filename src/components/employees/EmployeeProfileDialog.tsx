
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
import { Employee } from "@/pages/EmpleadosPage";
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
  email: z.string().email({
    message: "Por favor ingresa un correo electrónico válido.",
  }).optional().or(z.literal("")),
  address: z.string().optional(),
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

export default function EmployeeProfileDialog({
  open,
  onOpenChange,
  employee,
  onSave,
  newEmployeeData,
  setNewEmployeeData,
}: EmployeeProfileDialogProps) {
  const [activeTab, setActiveTab] = useState("personal");
  const [documents, setDocuments] = useState<{ id: number; name: string; type: string }[]>(
    employee?.documents || []
  );
  const [fileUpload, setFileUpload] = useState<{
    name: string;
    type: "salary" | "contract" | "other";
  }>({
    name: "",
    type: "salary",
  });

  const form = useForm<z.infer<typeof employeeFormSchema>>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      name: employee?.name || newEmployeeData.name || "",
      position: employee?.position || newEmployeeData.position || "Estilista",
      phone: employee?.phone || newEmployeeData.phone || "",
      email: employee?.email || newEmployeeData.email || "",
      address: employee?.address || newEmployeeData.address || "",
      documentId: employee?.documentId || newEmployeeData.documentId || "",
      birthday: employee?.birthday || newEmployeeData.birthday || "",
      bankAccount: employee?.bankAccount || newEmployeeData.bankAccount || "",
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
      // Create new employee
      onSave({
        ...newEmployeeData,
        ...values,
      });
    }
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
      employee.documents = updatedDocuments;
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
      employee.documents = updatedDocuments;
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
            Completa la información del empleado. Todos los campos marcados con * son obligatorios.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)}>
            <Tabs defaultValue="personal" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="personal">Información Personal</TabsTrigger>
                <TabsTrigger value="documents">Documentos</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-4 py-4">
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
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
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
                          <Input {...field} placeholder="email@ejemplo.com" type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="documentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>DNI</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="30123456" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="birthday"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de Nacimiento</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="DD/MM/AAAA" />
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
                      <FormLabel>Dirección</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Dirección completa" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bankAccount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cuenta Bancaria</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Banco y número de cuenta" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="documents" className="py-4">
                <div className="space-y-4">
                  <div className="border rounded-md p-4">
                    <h3 className="text-sm font-medium mb-3">Subir nuevo documento</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <Label htmlFor="document-name">Nombre del documento</Label>
                        <Input
                          id="document-name"
                          value={fileUpload.name}
                          onChange={(e) => setFileUpload({ ...fileUpload, name: e.target.value })}
                          placeholder="Recibo de sueldo Mayo 2023"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="document-type">Tipo de documento</Label>
                        <Select
                          value={fileUpload.type}
                          onValueChange={(value: "salary" | "contract" | "other") => 
                            setFileUpload({ ...fileUpload, type: value })
                          }
                        >
                          <SelectTrigger id="document-type">
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="salary">Recibo de sueldo</SelectItem>
                            <SelectItem value="contract">Contrato</SelectItem>
                            <SelectItem value="other">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="document-file">Archivo</Label>
                        <Input
                          id="document-file"
                          type="file"
                          className="cursor-pointer"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button 
                          type="button" 
                          onClick={handleAddDocument}
                          className="w-full md:w-auto mt-4 md:mt-0"
                        >
                          <FileUp className="mr-2 h-4 w-4" />
                          Subir documento
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Documentos subidos</h3>
                    {documents.length > 0 ? (
                      <div className="border rounded-md divide-y">
                        {documents.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-3">
                            <div>
                              <p className="font-medium">{doc.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {doc.type === "salary" 
                                  ? "Recibo de sueldo" 
                                  : doc.type === "contract" 
                                  ? "Contrato" 
                                  : "Otro"}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                type="button"
                                onClick={() => handleRemoveDocument(doc.id)}
                                className="text-red-500"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 border rounded-md">
                        <p className="text-muted-foreground">No hay documentos subidos</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Guardar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

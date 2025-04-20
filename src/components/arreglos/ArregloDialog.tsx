import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useArreglosData } from "@/hooks/arreglos/useArreglosData";
import { Arreglo, serviceTypes } from "@/services/arreglosService";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ArregloDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  arreglo: Arreglo | null;
}

export default function ArregloDialog({ open, onOpenChange, arreglo }: ArregloDialogProps) {
  const { user } = useAuth();
  const { addArregloMutation, updateArregloMutation } = useArreglosData();
  
  const [formData, setFormData] = useState({
    client_name: "",
    description: "",
    created_by: "",
    assigned_to: "",
    status: "pendiente" as "pendiente" | "en_proceso" | "completado" | "cancelado",
    price: 0,
    notes: "",
    date: format(new Date(), "dd/MM/yyyy"),
    repair_date: format(new Date(), "dd/MM/yyyy"),
    payment_status: "pendiente" as "pendiente" | "pagado",
    service_type: "Manicura",
  });

  const [mismaManicura, setMismaManicura] = useState(false);
  const [fechaComanda, setFechaComanda] = useState<Date>();
  const [fechaArreglo, setFechaArreglo] = useState<Date>();

  const manicuristas = [
    "Cecilia Gomez",
    "Agostina Gastaldi",
    "Daiana La Rosa",
    "Lourdes Altamirano",
    "Rocio Espindola",
    "Abigail Miranda",
    "Ludmila Chavez",
    "Camila Isaurrable",
    "Samanta Gomez",
    "Belen Flores",
    "Analia Chavez",
    "Graciela Mareco",
    "Daniela Caggiano",
  ];

  useEffect(() => {
    if (arreglo) {
      setFormData({
        client_name: arreglo.client_name,
        description: arreglo.description,
        created_by: arreglo.created_by,
        assigned_to: arreglo.assigned_to || "",
        status: arreglo.status,
        price: arreglo.price,
        notes: arreglo.notes || "",
        date: arreglo.date,
        repair_date: arreglo.repair_date || format(new Date(), "dd/MM/yyyy"),
        payment_status: arreglo.payment_status,
        service_type: arreglo.service_type,
      });
    }
  }, [arreglo]);

  useEffect(() => {
    if (mismaManicura && formData.created_by) {
      setFormData(prev => ({
        ...prev,
        assigned_to: prev.created_by
      }));
    }
  }, [mismaManicura, formData.created_by]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const arregloData = {
        ...formData,
        created_by: user?.username || 'unknown'
      };

      if (arreglo) {
        await updateArregloMutation.mutateAsync({
          id: arreglo.id,
          updates: arregloData
        });
      } else {
        await addArregloMutation.mutateAsync(arregloData);
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving arreglo:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {arreglo ? "Editar Arreglo" : "Agregar Nuevo Arreglo"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Cliente</Label>
              <Input
                name="client_name"
                value={formData.client_name}
                onChange={handleInputChange}
                placeholder="Nombre del cliente"
                className="mt-1.5"
              />
            </div>
            
            <div>
              <Label>Descripción</Label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Descripción del arreglo"
                className="mt-1.5"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Comanda Original</Label>
                <Select
                  value={formData.created_by}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, created_by: value }))}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Seleccionar manicurista" />
                  </SelectTrigger>
                  <SelectContent>
                    {manicuristas.map(name => (
                      <SelectItem value={name} key={name}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Fecha Comanda</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full mt-1.5 justify-start text-left font-normal",
                        !fechaComanda && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fechaComanda ? format(fechaComanda, "PPP") : <span>Seleccionar fecha</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={fechaComanda}
                      onSelect={(date) => {
                        setFechaComanda(date);
                        if (date) {
                          setFormData(prev => ({ ...prev, date: format(date, "dd/MM/yyyy") }));
                        }
                      }}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Arreglado Por</Label>
                <Select
                  value={formData.assigned_to}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, assigned_to: value }))}
                  disabled={mismaManicura}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Seleccionar manicurista" />
                  </SelectTrigger>
                  <SelectContent>
                    {manicuristas.map(name => (
                      <SelectItem value={name} key={name}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Fecha Arreglo</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full mt-1.5 justify-start text-left font-normal",
                        !fechaArreglo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fechaArreglo ? format(fechaArreglo, "PPP") : <span>Seleccionar fecha</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={fechaArreglo}
                      onSelect={(date) => {
                        setFechaArreglo(date);
                        if (date) {
                          setFormData(prev => ({ ...prev, repair_date: format(date, "dd/MM/yyyy") }));
                        }
                      }}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="misma-manicura"
                checked={mismaManicura}
                onCheckedChange={(checked) => setMismaManicura(checked as boolean)}
              />
              <Label htmlFor="misma-manicura">Misma manicura que original</Label>
            </div>

            <div>
              <Label>Observaciones</Label>
              <Textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Observaciones adicionales"
                className="mt-1.5"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Estado</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "pendiente" | "en_proceso" | "completado" | "cancelado") => 
                    setFormData(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="en_proceso">En Proceso</SelectItem>
                    <SelectItem value="completado">Completado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Descuenta</Label>
                <Select
                  value={formData.payment_status}
                  onValueChange={(value: "pendiente" | "pagado") => 
                    setFormData(prev => ({ ...prev, payment_status: value }))
                  }
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendiente">NO</SelectItem>
                    <SelectItem value="pagado">SI</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Precio</Label>
                <Input
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="mt-1.5"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-violet-500 hover:bg-violet-600">
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

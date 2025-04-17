
import React, { useState, useEffect } from 'react';
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
    service_type: "Otro",
    description: "",
    status: "pendiente" as "pendiente" | "en_proceso" | "completado" | "cancelado",
    assigned_to: "",
    price: 0,
    payment_status: "pendiente" as "pendiente" | "pagado",
    notes: "",
    date: format(new Date(), "dd/MM/yyyy"),
  });

  useEffect(() => {
    if (arreglo) {
      setFormData({
        client_name: arreglo.client_name,
        service_type: arreglo.service_type,
        description: arreglo.description,
        status: arreglo.status,
        assigned_to: arreglo.assigned_to || "",
        price: arreglo.price,
        payment_status: arreglo.payment_status,
        notes: arreglo.notes || "",
        date: arreglo.date,
      });
    } else {
      // Reset form for a new arreglo
      setFormData({
        client_name: "",
        service_type: "Otro",
        description: "",
        status: "pendiente",
        assigned_to: "",
        price: 0,
        payment_status: "pendiente",
        notes: "",
        date: format(new Date(), "dd/MM/yyyy"),
      });
    }
  }, [arreglo]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "status") {
      setFormData((prev) => ({ 
        ...prev, 
        [name]: value as "pendiente" | "en_proceso" | "completado" | "cancelado" 
      }));
    } else if (name === "payment_status") {
      setFormData((prev) => ({ 
        ...prev, 
        [name]: value as "pendiente" | "pagado" 
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (arreglo) {
        // Update existing arreglo
        await updateArregloMutation.mutateAsync({
          id: arreglo.id,
          updates: {
            ...formData
          }
        });
      } else {
        // Create new arreglo
        await addArregloMutation.mutateAsync({
          ...formData,
          created_by: user?.username || 'unknown'
        });
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
            {arreglo ? `Editar Arreglo #${arreglo.id}` : "Nuevo Arreglo"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client_name">Nombre del Cliente</Label>
              <Input
                id="client_name"
                name="client_name"
                value={formData.client_name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="service_type">Tipo de Servicio</Label>
              <Select
                value={formData.service_type}
                onValueChange={(value) => handleSelectChange("service_type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Precio</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="assigned_to">Asignado a</Label>
              <Input
                id="assigned_to"
                name="assigned_to"
                value={formData.assigned_to}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger>
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
            
            <div className="space-y-2">
              <Label htmlFor="payment_status">Estado de Pago</Label>
              <Select
                value={formData.payment_status}
                onValueChange={(value) => handleSelectChange("payment_status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Estado de pago" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="pagado">Pagado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notas Adicionales</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {arreglo ? "Actualizar" : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

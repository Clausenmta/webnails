
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NewGiftCard } from "@/services/giftCardService";
import { format } from "date-fns";

interface AddGiftCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (giftCard: NewGiftCard) => void;
  updateExpiryDate: (purchaseDate: string) => string;
}

export const AddGiftCardDialog = ({ 
  open, 
  onOpenChange, 
  onSubmit,
  updateExpiryDate 
}: AddGiftCardDialogProps) => {
  const [formData, setFormData] = useState<NewGiftCard>({
    code: '',
    amount: 0,
    customer_name: '',
    service: '',
    purchase_date: format(new Date(), 'yyyy-MM-dd'),
    expiry_date: '',
    status: 'active',
    created_by: 'admin',
    notes: ''
  });

  // Update expiry date when purchase date changes
  useEffect(() => {
    if (formData.purchase_date) {
      const newExpiryDate = updateExpiryDate(formData.purchase_date);
      setFormData(prev => ({ ...prev, expiry_date: newExpiryDate }));
    }
  }, [formData.purchase_date, updateExpiryDate]);

  // Generate code when dialog opens
  useEffect(() => {
    if (open && !formData.code) {
      const generatedCode = `GC-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
      setFormData(prev => ({ ...prev, code: generatedCode }));
    }
  }, [open, formData.code]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    // Reset form
    setFormData({
      code: '',
      amount: 0,
      customer_name: '',
      service: '',
      purchase_date: format(new Date(), 'yyyy-MM-dd'),
      expiry_date: '',
      status: 'active',
      created_by: 'admin',
      notes: ''
    });
  };

  const handleInputChange = (field: keyof NewGiftCard, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Gift Card</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código Gift Card *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleInputChange('code', e.target.value)}
                placeholder="Ej: GC-12345"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Monto *</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount || ''}
                onChange={(e) => handleInputChange('amount', Number(e.target.value))}
                placeholder="0"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer_name">Cliente</Label>
              <Input
                id="customer_name"
                value={formData.customer_name || ''}
                onChange={(e) => handleInputChange('customer_name', e.target.value)}
                placeholder="Nombre del cliente"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="service">Servicio</Label>
              <Input
                id="service"
                value={formData.service || ''}
                onChange={(e) => handleInputChange('service', e.target.value)}
                placeholder="Tipo de servicio"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchase_date">Fecha de Compra *</Label>
              <Input
                id="purchase_date"
                type="date"
                value={formData.purchase_date}
                onChange={(e) => handleInputChange('purchase_date', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="expiry_date">Fecha de Vencimiento *</Label>
              <Input
                id="expiry_date"
                type="date"
                value={formData.expiry_date}
                onChange={(e) => handleInputChange('expiry_date', e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Activa</SelectItem>
                <SelectItem value="redeemed">Canjeada</SelectItem>
                <SelectItem value="expired">Vencida</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Información adicional..."
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">
              Crear Gift Card
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

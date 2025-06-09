
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
import { GiftCard, NewGiftCard } from "@/services/giftCardService";

interface EditGiftCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  giftCard: GiftCard | null;
  onSubmit: (id: number, updates: Partial<NewGiftCard>) => void;
  updateExpiryDate: (purchaseDate: string) => string;
}

export const EditGiftCardDialog = ({ 
  open, 
  onOpenChange, 
  giftCard,
  onSubmit,
  updateExpiryDate 
}: EditGiftCardDialogProps) => {
  const [formData, setFormData] = useState<Partial<NewGiftCard>>({});

  useEffect(() => {
    if (giftCard) {
      setFormData({
        code: giftCard.code,
        amount: giftCard.amount,
        customer_name: giftCard.customer_name,
        service: giftCard.service,
        purchase_date: giftCard.purchase_date,
        expiry_date: giftCard.expiry_date,
        status: giftCard.status,
        redeemed_date: giftCard.redeemed_date,
        notes: giftCard.notes,
        created_by: giftCard.created_by
      });
    }
  }, [giftCard]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (giftCard) {
      onSubmit(giftCard.id, formData);
    }
  };

  const handleInputChange = (field: keyof NewGiftCard, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-update expiry date when purchase date changes
    if (field === 'purchase_date' && value) {
      const newExpiryDate = updateExpiryDate(value);
      setFormData(prev => ({ ...prev, expiry_date: newExpiryDate }));
    }
  };

  if (!giftCard) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Gift Card</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código Gift Card *</Label>
              <Input
                id="code"
                value={formData.code || ''}
                onChange={(e) => handleInputChange('code', e.target.value)}
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
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="service">Servicio</Label>
              <Input
                id="service"
                value={formData.service || ''}
                onChange={(e) => handleInputChange('service', e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchase_date">Fecha de Compra *</Label>
              <Input
                id="purchase_date"
                type="date"
                value={formData.purchase_date || ''}
                onChange={(e) => handleInputChange('purchase_date', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="expiry_date">Fecha de Vencimiento *</Label>
              <Input
                id="expiry_date"
                type="date"
                value={formData.expiry_date || ''}
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

          {formData.status === 'redeemed' && (
            <div className="space-y-2">
              <Label htmlFor="redeemed_date">Fecha de Canje</Label>
              <Input
                id="redeemed_date"
                type="date"
                value={formData.redeemed_date || ''}
                onChange={(e) => handleInputChange('redeemed_date', e.target.value)}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
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
              Actualizar Gift Card
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

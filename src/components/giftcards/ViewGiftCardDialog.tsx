
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { GiftCard } from "@/services/giftCardService";
import { format } from "date-fns";

interface ViewGiftCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  giftCard: GiftCard | null;
}

export const ViewGiftCardDialog = ({ 
  open, 
  onOpenChange, 
  giftCard
}: ViewGiftCardDialogProps) => {
  if (!giftCard) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Activa</Badge>;
      case 'redeemed':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Canjeada</Badge>;
      case 'expired':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Vencida</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Detalles de Gift Card</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-gray-600">Código</h4>
              <p className="font-mono text-lg">{giftCard.code}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-600">Estado</h4>
              <div className="mt-1">
                {getStatusBadge(giftCard.status)}
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-gray-600">Monto</h4>
              <p className="text-xl font-semibold text-green-600">
                ${giftCard.amount.toLocaleString()}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-600">Cliente</h4>
              <p>{giftCard.customer_name || '-'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-gray-600">Servicio</h4>
              <p>{giftCard.service || '-'}</p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-gray-600">Fecha de Compra</h4>
              <p>{format(new Date(giftCard.purchase_date), 'dd/MM/yyyy')}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-600">Fecha de Vencimiento</h4>
              <p>{format(new Date(giftCard.expiry_date), 'dd/MM/yyyy')}</p>
            </div>
          </div>

          {giftCard.redeemed_date && (
            <div>
              <h4 className="font-medium text-sm text-gray-600">Fecha de Canje</h4>
              <p>{format(new Date(giftCard.redeemed_date), 'dd/MM/yyyy')}</p>
            </div>
          )}

          {giftCard.notes && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium text-sm text-gray-600">Notas</h4>
                <p className="text-sm text-gray-700 mt-1">{giftCard.notes}</p>
              </div>
            </>
          )}

          <Separator />

          <div className="text-xs text-gray-500">
            <p>Creado por: {giftCard.created_by}</p>
            <p>Fecha de creación: {format(new Date(giftCard.created_at), 'dd/MM/yyyy HH:mm')}</p>
          </div>
        </div>
        
        <div className="flex justify-end pt-4">
          <Button onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

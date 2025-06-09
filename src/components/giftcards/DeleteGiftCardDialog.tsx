
import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { GiftCard } from "@/services/giftCardService";

interface DeleteGiftCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  giftCard: GiftCard | null;
  onConfirm: (id: number) => void;
}

export const DeleteGiftCardDialog = ({ 
  open, 
  onOpenChange, 
  giftCard,
  onConfirm 
}: DeleteGiftCardDialogProps) => {
  if (!giftCard) return null;

  const handleConfirm = () => {
    onConfirm(giftCard.id);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar Gift Card</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que deseas eliminar la gift card <strong>{giftCard.code}</strong>?
            Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};


import React from 'react';
import { AddGiftCardDialog } from './AddGiftCardDialog';
import { EditGiftCardDialog } from './EditGiftCardDialog';
import { ViewGiftCardDialog } from './ViewGiftCardDialog';
import { DeleteGiftCardDialog } from './DeleteGiftCardDialog';
import { GiftCard, NewGiftCard } from "@/services/giftCardService";
import { UseMutationResult } from "@tanstack/react-query";

interface GiftCardDialogsProps {
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
  isViewDetailsDialogOpen: boolean;
  setIsViewDetailsDialogOpen: (open: boolean) => void;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  selectedGiftCard: GiftCard | null;
  addGiftCardMutation: UseMutationResult<GiftCard, any, NewGiftCard, unknown>;
  updateGiftCardMutation: UseMutationResult<GiftCard, any, { id: number, updates: Partial<NewGiftCard> }, unknown>;
  deleteGiftCardMutation: UseMutationResult<void, any, number, unknown>;
  updateExpiryDate: (purchaseDate: string) => string;
}

export const GiftCardDialogs = ({
  isAddDialogOpen,
  setIsAddDialogOpen,
  isEditDialogOpen,
  setIsEditDialogOpen,
  isViewDetailsDialogOpen,
  setIsViewDetailsDialogOpen,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  selectedGiftCard,
  addGiftCardMutation,
  updateGiftCardMutation,
  deleteGiftCardMutation,
  updateExpiryDate
}: GiftCardDialogsProps) => {
  return (
    <>
      <AddGiftCardDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={(giftCard) => addGiftCardMutation.mutate(giftCard)}
        updateExpiryDate={updateExpiryDate}
      />

      <EditGiftCardDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        giftCard={selectedGiftCard}
        onSubmit={(id, updates) => updateGiftCardMutation.mutate({ id, updates })}
        updateExpiryDate={updateExpiryDate}
      />

      <ViewGiftCardDialog
        open={isViewDetailsDialogOpen}
        onOpenChange={setIsViewDetailsDialogOpen}
        giftCard={selectedGiftCard}
      />

      <DeleteGiftCardDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        giftCard={selectedGiftCard}
        onConfirm={(id) => deleteGiftCardMutation.mutate(id)}
      />
    </>
  );
};

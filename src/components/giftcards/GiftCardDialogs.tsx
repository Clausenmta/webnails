
import React from 'react';
import { AddGiftCardDialog } from './AddGiftCardDialog';
import { EditGiftCardDialog } from './EditGiftCardDialog';
import { ViewGiftCardDialog } from './ViewGiftCardDialog';
import { DeleteGiftCardDialog } from './DeleteGiftCardDialog';
import { useGiftCardManagement } from "@/hooks/useGiftCardManagement";

export const GiftCardDialogs = () => {
  const {
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
  } = useGiftCardManagement();

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

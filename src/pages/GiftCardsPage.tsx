
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileSpreadsheet, Upload, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import { useGiftCardManagement } from "@/hooks/useGiftCardManagement";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { GiftCardFilters } from "@/components/giftcards/GiftCardFilters";
import { GiftCardDialogs } from "@/components/giftcards/GiftCardDialogs";
import { GiftCard } from "@/services/giftCardService";

export default function GiftCardsPage() {
  const {
    giftCards,
    isLoading,
    
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    selectedMonth,
    setSelectedMonth,
    
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isViewDetailsDialogOpen,
    setIsViewDetailsDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    selectedGiftCard,
    setSelectedGiftCard,
    
    addGiftCardMutation,
    updateGiftCardMutation,
    deleteGiftCardMutation,
    updateExpiryDate,
    
    setIsImportDialogOpen,
    handleExportToExcel
  } = useGiftCardManagement();

  const handleViewDetails = (giftCard: GiftCard) => {
    console.log("Opening view details for:", giftCard);
    setSelectedGiftCard(giftCard);
    setIsViewDetailsDialogOpen(true);
  };

  const handleEdit = (giftCard: GiftCard) => {
    console.log("Opening edit for:", giftCard);
    setSelectedGiftCard(giftCard);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (giftCard: GiftCard) => {
    console.log("Opening delete for:", giftCard);
    setSelectedGiftCard(giftCard);
    setIsDeleteDialogOpen(true);
  };

  const handleAddNew = () => {
    console.log("Opening add new gift card dialog");
    setSelectedGiftCard(null);
    setIsAddDialogOpen(true);
  };

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

  if (isLoading) {
    return <div className="p-6">Cargando...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gift Cards</h1>
          <p className="text-gray-600">Gestiona todas las gift cards de tu negocio</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsImportDialogOpen(true)}
          >
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button>
          <Button
            variant="outline"
            onClick={handleExportToExcel}
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Exportar Excel
          </Button>
          <Button onClick={handleAddNew}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Gift Card
          </Button>
        </div>
      </div>

      {/* Filters */}
      <GiftCardFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
      />

      {/* Lista de Gift Cards */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Gift Cards</CardTitle>
          <p className="text-sm text-gray-600">{giftCards.length} gift cards encontradas</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código Gift Card</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Sucursal</TableHead>
                <TableHead>F. Compra</TableHead>
                <TableHead>F. Vencimiento</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {giftCards.map((giftCard) => (
                <TableRow key={giftCard.id}>
                  <TableCell className="font-medium">{giftCard.code}</TableCell>
                  <TableCell>${giftCard.amount.toLocaleString()}</TableCell>
                  <TableCell>{giftCard.customer_name || '-'}</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>{format(new Date(giftCard.purchase_date), 'yyyy-MM-dd')}</TableCell>
                  <TableCell>{format(new Date(giftCard.expiry_date), 'yyyy-MM-dd')}</TableCell>
                  <TableCell>{getStatusBadge(giftCard.status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(giftCard)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(giftCard)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(giftCard)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <GiftCardDialogs 
        isAddDialogOpen={isAddDialogOpen}
        setIsAddDialogOpen={setIsAddDialogOpen}
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        isViewDetailsDialogOpen={isViewDetailsDialogOpen}
        setIsViewDetailsDialogOpen={setIsViewDetailsDialogOpen}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        selectedGiftCard={selectedGiftCard}
        addGiftCardMutation={addGiftCardMutation}
        updateGiftCardMutation={updateGiftCardMutation}
        deleteGiftCardMutation={deleteGiftCardMutation}
        updateExpiryDate={updateExpiryDate}
      />
    </div>
  );
}

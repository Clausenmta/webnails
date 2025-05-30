
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, FileSpreadsheet, Upload, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import { useGiftCardManagement } from "@/hooks/useGiftCardManagement";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { GiftCardFilters } from "@/components/giftcards/GiftCardFilters";

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
    
    setSelectedGiftCard,
    setIsAddDialogOpen,
    setIsEditDialogOpen,
    setIsViewDetailsDialogOpen,
    setIsDeleteDialogOpen,
    setIsImportDialogOpen,
    
    handleExportToExcel,
    safeAction
  } = useGiftCardManagement();

  const handleViewDetails = (giftCard: any) => {
    safeAction(() => {
      setSelectedGiftCard(giftCard);
      setIsViewDetailsDialogOpen(true);
    });
  };

  const handleEdit = (giftCard: any) => {
    safeAction(() => {
      setSelectedGiftCard(giftCard);
      setIsEditDialogOpen(true);
    });
  };

  const handleDelete = (giftCard: any) => {
    safeAction(() => {
      setSelectedGiftCard(giftCard);
      setIsDeleteDialogOpen(true);
    });
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
            onClick={() => safeAction(() => setIsImportDialogOpen(true))}
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
          <Button
            onClick={() => safeAction(() => setIsAddDialogOpen(true))}
          >
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
    </div>
  );
}

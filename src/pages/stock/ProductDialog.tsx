
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { StockItem, NewStockItem } from "@/types/stock";
import { stockCategories, stockLocations } from "@/types/stock";

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  product: StockItem | null;
  onSave: (product: NewStockItem) => void;
  isLoading: boolean;
}

const ProductDialog: React.FC<ProductDialogProps> = ({
  open,
  onOpenChange,
  product,
  onSave,
  isLoading
}) => {
  const [formData, setFormData] = useState<Partial<NewStockItem>>({
    product_name: '',
    category: '',
    brand: '',
    supplier: '',
    quantity: 0,
    unit_price: 0,
    min_stock_level: 3,
    location: 'default-location'
  });

  // Update form data when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        product_name: product.product_name,
        category: product.category,
        brand: product.brand,
        supplier: product.supplier,
        quantity: product.quantity,
        unit_price: product.unit_price,
        min_stock_level: product.min_stock_level,
        location: product.location
      });
    } else {
      setFormData({
        product_name: '',
        category: '',
        brand: '',
        supplier: '',
        quantity: 0,
        unit_price: 0,
        min_stock_level: 3,
        location: 'default-location'
      });
    }
  }, [product]);

  const handleSave = () => {
    if (!formData.product_name) return;
    
    onSave(formData as NewStockItem);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const isEdit = !!product;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Producto" : "Agregar Nuevo Producto"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Modifica los detalles del producto en el inventario" : "Completa los detalles del producto para agregarlo al inventario"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Producto</Label>
            <Input 
              id="name" 
              value={formData.product_name || ""} 
              onChange={e => setFormData({
                ...formData,
                product_name: e.target.value
              })} 
              placeholder="Nombre completo del producto" 
              className="w-full" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplier">Proveedor</Label>
              <Input 
                id="supplier" 
                value={formData.supplier || ""} 
                onChange={e => setFormData({
                  ...formData,
                  supplier: e.target.value
                })} 
                placeholder="Nombre del proveedor" 
                className="w-full" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">Marca</Label>
              <Input 
                id="brand" 
                value={formData.brand || ""} 
                onChange={e => setFormData({
                  ...formData,
                  brand: e.target.value
                })} 
                placeholder="Marca del producto" 
                className="w-full" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <Select 
              value={formData.category || ""} 
              onValueChange={value => setFormData({
                ...formData,
                category: value
              })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {stockCategories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Ubicación</Label>
            <Select 
              value={formData.location || 'default-location'} 
              onValueChange={value => setFormData({
                ...formData,
                location: value
              })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar ubicación" />
              </SelectTrigger>
              <SelectContent>
                {stockLocations.map(location => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input 
                id="stock" 
                type="number" 
                min="0" 
                value={formData.quantity || ""} 
                onChange={e => setFormData({
                  ...formData,
                  quantity: Number(e.target.value)
                })} 
                className="w-full" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minStock">Stock Mínimo</Label>
              <Input 
                id="minStock" 
                type="number" 
                min="1" 
                value={formData.min_stock_level || ""} 
                onChange={e => setFormData({
                  ...formData,
                  min_stock_level: Number(e.target.value)
                })} 
                className="w-full" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Precio</Label>
              <Input 
                id="price" 
                type="number" 
                min="0" 
                value={formData.unit_price || ""} 
                onChange={e => setFormData({
                  ...formData,
                  unit_price: Number(e.target.value)
                })} 
                className="w-full" 
              />
            </div>
          </div>
        </div>
        <DialogFooter className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!formData.product_name || isLoading} 
            className="bg-[#9b87f5] hover:bg-[#7E69AB] text-white"
          >
            {isLoading ? "Guardando..." : isEdit ? "Actualizar" : "Agregar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDialog;

// Handles both Add and Edit Product dialogs
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { NewStockItem } from "@/types/stock";
interface ProductDialogProps {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  mode: "add" | "edit";
  product: Partial<NewStockItem>;
  setProduct: (v: Partial<NewStockItem>) => void;
  categories: string[];
  locations: string[];
  isPending: boolean;
  onAction: () => void;
  onCancel: () => void;
  actionLabel: string;
}
const ProductDialog: React.FC<ProductDialogProps> = ({
  open,
  onOpenChange,
  mode,
  product,
  setProduct,
  categories,
  locations,
  isPending,
  onAction,
  onCancel,
  actionLabel
}) => <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>{mode === "add" ? "Agregar Nuevo Producto" : "Editar Producto"}</DialogTitle>
        <DialogDescription>
          {mode === "add" ? "Completa los detalles del producto para agregarlo al inventario" : "Modifica los detalles del producto en el inventario"}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-6 py-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre del Producto</Label>
          <Input id="name" value={product.product_name || ""} onChange={e => setProduct({
          ...product,
          product_name: e.target.value
        })} placeholder="Nombre completo del producto" className="w-full" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="supplier">Proveedor</Label>
            <Input id="supplier" value={product.supplier || ""} onChange={e => setProduct({
            ...product,
            supplier: e.target.value
          })} placeholder="Nombre del proveedor" className="w-full" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="brand">Marca</Label>
            <Input id="brand" value={product.brand || ""} onChange={e => setProduct({
            ...product,
            brand: e.target.value
          })} placeholder="Marca del producto" className="w-full" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Categoría</Label>
          <Select value={product.category || ""} onValueChange={value => setProduct({
          ...product,
          category: value
        })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => <SelectItem key={category} value={category}>{category}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Ubicación</Label>
          <Select value={product.location || ''} onValueChange={value => setProduct({
          ...product,
          location: value
        })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar ubicación" />
            </SelectTrigger>
            <SelectContent>
              {locations.map(location => <SelectItem key={location} value={location}>{location}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="stock">Stock
          </Label>
            <Input id="stock" type="number" min="0" value={product.quantity || ""} onChange={e => setProduct({
            ...product,
            quantity: Number(e.target.value)
          })} className="w-full" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="minStock">Stock Mínimo</Label>
            <Input id="minStock" type="number" min="1" value={product.min_stock_level || ""} onChange={e => setProduct({
            ...product,
            min_stock_level: Number(e.target.value)
          })} className="w-full" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Precio</Label>
            <Input id="price" type="number" min="0" value={product.unit_price || ""} onChange={e => setProduct({
            ...product,
            unit_price: Number(e.target.value)
          })} className="w-full" />
          </div>
        </div>
      </div>
      <DialogFooter className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={onAction} disabled={!product.product_name || isPending} className="bg-[#9b87f5] hover:bg-[#7E69AB] text-white">
          {isPending ? mode === "add" ? "Guardando..." : "Guardando..." : actionLabel}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>;
export default ProductDialog;
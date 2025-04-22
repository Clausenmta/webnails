
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { StockItem, NewStockItem } from "@/types/stock";

interface StockUpdateDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  productId: number;
  setProductId: (id: number) => void;
  quantity: number;
  setQuantity: (q: number) => void;
  operation: "add" | "remove";
  setOperation: (op: "add" | "remove") => void;
  stockItems: StockItem[];
  isPending: boolean;
  onUpdate: () => void;
  onCancel: () => void;
}

const StockUpdateDialog: React.FC<StockUpdateDialogProps> = ({
  open, onOpenChange, productId, setProductId, quantity, setQuantity, operation, setOperation,
  stockItems, isPending, onUpdate, onCancel
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Actualizar Stock</DialogTitle>
        <DialogDescription>
          Selecciona un producto y actualiza su cantidad en stock
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="product">Producto</Label>
          <Select
            value={productId ? productId.toString() : "select-product"}
            onValueChange={value => setProductId(Number(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar producto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="select-product" disabled>Seleccionar producto</SelectItem>
              {stockItems.map(product => (
                <SelectItem key={product.id} value={product.id.toString()}>
                  {product.product_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="operation">Operación</Label>
          <Select
            value={operation}
            onValueChange={v => setOperation(v as "add" | "remove")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar operación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="add">Agregar</SelectItem>
              <SelectItem value="remove">Retirar</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="quantity">Cantidad</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={quantity || ""}
            onChange={e => setQuantity(Number(e.target.value))}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          onClick={onUpdate}
          disabled={quantity <= 0 || !productId || isPending}
        >
          {isPending ? "Actualizando..." : "Actualizar Stock"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default StockUpdateDialog;

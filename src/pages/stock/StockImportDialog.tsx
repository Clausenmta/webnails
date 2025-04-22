
import React from "react";
import { ImportExcelDialog } from "@/components/common/ImportExcelDialog";

interface StockImportDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onImport: (d: any[]) => void;
  templateData: any[];
  templateFilename: string;
  title: string;
  description: string;
}

const StockImportDialog: React.FC<StockImportDialogProps> = (props) => (
  <ImportExcelDialog {...props} />
);

export default StockImportDialog;

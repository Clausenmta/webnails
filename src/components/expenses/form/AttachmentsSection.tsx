
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileImage, File, Upload, X } from "lucide-react";
import { toast } from "sonner";

interface AttachmentsSectionProps {
  attachments: File[];
  onAttachmentsChange: (files: File[]) => void;
}

export function AttachmentsSection({ attachments, onAttachmentsChange }: AttachmentsSectionProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') || file.type === 'application/pdf'
    );
    
    if (validFiles.length !== files.length) {
      toast.error("Solo se permiten archivos de imagen o PDF");
      return;
    }
    
    onAttachmentsChange([...attachments, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    onAttachmentsChange(attachments.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <Label>Adjuntos (opcional)</Label>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
            multiple
          />
          <Label
            htmlFor="file-upload"
            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-md"
          >
            <Upload className="h-4 w-4" />
            Subir archivos
          </Label>
          <span className="text-sm text-muted-foreground">
            Imágenes o PDF
          </span>
        </div>
        
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 bg-muted rounded-md"
              >
                {file.type.startsWith('image/') ? (
                  <FileImage className="h-4 w-4" />
                ) : (
                  <File className="h-4 w-4" />
                )}
                <span className="text-sm truncate max-w-[150px]">
                  {file.name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => removeAttachment(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

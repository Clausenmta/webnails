
import { toast as sonnerToast } from "sonner"

type ToastProps = {
  title?: string
  message: string
  type?: "success" | "error" | "info" | "warning"
}

export const toast = {
  success: (message: string, title?: string) => {
    sonnerToast.success(title || "Success", {
      description: message,
    })
  },
  error: (message: string, title?: string) => {
    sonnerToast.error(title || "Error", {
      description: message,
    })
  },
  info: (message: string, title?: string) => {
    sonnerToast.info(title || "Info", {
      description: message,
    })
  },
  warning: (message: string, title?: string) => {
    sonnerToast.warning(title || "Warning", {
      description: message,
    })
  },
}

export const useToast = () => {
  return toast
}

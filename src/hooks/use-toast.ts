
import * as React from "react"

export const TOAST_LIMIT = 5
export const TOAST_REMOVE_DELAY = 1000000

export type Toast = {
  id?: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
  className?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export type ToasterToast = Required<Pick<Toast, "id">> & Toast

export interface ToastContextType {
  toasts: ToasterToast[]
  addToast: (toast: Omit<Toast, "id">) => string
  updateToast: (id: string, toast: Partial<Toast>) => void
  dismissToast: (id: string) => void
  removeToast: (id: string) => void
  toast: {
    (props: Omit<Toast, "id">): string
    success: (message: string, title?: string) => string
    error: (message: string, title?: string) => string
    warning: (message: string, title?: string) => string
    info: (message: string, title?: string) => string
  }
}

export const ToastContext = React.createContext<ToastContextType | null>(null)

// The main useToast hook
export const useToast = () => {
  const context = React.useContext(ToastContext)

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }

  return context
}

// Create function to be used outside of components
const toastFunction = ((props: Omit<Toast, "id">): string => {
  console.error(
    "Toast function called outside of component. Use useToast() hook instead."
  )
  return ""
}) as {
  (props: Omit<Toast, "id">): string
  success: (message: string, title?: string) => string
  error: (message: string, title?: string) => string
  warning: (message: string, title?: string) => string
  info: (message: string, title?: string) => string
}

// Add methods to the toast function
toastFunction.success = (message: string, title?: string): string => {
  console.error("Toast function called outside of component. Use useToast() hook instead.")
  return ""
}

toastFunction.error = (message: string, title?: string): string => {
  console.error("Toast function called outside of component. Use useToast() hook instead.")
  return ""
}

toastFunction.warning = (message: string, title?: string): string => {
  console.error("Toast function called outside of component. Use useToast() hook instead.")
  return ""
}

toastFunction.info = (message: string, title?: string): string => {
  console.error("Toast function called outside of component. Use useToast() hook instead.")
  return ""
}

export const toast = toastFunction

// Export the provider implementation
export { ToastProvider } from "./use-toast.tsx"

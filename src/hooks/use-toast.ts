
import * as React from "react"
import { type ToastActionElement, type ToastProps } from "@/components/ui/toast"

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: string
  description?: string
  action?: ToastActionElement
}

let count = 0

function generateId() {
  return `${count++}`
}

// Create the toast context type
export type Toast = {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
  className?: string
}

export interface ToastContextType {
  toasts: Toast[]
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

// Export the hook implementation
export { ToastProvider } from "./use-toast.tsx"

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
  throw new Error(
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

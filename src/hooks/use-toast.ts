
import { type ToastActionElement, type ToastProps } from "@/components/ui/toast"
import * as React from "react"

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
}

export const ToastContext = React.createContext<ToastContextType | null>(null)

interface ToastProviderProps {
  children: React.ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const addToast = React.useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = generateId()
      
      setToasts((prevToasts) => {
        // Check if we already have the maximum number of toasts
        if (prevToasts.length >= TOAST_LIMIT) {
          const nextToasts = [...prevToasts]
          nextToasts.shift() // Remove the oldest toast
          return [...nextToasts, { id, ...toast }]
        }

        return [...prevToasts, { id, ...toast }]
      })
      
      return id
    },
    [setToasts]
  )

  const updateToast = React.useCallback(
    (id: string, toast: Partial<Toast>) => {
      setToasts((prevToasts) => {
        const toastIndex = prevToasts.findIndex((t) => t.id === id)

        if (toastIndex === -1) {
          return prevToasts
        }

        const updatedToasts = [...prevToasts]
        updatedToasts[toastIndex] = {
          ...updatedToasts[toastIndex],
          ...toast,
        }

        return updatedToasts
      })
    },
    [setToasts]
  )

  const dismissToast = React.useCallback(
    (id: string) => {
      setToasts((prevToasts) => {
        const toastIndex = prevToasts.findIndex((t) => t.id === id)

        if (toastIndex === -1) {
          return prevToasts
        }

        const updatedToasts = [...prevToasts]
        updatedToasts.splice(toastIndex, 1)

        return updatedToasts
      })
    },
    [setToasts]
  )

  const removeToast = React.useCallback(
    (id: string) => {
      setTimeout(() => {
        dismissToast(id)
      }, TOAST_REMOVE_DELAY)
    },
    [dismissToast]
  )

  const value = React.useMemo(() => {
    return {
      toasts,
      addToast,
      updateToast,
      dismissToast,
      removeToast,
    }
  }, [toasts, addToast, updateToast, dismissToast, removeToast])

  // Create provider element
  const provider = React.createElement(
    ToastContext.Provider,
    { value },
    children
  )
  
  return provider
}

// The main useToast hook
export const useToast = () => {
  const context = React.useContext(ToastContext)

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }

  return context
}

// Define the toast function interface with callable signature and methods
interface ToastFunction {
  (props: Omit<Toast, "id">): string;
  success: (message: string, title?: string) => string;
  error: (message: string, title?: string) => string;
  warning: (message: string, title?: string) => string;
  info: (message: string, title?: string) => string;
}

// Create the toast function that can be called directly or via methods
const createToastFunction = (): ToastFunction => {
  const toastFn = ((props: Omit<Toast, "id">) => {
    const context = React.useContext(ToastContext)
    if (!context) {
      console.error("Toast used outside of provider, this won't work")
      return ""
    }
    return context.addToast(props)
  }) as ToastFunction

  // Add success method
  toastFn.success = (message: string, title?: string) => {
    const context = React.useContext(ToastContext)
    if (!context) return ""
    return context.addToast({
      title: title || "Success",
      description: message,
      variant: "default",
      className: "bg-green-100 border-green-300 text-green-800"
    })
  }

  // Add error method
  toastFn.error = (message: string, title?: string) => {
    const context = React.useContext(ToastContext)
    if (!context) return ""
    return context.addToast({
      title: title || "Error",
      description: message,
      variant: "destructive"
    })
  }

  // Add warning method
  toastFn.warning = (message: string, title?: string) => {
    const context = React.useContext(ToastContext)
    if (!context) return ""
    return context.addToast({
      title: title || "Warning",
      description: message,
      className: "bg-yellow-100 border-yellow-300 text-yellow-800"
    })
  }

  // Add info method
  toastFn.info = (message: string, title?: string) => {
    const context = React.useContext(ToastContext)
    if (!context) return ""
    return context.addToast({
      title: title || "Info",
      description: message,
      className: "bg-blue-100 border-blue-300 text-blue-800"
    })
  }

  return toastFn
}

// Export the toast function
export const toast = createToastFunction()

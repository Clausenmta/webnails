
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

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  )
}

// The main useToast hook
export const useToast = () => {
  const context = React.useContext(ToastContext)

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }

  return context
}

// Function to create toast without having to call useToast
type ToastFunction = {
  (props: Omit<Toast, "id">): string;
  success: (message: string, title?: string) => string;
  error: (message: string, title?: string) => string;
  warning: (message: string, title?: string) => string;
  info: (message: string, title?: string) => string;
}

// Create a toast function for direct access without hooks
export const toast = {
  (props: Omit<Toast, "id">) {
    throw new Error(
      "Toast function called outside of component. Use useToast() hook instead."
    )
  },
  success(message: string, title?: string) {
    console.error("Toast function called outside of component. Use useToast() hook instead.")
    return ""
  },
  error(message: string, title?: string) {
    console.error("Toast function called outside of component. Use useToast() hook instead.")
    return ""
  },
  warning(message: string, title?: string) {
    console.error("Toast function called outside of component. Use useToast() hook instead.")
    return ""
  },
  info(message: string, title?: string) {
    console.error("Toast function called outside of component. Use useToast() hook instead.")
    return ""
  }
} as ToastFunction

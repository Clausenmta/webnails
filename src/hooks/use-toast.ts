
import { type ToastActionElement, type ToastProps } from "@/components/ui/toast"
import { useToast as useSonnerToast } from "sonner"

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: string
  description?: string
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function generateId() {
  return `${count++}`
}

// Create a context and provider for toasts
import * as React from "react"

type Toast = {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

type ToastContextType = {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
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
      setToasts((prevToasts) => {
        const id = generateId()

        // Check if we already have the maximum number of toasts
        if (prevToasts.length >= TOAST_LIMIT) {
          const nextToasts = [...prevToasts]
          nextToasts.shift() // Remove the oldest toast
          return [...nextToasts, { id, ...toast }]
        }

        return [...prevToasts, { id, ...toast }]
      })
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

// Simple toast utility functions
export const toast = {
  success: (message: string, title?: string) => {
    const context = React.useContext(ToastContext)
    if (context) {
      context.addToast({
        title: title || "Success",
        description: message,
        variant: "default"
      })
    }
  },
  error: (message: string, title?: string) => {
    const context = React.useContext(ToastContext)
    if (context) {
      context.addToast({
        title: title || "Error",
        description: message,
        variant: "destructive"
      })
    }
  },
  info: (message: string, title?: string) => {
    const context = React.useContext(ToastContext)
    if (context) {
      context.addToast({
        title: title || "Info",
        description: message,
      })
    }
  },
  warning: (message: string, title?: string) => {
    const context = React.useContext(ToastContext)
    if (context) {
      context.addToast({
        title: title || "Warning",
        description: message,
      })
    }
  },
}

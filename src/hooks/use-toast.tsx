
import * as React from "react"
import { ToastContext, type ToastContextType, type Toast } from "./use-toast" 
import { ToastProvider as RadixToastProvider } from "@radix-ui/react-toast"

interface ToastProviderProps {
  children: React.ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const addToast = React.useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).substring(2, 9)
      
      setToasts((prevToasts) => {
        // Check if we already have the maximum number of toasts
        if (prevToasts.length >= 5) {
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
      }, 5000)
    },
    [dismissToast]
  )

  const value = React.useMemo<ToastContextType>(() => {
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
      <RadixToastProvider>
        {children}
      </RadixToastProvider>
    </ToastContext.Provider>
  )
}

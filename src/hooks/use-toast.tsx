"use client"

import * as React from "react"
import { type Toast } from "./use-toast"

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = Required<Pick<Toast, "id">> & Toast

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

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
      id: string
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      id: string
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      id: string
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: actionTypes.REMOVE_TOAST,
      id: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.id ? { ...t, ...action.toast } : t
        ),
      }

    case actionTypes.DISMISS_TOAST: {
      const { id } = action

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (id) {
        addToRemoveQueue(id)
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === id || id === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case actionTypes.REMOVE_TOAST:
      if (action.id === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.id),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

function toast(props: Omit<Toast, "id">) {
  const id = generateId()

  const update = (props: Omit<Toast, "id">) =>
    dispatch({
      type: actionTypes.UPDATE_TOAST,
      id,
      toast: props,
    })

  const dismiss = () => dispatch({ type: actionTypes.DISMISS_TOAST, id })

  dispatch({
    type: actionTypes.ADD_TOAST,
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id,
    dismiss,
    update,
  }
}

toast.success = (message: string, title?: string) => {
  return toast({ title, description: message, variant: "default" }).id
}

toast.error = (message: string, title?: string) => {
  return toast({ title, description: message, variant: "destructive" }).id
}

toast.warning = (message: string, title?: string) => {
  const className = "bg-yellow-500 border border-yellow-600 text-white"
  return toast({ title, description: message, className }).id
}

toast.info = (message: string, title?: string) => {
  const className = "bg-blue-500 border border-blue-600 text-white" 
  return toast({ title, description: message, className }).id
}

import { ToastContext, type ToastContextType } from "./use-toast"

export function ToastProvider({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  const contextValue = React.useMemo<ToastContextType>(
    () => ({
      toasts: state.toasts,
      addToast: (props) => toast(props).id,
      updateToast: (id, props) => {
        dispatch({
          type: actionTypes.UPDATE_TOAST,
          id,
          toast: props,
        })
      },
      dismissToast: (id) => {
        dispatch({ type: actionTypes.DISMISS_TOAST, id })
      },
      removeToast: (id) => {
        dispatch({ type: actionTypes.REMOVE_TOAST, id })
      },
      toast: Object.assign(
        (props: Omit<Toast, "id">) => toast(props).id,
        {
          success: toast.success,
          error: toast.error,
          warning: toast.warning,
          info: toast.info,
        }
      ),
    }),
    [state.toasts]
  )

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
    </ToastContext.Provider>
  )
}

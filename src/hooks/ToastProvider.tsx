
import React from "react";
import { ToastContext, type ToastContextType } from "./use-toast";

interface ToastProviderProps {
  children: React.ReactNode;
  value: ToastContextType;
}

export const ToastContextProvider: React.FC<ToastProviderProps> = ({ 
  children, 
  value 
}) => {
  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};

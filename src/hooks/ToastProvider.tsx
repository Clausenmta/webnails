
import React from "react";
import { ToastContext } from "./use-toast";

interface ToastProviderProps {
  children: React.ReactNode;
  value: any;
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

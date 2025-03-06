"use client"

import { useState, useEffect, createContext, useContext } from "react"

type ToastProps = {
  title: string
  description?: string
  variant?: "default" | "destructive"
  duration?: number
}

type ToastContextType = {
  toast: (props: ToastProps) => void
  toasts: ToastProps[]
  removeToast: (index: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = (props: ToastProps) => {
    setToasts((prev) => [...prev, { ...props, duration: props.duration || 5000 }])
  }

  const removeToast = (index: number) => {
    setToasts((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <ToastContext.Provider value={{ toast, toasts, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed bottom-0 right-0 p-4 space-y-2 z-50">
      {toasts.map((toast, index) => (
        <Toast key={index} {...toast} onClose={() => removeToast(index)} />
      ))}
    </div>
  )
}

function Toast({
  title,
  description,
  variant = "default",
  duration = 5000,
  onClose,
}: ToastProps & { onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div
      className={`
        p-4 rounded-md shadow-md min-w-[300px] max-w-md animate-in slide-in-from-right-full
        ${variant === "destructive" ? "bg-red-600 text-white" : "bg-white text-gray-900 border"}
      `}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-medium">{title}</h3>
        <button onClick={onClose} className="text-sm opacity-70 hover:opacity-100">
          ×
        </button>
      </div>
      {description && <p className="text-sm mt-1 opacity-90">{description}</p>}
    </div>
  )
}


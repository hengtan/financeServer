import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR').format(date)
}

// Toast helper functions
import { toast } from "@/hooks/useToast"

export const showSuccessToast = (title: string, description?: string) => {
  toast({
    variant: "success",
    title,
    description,
  })
}

export const showErrorToast = (title: string, description?: string) => {
  toast({
    variant: "destructive",
    title,
    description,
  })
}

export const showWarningToast = (title: string, description?: string) => {
  toast({
    variant: "warning",
    title,
    description,
  })
}

export const showInfoToast = (title: string, description?: string) => {
  toast({
    variant: "info",
    title,
    description,
  })
}
/**
 * Configuración de Payphone para Nicole Pastry Arts
 * Contiene las credenciales y URLs necesarias para la integración de pagos
 * Las credenciales sensibles se obtienen de variables de entorno
 */

// Validación de variables de entorno requeridas
const requiredEnvVars = {
  TOKEN: import.meta.env.VITE_PAYPHONE_TOKEN,
  STORE_ID: import.meta.env.VITE_PAYPHONE_STORE_ID,
  RESPONSE_URL: import.meta.env.VITE_PAYPHONE_RESPONSE_URL,
  CANCEL_URL: import.meta.env.VITE_PAYPHONE_CANCEL_URL,
}

// Verificar que todas las variables de entorno estén definidas
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Variable de entorno requerida no encontrada: VITE_PAYPHONE_${key}`)
  }
})

export const PAYPHONE_CONFIG = {
  // Credenciales de autenticación (desde variables de entorno)
  TOKEN: requiredEnvVars.TOKEN,
  STORE_ID: requiredEnvVars.STORE_ID,

  // URLs de la API
  API_BASE_URL: 'https://pay.payphonetodoesposible.com/api',
  BUTTON_PREPARE_URL: 'https://pay.payphonetodoesposible.com/api/button/Prepare',
  BUTTON_CONFIRM_URL: 'https://pay.payphonetodoesposible.com/api/button/Confirm',

  // URLs de respuesta y dominio (desde variables de entorno)
  RESPONSE_URL: requiredEnvVars.RESPONSE_URL,
  CANCEL_URL: requiredEnvVars.CANCEL_URL,

  // Configuración de moneda y formato
  CURRENCY: 'USD',

  // Headers por defecto
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${requiredEnvVars.TOKEN}`,
  },
} as const

/**
 * Tipos para las transacciones de Payphone
 */
export interface PayphoneTransaction {
  amount: number // Monto total en centavos
  amountWithTax?: number // Monto base de items gravados (sin incluir impuestos)
  amountWithoutTax?: number // Monto sin impuestos
  tax?: number // Impuestos
  service?: number // Servicio
  tip?: number // Propina
  currency: string
  reference: string // Referencia del comercio
  clientTransactionId: string // ID único de la transacción
  storeId: string
  responseUrl: string // URL de respuesta después del pago
  cancellationUrl?: string // URL de cancelación (opcional)
}

export interface PayphoneResponse {
  transactionId: string
  clientTransactionId: string
  transactionStatus: 'Pending' | 'Approved' | 'Rejected'
  payWithPayPhone: string // URL para redireccionar al usuario
  message?: string
}

/**
 * Utilidad para convertir precio en dólares a centavos
 */
export const dollarsToCents = (dollars: number): number => {
  return Math.round(dollars * 100)
}

/**
 * Utilidad para generar ID único de transacción
 */
export const generateTransactionId = (productId: string): string => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  // Prefijo ajustado para este proyecto
  return `storybrand-${productId}-${timestamp}-${random}`
}

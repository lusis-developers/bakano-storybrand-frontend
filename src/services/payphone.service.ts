import { PAYPHONE_CONFIG, type PayphoneTransaction, type PayphoneResponse } from '@/config/payphone'

class PayphoneService {
  /**
   * Prepara el botón de pago en Payphone y retorna la URL para redirigir al usuario.
   */
  async prepareButton(tx: PayphoneTransaction): Promise<PayphoneResponse> {
    // Asegurar consistencia: Amount debe ser igual a la suma de AmountWithTax, AmountWithoutTax, Tax, Service y Tip
    const payload: PayphoneTransaction = {
      ...tx,
      amountWithoutTax: tx.amountWithoutTax ?? tx.amount,
      tax: tx.tax ?? 0,
      service: tx.service ?? 0,
      tip: tx.tip ?? 0,
    }

    const res = await fetch(PAYPHONE_CONFIG.BUTTON_PREPARE_URL, {
      method: 'POST',
      headers: PAYPHONE_CONFIG.DEFAULT_HEADERS,
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Payphone Prepare failed: ${res.status} ${text}`)
    }

    const data = (await res.json()) as PayphoneResponse
    return data
  }
}

const payphoneService = new PayphoneService()
export { payphoneService }
export default payphoneService
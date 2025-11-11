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

  /**
   * Confirma una transacción de Payphone (POST /button/Confirm)
   * @param id Transaction ID provisto por Payphone en el querystring (id=...)
   */
  async confirmButton(id: string): Promise<any> {
    const res = await fetch(PAYPHONE_CONFIG.BUTTON_CONFIRM_URL, {
      method: 'POST',
      headers: PAYPHONE_CONFIG.DEFAULT_HEADERS,
      body: JSON.stringify({ id }),
    })

    const text = await res.text()
    if (!res.ok) {
      throw new Error(`Payphone Confirm failed: ${res.status} ${text}`)
    }

    try {
      return JSON.parse(text)
    } catch (_) {
      return { raw: text }
    }
  }
}

const payphoneService = new PayphoneService()
export { payphoneService }
export default payphoneService
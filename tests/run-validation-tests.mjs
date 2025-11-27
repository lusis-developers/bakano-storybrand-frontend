import assert from 'node:assert'

function validateId(value, type) {
  const v = String(value).trim()
  if (type === 'cedula') return /^\d{10}$/.test(v)
  if (type === 'ruc') return /^\d{13}$/.test(v)
  return /^[A-Za-z0-9]{6,20}$/.test(v)
}

function validateAddress(addr) {
  if (!addr) return false
  const streetOk = !!(addr.street && addr.street.trim().length >= 3)
  const cityOk = !!(addr.city && addr.city.trim().length >= 2)
  const countryOk = !!(addr.country && addr.country.trim().length >= 2)
  return streetOk && cityOk && countryOk
}

function validatePhone(p) {
  return /^[\+]?[1-9][\d]{6,15}$/.test(String(p).trim())
}

assert.strictEqual(validateId('0123456789', 'cedula'), true)
assert.strictEqual(validateId('012345678', 'cedula'), false)
assert.strictEqual(validateId('0123456789012', 'ruc'), true)
assert.strictEqual(validateId('abc123', 'pasaporte'), true)
assert.strictEqual(validateId('a', 'pasaporte'), false)

assert.strictEqual(validateAddress({ street: 'Av. 123', city: 'Quito', country: 'Ecuador' }), true)
assert.strictEqual(validateAddress({ street: '', city: 'Quito', country: 'Ecuador' }), false)

assert.strictEqual(validatePhone('+593987654321'), true)
assert.strictEqual(validatePhone('098'), false)

console.log('Validation tests passed')

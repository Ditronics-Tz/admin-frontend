export function maskPhone(value: string) {
  const digits = value.replace(/\D/g, '')
  return digits.length >= 9
    ? `+${digits.slice(0, 3)} ${digits.slice(3, 4)}** *** ${digits.slice(-3)}`
    : '•••'
}

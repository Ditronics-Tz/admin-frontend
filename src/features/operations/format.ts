export function maskPhone(phone: string) {
  return phone.length < 7 ? '•••' : `${phone.slice(0, 5)}** *** ${phone.slice(-3)}`
}

export function money(value: number) {
  return `TSh ${value.toLocaleString('en-TZ')}`
}

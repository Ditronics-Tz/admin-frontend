import { useRef } from 'react'

interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  invalid?: boolean
}

export function OtpInput({ value, onChange, disabled, invalid }: OtpInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([])
  const digits = Array.from({ length: 6 }, (_, index) => value[index] ?? '')

  function write(next: string) {
    onChange(next.replace(/\D/g, '').slice(0, 6))
  }

  return (
    <div className="flex justify-center gap-2" onPaste={(event) => {
      event.preventDefault()
      write(event.clipboardData.getData('text'))
      refs.current[5]?.focus()
    }}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(node) => {
            refs.current[index] = node
          }}
          value={digit}
          disabled={disabled}
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          autoFocus={index === 0}
          aria-label={`Digit ${index + 1}`}
          maxLength={1}
          className={`h-12 w-10 rounded-md border bg-white text-center text-lg text-[#172B36] outline-none focus:border-[#1C7C70] sm:w-12 ${invalid ? 'border-destructive' : 'border-input'}`}
          onChange={(event) => {
            const entered = event.target.value.replace(/\D/g, '')
            if (!entered) {
              write(value.slice(0, index) + value.slice(index + 1))
              return
            }
            const next = (value.slice(0, index) + entered + value.slice(index + 1)).replace(/\D/g, '').slice(0, 6)
            write(next)
            refs.current[Math.min(index + entered.length, 5)]?.focus()
          }}
          onKeyDown={(event) => {
            if (event.key === 'Backspace' && !digits[index] && index > 0) {
              refs.current[index - 1]?.focus()
            }
          }}
        />
      ))}
    </div>
  )
}

import { useEffect, useState } from 'react'

export function useDebounced<T>(value: T, delay = 300) {
  const [debounced, set] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => set(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

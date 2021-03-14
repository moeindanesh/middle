import { useRef, useEffect } from 'react'

export function useLatest<T = any>(value: T) {
  const valueRef = useRef<T>()

  useEffect(() => {
    valueRef.current = value
  }, [value])

  return valueRef
}

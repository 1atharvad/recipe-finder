import { useEffect } from 'react'

// Prevents the page behind an open modal from scrolling — without this the
// overlay only blocks clicks, but wheel/keyboard scroll still reaches the
// page underneath, which reads as broken since the modal looks modal but isn't.
export const useBodyScrollLock = () => {
  useEffect(() => {
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = original }
  }, [])
}

"use client"

import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Default to false for SSR to avoid hydration issues
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    // Only run on the client side
    if (typeof window === 'undefined') return
    
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Set initial value
    onChange()
    
    // Add event listener
    mql.addEventListener("change", onChange)
    
    // Cleanup
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile
}

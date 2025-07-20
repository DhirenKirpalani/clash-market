"use client";

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useSplashScreen } from './splash-screen';

/**
 * NavigationLoader - Shows the splash screen during page transitions
 */
export function NavigationLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { forceShow, forceHide } = useSplashScreen();
  
  // Keep track of navigation state
  const isNavigating = useRef(false);
  const prevPathRef = useRef(pathname);
  const prevSearchRef = useRef(searchParams.toString());
  
  useEffect(() => {
    // Get current full path including search params
    const currentFullPath = searchParams.toString() 
      ? `${pathname}?${searchParams.toString()}` 
      : pathname;
    
    // Get previous full path
    const prevFullPath = prevSearchRef.current 
      ? `${prevPathRef.current}?${prevSearchRef.current}` 
      : prevPathRef.current;
    
    // Skip initial render
    if (prevPathRef.current === pathname && prevSearchRef.current === searchParams.toString()) {
      return;
    }
    
    // Show loader when navigation starts (if not already showing)
    if (!isNavigating.current) {
      console.log('Navigation started to:', currentFullPath);
      isNavigating.current = true;
      forceShow();
      
      // Hide loader after navigation is complete (with a small delay for smoother experience)
      setTimeout(() => {
        console.log('Navigation completed to:', currentFullPath);
        forceHide();
        isNavigating.current = false;
      }, 800); // Adjust this delay as needed
    }
    
    // Update refs for next comparison
    prevPathRef.current = pathname;
    prevSearchRef.current = searchParams.toString();
    
  }, [pathname, searchParams, forceShow, forceHide]);
  
  // This component doesn't render anything, it just controls the splash screen
  return null;
}

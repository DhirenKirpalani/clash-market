import React, { useState, useEffect, useRef } from 'react';
import { useNotifications } from './notification-modal';

interface CountdownTimerProps {
  targetDate: Date;
  active?: boolean;
  durationMinutes?: number;
}

export function CountdownTimer({ targetDate, active = false, durationMinutes = 30 }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const { addNotification } = useNotifications();
  const notificationsShown = useRef({
    oneHour: false,
    tenMinutes: false,
    oneMinute: false,
    started: false,
  });
  
  // Store the target date in a ref to detect changes
  const targetDateRef = useRef<Date>(targetDate);
  
  // Store active state in a ref to detect changes
  const activeRef = useRef<boolean>(active);
  
  // Keep track of the initial render when transitioning to active
  const firstActiveRender = useRef(true);
  
  useEffect(() => {
    console.log('CountdownTimer effect triggered:', { active, targetDate: targetDate.toISOString() });
    
    // Check if target date has changed
    if (targetDateRef.current.getTime() !== targetDate.getTime()) {
      console.log('Target date changed, updating ref');
      targetDateRef.current = targetDate;
    }
    
    // Check if active state has changed
    if (activeRef.current !== active) {
      console.log('Active state changed:', active);
      activeRef.current = active;
      // Reset firstActiveRender if we're becoming active
      if (active) {
        firstActiveRender.current = true;
      }
    }
    
    // If not active, show the full duration
    if (!active) {
      console.log('Not active, showing full duration:', durationMinutes);
      // Convert duration from minutes to proper time units
      const durationInSeconds = durationMinutes * 60;
      setTimeLeft({
        days: 0,
        hours: Math.floor(durationInSeconds / 3600),
        minutes: Math.floor((durationInSeconds % 3600) / 60),
        seconds: Math.floor(durationInSeconds % 60),
      });
      return;
    }

    // When transitioning from inactive to active, don't reset the display
    // Keep the same display but start counting down from there
    if (firstActiveRender.current) {
      console.log('First active render, starting countdown from full duration');
      firstActiveRender.current = false;
      // No need to reset the timeLeft here - maintain what was already displayed
    }

    console.log('Setting up countdown interval with target date:', targetDate.toISOString());
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance > 0) {
        const newTimeLeft = {
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        };

        setTimeLeft(newTimeLeft);

        // Notification triggers
        const totalMinutes = Math.floor(distance / (1000 * 60));
        
        if (totalMinutes <= 60 && !notificationsShown.current.oneHour) {
          notificationsShown.current.oneHour = true;
          addNotification({
            title: "Challenge Starting Soon!",
            description: "Trading competition begins in 1 hour. Get ready!",
            type: "info",
          });
        }

        if (totalMinutes <= 10 && !notificationsShown.current.tenMinutes) {
          notificationsShown.current.tenMinutes = true;
          addNotification({
            title: "Final Countdown!",
            description: "Only 10 minutes until the challenge starts!",
            type: "warning",
          });
        }

        if (totalMinutes <= 1 && !notificationsShown.current.oneMinute) {
          notificationsShown.current.oneMinute = true;
          addNotification({
            title: "Challenge Starting NOW!",
            description: "Less than 1 minute remaining. Prepare for battle!",
            type: "warning",
          });
        }
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        if (!notificationsShown.current.started) {
          notificationsShown.current.started = true;
          addNotification({
            title: "🚀 CHALLENGE LIVE!",
            description: "The trading competition has begun! Good luck traders!",
            type: "success",
          });
        }
      }
    }, 1000);

    return () => {
      console.log('Cleaning up countdown timer');
      clearInterval(timer);
    };
  }, [targetDate, active, durationMinutes, addNotification]);

  return (
    <div className="flex items-center justify-center gap-2">
      <div className="flex flex-col items-center">
        <div className="bg-black/50 border border-dark-border h-12 w-12 flex items-center justify-center text-neon-cyan font-orbitron font-bold text-2xl">
          {String(timeLeft.days).padStart(2, '0')}
        </div>
        <div className="text-xs text-muted-foreground mt-1">Days</div>
      </div>
      
      <div className="text-neon-cyan font-bold text-lg mx-1">:</div>
      
      <div className="flex flex-col items-center">
        <div className="bg-black/50 border border-dark-border h-12 w-12 flex items-center justify-center text-neon-cyan font-orbitron font-bold text-2xl">
          {String(timeLeft.hours).padStart(2, '0')}
        </div>
        <div className="text-xs text-muted-foreground mt-1">Hours</div>
      </div>
      
      <div className="text-neon-cyan font-bold text-lg mx-1">:</div>
      
      <div className="flex flex-col items-center">
        <div className="bg-black/50 border border-dark-border h-12 w-12 flex items-center justify-center text-neon-cyan font-orbitron font-bold text-2xl">
          {String(timeLeft.minutes).padStart(2, '0')}
        </div>
        <div className="text-xs text-muted-foreground mt-1">Min</div>
      </div>
      
      <div className="text-neon-cyan font-bold text-lg mx-1">:</div>
      
      <div className="flex flex-col items-center">
        <div className="bg-black/50 border border-dark-border h-12 w-12 flex items-center justify-center text-neon-cyan font-orbitron font-bold text-2xl">
          {String(timeLeft.seconds).padStart(2, '0')}
        </div>
        <div className="text-xs text-muted-foreground mt-1">Sec</div>
      </div>
    </div>
  );
}

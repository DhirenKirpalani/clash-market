import React, { useState, useEffect, useRef } from 'react';
import { useNotifications } from './notification-modal';

interface CountdownTimerProps {
  targetDate: Date;
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
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

  useEffect(() => {
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

    return () => clearInterval(timer);
  }, [targetDate, addNotification]);

  return (
    <div className="flex items-center justify-center">
      <div className="bg-dark-card border border-electric-purple rounded-lg p-4 min-w-[80px] shadow-neon-purple">
        <div className="text-2xl font-orbitron font-bold text-neon-cyan">
          {timeLeft.days.toString().padStart(2, '0')}
        </div>
        <div className="text-sm text-gray-400">Days</div>
      </div>
      
      <div className="text-2xl font-orbitron font-bold text-electric-purple mx-1">:</div>
      
      <div className="bg-dark-card border border-cyber-blue rounded-lg p-4 min-w-[80px] shadow-neon-blue">
        <div className="text-2xl font-orbitron font-bold text-electric-blue">
          {timeLeft.hours.toString().padStart(2, '0')}
        </div>
        <div className="text-sm text-gray-400">Hours</div>
      </div>
      
      <div className="text-2xl font-orbitron font-bold text-electric-purple mx-1">:</div>
      
      <div className="bg-dark-card border border-electric-purple rounded-lg p-4 min-w-[80px] shadow-neon-purple">
        <div className="text-2xl font-orbitron font-bold text-neon-cyan">
          {timeLeft.minutes.toString().padStart(2, '0')}
        </div>
        <div className="text-sm text-gray-400">Min</div>
      </div>
      
      <div className="text-2xl font-orbitron font-bold text-electric-purple mx-1">:</div>
      
      <div className="bg-dark-card border border-cyber-blue rounded-lg p-4 min-w-[80px] shadow-neon-blue">
        <div className="text-2xl font-orbitron font-bold text-electric-blue">
          {timeLeft.seconds.toString().padStart(2, '0')}
        </div>
        <div className="text-sm text-gray-400">Sec</div>
      </div>
    </div>
  );
}

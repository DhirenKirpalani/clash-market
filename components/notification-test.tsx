"use client"

import React from 'react';
import { Button } from './ui/button';
import { useNotifications } from './notification-modal';
import { Bell, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

export function NotificationTest() {
  const { addNotification, clearNotifications } = useNotifications();

  const showSuccessNotification = () => {
    addNotification({
      title: "Success!",
      description: "Your trade was executed successfully.",
      type: "success",
    });
  };

  const showWarningNotification = () => {
    addNotification({
      title: "Warning",
      description: "Your position is approaching liquidation threshold.",
      type: "warning",
    });
  };

  const showInfoNotification = () => {
    addNotification({
      title: "Market Update",
      description: "BTC price has increased by 5% in the last hour.",
      type: "info",
    });
  };

  const showErrorNotification = () => {
    addNotification({
      title: "Error",
      description: "Failed to execute trade. Insufficient balance.",
      type: "error",
    });
  };

  const showLeaderboardUpdate = () => {
    addNotification({
      title: "Leaderboard Update!",
      description: "You've moved up to rank #3! Keep trading!",
      type: "success",
    });
  };

  const showChallengeReminder = () => {
    addNotification({
      title: "Challenge Starting Soon!",
      description: "The trading competition starts in 5 minutes.",
      type: "info",
    });
  };

  return (
    <div className="gaming-card nft-card p-6 rounded-xl space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="h-6 w-6 text-cyber-blue" />
        <h3 className="text-xl font-bold gradient-text-primary">Notification Test Center</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button 
          onClick={showSuccessNotification}
          className="gaming-button flex items-center gap-2"
        >
          <CheckCircle className="h-4 w-4" />
          Success
        </Button>
        
        <Button 
          onClick={showWarningNotification}
          className="gaming-button flex items-center gap-2"
          variant="destructive"
        >
          <AlertTriangle className="h-4 w-4" />
          Warning
        </Button>
        
        <Button 
          onClick={showInfoNotification}
          className="gaming-button flex items-center gap-2"
          variant="secondary"
        >
          <Info className="h-4 w-4" />
          Info
        </Button>
        
        <Button 
          onClick={showErrorNotification}
          className="gaming-button flex items-center gap-2"
          variant="destructive"
        >
          <X className="h-4 w-4" />
          Error
        </Button>
        
        <Button 
          onClick={showLeaderboardUpdate}
          className="gaming-button flex items-center gap-2"
        >
          <Bell className="h-4 w-4" />
          Rank Update
        </Button>
        
        <Button 
          onClick={showChallengeReminder}
          className="gaming-button flex items-center gap-2"
        >
          <Bell className="h-4 w-4" />
          Challenge Alert
        </Button>
      </div>
      
      <p className="text-sm text-gray-400 mt-4">
        Click any button to test different notification types. Notifications will appear in the notification center and will persist even after page refresh.
      </p>
      
      <Button 
        onClick={clearNotifications}
        variant="outline"
        className="mt-4 w-full text-gray-400 hover:text-white">
        Clear All Notifications
      </Button>
    </div>
  );
}

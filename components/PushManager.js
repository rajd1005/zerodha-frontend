"use client";

import { useEffect } from 'react';
import axios from 'axios';

export default function PushManager() {
  useEffect(() => {
    setupPushNotifications();
  }, []);

  const setupPushNotifications = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    try {
      // 1. Register our custom push service worker
      const registration = await navigator.serviceWorker.register('/push-sw.js');

      // 2. Ask user for permission to send notifications
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log("Notification permission denied by user.");
        return;
      }

      // 3. Fetch the VAPID Public Key from your Railway Backend
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const { data } = await axios.get(`${API_URL}/notifications/vapid-public-key`);
      
      // Convert VAPID key to format required by the browser
      const urlBase64ToUint8Array = (base64String) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
          outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
      };

      // 4. Subscribe the device
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(data.publicKey)
      });

      // 5. Send subscription to backend to save in MongoDB
      const token = localStorage.getItem('token');
      if (token) {
        await axios.post(`${API_URL}/notifications/subscribe`, subscription, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

    } catch (error) {
      console.error("Push Notification Setup Failed:", error);
    }
  };

  // This component doesn't render any UI, it just runs the logic in the background
  return null;
}

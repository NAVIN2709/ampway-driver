import { useEffect } from 'react';
import {
  PushNotifications,
} from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

const usePushNotifications = () => {
  useEffect(() => {
    const setup = async () => {
      if (!Capacitor.isNativePlatform()) {
        if (Notification.permission === 'default') {
          await Notification.requestPermission();
        }
        return;
      }

      await PushNotifications.requestPermissions();
      await PushNotifications.register();

      PushNotifications.addListener('registration', (token) => {
        console.log('Push token:', token.value);
      });

      PushNotifications.addListener('registrationError', (error) => {
        console.error('Push registration error:', error);
      });

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push received:', notification);
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
        console.log('Push action performed', action);
      });
    };

    setup();
  }, []);
};

export default usePushNotifications;

import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { LocalNotifications } from '@capacitor/local-notifications';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [shownCount, setShownCount] = useState(0); // tracks already shown ones

  useEffect(() => {
    const requestPermission = async () => {
      const perm = await LocalNotifications.requestPermissions();
      if (perm.display !== 'granted') {
        console.warn('Notification permission not granted');
      }
    };

    requestPermission();
  }, []);

  useEffect(() => {
    const fetchWaitingRiders = async () => {
      const { data, error } = await supabase
        .from('riders')
        .select('id, latitude, longitude')
        .eq('status', 'waiting');

      if (error) {
        console.error('Error fetching riders:', error);
      } else {
        const formatted = data.map(
          (rider) => `🕒 Rider is waiting at (${rider.latitude}, ${rider.longitude})`
        );

        // Push notification only for new ones
        if (data.length > shownCount) {
          const newCount = data.length - shownCount;
          for (let i = 0; i < newCount; i++) {
            await LocalNotifications.schedule({
              notifications: [
                {
                  title: 'New Waiting Rider',
                  body: formatted[i],
                  id: Date.now() + i,
                  schedule: { at: new Date(Date.now() + 1000 * (i + 1)) },
                },
              ],
            });
          }
          setShownCount(data.length);
        }

        setNotifications(formatted);
      }
    };

    // Poll every 15s (adjust as needed)
    fetchWaitingRiders();
    const interval = setInterval(fetchWaitingRiders, 15000);
    return () => clearInterval(interval);
  }, [shownCount]);

  return (
    <div>
      <h2 className="text-lg font-bold mb-2">Notifications</h2>
      <ul className="space-y-2">
        {notifications.length > 0 ? (
          notifications.map((note, index) => (
            <li key={index} className="bg-gray-100 px-3 py-2 rounded text-sm">
              {note}
            </li>
          ))
        ) : (
          <li className="text-sm text-gray-500">No waiting riders at the moment.</li>
        )}
      </ul>
    </div>
  );
};

export default Notifications;

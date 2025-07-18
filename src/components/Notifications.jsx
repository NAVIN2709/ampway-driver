import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient'; // adjust path if needed

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchWaitingRiders = async () => {
      const { data, error } = await supabase
        .from('riders')
        .select('latitude','longitude')
        .eq('status', 'waiting');

      if (error) {
        console.error('Error fetching riders:', error);
      } else {
        const formatted = data.map(
          (rider) =>
            `🕒 Rider is waiting`
        );
        setNotifications(formatted);
      }
    };

    fetchWaitingRiders();
  }, []);

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

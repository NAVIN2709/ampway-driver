import React from 'react';

const Notifications = () => {
  const dummyNotifications = [
    '📍 You checked in near the library',
    '⚠️ Heavy traffic near main gate',
    '🛴 E-scooter available nearby',
  ];

  return (
    <div>
      <h2 className="text-lg font-bold mb-2">Notifications</h2>
      <ul className="space-y-2">
        {dummyNotifications.map((note, index) => (
          <li key={index} className="bg-gray-100 px-3 py-2 rounded text-sm">
            {note}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;

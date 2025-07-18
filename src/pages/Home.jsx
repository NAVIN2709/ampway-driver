import React, { useState } from 'react';
import MapComponent from '../components/MapComponent';
import Notifications from '../components/Notifications'; // Make sure this file exists

const Home = () => {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="relative w-full h-[100vh] bg-black text-white overflow-hidden">
      {/* Welcome Bar */}
      <div className="absolute top-0 left-0 p-4 z-[1000] flex justify-around items-center w-full">
        <p className="text-md text-black font-bold px-4 py-1 rounded">
          Welcome to AmpWay
        </p>

        {/* Notification Bell */}
        <div
          className="text-white text-2xl cursor-pointer"
          onClick={() => setShowNotifications(!showNotifications)}
        >
          🔔
        </div>
      </div>

      {/* Notification Dropdown */}
      {showNotifications && (
        <div className="absolute top-16 right-4 z-[1000] bg-white text-black rounded-lg shadow-lg p-4 w-64">
          <Notifications />
        </div>
      )}

      {/* Map Section */}
      <MapComponent />
    </div>
  );
};

export default Home;

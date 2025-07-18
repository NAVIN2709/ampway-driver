import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from '../../supabaseClient';

const showNotification = (rider) => {
  const title = 'New Rider Waiting';
  const body = `Rider #${rider.id} is waiting nearby!`;

  if (!Capacitor.isNativePlatform() && Notification.permission === 'granted') {
    new Notification(title, { body });
  }

  if (Capacitor.isNativePlatform()) {
    PushNotifications.createChannel({
      id: 'rider-updates',
      name: 'Rider Updates',
      description: 'Notifications for new riders',
      importance: 5,
      visibility: 1,
    });

    PushNotifications.schedule({
      notifications: [
        {
          title,
          body,
          id: Date.now(),
          schedule: { at: new Date(Date.now() + 1000) },
          channelId: 'rider-updates',
          sound: 'default',
        },
      ],
    });
  }
};

const MapComponent = () => {
  const [userPosition, setUserPosition] = useState(null);
  const [waitingRiders, setWaitingRiders] = useState([]);

  useEffect(() => {
    // Request web browser notification permission
    if (!Capacitor.isNativePlatform() && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }

    const fetchWaitingRiders = async () => {
      const { data, error } = await supabase
        .from('riders')
        .select('id, latitude, longitude')
        .eq('status', 'waiting');

      if (error) {
        console.error('Error fetching riders:', error);
        return;
      }

      // Compare new riders with existing ones to avoid duplicate notifications
      const newRiders = data.filter(
        (rider) => !waitingRiders.some((r) => r.id === rider.id)
      );

      if (newRiders.length > 0) {
        newRiders.forEach((rider) => showNotification(rider));
      }

      setWaitingRiders(data);
    };

    fetchWaitingRiders(); // Initial call
    const interval = setInterval(fetchWaitingRiders, 10000); // Every 10s

    return () => clearInterval(interval); // Clean up on unmount
  }, [waitingRiders]);

  useEffect(() => {
    const getCurrentPosition = async () => {
      const position = await Geolocation.getCurrentPosition();
      setUserPosition([position.coords.latitude, position.coords.longitude]);
    };

    getCurrentPosition();
  }, []);

  return (
    <MapContainer center={[10.7905, 78.7047]} zoom={15} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {userPosition && (
        <Marker position={userPosition}>
          <Popup>Your Location</Popup>
        </Marker>
      )}
      {waitingRiders.map((rider) => (
        <Marker key={rider.id} position={[rider.latitude, rider.longitude]}>
          <Popup>Rider #{rider.id} is waiting</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Geolocation } from '@capacitor/geolocation';
import { supabase } from '../../supabaseClient';

const MapComponent = () => {
  const [userPosition, setUserPosition] = useState(null);
  const [cars, setCars] = useState([]);
  const [riders, setRiders] = useState([]);
  const [carId, setCarId] = useState(null);

  const userIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  const carIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/744/744465.png',
    iconSize: [35, 35],
    iconAnchor: [17, 35],
  });

  const riderIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });

  // 🔐 Get user ID
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session?.user?.id) {
        console.error('Error getting user session:', error);
        return;
      }

      setCarId(session.user.id);
    };

    fetchUser();
  }, []);

  // 📍 Update car location every 5s
  useEffect(() => {
    if (!carId) return;

    const updateLocation = async () => {
      try {
        const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
        const { latitude, longitude } = pos.coords;

        setUserPosition([latitude, longitude]);

        const { error } = await supabase.from('cars').upsert({
          id: carId,
          latitude,
          longitude,
        });

        if (error) console.error('Error updating location:', error);
      } catch (err) {
        console.error('Geolocation error:', err);
      }
    };

    updateLocation();
    const interval = setInterval(updateLocation, 5000);

    return () => clearInterval(interval);
  }, [carId]);

  // 🚗 Fetch cars
  useEffect(() => {
    const fetchCars = async () => {
      const { data, error } = await supabase
        .from('cars')
        .select('id, car_name, latitude, longitude');

      if (error) {
        console.error('Error fetching cars:', error);
        return;
      }

      const validCars = data
        .filter((car) => car.latitude && car.longitude)
        .map((car) => ({
          id: car.id,
          name: car.car_name,
          location: {
            latitude: car.latitude,
            longitude: car.longitude,
          },
        }));

      setCars(validCars);
    };

    fetchCars();

    const channel = supabase
      .channel('cars-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cars' },
        () => fetchCars()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 🧍‍♂️ Fetch riders with status 'waiting'
  useEffect(() => {
    const fetchRiders = async () => {
      const { data, error } = await supabase
        .from('riders')
        .select('id, latitude, longitude, requested_at')
        .eq('status', 'waiting');

      if (error) {
        console.error('Error fetching riders:', error);
        return;
      }

      const validRiders = data
        .filter((r) => r.latitude && r.longitude)
        .map((r) => ({
          id: r.id,
          latitude: r.latitude,
          longitude: r.longitude,
          requestedAt: r.requested_at,
        }));

      setRiders(validRiders);
    };

    fetchRiders();

    const channel = supabase
      .channel('riders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'riders', filter: 'status=eq.waiting' },
        () => fetchRiders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="w-full h-[calc(100vh)] overflow-hidden">
      {userPosition ? (
        <MapContainer
          center={userPosition}
          zoom={17}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Car Markers */}
          {cars.map((car) => (
            <Marker
              key={car.id}
              position={[car.location.latitude, car.location.longitude]}
              icon={carIcon}
            >
              <Popup>🚗 <strong>{car.name || 'Electric Taxi'}</strong></Popup>
            </Marker>
          ))}

          {/* Rider Markers */}
          {riders.map((rider) => (
            <Marker
              key={rider.id}
              position={[rider.latitude, rider.longitude]}
              icon={riderIcon}
            >
              <Popup>🧍 Rider waiting since {new Date(rider.requestedAt).toLocaleTimeString()}</Popup>
            </Marker>
          ))}
        </MapContainer>
      ) : (
        <div className="text-white text-center mt-10">Getting your location...</div>
      )}
    </div>
  );
};

export default MapComponent;

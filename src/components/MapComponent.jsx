import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Geolocation } from "@capacitor/geolocation";
import { supabase } from "../../supabaseClient";

const MapComponent = () => {
  const [userPosition, setUserPosition] = useState([10.7598, 78.8136]);
  const [carId, setCarId] = useState(null);
  const [riders, setRiders] = useState([]);
  const mapRef = useRef(null);

  // Get current user ID
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user?.id) {
        console.error("Error getting user session:", error);
        return;
      }
      setCarId(data.user.id);
    };

    fetchUser();
  }, []);

  // Fetch riders data
  useEffect(() => {
    if (!carId) return;

    const fetchRiders = async () => {
      const { data, error } = await supabase
        .from('riders')
        .select('*')
        .order('requested_at', { ascending: false });

      if (error) {
        console.error('Error fetching riders:', error);
        return;
      }
      setRiders(data);
    };

    fetchRiders();
    const interval = setInterval(fetchRiders, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [carId]);

  // Update location every 5 seconds
  useEffect(() => {
    if (!carId) return;

    const updateLocation = async () => {
      try {
        const pos = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
        }).catch(async () => {
          return await Geolocation.getCurrentPosition();
        });

        const { latitude, longitude } = pos.coords;
        
        setUserPosition(prev => {
          if (!prev || 
              Math.abs(prev[0] - latitude) > 0.0001 || 
              Math.abs(prev[1] - longitude) > 0.0001) {
            return [latitude, longitude];
          }
          return prev;
        });

        const { error } = await supabase
          .from("cars")
          .update({
            latitude,
            longitude,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", carId);

        if (error) {
          console.error("Error updating location:", error);
        }

        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude]);
        }
      } catch (err) {
        console.error("Geolocation error:", err);
      }
    };

    updateLocation();
    const interval = setInterval(updateLocation, 5000);

    return () => clearInterval(interval);
  }, [carId]);

  const carIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/854/854894.png",
    iconSize: [32, 32],
  });

  const riderIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/3132/3132693.png",
    iconSize: [32, 32],
  });

  return (
    <div className="h-screen w-full">
      <MapContainer
        center={userPosition}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
        whenCreated={(map) => {
          mapRef.current = map;
        }}
        key={JSON.stringify(userPosition)}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Car Marker */}
        <Marker position={userPosition} icon={carIcon}>
          <Popup>Your Current Location</Popup>
        </Marker>
        
        {/* Rider Markers */}
        {riders.map((rider) => (
          rider.latitude && rider.longitude && (
            <Marker 
              key={rider.id} 
              position={[rider.latitude, rider.longitude]} 
              icon={riderIcon}
            >
              <Popup>
                <div>
                  <strong>Rider Request</strong>
                  <p>Status: {rider.status}</p>
                  <p>Requested at: {new Date(rider.requested_at).toLocaleString()}</p>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
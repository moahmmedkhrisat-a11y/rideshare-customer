import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { io } from 'socket.io-client';
import { API_URL } from '../config';

export default function HomeScreen({ navigation }) {
  const [socket, setSocket] = useState(null);
  const [location, setLocation] = useState({
    latitude: 31.9454, // Default to Amman, Jordan
    longitude: 35.9284,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [activeTrip, setActiveTrip] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);

  useEffect(() => {
    const newSocket = io(API_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to backend');
    });

    newSocket.on('trip_status_updated', (trip) => {
      setActiveTrip(trip);
      if (trip.status === 'accepted') {
        Alert.alert('Trip Accepted', `Driver ${trip.driverId} is on the way!`);
      }
    });

    newSocket.on('active_drivers_update', (drivers) => {
      if (activeTrip && activeTrip.driverId) {
        const driver = drivers.find(d => d.driverId === activeTrip.driverId);
        if (driver) {
          setDriverLocation({ latitude: driver.lat, longitude: driver.lng });
        }
      }
    });

    return () => newSocket.close();
  }, [activeTrip]);

  const requestTrip = () => {
    if (!socket) return;
    socket.emit('request_trip', {
      riderId: 1, // hardcoded for now, would use jwt payload
      pickup: { lat: location.latitude, lng: location.longitude },
      dropoff: { lat: location.latitude + 0.01, lng: location.longitude + 0.01 } // demo dropoff
    });
    Alert.alert('Trip Requested', 'Looking for nearby drivers...');
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={location}>
        <Marker coordinate={location} title="Pickup Location" />
        
        {activeTrip && activeTrip.dropoff && (
          <Marker 
            coordinate={{ latitude: activeTrip.dropoff.lat, longitude: activeTrip.dropoff.lng }} 
            title="Dropoff" 
            pinColor="green" 
          />
        )}
        
        {driverLocation && (
          <Marker 
            coordinate={driverLocation} 
            title="Driver" 
            pinColor="blue" 
          />
        )}
      </MapView>
      
      <View style={styles.footer}>
        <Text style={styles.status}>
          {activeTrip 
            ? `Status: ${activeTrip.status.toUpperCase()}` 
            : 'Ready to request a ride'}
        </Text>
        
        <TouchableOpacity 
          style={[styles.button, activeTrip && styles.buttonDisabled]} 
          onPress={requestTrip}
          disabled={!!activeTrip}
        >
          <Text style={styles.buttonText}>Request Ride Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  status: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

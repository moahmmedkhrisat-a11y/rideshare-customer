import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { io } from 'socket.io-client';
import * as Location from 'expo-location';
import { API_URL } from '../config';
import { LangContext } from '../App';

export default function HomeScreen({ route }) {
  const { token, userId } = route.params || {};
  const { t, lang, setLang } = useContext(LangContext);
  const socketRef = useRef(null);
  const [location, setLocation] = useState(null);
  const [activeTrip, setActiveTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t.alert, t.locationPermission);
        setLoading(false);
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      setLoading(false);
    })();

    const newSocket = io(API_URL);
    socketRef.current = newSocket;

    newSocket.on('trip_status_updated', (trip) => {
      setActiveTrip(trip);
      if (trip.status === 'accepted') {
        Alert.alert(t.tripAcceptedAlert, t.driverComingAlert);
      }
    });

    return () => { newSocket.close(); socketRef.current = null; };
  }, []);

  const requestTrip = () => {
    if (!socketRef.current || !location) return;
    socketRef.current.emit('request_trip', {
      riderId: userId || 1,
      pickup: { lat: location.latitude, lng: location.longitude },
      dropoff: { lat: location.latitude + 0.01, lng: location.longitude + 0.01 }
    });
    Alert.alert(t.tripRequested, t.searchingDriver);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>{t.loadingLocation}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.langBtn} onPress={() => setLang(lang === 'ar' ? 'en' : 'ar')}>
        <Text style={styles.langText}>{t.switchLang}</Text>
      </TouchableOpacity>

      <View style={styles.locationCard}>
        <Text style={styles.locationTitle}>{t.yourLocation}</Text>
        <Text style={styles.locationCoords}>
          {location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : t.locationNotFound}
        </Text>
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>
          {activeTrip
            ? `${t.tripStatus}: ${activeTrip.status === 'accepted' ? t.tripAccepted : t.tripPending}`
            : t.readyToRide}
        </Text>
        {activeTrip && activeTrip.status === 'accepted' && (
          <View style={styles.tripDetails}>
            <Text style={styles.detailText}>{t.driverOnWay}</Text>
            <Text style={styles.detailText}>{t.driverNum}: {activeTrip.driverId}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.button, (activeTrip || !location) && styles.buttonDisabled]}
        onPress={requestTrip}
        disabled={!!activeTrip || !location}
      >
        <Text style={styles.buttonText}>{activeTrip ? t.activeTrip : t.requestRide}</Text>
      </TouchableOpacity>

      {activeTrip && (
        <TouchableOpacity style={styles.cancelButton} onPress={() => setActiveTrip(null)}>
          <Text style={styles.cancelButtonText}>{t.cancelTrip}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20, justifyContent: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' },
  loadingText: { marginTop: 15, fontSize: 16, color: '#666' },
  langBtn: { position: 'absolute', top: 15, right: 20, backgroundColor: '#eee', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, zIndex: 10 },
  langText: { fontSize: 14, fontWeight: '600', color: '#333' },
  locationCard: { backgroundColor: '#fff', padding: 20, borderRadius: 12, marginBottom: 20, elevation: 3, alignItems: 'center' },
  locationTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  locationCoords: { fontSize: 14, color: '#888' },
  statusCard: { backgroundColor: '#fff', padding: 20, borderRadius: 12, marginBottom: 30, elevation: 3, alignItems: 'center' },
  statusTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  tripDetails: { marginTop: 15, alignItems: 'center' },
  detailText: { fontSize: 16, color: '#555', marginBottom: 5 },
  button: { backgroundColor: '#007AFF', padding: 18, borderRadius: 12, alignItems: 'center', elevation: 3 },
  buttonDisabled: { backgroundColor: '#b0b0b0' },
  buttonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  cancelButton: { marginTop: 15, padding: 15, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#ff3b30' },
  cancelButtonText: { color: '#ff3b30', fontSize: 16, fontWeight: '600' },
});

// File: app/Home.tsx
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import { AppleMaps, GoogleMaps } from 'expo-maps';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import 'react-native-get-random-values';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.4;
const INITIAL_ZOOM = 14;

export default function Home() {
  const [stations, setStations] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const apiKey = Constants.expoConfig?.extra?.GOOGLE_CLOUD_API_KEY;
  const profilePicUrl = 'https://via.placeholder.com/40';

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
        return;
      }
      try {
        const loc = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = loc.coords;
        setCoords({ latitude, longitude });
        await fetchStations(latitude, longitude);
      } catch {
        setErrorMsg('Error fetching location');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const fetchStations = async (lat: number, lng: number) => {
    if (!apiKey) {
      setErrorMsg('Missing API key');
      return;
    }
    try {
      const url = [
        'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
        `?location=${lat},${lng}`,
        '&radius=5000',
        '&type=electric_vehicle_charging_station',
        `&key=${apiKey}`,
      ].join('');
      const res = await fetch(url);
      const data = await res.json();
      setStations(data.results || []);
    } catch {
      setErrorMsg('Failed to fetch stations');
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim() || !apiKey) return;
    setLoading(true);
    Keyboard.dismiss();
    try {
      const geoUrl = [
        'https://maps.googleapis.com/maps/api/geocode/json',
        `?address=${encodeURIComponent(searchTerm)}`,
        `&key=${apiKey}`,
      ].join('');
      const resp = await fetch(geoUrl);
      const geoData = await resp.json();
      if (geoData.results?.length) {
        const { lat, lng } = geoData.results[0].geometry.location;
        setCoords({ latitude: lat, longitude: lng });
        await fetchStations(lat, lng);
      } else {
        Alert.alert('Location not found');
      }
    } catch {
      Alert.alert('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleZoom = (type: 'in' | 'out') => {
    const factor = type === 'in' ? 0.5 : 2;
    setZoom(z => Math.max(1, z * (type === 'in' ? 1.2 : 0.8)));
  };

  const toggleMenu = () => {
    Animated.timing(slideAnim, {
      toValue: menuVisible ? SHEET_HEIGHT : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setMenuVisible(v => !v);
  };

  if (loading || !coords) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2ECC71" />
        <Text style={styles.error}>{loading ? 'Loading...' : errorMsg}</Text>
      </View>
    );
  }

  const MapComponent = Platform.OS === 'ios' ? AppleMaps.View : GoogleMaps.View;
  const cameraPosition = { coords, zoom };

  return (
    <View style={styles.container}>
      {errorMsg && <Text style={styles.errorOverlay}>{errorMsg}</Text>}
      <MapComponent
        style={styles.map}
        cameraPosition={cameraPosition}
        {...(Platform.OS === 'ios'
          ? { annotations: stations.map((s, i) => ({ id: s.place_id || `${i}`, coordinates: { latitude: s.geometry.location.lat, longitude: s.geometry.location.lng }, title: s.name })) }
          : { markers: stations.map((s, i) => ({ id: s.place_id || `${i}`, coordinate: { latitude: s.geometry.location.lat, longitude: s.geometry.location.lng }, title: s.name })) })}
      />

      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search city, address, or ZIP"
          placeholderTextColor="#666"
          value={searchTerm}
          onChangeText={setSearchTerm}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
      </View>

      <View style={styles.zoomContainer}>
        <TouchableOpacity onPress={() => handleZoom('in')} style={styles.zoomButton}>
          <Text style={styles.zoomText}>＋</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleZoom('out')} style={styles.zoomButton}>
          <Text style={styles.zoomText}>－</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.bottomBar} onPress={toggleMenu} activeOpacity={0.7}>
        <View style={styles.handle} />
      </TouchableOpacity>

      <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: slideAnim }] }]}>        
        <View style={styles.sheetHeader}>
          <Image source={{ uri: profilePicUrl }} style={styles.profilePic} />
          <Text style={styles.sheetTitle}>Your Profile</Text>
        </View>
        <TouchableOpacity style={styles.sheetItem}><Text style={styles.sheetItemText}>Profile</Text></TouchableOpacity>
        <TouchableOpacity style={styles.sheetItem}><Text style={styles.sheetItemText}>Settings</Text></TouchableOpacity>
        <TouchableOpacity style={styles.sheetItem}><Text style={styles.sheetItemText}>History</Text></TouchableOpacity>
        <TouchableOpacity style={styles.sheetItem}><Text style={[styles.sheetItemText, styles.logoutText]}>Log Out</Text></TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  searchBarContainer: { position: 'absolute', top: 40, width: '100%', paddingHorizontal: 20, zIndex: 2 },
  searchInput: { height: 50, backgroundColor: '#FFF', borderRadius: 25, paddingHorizontal: 15, fontSize: 16, borderColor: '#CCC', borderWidth: 1 },
  zoomContainer: { position: 'absolute', bottom: 100, right: 20, alignItems: 'center', zIndex: 3 },
  zoomButton: { backgroundColor: '#FFF', borderRadius: 4, padding: 6, marginVertical: 4, elevation: 2 },
  zoomText: { fontSize: 20, fontWeight: 'bold' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', zIndex: 3 },
  handle: { width: 60, height: 6, backgroundColor: '#CCC', borderRadius: 3 },
  bottomSheet: { position: 'absolute', bottom: 0, left: 0, right: 0, height: SHEET_HEIGHT, backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, zIndex: 2 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  profilePic: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  sheetTitle: { fontSize: 18, fontWeight: 'bold' },
  sheetItem: { paddingVertical: 12 },
  sheetItemText: { fontSize: 16 },
  logoutText: { color: 'red' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { marginTop: 8, color: 'red' },
  errorOverlay: { position: 'absolute', top: 10, alignSelf: 'center', backgroundColor: 'rgba(255,0,0,0.7)', color: '#FFF', padding: 5, borderRadius: 5, zIndex: 3 },
});

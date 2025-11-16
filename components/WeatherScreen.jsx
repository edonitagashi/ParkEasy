import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Picker,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

const cities = {
  "Prishtinë": { lat: 42.6629, lon: 21.1655 },
  "Pejë": { lat: 42.659, lon: 20.2883 },
  "Gjakovë": { lat: 42.3803, lon: 20.4305 },
  "Prizren": { lat: 42.2153, lon: 20.7419 },
  "Ferizaj": { lat: 42.3703, lon: 21.1553 },
  "Mitrovicë": { lat: 42.89, lon: 20.8667 },
  "Gjilan": { lat: 42.462, lon: 21.4694 },
  "Podujevë": { lat: 42.91, lon: 21.2 },
  "Vushtrri": { lat: 42.8231, lon: 20.9722 },
  "Suharekë": { lat: 42.3594, lon: 20.8256 },
};

export default function WeatherScreen() {
  const [city, setCity] = useState("Prishtinë");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWeather = () => {
    setLoading(true);
    setError(null);

    const { lat, lon } = cities[city];

    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
    )
      .then((res) => res.json())
      .then((json) => setData({ ...json.current_weather }))
      .catch(() => setError("Gabim gjatë marrjes së të dhënave!"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWeather();
  }, [city]);

  const getIcon = (code) => {
    if (code === 0) return <MaterialIcons name="wb-sunny" size={60} color="#F1C40F" />;
    if (code <= 3) return <MaterialIcons name="wb-cloudy" size={60} color="#5DA3FA" />;
    if (code <= 67) return <FontAwesome5 name="cloud-rain" size={60} color="#3498DB" />;
    if (code <= 77) return <FontAwesome5 name="snowflake" size={60} color="#85C1E9" />;
    if (code <= 82)
      return <FontAwesome5 name="cloud-showers-heavy" size={60} color="#2E86C1" />;
    if (code >= 95)
      return <MaterialIcons name="thunderstorm" size={60} color="#2E4053" />;
    return <MaterialIcons name="wb-cloudy" size={60} color="#5DA3FA" />;
  };

  const local = data ? new Date(data.time) : null;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🌦️ Moti në Kosovë</Text>

      <Picker selectedValue={city} style={styles.picker} onValueChange={setCity}>
        {Object.keys(cities).map((c) => (
          <Picker.Item key={c} label={c} value={c} />
        ))}
      </Picker>

      {loading && <ActivityIndicator size="large" color="#2E7D6A" />}
      {error && <Text style={styles.error}>{error}</Text>}

      {data && !loading && (
        <View style={styles.card}>
          {getIcon(data.weathercode)}

          <Text style={styles.text}>📍 {city}</Text>
          <Text style={styles.text}>🌡️ {data.temperature}°C</Text>
          <Text style={styles.text}>💨 {data.windspeed} km/h</Text>
          <Text style={styles.text}>📅 {local.toLocaleDateString("en-GB")}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.btn} onPress={fetchWeather}>
        <MaterialIcons name="refresh" size={22} color="#fff" />
        <Text style={styles.btnText}>Rifresko</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#DFF6F0", alignItems: "center", justifyContent: "center" },
  header: { fontSize: 26, fontWeight: "800", color: "#2E7D6A", marginBottom: 10 },
  picker: { height: 50, width: 250, backgroundColor: "#fff", borderRadius: 10, marginBottom: 20 },
  card: {
    backgroundColor: "#fff",
    width: "80%",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    elevation: 7,
    marginBottom: 25,
  },
  text: { fontSize: 20, color: "#4C6E64", marginVertical: 5 },
  error: { color: "red", fontSize: 18, marginBottom: 10 },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E7D6A",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 12,
  },
  btnText: { color: "#fff", fontSize: 18, fontWeight: "600" },
});

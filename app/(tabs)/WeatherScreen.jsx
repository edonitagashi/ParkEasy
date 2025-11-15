import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

export default function WeatherScreen() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWeather = () => {
    setLoading(true);
    setError(null);

    fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=42.66&longitude=21.16&current_weather=true"
    )
      .then((res) => res.json())
      .then((json) => {
        setData(json.current_weather);
      })
      .catch(() => {
        setError("Gabim gjatë marrjes së të dhënave!");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  // Funksion per ikonën e motit
  const getWeatherIcon = (code) => {
    if (!code) return <MaterialIcons name="help" size={60} color="#555" />;

    if (code === 0)
      return <MaterialIcons name="wb-sunny" size={60} color="#F1C40F" />;

    if (code === 1 || code === 2 || code === 3)
      return <MaterialIcons name="wb-cloudy" size={60} color="#5DA3FA" />;

    if (code >= 51 && code <= 67)
      return <FontAwesome5 name="cloud-rain" size={60} color="#3498DB" />;

    if (code >= 71 && code <= 77)
      return <FontAwesome5 name="snowflake" size={60} color="#85C1E9" />;

    if (code >= 80 && code <= 82)
      return <FontAwesome5 name="cloud-showers-heavy" size={60} color="#2E86C1" />;

    if (code >= 95)
      return <MaterialIcons name="thunderstorm" size={60} color="#2E4053" />;

    return <MaterialIcons name="wb-cloudy" size={60} color="#5DA3FA" />;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🌦️ Moti në Prishtinë</Text>

      {loading && <ActivityIndicator size="large" color="#2E7D6A" />}

      {error && <Text style={styles.error}>{error}</Text>}

      {data && !loading && (
        <View style={styles.card}>
          <View style={{ marginBottom: 20 }}>
            {getWeatherIcon(data.weathercode)}
          </View>

          <Text style={styles.text}>🌡️ Temperatura: {data.temperature}°C</Text>
          <Text style={styles.text}>💨 Era: {data.windspeed} km/h</Text>
          <Text style={styles.text}>
            🕒 Koha: {data.time.replace("T", " | ")}
          </Text>
        </View>
      )}

      <TouchableOpacity onPress={fetchWeather} style={styles.btn}>
        <MaterialIcons name="refresh" size={22} color="#fff" />
        <Text style={styles.btnText}> Rifresko</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#DFF6F0",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: "800",
    color: "#2E7D6A",
    marginBottom: 30,
  },
  card: {
    backgroundColor: "#FFFFFF",
    width: "80%",
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 7,
    marginBottom: 30,
  },
  text: {
    fontSize: 20,
    color: "#4C6E64",
    marginVertical: 8,
    textAlign: "center",
    fontWeight: "500",
  },
  error: {
    color: "red",
    fontSize: 18,
    marginBottom: 10,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E7D6A",
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 12,
  },
  btnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

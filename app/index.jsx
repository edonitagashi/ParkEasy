import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Link } from "expo-router";

export default function Home() {
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/ParkingPhotoAI.webp")}
        style={styles.logo}
        resizeMode="cover" // cover për t'i mbushur mirë kufijtë e rrethit
      />

      <Text style={styles.title}>Welcome to ParkEasy</Text>
      <Text style={styles.subtitle}>Your smart parking companion</Text>

      <Link href="/screens/LoginScreen" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F9F4",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  logo: {
    width: 180,
    height: 180,
    borderRadius: 90, // gjysma e madhësisë për ta bërë rreth
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#5C8374",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#7A9E8E",
    marginBottom: 40,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#5C8374",
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
});

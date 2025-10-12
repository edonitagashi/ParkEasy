import { View, Text, Button } from "react-native";
import { Link } from "expo-router";

export default function Home() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", color: "#5C8374" }}>
        Welcome to ParkEasy
      </Text>
      <Link href="/screens/SearchParkingScreen" asChild>
        <Button title="Go to Search Parking" color="#5C8374" />
      </Link>
    </View>
  );
}

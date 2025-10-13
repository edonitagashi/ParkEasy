import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

const ParkingCard = ({ name, distance, price }) => {
  // Funksioni që thirret kur klikojmë kartën
  const handlePress = () => {
    Alert.alert(
      'Detajet e Parkingut',
      `Emri: ${name}\nDistanca: ${distance} km\nÇmimi: $${price}`
    );
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.detail}>Distanca: {distance} km</Text>
        <Text style={styles.detail}>Çmimi: ${price}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3, // për Android shadow
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  detail: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
});

export default ParkingCard;

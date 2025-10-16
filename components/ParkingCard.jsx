import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ParkingCard = ({ name, distance, price, spots }) => {
  const [isFavorite, setIsFavorite] = useState(false); 

  const handlePress = () => {
    Alert.alert(
      'Detajet e Parkingut',
      `Emri: ${name}\nDistanca: ${distance} km\nÇmimi: ${price}`
    );
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.detail}>Distanca: {distance} km</Text>
        <Text style={styles.detail}>Çmimi: {price}</Text>
      </View>

      <View
        style={[
          styles.availabilityBox,
          { backgroundColor: spots === 0 ? "#D9534F" : spots < 5 ? "#F08080" : "#5C8374" },
        ]}
      >
        <Text style={styles.availabilityText}>{spots} free spots</Text>
      </View>

      
      <TouchableOpacity style={styles.favoriteIcon} onPress={toggleFavorite}>
        <Ionicons
          name={isFavorite ? "bookmark" : "bookmark-outline"}
          size={24}
          color={isFavorite ? "#FFD700" : "#5C8374"}
        />
      </TouchableOpacity>
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
    elevation: 3,
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
  availabilityBox: {
    borderRadius: 8,
    paddingVertical: 6,
    marginTop: 5
  },
  availabilityText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 13
  },
  favoriteIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
});

export default ParkingCard;

  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const tiltAnim = useRef(new Animated.Value(0)).current;
import React, { useEffect, useRef } from "react";
import { StyleSheet, Animated, Image, StatusBar, ScrollView, Text, View } from "react-native";
import AnimatedTouchable from "../components/animation/AnimatedTouchable";
import theme, { colors, shadows } from "./hooks/theme";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context';

function IndexScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  useEffect(() => {
    // Bounce in
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, speed: 1, bounciness: 10, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 60, useNativeDriver: true })
    ]).start();
    // Pulse effect (infinite)
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.03, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true })
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Tilt handlers
  const handleCardPressIn = () => {
    Animated.spring(tiltAnim, { toValue: 1, useNativeDriver: true, friction: 5, tension: 80 }).start();
  };
  const handleCardPressOut = () => {
    Animated.spring(tiltAnim, { toValue: 0, useNativeDriver: true, friction: 5, tension: 80 }).start();
  };

  return (
    <LinearGradient colors={["#E9F8F6", "#D7EEE8", "#C4E3DD"]} style={styles.gradient}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <SafeAreaView style={{ flex: 1 }} edges={['top','bottom']}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <Animated.View
            style={[styles.container, {
              opacity: fadeAnim,
              transform: [
                { translateY },
                { scale: Animated.multiply(scaleAnim, pulseAnim) },
                {
                  rotateZ: tiltAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '-7deg']
                  })
                }
              ]
            }]}
            onTouchStart={handleCardPressIn}
            onTouchEnd={handleCardPressOut}
            onTouchCancel={handleCardPressOut}
          >
            <Text style={styles.appName}>ParkEasy</Text>
            <Image source={require("../assets/images/index5.jpg")} style={styles.headerImage} resizeMode="contain" />
            <Text style={styles.subtitle}>Find and reserve your parking spot effortlessly.</Text>
            <View style={styles.banner}>
              <Text style={styles.bannerTitle}>Smart Parking Starts Here</Text>
              <Text style={styles.bannerText}>Save time and secure your perfect spot in just a few taps.</Text>
            </View>
            <View style={styles.buttonContainer}>
              <Link href="LoginScreen" asChild>
                <AnimatedTouchable style={styles.primaryButton}>
                  <Text style={styles.primaryText}>Login</Text>
                </AnimatedTouchable>
              </Link>
              <Link href="RegisterScreen" asChild>
                <AnimatedTouchable style={styles.secondaryButton}>
                  <Text style={styles.secondaryText}>Register</Text>
                </AnimatedTouchable>
              </Link>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: "center",
    minHeight: '100%',
    paddingVertical: theme.spacing.lg + theme.spacing.sm
  },
  container: {
    alignItems: "center", justifyContent: "center", width: "90%",
    backgroundColor: "#FFFFFFDD", borderRadius: 20, paddingVertical: theme.spacing.xxl + theme.spacing.md, paddingHorizontal: theme.spacing.lg + theme.spacing.sm,
    shadowColor: shadows.card.shadowColor, shadowOffset: shadows.card.shadowOffset, shadowOpacity: shadows.card.shadowOpacity, shadowRadius: shadows.card.shadowRadius, elevation: 8,
  },
  headerImage: { width: "100%" , height: 120, marginBottom: theme.spacing.md - theme.spacing.xs, borderRadius: 12 },
  appName: {
    fontSize: 38, fontWeight: "900", color: colors.primary, textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.15)", textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4, marginBottom: theme.spacing.md - theme.spacing.xs,
  },
  subtitle: { fontSize: 16, color: colors.text, textAlign: "center", marginTop: theme.spacing.sm, marginBottom: theme.spacing.xxl - theme.spacing.md },
  banner: {
    backgroundColor: colors.accent, borderRadius: 14, padding: theme.spacing.lg + theme.spacing.xs, width: "100%", alignItems: "center", marginBottom: theme.spacing.xxl + theme.spacing.sm,
    shadowColor: shadows.card.shadowColor, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5,
  },
  bannerTitle: { fontSize: 18, fontWeight: "700", color: colors.primaryDark, marginBottom: theme.spacing.sm - theme.spacing.xs },
  bannerText: { fontSize: 14, color: colors.text, textAlign: "center" },
  buttonContainer: { width: "100%", alignItems: "center" },
  primaryButton: {
    backgroundColor: colors.primary, width: "80%", paddingVertical: theme.spacing.md, borderRadius: 14, alignItems: "center",
    justifyContent: "center", shadowColor: shadows.card.shadowColor, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3,
    shadowRadius: 6, elevation: 5, marginBottom: theme.spacing.lg - theme.spacing.sm,
  },
  primaryText: { color: colors.textOnPrimary, fontSize: 18, fontWeight: "700" },
  secondaryButton: { width: "80%", paddingVertical: theme.spacing.md, borderWidth: 2, borderColor: colors.primary, borderRadius: 14, alignItems: "center" },
  secondaryText: { color: colors.primary, fontSize: 18, fontWeight: "700" },
});

export default IndexScreen;

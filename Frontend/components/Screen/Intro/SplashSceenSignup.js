import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SplashScreenSignup = () => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const navigation = useNavigation();
  const route = useRoute();
  const userName = route.params?.userName;

  useEffect(() => {
    const fadeIn = () => {
      Animated.timing(
        fadeAnim,
        {
          toValue: 1,
          duration: 1000, // Fade in duration
          useNativeDriver: true,
        }
      ).start(() => {
        // Hold for 1 second after fade in
        setTimeout(() => {
          fadeOut(); // Start fade out after holding
        }, 1000);
      });
    };

    const fadeOut = () => {
      Animated.timing(
        fadeAnim,
        {
          toValue: 0,
          duration: 1500, // Fade out duration
          useNativeDriver: true,
        }
      ).start(() => {
        // Navigate to UserHome screen after fade out
        navigateToUserHome();
      });
    };

    const navigateToUserHome = async () => {
      try {
        // Retrieve user ID from AsyncStorage
        const userId = await AsyncStorage.getItem('userId');
        
        console.log('Fetching user details for userId:', userId)
        // Fetch user details using the retrieved userId
        const response = await axios.get(`http://localhost:3000/api/user/${userId}`);
        console.log('User Details:', response.data);
        
        // Navigate to UserHome screen or perform further actions
        navigation.navigate('UserHome');
      } catch (error) {
        console.error('Error fetching user details:', error);
        // Handle error scenarios
      }
    };

    fadeIn();

    return () => {
      fadeAnim.setValue(0);
    };
  }, []);

  return (
    <LinearGradient
      colors={['#203960', '#3682be']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>Welcome {userName}</Animated.Text>
      <Animated.Text style={[styles.subtitle, { opacity: fadeAnim }]}>
        Getting ready for you
      </Animated.Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 3,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default SplashScreenSignup;

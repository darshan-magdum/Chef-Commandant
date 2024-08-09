import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  Image,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import logo from '../../assets/images/logo.jpeg';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Signup() {
  const navigation = useNavigation();

  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    general: '',
  });


  const handleSignup = async () => {
    let valid = true;
    const newError = {
      name: '',
      email: '',
      mobile: '',
      password: '',
      confirmPassword: '',
      general: '',
    };
  
    if (!form.name) {
      newError.name = 'Full Name is required';
      valid = false;
    }
  
    if (!form.email) {
      newError.email = 'Email Address is required';
      valid = false;
    } else if (!isValidEmail(form.email)) {
      newError.email = 'Enter a valid email address';
      valid = false;
    }
  
    if (!form.mobile) {
      newError.mobile = 'Mobile Number is required';
      valid = false;
    } else if (!isValidMobileNumber(form.mobile)) {
      newError.mobile = 'Enter a valid mobile number';
      valid = false;
    }
  
    if (!form.password) {
      newError.password = 'Password is required';
      valid = false;
    }
  
    if (!form.confirmPassword) {
      newError.confirmPassword = 'Confirm Password is required';
      valid = false;
    }
  
    if (form.password !== form.confirmPassword) {
      newError.password = 'Passwords do not match';
      newError.confirmPassword = 'Passwords do not match';
      valid = false;
    }
  
    setError(newError);
  
    if (!valid) {
      return;
    }
  
    try {
      // Retrieve token from AsyncStorage
      const token = await AsyncStorage.getItem('token');
  
      // Make POST request with token in headers
      const response = await axios.post('http://localhost:3000/api/user/Usersignup', form, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      Alert.alert('Successfully Signed Up', response.data.msg);
  
      setForm({
        name: '',
        email: '',
        mobile: '',
        password: '',
        confirmPassword: '',
      });
  
      await AsyncStorage.setItem('userId', response.data.userId);
      console.log('Stored userId:', response.data.userId);
      // Navigate to SplashSceenSignup with username
      navigation.navigate('SplashSceenSignup', { userName: form.name });
  
    } catch (error) {
      
      if (error.response?.data?.message === 'User already exists') {
        Alert.alert(error.response?.data?.message);
      } else {
        newError.general = error.response?.data?.message || 'An error occurred';
      }
      setError(newError);
    }
  };
  

  const isValidMobileNumber = (mobile) => {
    // Example validation: Check if the mobile number is exactly 10 digits
    const mobileRegex = /^[0-9]{10}$/;
    return mobileRegex.test(mobile);
  };

  const isValidEmail = (email) => {
    // Example validation: Check if the email format is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#e8ecf4' }}>
      <View style={styles.container}>
        <KeyboardAwareScrollView>
          <View style={styles.header}>
            <Image
              alt="App Logo"
              resizeMode="contain"
              style={styles.headerImg}
              source={logo}
            />
            <Text style={styles.title}>
              Sign up <Text style={{ color: '#075eec' }}>Now</Text>
            </Text>
            <Text style={styles.subtitle}>
              Create your account to get started
            </Text>
          </View>


          <View style={styles.form}>
            <View style={styles.input}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                autoCapitalize="words"
                autoCorrect={false}
                clearButtonMode="while-editing"
                onChangeText={(name) => setForm({ ...form, name })}
                placeholder="Enter your Name"
                placeholderTextColor="#6b7280"
                style={styles.inputControl}
                value={form.name}
              />
              {error.name ? <Text style={styles.errorText}>{error.name}</Text> : null}
            </View>

            <View style={styles.input}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                clearButtonMode="while-editing"
                keyboardType="email-address"
                onChangeText={(email) => setForm({ ...form, email })}
                placeholder="Enter Your Email"
                placeholderTextColor="#6b7280"
                style={styles.inputControl}
                value={form.email}
              />
              {error.email ? <Text style={styles.errorText}>{error.email}</Text> : null}
            </View>

            <View style={styles.input}>
              <Text style={styles.inputLabel}>Mobile Number</Text>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                clearButtonMode="while-editing"
                keyboardType="phone-pad"
                onChangeText={(mobile) => setForm({ ...form, mobile })}
                placeholder="Enter your mobile number"
                placeholderTextColor="#6b7280"
                style={styles.inputControl}
                value={form.mobile}
              />
              {error.mobile ? <Text style={styles.errorText}>{error.mobile}</Text> : null}
            </View>

            <View style={styles.input}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                autoCorrect={false}
                clearButtonMode="while-editing"
                onChangeText={(password) => setForm({ ...form, password })}
                placeholder="Enter your New Password"
                placeholderTextColor="#6b7280"
                style={styles.inputControl}
                secureTextEntry={true}
                value={form.password}
              />
              {error.password ? <Text style={styles.errorText}>{error.password}</Text> : null}
            </View>

            <View style={styles.input}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <TextInput
                autoCorrect={false}
                clearButtonMode="while-editing"
                onChangeText={(confirmPassword) => setForm({ ...form, confirmPassword })}
                placeholder="Enter Password Again"
                placeholderTextColor="#6b7280"
                style={styles.inputControl}
                secureTextEntry={true}
                value={form.confirmPassword}
              />
              {error.confirmPassword ? <Text style={styles.errorText}>{error.confirmPassword}</Text> : null}
            </View>

            {error.general ? <Text style={styles.errorText}>{error.general}</Text> : null}

            <View style={styles.formAction}>
              <TouchableOpacity onPress={handleSignup}>
                <View style={styles.btn}>
                  <Text style={styles.btnText}>Sign up</Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 20 }}>
              <Text style={styles.formLink}>
                Already have an account?{' '}
                <Text style={{ textDecorationLine: 'underline' }}>Log in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    paddingHorizontal: 0,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  title: {
    fontSize: 31,
    fontWeight: '700',
    color: '#1D2A32',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#929292',
  },
  /** Header */
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 36,
  },
  headerImg: {
    width: 80,
    height: 80,
    alignSelf: 'center',
  },
  /** Form */
  form: {
    marginBottom: 24,
    paddingHorizontal: 24,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  formAction: {
    marginTop: 4,
    marginBottom: 16,
  },
  formLink: {
    fontSize: 16,
    fontWeight: '600',
    color: '#075eec',
    textAlign: 'center',
  },
  /** Input */
  input: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
  },
  inputControl: {
    height: 50,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 15,
    fontWeight: '500',
    color: '#222',
    borderWidth: 1,
    borderColor: '#C9D3DB',
    borderStyle: 'solid',
  },
  /** Button */
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    backgroundColor: '#075eec',
    borderColor: '#075eec',
  },
  btnText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
    color: '#fff',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 4,
  },
  usernameText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#075eec',
    textAlign: 'center',
    marginVertical: 10,
  },
});

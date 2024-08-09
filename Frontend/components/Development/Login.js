import React, { useEffect, useState } from 'react';
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

export default function Login() {
  const navigation = useNavigation();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState({
    email: '',
    password: '',
    general: '',
  });


  const handleLogin = async () => {
    let valid = true;
    const newError = {
      email: '',
      password: '',
      general: '',
    };
  
    // Validation
    if (!form.email) {
      newError.email = 'Email Address is required';
      valid = false;
    } else if (!isValidEmail(form.email)) {
      newError.email = 'Enter a valid email address';
      valid = false;
    }
  
    if (!form.password) {
      newError.password = 'Password is required';
      valid = false;
    }
  
    setError(newError);
  
    if (!valid) {
      return;
    }
  
    try {
      // Attempt user login
      const userResponse = await axios.post('http://localhost:3000/api/user/Userlogin', form);
      const { token, userId, message } = userResponse.data;
  
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('userId', userId);
      await AsyncStorage.removeItem('adminToken');
      await AsyncStorage.removeItem('adminId');
      await AsyncStorage.removeItem('vendorToken');
      await AsyncStorage.removeItem('vendorId');
      await AsyncStorage.removeItem('vendorMemberToken');
      await AsyncStorage.removeItem('vendorMemberId');
  
      setForm({ email: '', password: '' });
      Alert.alert(message);
      navigation.navigate('UserHome');
      
    } catch (userError) {
      try {
        // Attempt admin login if user login fails
        const adminResponse = await axios.post('http://localhost:3000/api/admin/login', form);
        const { token, adminId, message } = adminResponse.data;
  
        await AsyncStorage.setItem('adminToken', token);
        await AsyncStorage.setItem('adminId', adminId);
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('userId');
        await AsyncStorage.removeItem('vendorToken');
        await AsyncStorage.removeItem('vendorId');
        await AsyncStorage.removeItem('vendorMemberToken');
        await AsyncStorage.removeItem('vendorMemberId');
  
        setForm({ email: '', password: '' });
        Alert.alert(message);
        navigation.navigate('AdminHome');
        
      } catch (adminError) {
        try {
          // Attempt vendor login if admin login fails
          const vendorResponse = await axios.post('http://localhost:3000/api/vendor/login', form);
          const { token, vendorId, vendor, message } = vendorResponse.data;
  
          await AsyncStorage.setItem('vendorToken', token);
          await AsyncStorage.setItem('vendorId', vendorId);
          await AsyncStorage.setItem('vendor', vendor);  // Storing vendor info
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('userId');
          await AsyncStorage.removeItem('adminToken');
          await AsyncStorage.removeItem('adminId');
          await AsyncStorage.removeItem('vendorMemberToken');
          await AsyncStorage.removeItem('vendorMemberId');
  
          setForm({ email: '', password: '' });
          Alert.alert(message);
          navigation.navigate('VendorHome');
          
        } catch (vendorError) {
          try {
            // Attempt vendor employee login if vendor login fails
            const vendorEmployeeResponse = await axios.post('http://localhost:3000/api/vendormember/login', form);
            const { token, vendorMemberId, vendor, message } = vendorEmployeeResponse.data;
  
            await AsyncStorage.setItem('vendorMemberToken', token);
            await AsyncStorage.setItem('vendorMemberId', vendorMemberId);
            await AsyncStorage.setItem('vendor', vendor);  // Storing vendor info
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('userId');
            await AsyncStorage.removeItem('adminToken');
            await AsyncStorage.removeItem('adminId');
            await AsyncStorage.removeItem('vendorToken');
            await AsyncStorage.removeItem('vendorId');
  
            setForm({ email: '', password: '' });
            Alert.alert(message);
            navigation.navigate('VendorEmployeeHome');
            
          } catch (vendorEmployeeError) {
            setError({ ...newError, general: vendorEmployeeError.response?.data?.message || 'An error occurred' });
          }
        }
      }
    }
  };
  
  
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };


  useEffect(() => {
    const checkAsyncStorage = async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        if (keys.length === 0) {
          console.log('AsyncStorage is empty');
        } else {
          console.log(`AsyncStorage has ${keys.length} item(s)`);
          const items = await AsyncStorage.multiGet(keys);
          items.forEach(([key, value]) => {
            console.log(`Key: ${key}, Value: ${value}`);
          });
        }
      } catch (error) {
        console.error('Error checking AsyncStorage:', error);
      }
    };

    checkAsyncStorage();
  }, []);

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
              Login <Text style={{ color: '#075eec' }}>Now</Text>
            </Text>
            <Text style={styles.subtitle}>
              Get access to your portfolio and more
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.input}>
              <Text style={styles.inputLabel}>Email address</Text>
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
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                autoCorrect={false}
                clearButtonMode="while-editing"
                onChangeText={(password) => setForm({ ...form, password })}
                placeholder="Enter Your Password"
                placeholderTextColor="#6b7280"
                style={styles.inputControl}
                secureTextEntry={true}
                value={form.password}
              />
              {error.password ? <Text style={styles.errorText}>{error.password}</Text> : null}
            </View>

            {error.general ? <Text style={styles.errorText}>{error.general}</Text> : null}

            <TouchableOpacity onPress={handleLogin}>
              <View style={styles.btn}>
                <Text style={styles.btnText}>Sign in</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              style={{ marginTop: 'auto' }}>
              <Text style={styles.formLink}>Forgot password?</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>

        <TouchableOpacity
          onPress={() => navigation.navigate('Signup')}
          style={{ marginTop: 'auto' }}>
          <Text style={styles.formFooter}>
            Don't have an account?{' '}
            <Text style={{ textDecorationLine: 'underline' }}>Sign up</Text>
          </Text>
        </TouchableOpacity>
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
  formLink: {
    fontSize: 16,
    fontWeight: '600',
    color: '#075eec',
    textAlign: 'center',
  },
  formFooter: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    textAlign: 'center',
    letterSpacing: 0.15,
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
    marginBottom: 10,
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
});

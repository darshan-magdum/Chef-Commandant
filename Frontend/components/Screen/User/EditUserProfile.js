import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Joi from 'joi';

export default function EditUserProfile({ navigation }) {
  const [form, setForm] = useState({
    name: '',
    mobile: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    mobile: '',
    apiError: '', // New state for API error message
  });

  useEffect(() => {
    fetchUserData(); // Fetch user data on component mount
  }, []);

  const fetchUserData = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId'); // Retrieve user ID from AsyncStorage

      const response = await axios.get(`http://192.168.0.112:3000/api/user/${userId}`); // Fetch user details using user ID

      if (response.status === 200) {
        const { name, mobile } = response.data;
        setForm({ name, mobile });
      } else {
        console.error('Failed to fetch user details');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      // Handle error scenarios
    }
  };

  const handleChangeName = (name) => {
    setForm({ ...form, name });
  };

  const handleChangeMobile = (mobile) => {
    setForm({ ...form, mobile });
  };

  const handleSubmit = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId'); // Retrieve user ID from AsyncStorage
      const { name, mobile } = form;
  
      // Validate name and mobile number using Joi
      const schema = Joi.object({
        name: Joi.string().required().label('Name'),
        mobile: Joi.string().pattern(new RegExp('^[0-9]{10}$')).required().label('Mobile Number')
          .messages({ 'string.pattern.base': 'Mobile number must be 10 digits long' }),
      });
  
      const { error } = schema.validate({ name, mobile });
  
      if (error) {
        // Determine which field the error belongs to
        if (error.details[0].path[0] === 'name') {
          setErrors({ ...errors, name: error.details[0].message });
        } else if (error.details[0].path[0] === 'mobile') {
          setErrors({ ...errors, mobile: error.details[0].message });
        }
        return;
      } else {
        setErrors({ ...errors, name: '', mobile: '' });
      }
  
      const response = await axios.put(`http://192.168.0.112:3000/api/user/${userId}`, { name, mobile });
  
      if (response.status === 200) {
        Alert.alert('Profile updated successfully');
        navigation.goBack(); // Navigate back to previous screen after successful update
      } else {
        const { message } = response.data;
        setErrors({ ...errors, apiError: message }); // Set API error message
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };
  
  

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <FeatherIcon name="chevron-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
        </View>

        <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
  <Text style={styles.inputLabel}>Name</Text>
  <TextInput
    style={styles.input}
    value={form.name}
    onChangeText={handleChangeName}
  />
  {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
</View>


<View style={styles.inputContainer}>
  <Text style={styles.inputLabel}>Mobile Number</Text>
  <TextInput
    style={styles.input}
    value={form.mobile}
    onChangeText={handleChangeMobile}
  />
  {errors.mobile ? <Text style={styles.errorText}>{errors.mobile}</Text> : null}
</View>

        </View>

        {/* Display API error message */}
        {errors.apiError ? (
    <View style={styles.errorContainer}>
      <Text style={styles.apiErrorText}>{errors.apiError}</Text>
    </View>
  ) : null}
  
        {/* Update Profile Button */}
        <TouchableOpacity style={styles.updateButton} onPress={handleSubmit}>
          <Text style={styles.updateButtonText}>Update Profile</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    flex: 1,
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    fontSize: 16,
  },
  updateButton: {
    marginHorizontal: 24,
    marginTop: 24,
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: 'red',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginHorizontal: 24,
    marginTop: 10,
  },
  apiErrorText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 5,
  },
});

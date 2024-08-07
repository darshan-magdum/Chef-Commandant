import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Joi from 'joi';

export default function EditAdminProfile({ navigation }) {
  const [form, setForm] = useState({
    companyName: '',
    contactNo: ''
  });

  const [errors, setErrors] = useState({
    companyName: '',
    contactNo: '',
    apiError: ''
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const adminId = await AsyncStorage.getItem('adminId');
      console.log('Fetching admin details for adminId:', adminId);
      const response = await axios.get(`http://192.168.0.107:3000/api/admin/${adminId}`);
      console.log('Admin Details:', response.data);
      if (response.status === 200) {
        const { companyName, contactNo } = response.data;
        setForm({ companyName, contactNo });
      } else {
        console.error('Failed to fetch admin details');
      }
    } catch (error) {
      console.error('Error fetching admin details:', error);
    }
  };

  const handleChangeCompanyName = (companyName) => {
    setForm({ ...form, companyName });
  };

  const handleChangeContactNo = (contactNo) => {
    setForm({ ...form, contactNo });
  };

  const handleSubmit = async () => {
    try {
      const adminId = await AsyncStorage.getItem('adminId');
      const { companyName, contactNo } = form;

      const schema = Joi.object({
        companyName: Joi.string().required().label('Company Name'),
        contactNo: Joi.string().pattern(new RegExp('^[0-9]{10}$')).required().label('Contact Number')
          .messages({ 'string.pattern.base': 'Contact number must be 10 digits long' }),
      });

      const { error } = schema.validate({ companyName, contactNo });

      if (error) {
        if (error.details[0].path[0] === 'companyName') {
          setErrors({ ...errors, companyName: error.details[0].message });
        } else if (error.details[0].path[0] === 'contactNo') {
          setErrors({ ...errors, contactNo: error.details[0].message });
        }
        return;
      } else {
        setErrors({ ...errors, companyName: '', contactNo: '' });
      }

      const response = await axios.put(`http://192.168.0.107:3000/api/admin/${adminId}`, { companyName, contactNo });

      if (response.status === 200) {
        Alert.alert('Profile updated successfully');
        navigation.goBack();
      } else {
        const { message } = response.data;
        setErrors({ ...errors, apiError: message });
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
            <Text style={styles.inputLabel}>Company Name</Text>
            <TextInput
              style={styles.input}
              value={form.companyName}
              onChangeText={handleChangeCompanyName}
            />
            {errors.companyName ? <Text style={styles.errorText}>{errors.companyName}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Contact Number</Text>
            <TextInput
              style={styles.input}
              value={form.contactNo}
              onChangeText={handleChangeContactNo}
            />
            {errors.contactNo ? <Text style={styles.errorText}>{errors.contactNo}</Text> : null}
          </View>
        </View>

        {errors.apiError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.apiErrorText}>{errors.apiError}</Text>
          </View>
        ) : null}

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

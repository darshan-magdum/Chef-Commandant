import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddBranches({ navigation }) {
  const [form, setForm] = useState({
    country: '',
    city: '',
    branch: '',
  });

  const [validationMessages, setValidationMessages] = useState({
    country: '',
    city: '',
    branch: '',
  });

  const handleChangeCountry = (country) => {
    setForm({ ...form, country });
    setValidationMessages({ ...validationMessages, country: '' }); // Clear validation message on change
  };

  const handleChangeCity = (city) => {
    setForm({ ...form, city });
    setValidationMessages({ ...validationMessages, city: '' }); // Clear validation message on change
  };

  const handleChangeBranch = (branch) => {
    setForm({ ...form, branch });
    setValidationMessages({ ...validationMessages, branch: '' }); // Clear validation message on change
  };

  const [userData, setUserData] = useState(null); // State to hold user data

  useEffect(() => {
    fetchUserData(); // Fetch user data on component mount
  }, []);

  const fetchUserData = async () => {
    try {
      const adminId = await AsyncStorage.getItem('adminId'); 
      console.log('Fetching user details for userId:', adminId);
      const response = await axios.get(`http://192.168.0.114:3000/api/admin/${adminId}`);  
      console.log('User Details:', response.data);

      if (response.status === 200) {
        setUserData(response.data); // Set user data to state
      } else {
        console.error('Failed to fetch user details');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      // Handle error scenarios
    }
  };

  const handleSubmit = async () => {
    try {
      const { country, city, branch } = form;
      const { adminId, companyName } = userData;

      // Check if any required field is empty
      let formIsValid = true;
      const newValidationMessages = { ...validationMessages };

      if (!country) {
        newValidationMessages.country = 'Country is required';
        formIsValid = false;
      }

      if (!city) {
        newValidationMessages.city = 'City is required';
        formIsValid = false;
      }

      if (!branch) {
        newValidationMessages.branch = 'Branch is required';
        formIsValid = false;
      }

      if (!formIsValid) {
        setValidationMessages(newValidationMessages);
        return;
      }

      const branchData = {
        country,
        city,
        branch,
        adminId,
        companyName
      };

      const response = await axios.post('http://192.168.0.114:3000/api/branchRoutes/addbranch', branchData);

      if (response.status === 201) {
        Alert.alert('Success', 'Branch added successfully');
        navigation.goBack();
      } else {
        throw new Error('Failed to add branch');
      }
    } catch (error) {
      console.error('Error adding branch:', error);
      Alert.alert('Error', 'Failed to add branch. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FeatherIcon name="chevron-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Company Branches</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Country</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Country"
            placeholderTextColor="#999"
            value={form.country}
            onChangeText={handleChangeCountry}
          />
          {validationMessages.country ? (
            <Text style={styles.validationMessage}>{validationMessages.country}</Text>
          ) : null}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>City</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter City"
            placeholderTextColor="#999"
            value={form.city}
            onChangeText={handleChangeCity}
          />
          {validationMessages.city ? (
            <Text style={styles.validationMessage}>{validationMessages.city}</Text>
          ) : null}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Branch</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Branch"
            placeholderTextColor="#999"
            value={form.branch}
            onChangeText={handleChangeBranch}
          />
          {validationMessages.branch ? (
            <Text style={styles.validationMessage}>{validationMessages.branch}</Text>
          ) : null}
        </View>
      </View>

      {/* Add Branch Button */}
      <TouchableOpacity style={styles.updateButton} onPress={handleSubmit}>
        <Text style={styles.updateButtonText}>Add Branch</Text>
      </TouchableOpacity>
    </View>
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
    color: '#333', // Ensuring text color is distinct from placeholder
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
  validationMessage: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
});

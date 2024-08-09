import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import CheckBox from 'react-native-check-box';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function AddMembers({ navigation }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    locations: [],
  });
  const [errors, setErrors] = useState({});
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationError, setLocationError] = useState('');
  const [selectedLocationsDisplay, setSelectedLocationsDisplay] = useState('');
  const [selectedLocationsButtonText, setSelectedLocationsButtonText] = useState('Select Locations'); // Button text state

  useEffect(() => {
    fetchVendorData(); // Fetch vendor data on component mount
  }, []);

  const fetchVendorData = async () => {
    try {
      const vendorId = await AsyncStorage.getItem('vendorId');
      console.log('Fetching user details for userId:', vendorId);
      const response = await axios.get(`http://localhost:3000/api/vendor/vendor/${vendorId}`);
      console.log('User Details:', response.data);

      if (response.status === 200) {
        // No need to set form details here for name, email, and mobile
        // Only set locations data
        const { locations } = response.data;
        const formattedLocations = locations.map(loc => ({ id: loc, name: loc, selected: false }));
        setForm(prevForm => ({
          ...prevForm,
          locations: formattedLocations,
        }));
      } else {
        console.error('Failed to fetch user details');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      // Handle error scenarios
    }
  };

  useEffect(() => {
    // Filter locations based on search query
    const filtered = form.locations.filter(loc =>
      loc.name && loc.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredLocations(filtered);
  }, [searchQuery, form.locations]);

  const validateForm = () => {
    const newErrors = {};
    if (!form.name) newErrors.name = 'Name is required';
    if (!form.email) newErrors.email = 'Email is required';
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Email is invalid';
    if (!form.mobile) newErrors.mobile = 'Mobile number is required';
    if (form.mobile && !/^\d{10}$/.test(form.mobile)) newErrors.mobile = 'Mobile number is invalid';
    if (!form.password) newErrors.password = 'Password is required';
    if (form.password && form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    // Check if at least one location is selected
    const selectedLocations = form.locations.filter(loc => loc.selected);
    if (selectedLocations.length === 0) {
      setLocationError('Please select at least one location');
      newErrors.locations = 'Please select at least one location';
    } else {
      setLocationError('');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };



  const handleLocationChange = (id) => {
    const updatedLocations = form.locations.map(loc =>
      loc.id === id ? { ...loc, selected: true } : { ...loc, selected: false }
    );
    setForm(prevForm => ({ ...prevForm, locations: updatedLocations }));
  };

  
  const handleSubmit = async () => {
    if (!validateForm()) return;

 
    try {
      const vendorId = await AsyncStorage.getItem('vendorId');
      console.log('Vendor ID:', vendorId);

      const selectedLocations = form.locations.filter(loc => loc.selected).map(loc => loc.name);
      const formData = {
        name: form.name,
        email: form.email,
        mobile: form.mobile,
        password: form.password,
        confirmPassword: form.confirmPassword,
        locations: selectedLocations,
        vendor: vendorId,
      };

      // Make API call to add member
      const response = await axios.post('http://localhost:3000/api/vendormember/signup', formData);
      Alert.alert('Success', 'Member added successfully');
      navigation.navigate('SuccessScreen');
    } catch (error) {
      console.error('Error adding member:', error);

      if (error.response && error.response.data && error.response.data.message) {
        const errorMessage = error.response.data.message;

        // Check for specific error messages from API response
        if (errorMessage.includes('already exists with this mobile number')) {
          setErrors(prevErrors => ({
            ...prevErrors,
            mobile: errorMessage,
          }));
        } else if (errorMessage.includes('already exists with this email')) {
          setErrors(prevErrors => ({
            ...prevErrors,
            email: errorMessage,
          }));
        } else {
          // Handle other errors or generic error message
          Alert.alert('Error', errorMessage);
        }
      } else {
        // Handle other generic errors
        Alert.alert('Error', 'Failed to add member. Please try again later.');
      }
    }
  };

  // Update selected locations display whenever form.locations changes
  useEffect(() => {
    const selectedLocationsDisplayText = form.locations
      .filter(loc => loc.selected)
      .map(loc => loc.name)
      .join(', ');

    setSelectedLocationsDisplay(selectedLocationsDisplayText);

    // Update button text to reflect selected locations
    setSelectedLocationsButtonText(selectedLocationsDisplayText ? selectedLocationsDisplayText : 'Select Locations');
  }, [form.locations]);

  return (
    <View style={styles.container}>
        <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <FeatherIcon name="chevron-left" size={24} color="#333" />
          </TouchableOpacity>
        <Text style={styles.headerTitle}>Member Registration</Text>
      </View>

      <ScrollView style={styles.formContainer}>
        {/* Member Name */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Member Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Member Name"
            value={form.name}
            onChangeText={(text) => setForm({ ...form, name: text })}
            placeholderTextColor="#6b7280"
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        {/* Email */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Email"
            value={form.email}
            onChangeText={(text) => setForm({ ...form, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#6b7280"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        {/* Mobile Number */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Mobile Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Mobile Number"
            value={form.mobile}
            onChangeText={(text) => setForm({ ...form, mobile: text })}
            keyboardType="phone-pad"
            placeholderTextColor="#6b7280"
          />
          {errors.mobile && <Text style={styles.errorText}>{errors.mobile}</Text>}
        </View>

        {/* Password */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Password"
            value={form.password}
            onChangeText={(text) => setForm({ ...form, password: text })}
            secureTextEntry
            placeholderTextColor="#6b7280"
          />
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        </View>

        {/* Confirm Password */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChangeText={(text) => setForm({ ...form, confirmPassword: text })}
            secureTextEntry
            placeholderTextColor="#6b7280"
          />
          {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
        </View>

        {/* Select Locations */}
        <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Location</Text>
        <TouchableOpacity style={styles.dropdownButton} onPress={toggleModal}>
          <Text style={styles.dropdownButtonText}>{selectedLocationsButtonText}</Text>
        </TouchableOpacity>
        {locationError ? <Text style={styles.errorTextLocation}>{locationError}</Text> : null}
        </View>

        {/* Modal for Location Selection */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={toggleModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
            

              <View style={styles.searchContainer}>
                <FeatherIcon name="search" size={20} color="#999" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search Locations"
                  placeholderTextColor="#999"
                  value={searchQuery}
                  onChangeText={(text) => setSearchQuery(text)}
                />
              </View>
              <ScrollView style={{ maxHeight: 300 }}>
                {filteredLocations.map(location => (
                  <View key={location.id} style={styles.checkboxContainer}>
                    <CheckBox
                      isChecked={location.selected}
                      onClick={() => handleLocationChange(location.id)}
                      checkBoxColor="#007bff"
                      style={styles.checkbox}
                    />
                    <Text style={styles.checkboxLabel}>{location.name}</Text>
                  </View>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.modalCloseButton} onPress={toggleModal}>
                <Text style={styles.modalCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Submit Button */}
        <TouchableOpacity style={styles.registerButton} onPress={handleSubmit}>
          <Text style={styles.registerButtonText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
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
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    color: 'red',
    marginTop: 4,
  },
  errorTextLocation: {
    color: 'red',
    marginTop: 0, // Adjusted marginTop as per your requirement
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginTop: 5,
  },
  dropdownButtonText: {
    color: '#333',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    maxHeight: '80%',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkboxLabel: {
    fontSize: 16,
    marginLeft: 10,
  },
  modalCloseButton: {
    marginTop: 24,
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: '#007bff',
    borderRadius: 5,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  

});

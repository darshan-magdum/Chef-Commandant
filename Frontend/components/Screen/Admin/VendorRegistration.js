import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import CheckBox from 'react-native-check-box';
import axios from 'axios';

export default function VendorRegistration({ navigation }) {
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

  useEffect(() => {
    fetchBranches();  // Fetch branches on component mount
  }, []);

  const fetchBranches = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/branchRoutes/viewallbranch');
      const branches = response.data;  // Assuming API response is an array of branch objects
      const initialLocations = branches.map(branch => ({ id: branch._id, name: branch.branch, selected: false }));
      setForm({ ...form, locations: initialLocations });
      setFilteredLocations(initialLocations);  // Initialize filtered locations
    } catch (error) {
      console.error('Failed to fetch branches:', error);
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
      loc.id === id ? { ...loc, selected: !loc.selected } : loc
    );
    setForm({ ...form, locations: updatedLocations });
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
  
    // Include selected locations in the data being sent
    const selectedLocations = form.locations.filter(loc => loc.selected).map(loc => loc.name);
    const formData = {
      name: form.name,
      email: form.email,
      mobile: form.mobile,
      password: form.password,
      confirmPassword: form.confirmPassword,
      locations: selectedLocations,
    };
  
    try {
      // Make API call to register vendor
      const response = await axios.post('http://localhost:3000/api/vendor/signup', formData);
      Alert.alert('Success', 'Vendor registered successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error registering vendor:', error);
  
      // Check if error response contains validation errors
      if (error.response && error.response.data && error.response.data.message) {
        const errorMessage = error.response.data.message;
        // Handle specific error messages (e.g., mobile number already exists)
        if (errorMessage.includes('mobile')) {
          setErrors({ ...errors, mobile: 'Mobile number already exists' });
        } else {
          Alert.alert('Error', errorMessage);
        }
      } else {
        Alert.alert('Error', 'Failed to register vendor');
      }
    }
  };
  

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FeatherIcon name="chevron-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vendor Registration</Text>
      </View>

      <ScrollView style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Vendor Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Vendor Name"
            placeholderTextColor="#999"
            value={form.name}
            onChangeText={(name) => setForm({ ...form, name })}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Email"
            placeholderTextColor="#999"
            value={form.email}
            onChangeText={(email) => setForm({ ...form, email })}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Mobile Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Mobile Number"
            placeholderTextColor="#999"
            value={form.mobile}
            onChangeText={(mobile) => setForm({ ...form, mobile })}
            keyboardType="phone-pad"
          />
          {errors.mobile && <Text style={styles.errorText}>{errors.mobile}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Password"
            placeholderTextColor="#999"
            value={form.password}
            onChangeText={(password) => setForm({ ...form, password })}
            secureTextEntry
          />
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#999"
            value={form.confirmPassword}
            onChangeText={(confirmPassword) => setForm({ ...form, confirmPassword })}
            secureTextEntry
          />
          {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
        </View>

        {/* Location Selection */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Location</Text>
          <TouchableOpacity style={styles.dropdownButton} onPress={toggleModal}>
            <Text style={styles.dropdownButtonText}>Select Locations</Text>
          </TouchableOpacity>
          {locationError !== '' && <Text style={styles.errorTextLocation}>{locationError}</Text>}
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
                  onChangeText={setSearchQuery}
                />
              </View>
              <ScrollView style={{ maxHeight: 300 }}>
                {filteredLocations.map(location => (
                  <View key={location.id} style={styles.checkboxContainer}>
                    <CheckBox
                      isChecked={form.locations.find(loc => loc.id === location.id)?.selected || false}
                      onClick={() => handleLocationChange(location.id)}
                      checkBoxColor="#007bff"
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

        {/* Register Button */}
        <TouchableOpacity style={styles.registerButton} onPress={handleSubmit}>
          <Text style={styles.registerButtonText}>Create Vendor</Text>
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
  dropdownButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  dropdownButtonText: {
    color: '#333',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    maxHeight: 400,
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
    marginBottom: 12,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  modalCloseButton: {
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: 'tomato', // Background color set to tomato
    paddingVertical: 10, // Added padding for better touch area
    borderRadius: 5, // Rounded corners
  },
  modalCloseButtonText: {
    fontSize: 16,
    color: '#fff', // Text color set to white
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
  errorTextLocation: {
    color: 'red',
    marginTop: 0, // Adjusted marginTop as per your requirement
  },
  
});


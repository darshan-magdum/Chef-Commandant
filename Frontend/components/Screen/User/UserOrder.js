import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';

export default function UserOrder({ navigation }) {
  const [form, setForm] = useState({
    location: '', // Use location to store branch info
    foodName: '',
    description: '',
    quantity: '',
    date: null,
  });

  const [userDetails, setUserDetails] = useState({
    name: '',
    mobile: '',
    email: '',
    userId: '',
  });

  const [errors, setErrors] = useState({
    location: '', // Use location for branch error
    foodName: '',
    description: '',
    quantity: '',
    date: '',
    apiError: '',
    numericError: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false); // Location picker modal state
  const [branches, setBranches] = useState([]); // State for branches

  useEffect(() => {
    fetchUserData(); // Fetch user data on component mount
    fetchBranches(); // Fetch branches on component mount
  }, []);

  const fetchUserData = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId'); // Retrieve user ID from AsyncStorage
      const response = await axios.get(`http://192.168.0.107:3000/api/user/${userId}`); // Fetch user details using user ID
      if (response.status === 200) {
        const { name, mobile, email, userId } = response.data;
        setUserDetails({ name, mobile, email, userId });
      } else {
        console.error('Failed to fetch user details');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await axios.get('http://192.168.0.107:3000/api/branchRoutes/viewallbranch'); // Fetch branches from the API
      if (response.status === 200) {
        setBranches(response.data); // Assuming response data is an array of branch names or objects
      } else {
        console.error('Failed to fetch branches');
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      location: '', // Use location for branch error validation
      foodName: '',
      description: '',
      quantity: '',
      date: '',
      apiError: '',
      numericError: '',
    };

    if (!form.location.trim()) { // Validate location (branch)
      newErrors.location = 'Location (Branch) is required';
      valid = false;
    }
    if (!form.foodName.trim()) {
      newErrors.foodName = 'Food Name is required';
      valid = false;
    }
    if (!form.description.trim()) {
      newErrors.description = 'Description is required';
      valid = false;
    }
    if (!form.quantity.trim()) {
      newErrors.quantity = 'Quantity is required';
      valid = false;
    } else if (!/^\d+$/.test(form.quantity.trim())) {
      newErrors.numericError = 'Quantity must be a number';
      valid = false;
    }
    if (!form.date) {
      newErrors.date = 'Date is required';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || form.date || new Date();
    setShowDatePicker(false);
    setForm({ ...form, date: currentDate.toISOString().split('T')[0] });
  };

  const handleOrder = async () => {
    if (!validateForm()) {
      return;
    }
  
    try {
      const payload = {
        username: userDetails.name,
        userid: userDetails.userId,
        userlocation: form.location, // Use location as branch
        foodname: form.foodName,
        usernamecontactno: userDetails.mobile,
        useremailid: userDetails.email,
        description: form.description,
        quantity: form.quantity,
        date: form.date,
      };
  
      const response = await axios.post('http://192.168.0.107:3000/api/UserOrdersRoutes/post', payload);
  
      if (response.status === 201) {
        Alert.alert("Order Placed Successfully");
        
        // Reset the form after successful submission
        setForm({
          location: '', // Reset location to initial value
          foodName: '',
          description: '',
          quantity: '',
          date: null,
        });
        
        // Optionally reset other state if needed
        setErrors({
          location: '', 
          foodName: '',
          description: '',
          quantity: '',
          date: '',
          apiError: '',
          numericError: '',
        });
      } else {
        Alert.alert("Failed to Place Order");
      }
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Error', 'Failed to place order. Please try again later.');
    }
  };
  

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <FeatherIcon name="chevron-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Event - Food Order</Text>
        </View>

        <View style={styles.formContainer}>
          {/* Location */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Location (Branch)</Text>
            <TouchableOpacity style={styles.picker} onPress={() => setShowLocationPicker(true)}>
              <MaterialIcon name="business" size={24} color="#007bff" style={styles.pickerItemIcon} />
              <Text style={styles.pickerText}>{form.location || 'Select Location'}</Text>
            </TouchableOpacity>
            {errors.location ? <Text style={styles.errorText}>{errors.location}</Text> : null}
          </View>

          {/* Food Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Food Name</Text>
            <TextInput
              style={styles.input}
              value={form.foodName}
              onChangeText={(text) => setForm({ ...form, foodName: text })}
              placeholder="Enter Food Name"
              placeholderTextColor="#6b7280"
            />
            {errors.foodName ? <Text style={styles.errorText}>{errors.foodName}</Text> : null}
          </View>

          {/* Description */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={styles.input}
              value={form.description}
              onChangeText={(text) => setForm({ ...form, description: text })}
              placeholder="Enter Description"
              placeholderTextColor="#6b7280"
            />
            {errors.description ? <Text style={styles.errorText}>{errors.description}</Text> : null}
          </View>

          {/* Quantity */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Quantity</Text>
            <TextInput
              style={styles.input}
              value={form.quantity}
              onChangeText={(text) => setForm({ ...form, quantity: text })}
              placeholder="Add Order Quantity"
              placeholderTextColor="#6b7280"
              keyboardType="numeric"
            />
            {errors.quantity ? <Text style={styles.errorText}>{errors.quantity}</Text> : null}
            {errors.numericError ? <Text style={styles.errorText}>{errors.numericError}</Text> : null}
          </View>

          {/* Date Picker */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Date</Text>
            <TouchableOpacity style={styles.picker} onPress={showDatepicker}>
              <MaterialIcon name="calendar-today" size={24} color="#007bff" style={styles.pickerItemIcon} />
              <Text style={styles.pickerText}>{form.date ? new Date(form.date).toDateString() : 'Select Date'}</Text>
            </TouchableOpacity>
            {errors.date ? <Text style={styles.errorText}>{errors.date}</Text> : null}

            {showDatePicker && (
              <DateTimePicker
                value={form.date ? new Date(form.date) : new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
                style={{ alignSelf: 'flex-start', marginTop: 5 }}
              />
            )}
          </View>

          {/* Location Picker Modal */}
          <Modal
            transparent={true}
            visible={showLocationPicker}
            animationType="slide"
          >
            <View style={styles.modalBackdrop} />
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Location (Branch)</Text>
                <Picker
                  selectedValue={form.location}
                  onValueChange={(itemValue) => {
                    setForm({ ...form, location: itemValue });
                    setShowLocationPicker(false);
                  }}
                >
                  <Picker.Item label="Select Location" value="" />
                  {branches.map((branch, index) => (
                    <Picker.Item
                      key={index}
                      label={branch.branch} // Use the branch field for the label
                      value={branch.branch} // Use the branch field for the value
                    />
                  ))}
                </Picker>

                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowLocationPicker(false)}
                >
                  <Text style={styles.modalCloseButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.updateButton} onPress={handleOrder}>
          <Text style={styles.updateButtonText}>Order</Text>
        </TouchableOpacity>
      </ScrollView>
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
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 5,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 16,
    marginLeft: 8,
    color: '#6b7280',
  },
  pickerItemIcon: {
    marginRight: 10,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 8,
    width: '80%',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  modalCloseButton: {
    marginTop: 16,
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
});

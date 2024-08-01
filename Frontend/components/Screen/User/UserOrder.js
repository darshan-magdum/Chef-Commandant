import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, View, Text, TextInput, TouchableOpacity, ScrollView ,Alert } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

export default function UserOrder({ navigation }) {
  const [form, setForm] = useState({
    location: '',
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
    location: '',
    foodName: '',
    description: '',
    quantity: '',
    date: '',
    apiError: '',
    numericError: '', // New state for numeric input error
  });

  
  const validateForm = () => {
    let valid = true;
    const newErrors = {
      location: '',
      foodName: '',
      description: '',
      quantity: '',
      date: '',
      apiError: '',
      numericError: '',
    };
  
    if (!form.location.trim()) {
      newErrors.location = 'Location is required';
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
  
  

  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    fetchUserData(); // Fetch user data on component mount
  }, []);

  const fetchUserData = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId'); // Retrieve user ID from AsyncStorage

      const response = await axios.get(`http://192.168.0.114:3000/api/user/${userId}`); // Fetch user details using user ID

      if (response.status === 200) {
        const { name, mobile, email, userId } = response.data;
        setUserDetails({ name, mobile, email, userId });
      } else {
        console.error('Failed to fetch user details');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      // Handle error scenarios
    }
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
        userlocation: form.location,
        foodname: form.foodName,
        usernamecontactno: userDetails.mobile,
        useremailid: userDetails.email,
        description: form.description,
        quantity: form.quantity,
        date: form.date,
      };
  
      const response = await axios.post('http://192.168.0.114:3000/api/UserOrdersRoutes/post', payload);
  
      if (response.status === 201) {
        Alert.alert("Order Placed Successfully");
        // Optionally navigate to another screen or show a success message
      } else {
        Alert.alert("Failed to Place Order");
      }
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Error', 'Failed to place order. Please try again later.');
      // Handle error scenarios
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
  <Text style={styles.inputLabel}>Location</Text>
  <TextInput
    style={styles.input}
    value={form.location}
    onChangeText={(text) => setForm({ ...form, location: text })}
    placeholder="Select Location"
    placeholderTextColor="#6b7280"
  />
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
    keyboardType="numeric" // Ensures numeric keyboard on mobile
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
    color:'#6b7280'
  },
  pickerItemIcon: {
    marginRight: 10,
  },
});

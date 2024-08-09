import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, View, Text, TextInput, TouchableOpacity, Modal, FlatList, Alert } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function UserFeedback({ navigation }) {
  const [form, setForm] = useState({
    type: '',
    description: '',
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [userData, setUserData] = useState(null); // State to hold user data

  useEffect(() => {
    fetchUserData(); // Fetch user data on component mount
  }, []);

  const fetchUserData = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId'); // Retrieve user ID from AsyncStorage
      console.log('Fetching user details for userId:', userId);

      const response = await axios.get(`http://localhost:3000/api/user/${userId}`); // Fetch user details using user ID
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



  const [errorMessages, setErrorMessages] = useState({
    type: '',
    description: '',
  });


  const handleChangeType = (type) => {
    setSelectedType(type);
    setForm({ ...form, type: type.toLowerCase() });
    setModalVisible(false);
    setErrorMessages({ ...errorMessages, type: '' }); // Clear previous error message
  };

  const handleChangeDescription = (description) => {
    setForm({ ...form, description });
    setErrorMessages({ ...errorMessages, description: '' }); // Clear previous error message
  };

  const handleSubmit = async () => {
    let errors = false;
  
    if (selectedType === '') {
      setErrorMessages({ ...errorMessages, type: 'Please select a Type' });
      errors = true;
    }
  
    if (form.description.trim() === '') {
      setErrorMessages({ ...errorMessages, description: 'Please enter a Description' });
      errors = true;
    }
  
    if (!userData) {
      Alert.alert('Failed to fetch user data');
      errors = true;
    }
  
    if (errors) {
      return;
    }
  
    try {
      const userId = await AsyncStorage.getItem('userId'); // Retrieve user ID from AsyncStorage
  
      // Submit feedback data to backend 
      const response = await axios.post('http://localhost:3000/api/user/feedback/submit-feedback', {
        userId,
        username: userData.name, // Ensure userData is available and username is fetched correctly
        mobile: userData.mobile, // Assuming mobile is fetched in userData
        type: form.type,
        description: form.description,
      });
  
      console.log('Feedback submitted successfully:', response.data);
  
      // Show success alert
      Alert.alert('Success', 'Feedback submitted successfully', [
        { text: 'OK', onPress: () => navigation.goBack() } // Navigate back after OK is pressed
      ]);
  
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert('Failed to submit feedback');
    }
  };
  
  
  
  const renderPickerItem = ({ item }) => {
    let icon;
    if (item === 'Feedback') {
      icon = 'thumbs-up';
    } else if (item === 'Complaint') {
      icon = 'alert-circle';
    } else if (item === 'Suggestion') {
      icon = 'edit-3';
    }

    return (
      <TouchableOpacity style={styles.pickerItem} onPress={() => handleChangeType(item)}>
        <FeatherIcon name={icon} size={20} style={styles.pickerItemIcon} />
        <Text style={styles.pickerItemText}>{item}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <FeatherIcon name="chevron-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Feedback</Text>
        </View>
        
        {/* Preferences Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Tell Us Your Thoughts</Text>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Type</Text>
              <TouchableOpacity style={styles.picker} onPress={() => setModalVisible(true)}>
                <Text style={styles.pickerText}>{selectedType || 'Please select Type'}</Text>
              </TouchableOpacity>
              {errorMessages.type !== '' && <Text style={styles.errorMessage}>{errorMessages.type}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textArea, { borderColor: errorMessages.description ? 'red' : '#ccc' }]}
                value={form.description}
                onChangeText={handleChangeDescription}
                multiline
                placeholder="Enter your description here"
                placeholderTextColor="#999"
              />
              {errorMessages.description !== '' && <Text style={styles.errorMessage}>{errorMessages.description}</Text>}
            </View>
          </View>
        </View>

        {/* Submit Feedback Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select your choice</Text>
            <FlatList
              data={['Feedback', 'Complaint', 'Suggestion']}
              renderItem={renderPickerItem}
              keyExtractor={(item) => item}
            />
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  sectionContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 25,
  },
  formContainer: {
    marginTop: 12,
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
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  pickerText: {
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    fontSize: 16,
    height: 120,
    textAlignVertical: 'top',
    color: '#333',
  },
  submitButton: {
    marginHorizontal: 24,
    marginTop: 24,
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  pickerItemIcon: {
    marginRight: 10,
    color: '#007bff',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#333',
  },
  closeButton: {
    marginTop: 24,
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorMessage: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
});
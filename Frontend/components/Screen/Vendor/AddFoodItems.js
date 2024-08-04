import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, View, Text, TextInput, TouchableOpacity, Modal, FlatList, Pressable, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddFoodItems({ navigation }) {
  const [form, setForm] = useState({
    foodItem: [],
    date: null,
    price: '',
    category: '',
    selectedFood: null,
    foodDescription: '',
    foodType: '',
    foodImage: null,
    locations: [],
  });

  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [foodcollection, setFoodCollection] = useState([]);
  const [foodNames, setFoodNames] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [validationMessages, setValidationMessages] = useState({
    selectedFood: '',
    date: '',
    price: '',
    category: '',
  });
  const [vendorId, setVendorId] = useState('');

  useEffect(() => {
    const retrieveVendorId = async () => {
      try {
        const storedVendorId = await AsyncStorage.getItem('vendorMemberId');
        console.log("storedVendorId",storedVendorId)
        if (storedVendorId) {
          setVendorId(storedVendorId);
        }
      } catch (error) {
        console.error('Error retrieving vendorMemberId:', error);
      }
    };

    retrieveVendorId();
  }, []);

 
  const [userData, setUserData] = useState(null); // State to hold user data
  console.log("userData",userData)

  useEffect(() => {
    fetchUserData(); // Fetch user data on component mount
  }, []);

  const fetchUserData = async () => {
    try {
      const vendormemberId = await AsyncStorage.getItem('vendorMemberId'); 
      const response = await axios.get(`http://192.168.0.114:3000/api/vendormember/${vendormemberId}`);
      if (response.status === 200) {
        setUserData(response.data); // Store user data including locations
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const handleChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || form.date;
    setShowDatePicker(false);
    setForm({ ...form, date: currentDate });
    validateDate(currentDate);
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const handleChangePrice = (price) => {
    setForm({ ...form, price });
    validatePrice(price);
  };

  const handleChangeCategory = (category) => {
    setSelectedCategory(category);
    setForm({ ...form, category });
    setCategoryModalVisible(false);
    validateCategory(category);
  };

  const handleSubmit = async () => {
    const isValid = validateAllFields();

    if (isValid) {
      try {
        const payload = {
          name: form.selectedFood,
          description: form.foodDescription,
          foodType: form.foodType,
          date: form.date,
          price: form.price,
          category: form.category,
          foodImage:form.foodImage,
          vendorId: vendorId,
          location: [userData.locations[0]],
        };

        console.log('Submitting food item with:', payload);

        const response = await axios.post('http://192.168.0.114:3000/api/vendorMemberFoodRoutes/addfooditem', payload);

        console.log('Response from server:', response.data);
        Alert.alert('Success', response.data.message);

        navigation.goBack();
      } catch (error) {
        console.error('Error submitting food item:', error.response ? error.response.data : error.message);
        Alert.alert(error.response ? error.response.data : error.message);

       
      }
    }
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity style={styles.pickerItem} onPress={() => handleChangeCategory(item)}>
      <MaterialIcon name={getCategoryIcon(item)} size={24} color={item === selectedCategory ? "#007bff" : "#ccc"} style={styles.pickerItemIcon} />
      <Text style={styles.pickerItemText}>{item}</Text>
    </TouchableOpacity>
  );

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Breakfast':
        return 'breakfast-dining';
      case 'Lunch':
        return 'restaurant-menu';
      case 'Snacks':
        return 'local-pizza';
      case 'Dinner':
        return 'dinner-dining';
      case 'All day available':
        return 'all-inclusive';
      default:
        return 'help-outline';
    }
  };

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const handleFoodChange = (itemValue) => {
    const selectedFoodItem = foodcollection.find(item => item.name === itemValue);

    if (selectedFoodItem) {
      setForm({
        ...form,
        selectedFood: itemValue,
        foodDescription: selectedFoodItem.description,
        foodType: selectedFoodItem.foodType,
        foodImage:selectedFoodItem.foodImage,
      });
    } else {
      console.warn(`Food item with name '${itemValue}' not found in foodcollection`);
      setForm({
        ...form,
        selectedFood: itemValue,
        foodDescription: '',
        foodType: '',
        foodImage: '',
      });
    }

    toggleModal();
  };

  const validateFood = (food) => {
    if (!food) {
      return 'Please select a food item';
    }
    return '';
  };

  const validateDate = (date) => {
    if (!date) {
      return 'Please select a date';
    }
    return '';
  };

  const validatePrice = (price) => {
    if (!price) {
      return 'Please enter a price';
    }
    return '';
  };

  const validateCategory = (category) => {
    if (!category) {
      return 'Please select a category';
    }
    return '';
  };

  const validateAllFields = () => {
    const foodError = validateFood(form.selectedFood);
    const dateError = validateDate(form.date);
    const priceError = validatePrice(form.price);
    const categoryError = validateCategory(form.category);

    setValidationMessages({
      selectedFood: foodError,
      date: dateError,
      price: priceError,
      category: categoryError,
    });

    return !(foodError || dateError || priceError || categoryError);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://192.168.0.114:3000/api/fooditemroutes/getallfoodcollection');
        setFoodCollection(response.data);
        const names = response.data.map(item => item.name);
        setFoodNames(names);
      } catch (error) {
        console.error('Error fetching data:', error);
        Alert.alert('Error', 'Failed to fetch data');
      }
    };

    fetchData();
  }, []);

  

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}  style={styles.container}>
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <FeatherIcon name="chevron-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Food Item</Text>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Add New Food Item</Text>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Select Food</Text>
              <TouchableOpacity style={styles.selectFoodButton} onPress={toggleModal}>
                <Text>{form.selectedFood ? form.selectedFood : 'Select Food...'}</Text>
              </TouchableOpacity>
              <Text style={styles.validationMessage}>{validationMessages.selectedFood}</Text>
            </View>

            <Modal
              animationType="slide"
              transparent={true}
              visible={isModalVisible}
              onRequestClose={toggleModal}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Select Food</Text>
                  <Picker
                    selectedValue={form.selectedFood}
                    style={styles.Foodpicker}
                    onValueChange={handleFoodChange}
                  >
                    <Picker.Item label="Select Food..." value="" />
                    {foodNames.map((foodName, index) => (
                      <Picker.Item key={index} label={foodName} value={foodName} />
                    ))}
                  </Picker>
                  <Pressable style={styles.closeButton} onPress={toggleModal}>
                    <Text style={styles.closeButtonText}>Close</Text>
                  </Pressable>
                </View>
              </View>
            </Modal>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Date</Text>
              <TouchableOpacity style={styles.picker} onPress={showDatepicker}>
                <MaterialIcon name="calendar-today" size={24} color="#007bff" style={styles.pickerItemIcon} />
                <Text style={styles.pickerText}>{form.date ? form.date.toDateString() : 'Select Date'}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={form.date || new Date()}
                  mode="date"
                  display="default"
                  onChange={handleChangeDate}
                  style={{ alignSelf: 'flex-start', marginTop: 5 }}
                />
              )}
              <Text style={styles.validationMessage}>{validationMessages.date}</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Price</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter price"
                keyboardType="numeric"
                value={form.price}
                onChangeText={handleChangePrice}
                placeholderTextColor="#6b7280"
              />
              <Text style={styles.validationMessage}>{validationMessages.price}</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Category</Text>
              <TouchableOpacity style={styles.picker} onPress={() => setCategoryModalVisible(true)}>
                <MaterialIcon name={getCategoryIcon(selectedCategory)} size={24} color="#007bff" style={styles.pickerItemIcon} />
                <Text style={styles.pickerText}>{selectedCategory ? selectedCategory : 'Select Category...'}</Text>
              </TouchableOpacity>
              <Text style={styles.validationMessage}>{validationMessages.category}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={categoryModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Category</Text>
            <FlatList
              data={['Breakfast', 'Lunch', 'Snacks', 'Dinner', 'All day available']}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item}
            />
            <TouchableOpacity style={styles.closeButton} onPress={() => setCategoryModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
    </KeyboardAvoidingView>
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
    marginBottom: 10,
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 16,
    marginLeft: 8,
    color: '#6b7280'
  },
  pickerItemIcon: {
    marginRight: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    fontSize: 16,
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
    paddingTop: Platform.OS === 'ios' ? 50 : 38,
  },
  Foodpicker: {
    height: 200, // Adjust height as needed
    width: '100%',
    marginTop: -20,
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
  selectFoodButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  validationMessage: {
    color: 'red',
    marginTop: 5,
  },
});

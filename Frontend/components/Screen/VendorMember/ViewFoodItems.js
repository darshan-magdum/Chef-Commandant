import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, TextInput, ScrollView, Alert } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function ViewFoodItems({ navigation }) {

  const [foodItems, setFoodItems] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedFoodItem, setSelectedFoodItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // State for editing form fields
  const [editFoodItem, setEditFoodItem] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editPrice, setEditPrice] = useState('');
  console.log("editPrice",editPrice)
  const [editCategory, setEditCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editFoodType, setEditFoodType] = useState('');

  // Fetch food items from API
  useEffect(() => {
    fetchFoodItems();
  }, []);

  const fetchFoodItems = async () => {
    try {
      const vendormemberId = await AsyncStorage.getItem('vendorMemberId');  // Retrieve user ID from AsyncStorage
      console.log('Fetching user details for userId:', vendormemberId);
      const response = await axios.get(`http://192.168.0.114:3000/api/vendorMemberFoodRoutes/getfooditems/${vendormemberId}`); // Fetch user details using user ID
      console.log('Vendor Details:', response.data);
      if (response.status === 200) {
        setFoodItems(response.data);
      }
    } catch (error) {
      Alert.alert('Error fetching vendor details:', error.message);
    }
  };

  // Function to handle edit button click
  const handleEdit = (foodItem) => {
    setSelectedFoodItem(foodItem);
    setEditFoodItem(foodItem.name);
    setEditDate(foodItem.date);
    setEditPrice(foodItem.price);
    setEditCategory(foodItem.category);
    setEditDescription(foodItem.description);
    setEditFoodType(foodItem.foodType);
    setEditModalVisible(true);
  };

  const handleDelete = (foodItem) => {
    setSelectedFoodItem(foodItem);
    setDeleteModalVisible(true);
  };
  
  // Function to confirm delete action
  const handleConfirmDelete = async () => {
    try {
      const response = await axios.delete(`http://192.168.0.114:3000/api/vendorMemberFoodRoutes/deletefooditem/${selectedFoodItem._id}`);
      if (response.status === 200) {
        const updatedFoodItems = foodItems.filter(item => item._id !== selectedFoodItem._id);
        Alert.alert('Food Item deleted Successfully');
        setFoodItems(updatedFoodItems);
        setDeleteModalVisible(false);
      } else {
        Alert.alert('Error', 'Failed to delete food item');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to delete food item');
    }
  };

  // Function to confirm edit action
// Inside handleConfirmEdit function
const handleConfirmEdit = async () => {
  try {
    const vendormemberId = await AsyncStorage.getItem('vendorMemberId');
    
    const response = await axios.put(`http://192.168.0.114:3000/api/vendorMemberFoodRoutes/editfooditem/${selectedFoodItem._id}`, {
      vendorId: vendormemberId,
      name: editFoodItem,
      date: editDate,
      price: editPrice,
      category: editCategory,
      description: editDescription,
      foodType: editFoodType
    });

    if (response.status === 200) {
      const updatedItem = response.data; // Updated item from the API response
      const updatedFoodItems = foodItems.map(item =>
        item._id === updatedItem._id ? updatedItem : item
      );
      
      setFoodItems(updatedFoodItems); // Update state with the updated items
      Alert.alert('Success', 'Food Item updated successfully');
      setEditModalVisible(false); // Close edit modal
    } else {
      Alert.alert('Error', 'Failed to update food item');
    }
  } catch (error) {
    Alert.alert('Error', 'Failed to update food item');
  }
};


const filteredFoodItems = foodItems.filter(item => {
  // Check if item.name exists and is a string
  if (item.name && typeof item.name === 'string') {
    return item.name.toLowerCase().startsWith(searchQuery.toLowerCase());
  }
  return false; // Exclude items without a valid name
});


  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FeatherIcon name="chevron-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Food Items</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInput}>
          <FeatherIcon name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchTextInput}
            placeholder="Search by food name..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={text => setSearchQuery(text)}
          />
        </View>
      </View>

      {/* Food Item Cards or No Record Found */}
      {filteredFoodItems.length > 0 ? (
        <ScrollView style={styles.cardContainer}>
          {filteredFoodItems.map(item => (
            <View key={item.id} style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.label}>Food Item:</Text>
                <Text style={styles.value}>{item.name}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Date:</Text>
                <Text style={styles.value}>{item.date}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Price:</Text>
                <Text style={styles.value}>{item.price}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Category:</Text>
                <Text style={styles.value}>{item.category}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Description:</Text>
                <Text style={styles.value}>{item.description}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Food Type:</Text>
                <Text style={styles.value}>{item.foodType}</Text>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}>
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item)}>
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.noRecordContainer}>
          <Text style={styles.noRecordText}>No Record Found</Text>
        </View>
      )}

      {/* Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Item</Text>
            <ScrollView>
              {/* Food Item */}
              <Text style={styles.inputLabel}>Food Item:</Text>
              <TextInput
                style={styles.inputField}
                value={editFoodItem}
                onChangeText={text => setEditFoodItem(text)}
              />

              {/* Date */}
              <Text style={styles.inputLabel}>Date:</Text>
              <TextInput
                style={styles.inputField}
                value={editDate}
                onChangeText={text => setEditDate(text)}
              />

              {/* Price */}
              <Text style={styles.inputLabel}>Price:</Text>
              <TextInput
                style={styles.inputField}
                value={editPrice}
                onChangeText={text => setEditPrice(text)}
                keyboardType="numeric" 
              />

              {/* Category */}
              <Text style={styles.inputLabel}>Category:</Text>
              <TextInput
                style={styles.inputField}
                value={editCategory}
                onChangeText={text => setEditCategory(text)}
              />

              {/* Description */}
              <Text style={styles.inputLabel}>Description:</Text>
              <TextInput
                style={styles.inputField}
                value={editDescription}
                onChangeText={text => setEditDescription(text)}
              />

              {/* Food Type */}
              <Text style={styles.inputLabel}>Food Type:</Text>
              <TextInput
                style={styles.inputField}
                value={editFoodType}
                onChangeText={text => setEditFoodType(text)}
              />

              {/* Buttons */}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleConfirmEdit}
                >
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setEditModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Delete</Text>
            {selectedFoodItem && (
              <Text style={styles.confirmText}>
                Are you sure you want to delete " {selectedFoodItem.name} "?
              </Text>
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleConfirmDelete}
              >
                <Text style={styles.buttonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.buttonText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  searchContainer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 12,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchTextInput: {
    flex: 1,
    height: 40,
    color: '#333',
    paddingHorizontal: 12,
  },
  input: {
    height: 60,
    color: '#333',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginTop: 8,
    textAlignVertical: 'center', // Align text vertically centered
    paddingVertical: 10, // Add padding to center the text vertically
  },
  cardContainer: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  card: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    marginRight: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  value: {
    fontSize: 16,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  editButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  inputField: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: 'tomato',
  },
  saveButton: {
    backgroundColor: '#007bff',
  },
  formGroup: {
    width: '100%',
    marginBottom: 16,
  },
  noRecordContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noRecordText: {
    fontSize: 18,
    color: '#999', // example color
  },
});
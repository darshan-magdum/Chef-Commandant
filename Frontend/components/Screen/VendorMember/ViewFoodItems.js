import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, Alert, Modal } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function ViewFoodItems({ navigation }) {

  const [foodItems, setFoodItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedFoodItem, setSelectedFoodItem] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    date: '',
    price: '',
    category: '',
    description: '',
    foodType: '',
  });

  useEffect(() => {
    fetchFoodItems();
  }, []);

  const fetchFoodItems = async () => {
    try {
      const vendormemberId = await AsyncStorage.getItem('vendorMemberId');
      const response = await axios.get(`http://192.168.0.114:3000/api/vendorMemberFoodRoutes/getfooditems/${vendormemberId}`);
      if (response.status === 200) {
        setFoodItems(response.data);
      }
    } catch (error) {
      Alert.alert('Error fetching vendor details:', error.message);
    }
  };

  const handleDelete = (foodItem) => {
    setSelectedFoodItem(foodItem);
    setDeleteModalVisible(true);
  };

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

  const handleEdit = (foodItem) => {
    setSelectedFoodItem(foodItem);
    setEditForm({
      name: foodItem.name,
      date: foodItem.date,
      price: foodItem.price.toString(),  // Convert number to string
      category: foodItem.category,
      description: foodItem.description,
      foodType: foodItem.foodType,
    });
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    try {
      const vendorId = await AsyncStorage.getItem('vendorMemberId');
      if (vendorId === null) {
        throw new Error('Vendor Member ID is not found');
      }
  
      const response = await axios.put(`http://192.168.0.114:3000/api/vendorMemberFoodRoutes/editfooditem/${selectedFoodItem._id}`, {
        ...editForm,
        price: parseFloat(editForm.price),
        vendorId: vendorId, // Add vendorMemberId to request body
      });
  
      if (response.status === 200) {
        const updatedFoodItems = foodItems.map(item =>
          item._id === selectedFoodItem._id ? { ...item, ...editForm, price: parseFloat(editForm.price) } : item
        );
        Alert.alert('Food Item updated successfully');
        setFoodItems(updatedFoodItems);
        setEditModalVisible(false);
      } else {
        Alert.alert('Error', 'Failed to update food item');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update food item');
    }
  };
  

  const filteredFoodItems = foodItems.filter(item => {
    if (item.name && typeof item.name === 'string') {
      return item.name.toLowerCase().startsWith(searchQuery.toLowerCase());
    }
    return false;
  });

  const formatDate = (dateString) => {
    const dateObj = new Date(dateString);
    const day = dateObj.getDate();
    const month = dateObj.getMonth() + 1; // Months are zero indexed
    const year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
  };

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
            <View key={item._id} style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.label}>Food Item:</Text>
                <Text style={styles.value}>{item.name}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Date:</Text>
                <Text style={styles.value}>{formatDate(item.date)}</Text>
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

      {/* Edit Food Item Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Food Item</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Name"
              value={editForm.name}
              onChangeText={text => setEditForm({ ...editForm, name: text })}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Date"
              value={editForm.date}
              onChangeText={text => setEditForm({ ...editForm, date: text })}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Price"
              value={editForm.price}
              keyboardType="numeric" // Ensures numeric input
              onChangeText={text => setEditForm({ ...editForm, price: text })}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Category"
              value={editForm.category}
              onChangeText={text => setEditForm({ ...editForm, category: text })}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Description"
              value={editForm.description}
              onChangeText={text => setEditForm({ ...editForm, description: text })}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Food Type"
              value={editForm.foodType}
              onChangeText={text => setEditForm({ ...editForm, foodType: text })}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveEdit}
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
                Are you sure you want to delete "{selectedFoodItem.name}"?
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
  modalInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  confirmText: {
    fontSize: 16,
    marginBottom: 20,
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
  noRecordContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noRecordText: {
    fontSize: 18,
    color: '#999',
  },
});

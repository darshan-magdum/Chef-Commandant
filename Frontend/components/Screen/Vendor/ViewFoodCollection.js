import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, TextInput, ScrollView, Alert, Platform, KeyboardAvoidingView, Image } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ViewFoodCollection({ navigation }) {
  const [foodItems, setFoodItems] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [editFoodName, setEditFoodName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editFoodType, setEditFoodType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editFoodNameError, setEditFoodNameError] = useState('');
  const [editDescriptionError, setEditDescriptionError] = useState('');
  const [editFoodTypeError, setEditFoodTypeError] = useState('');
  const [loading, setLoading] = useState(true);

  const validateEditForm = () => {
    let isValid = true;

    if (!editFoodName.trim()) {
      setEditFoodNameError('Food Name is required');
      isValid = false;
    } else {
      setEditFoodNameError('');
    }

    if (!editDescription.trim()) {
      setEditDescriptionError('Description is required');
      isValid = false;
    } else {
      setEditDescriptionError('');
    }

    if (!editFoodType) {
      setEditFoodTypeError('Food Type is required');
      isValid = false;
    } else {
      setEditFoodTypeError('');
    }

    return isValid;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const vendorId = await AsyncStorage.getItem('vendorId');
        const response = await axios.get(`http://192.168.0.107:3000/api/fooditemroutes/getbyvendor/${vendorId}`)
    
        
        // Replace backslashes with forward slashes in image paths
        const updatedFoodItems = response.data.map(item => ({
          ...item,
          foodImage: item.foodImage ? item.foodImage.replace(/\\/g, '/') : null
        }));

        setFoodItems(updatedFoodItems);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        Alert.alert('Error', 'Failed to fetch data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEdit = (collection) => {
    setSelectedCollection(collection);
    setEditFoodName(collection.name);
    setEditDescription(collection.description);
    setEditFoodType(collection.foodType);
    setEditModalVisible(true);
  };

  const handleDelete = (collection) => {
    setSelectedCollection(collection);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`http://192.168.0.107:3000/api/fooditemroutes/delete/${selectedCollection._id}`);
      const updatedCollections = foodItems.filter(c => c._id !== selectedCollection._id);
      setFoodItems(updatedCollections);
      setDeleteModalVisible(false);
      Alert.alert('Food collection deleted successfully');
    } catch (error) {
      console.error('Error deleting collection:', error);
      Alert.alert('Failed to delete food collection');
    }
  };

  const handleConfirmEdit = async () => {
    try {
      if (!validateEditForm()) {
        return;
      }

      const updatedCollection = {
        name: editFoodName,
        description: editDescription,
        foodType: editFoodType,
      };

      await axios.put(
        `http://192.168.0.107:3000/api/fooditemroutes/edit/${selectedCollection._id}`,
        updatedCollection
      );

      const updatedCollections = foodItems.map(c =>
        c._id === selectedCollection._id ? { ...c, ...updatedCollection } : c
      );

      Alert.alert('Success', 'Food collection updated successfully');
      setFoodItems(updatedCollections);
      setEditModalVisible(false);
    } catch (error) {
      console.error('Error updating collection:', error);
      Alert.alert('Failed to update food collection');
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const filteredCollection = foodItems.filter(collection => {
    const searchTerm = searchQuery.toLowerCase().trim();
    const foodName = collection.name.toLowerCase().trim();
    return foodName.startsWith(searchTerm);
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredCollection.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCollection.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FeatherIcon name="chevron-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Food Collections</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInput}>
          <FeatherIcon name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchTextInput}
            placeholder="Search By Food Name..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      ) : currentItems.length === 0 ? (
        <View style={styles.noRecordContainer}>
          <Text style={styles.noRecordText}>No Record Found</Text>
        </View>
      ) : (
        <ScrollView style={styles.cardContainer}>
          {currentItems.map(collection => (
            <View key={collection._id} style={styles.card}>
              {collection.foodImage && (
                <Image
                  source={{ uri: `http://192.168.0.107:3000/${collection.foodImage}` }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
              )}
              <View style={styles.row}>
                <Text style={styles.label}>Food Name:</Text>
                <Text style={styles.value}>{collection.name}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Description:</Text>
                <Text style={styles.value}>{collection.description}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Type:</Text>
                <View style={[styles.foodTypeContainer, 
                              collection.foodType === 'Veg' ? styles.vegBackground : styles.nonVegBackground]}>
                  <Text style={styles.foodTypeText}>{collection.foodType}</Text>
                </View>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(collection)}>
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(collection)}>
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {filteredCollection.length > itemsPerPage && (
        <View style={styles.paginationContainer}>
          {Array.from({ length: totalPages }, (_, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.pageNumber, currentPage === index + 1 && styles.currentPageNumber]}
              onPress={() => paginate(index + 1)}
            >
              <Text style={styles.pageNumberText}>{index + 1}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Food Collection</Text>
            <ScrollView>
              {/* Form for editing collection */}
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Food Name:</Text>
                <TextInput
  style={styles.inputField}
  placeholder="Food Name"
  value={editFoodName}
  onChangeText={text => setEditFoodName(text)}
/>
{editFoodNameError ? <Text style={styles.errorText}>{editFoodNameError}</Text> : null}

              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Description:</Text>
                <TextInput
  style={styles.inputField}
  placeholder="Description"
  value={editDescription}
  onChangeText={text => setEditDescription(text)}
/>
{editDescriptionError ? <Text style={styles.errorText}>{editDescriptionError}</Text> : null}

              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Type:</Text>
              
<View style={styles.radioButtonsContainer}>
  <TouchableOpacity
    style={[styles.radioButton, editFoodType === 'Veg' && styles.radioButtonSelectedveg]}
    onPress={() => setEditFoodType('Veg')}
  >
    <Text style={styles.radioButtonText}>Veg</Text>
  </TouchableOpacity>
  <TouchableOpacity
    style={[styles.radioButton, editFoodType === 'Non-Veg' && styles.radioButtonSelectednonveg]}
    onPress={() => setEditFoodType('Non-Veg')}
  >
    <Text style={styles.radioButtonText}>Non-Veg</Text>
  </TouchableOpacity>
</View>
{editFoodTypeError ? <Text style={styles.errorText}>{editFoodTypeError}</Text> : null}
              </View>

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
        </KeyboardAvoidingView>
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
            {selectedCollection && (
              <Text style={styles.confirmText}>Are you sure you want to delete {selectedCollection.name}?</Text>
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
  cardImage: {
    width: '100%',
    height: 230,
    borderRadius: 8,
    marginBottom: 10,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingTop: Platform.OS === 'ios' ? 50 : 38,
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
  },
  errorText: {
    fontSize: 12,
    color: 'red',
    marginTop: 5,
  },
  
  radioButtonsContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  radioButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  radioButtonSelectednonveg: {
    backgroundColor: '#e74c3c', // Selected background color
  },
  radioButtonSelectedveg: {
    backgroundColor: '#2ecc71', // Selected background color
  },
  radioButtonText: {
    fontSize: 16,
    color: '#333',
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
  buttonText: {
    color: '#fff',
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
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  pageNumber: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    backgroundColor: '#007bff', // Default background color
    borderRadius: 5,
  },
  currentPageNumber: {
    backgroundColor: '#0056b3', // Active background color
  },
  pageNumberText: {
    color: '#fff', // Default text color
    fontWeight: 'bold',
    fontSize: 16,
  },
  foodTypeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vegBackground: {
    backgroundColor: '#2ecc71', // Green background color for Veg
  },
  nonVegBackground: {
    backgroundColor: '#e74c3c', // Red background color for Non-Veg
  },
  foodTypeText: {
    color: '#fff', // White text color
    fontSize: 14,
    fontWeight: 'bold',
  },
});

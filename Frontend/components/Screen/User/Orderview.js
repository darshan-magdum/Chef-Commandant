import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, SafeAreaView, Modal, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Orderview({ navigation }) {
  const [orderDetails, setOrderDetails] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editFoodName, setEditFoodName] = useState('');
  const [editFoodDescription, setEditFoodDescription] = useState('');
  const [editFoodQuantity, setEditFoodQuantity] = useState('');
  const [editFoodDate, setEditFoodDate] = useState('');
  const [editFoodLocation, setEditFoodLocation] = useState('');

  const [errors, setErrors] = useState({
    location: '',
    foodName: '',
    description: '',
    quantity: '',
    numericError: '',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Number of items per page
  const [filteredOrders, setFilteredOrders] = useState([]);

  useEffect(() => {
    fetchOrderDetails(); // Fetch order details on component mount
  }, []);

  useEffect(() => {
    // Update filtered orders whenever searchText changes
    filterOrders();
  }, [searchText, orderDetails]);

  const fetchOrderDetails = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const response = await axios.get(`http://localhost:3000/api/UserOrdersRoutes/${userId}`);
  
      if (response.status === 200) {
        const reversedOrders = response.data.reverse(); // Reverse the array to get newest first
        setOrderDetails(reversedOrders); // Update state with fetched data
      } else {
        console.error('Failed to fetch order details');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      // Handle error scenarios
    }
  };
  

  const handleEdit = (order) => {
    setSelectedOrder(order);
    setEditFoodName(order.foodname);
    setEditFoodDescription(order.description);
    setEditFoodQuantity(order.quantity.toString());
    setEditFoodLocation(order.userlocation);
    setEditModalVisible(true);
    setEditFoodDate(order.date);
  };

  const handleConfirmEdit = async () => {
    try {
      const isValid = validateForm();

      if (!isValid) {
        // Form validation failed, do not proceed with API call
        return;
      }

      const editedOrder = {
        ...selectedOrder,
        foodname: editFoodName,
        description: editFoodDescription,
        quantity: parseInt(editFoodQuantity),
        userlocation: editFoodLocation,
        date: editFoodDate, // Assuming you store dates in ISO format
      };

      // Perform API call to update the order
      const response = await axios.put(`http://localhost:3000/api/UserOrdersRoutes/edit/${selectedOrder._id}`, editedOrder);

      if (response.status === 200) {
        fetchOrderDetails(); // Refresh order list after edit
        Alert.alert(response.data.message);
        setEditModalVisible(false); // Close the edit modal
      } else {
        console.error('Failed to update order');
        Alert.alert('Failed to update order');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      Alert.alert('Error updating order:', error.response.data.message);
      // Handle error scenarios
    }
  };

  const handleDelete = (order) => {
    setSelectedOrder(order);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await axios.delete(`http://localhost:3000/api/UserOrdersRoutes/delete/${selectedOrder._id}`);

      if (response.status === 200) {
        fetchOrderDetails(); // Refresh order list after delete
        Alert.alert(response.data.message);
        setDeleteModalVisible(false); // Close the delete modal
      } else {
        Alert.alert("Failed to delete order");
      }
    } catch (error) {
      console.log("error",error)
      Alert.alert("Error deleting order", error);
      // Display backend error message in an alert
      if (error.response && error.response.data && error.response.data.message) {
        Alert.alert(error.response.data.message);
        setDeleteModalVisible(false);
      } else {
        Alert.alert('Error', 'Failed to delete order. Please try again later.');
        setDeleteModalVisible(false);
      }
    }
  };

  const formatDate = (dateString) => {
    const dateObj = new Date(dateString);
    const day = dateObj.getDate();
    const month = dateObj.getMonth() + 1; // Months are zero indexed
    const year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      location: '',
      foodName: '',
      description: '',
      quantity: '',
      numericError: '',
    };

    if (!editFoodLocation.trim()) {
      newErrors.location = 'Location is required';
      valid = false;
    }
    if (!editFoodName.trim()) {
      newErrors.foodName = 'Food Name is required';
      valid = false;
    }
    if (!editFoodDescription.trim()) {
      newErrors.description = 'Description is required';
      valid = false;
    }
    if (!editFoodQuantity.trim()) {
      newErrors.quantity = 'Quantity is required';
      valid = false;
    } else if (!/^\d+$/.test(editFoodQuantity.trim())) {
      newErrors.numericError = 'Quantity must be a number';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const filterOrders = () => {
    const filtered = orderDetails.filter(order =>
      order.foodname.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredOrders(filtered);
  };

  const renderOrders = () => {
    const ordersToRender = filteredOrders.length > 0 ? filteredOrders : orderDetails;
  
    return (
      <ScrollView style={styles.cardContainer}>
        {ordersToRender.length > 0 ? (
          ordersToRender
            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
            .map((order, index) => (
              <View key={order._id} style={styles.card}>
                {/* Order details */}
                <View style={styles.row}>
                  <Text style={styles.label}>Food Name:</Text>
                  <Text style={styles.value}>{order.foodname}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Description:</Text>
                  <Text style={styles.value}>{order.description}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Quantity:</Text>
                  <Text style={styles.value}>{order.quantity}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Date:</Text>
                  <Text style={styles.value}>{formatDate(order.date)}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Location:</Text>
                  <Text style={styles.value}>{order.userlocation}</Text>
                </View>
  
                {/* Buttons */}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(order)}>
                    <Text style={styles.buttonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(order)}>
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
        ) : (
          <View style={styles.noRecordContainer}>
            <Text style={styles.noRecordText}>No Record Found</Text>
          </View>
        )}
      </ScrollView>
    );
  };
  
  
  const renderPagination = () => {
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const ordersToPaginate = filteredOrders.length > 0 ? filteredOrders : orderDetails;

    return (
      <View style={styles.paginationContainer}>
        {Array.from({ length: totalPages }, (_, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.pageNumber, currentPage === index + 1 && styles.currentPageNumber]}
            onPress={() => setCurrentPage(index + 1)}
          >
            <Text style={styles.pageNumberText}>{index + 1}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FeatherIcon name="chevron-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>View Orders</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInput}>
          <FeatherIcon name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchTextInput}
            value={searchText}
            onChangeText={text => setSearchText(text)}
            placeholder="Search By Food Name..."
            placeholderTextColor="#666"
          />
        </View>
      </View>

      {/* Order Cards */}
      {renderOrders()}

      {/* Pagination */}
      {renderPagination()}

      {/* Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Food</Text>

            {/* Form for editing food */}
            <Text style={styles.inputLabel}>Food Name:</Text>
            <TextInput
              style={styles.inputField}
              value={editFoodName}
              onChangeText={(text) => setEditFoodName(text)}
            />
            {errors.foodName ? <Text style={styles.errorText}>{errors.foodName}</Text> : null}

            <Text style={styles.inputLabel}>Description:</Text>
            <TextInput
              style={styles.inputField}
              value={editFoodDescription}
              onChangeText={(text) => setEditFoodDescription(text)}
            />
            {errors.description ? <Text style={styles.errorText}>{errors.description}</Text> : null}

            <Text style={styles.inputLabel}>Quantity:</Text>
            <TextInput
              style={styles.inputField}
              value={editFoodQuantity}
              onChangeText={(text) => setEditFoodQuantity(text)}
            />
            {errors.quantity ? <Text style={styles.errorText}>{errors.quantity}</Text> : null}
            {errors.numericError ? <Text style={styles.errorText}>{errors.numericError}</Text> : null}

            <Text style={styles.inputLabel}>Location:</Text>
            <TextInput
              style={styles.inputField}
              value={editFoodLocation}
              onChangeText={(text) => setEditFoodLocation(text)}
            />
            {errors.location ? <Text style={styles.errorText}>{errors.location}</Text> : null}

            {/* Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleConfirmEdit}>
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
            <Text style={styles.deleteText}>
              Are you sure you want to delete the food "{selectedOrder ? selectedOrder.foodname : ''}"?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleConfirmDelete}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 5,
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
    marginTop: 16,
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    marginRight: 5,
    fontWeight: '500',
    color: '#333',
    fontSize: 16,
  },
  value: {
    flex: 1,
    fontSize: 16,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 8,
    justifyContent: 'flex-end',
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#3498db',
    borderRadius: 4,
    marginRight: 8,
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#e74c3c',
    borderRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
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
  deleteText: {
    marginBottom: 20,
    fontSize: 16,
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
    backgroundColor: '#0056b3',
  },
  pageNumberText: {
    color: '#fff', // Default text color
    fontWeight: 'bold',
    fontSize: 16,
  },
});

import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, Image, ScrollView, Modal } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useNavigation ,useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';


const Card = ({ image, name, type, isVeg, price, availability, vendor, location, onEdit, onDelete, searchQuery }) => {
  let statusBackgroundColor = '#57AF46'; // Default color for available items
 
  if (availability === 'finished') {
    statusBackgroundColor = 'red'; // Change to red for finished items
  }
 
  // Check if name includes searchQuery
  const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
 
  return matchesSearch ? (
    <View style={styles.foodCard}>
      <Image source={image} style={styles.foodImage} resizeMode="cover" />
     
      {/* Price Badge */}
      <View style={[styles.priceBadgeWhite]}>
        <Text style={[styles.priceTextBlack]}>₹{price}</Text>
      </View>
 
      {/* Status Badge */}
      <View style={[styles.statusBadge, { backgroundColor: statusBackgroundColor }]}>
        <Text style={styles.statusText}>{availability === 'available' ? 'Available' : 'Finished'}</Text>
      </View>
 
      <View style={styles.foodBottom}>
        <View style={styles.foodLeft}>
          <Text style={styles.foodName}>{name}</Text>
          {isVeg ? (
            <FeatherIcon name="circle" size={16} color="white" style={styles.vegIcon} />
          ) : (
            <FeatherIcon name="circle" size={16} color="white" style={styles.nonVegIcon} />
          )}
        </View>
      
 
        {/* Edit and Delete Icons */}
        <View style={styles.editDeleteIcons}>
          <FeatherIcon
            name="edit"
            size={20}
            color="#007bff"
            style={styles.editIcon}
            onPress={() => onEdit()}
          />
          <FeatherIcon
            name="trash-2"
            size={20}
            color="red"
            style={styles.deleteIcon}
            onPress={() => onDelete()}
          />
        </View>
      </View>
    </View>
  ) : null;
};
 
export default function VendorEmployeeHome() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [foodItems, setFoodItems] = useState([
    {
      id: 1,
      name: 'Pasta',
      type: 'lunch',
      isVeg: true,
      price: '120',
      image: require('../../../assets/images/pasta.jpg'),
      availability: 'available',
      vendor: 'ABC Restaurant',
      location: 'City A',
    },
    {
      id: 2,
      name: 'Salad',
      type: 'lunch',
      isVeg: true,
      price: '60',
      image: require('../../../assets/images/salad.jpg'),
      availability: 'finished',
      vendor: 'XYZ Cafe',
      location: 'City B',
    },
    {
      id: 3,
      name: 'Sandwich',
      type: 'breakfast',
      isVeg: true,
      price: '50',
      image: require('../../../assets/images/sandwich.jpg'),
      availability: 'available',
      vendor: 'DEF Eatery',
      location: 'City C',
    },
    {
      id: 4,
      name: 'Pizza',
      type: 'snack',
      isVeg: false,
      price: '100',
      image: require('../../../assets/images/pizza.jpg'),
      availability: 'available',
      vendor: 'GHI Pizzeria',
      location: 'City D',
    },
    {
      id: 5,
      name: 'Veg Thali',
      type: 'dinner',
      isVeg: true,
      price: '150',
      image: require('../../../assets/images/vegthali.jpg'),
      availability: 'available',
      vendor: 'JKL Diner',
      location: 'City E',
    },
    {
      id: 6,
      name: 'Pepsi',
      type: 'all day',
      isVeg: true,
      price: '20',
      image: require('../../../assets/images/pepsi.jpg'),
      availability: 'available',
      vendor: 'MNO Refreshments',
      location: 'City F',
    },
  ]);
 
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('City A'); // Default location
 
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [DeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editItem, setEditItem] = useState(null);
 
  const openEditModal = (item) => {
 
    setEditModalVisible(true);
  };
 
  const closeEditModal = () => {
    setEditItem(null);
    setEditModalVisible(false);
  };
 
  const openDeleteModal = (item) => {
    setDeleteModalVisible(true);
    setEditItem(item); // Optional: Set the item to be deleted for confirmation
  };
 
  const closeDeleteModal = () => {
    setDeleteModalVisible(false);
    setEditItem(null); // Clear the editItem state
  };
 

  const [userData, setUserData] = useState(null); // State to hold user data

    const fetchUserData = useCallback(async () => {
      try {
        const vendormemberId = await AsyncStorage.getItem('vendorMemberId');  // Retrieve user ID from AsyncStorage
      console.log('Fetching user details for userId:', vendormemberId);
      const response = await axios.get(`http://192.168.0.114:3000/api/vendormember/${vendormemberId}`); // Fetch user details using user ID
        console.log('User Detailshh:', response.data);
  
        if (response.status === 200) {
          setUserData(response.data); // Set user data to state
        } else {
          console.error('Failed to fetch user details');
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
        // Handle error scenarios
      }
    }, []); // Add empty dependency array to ensure this function is stable and does not change
  
    useEffect(() => {
      fetchUserData(); // Fetch user data on component mount
    }, [fetchUserData]); // Ensure useEffect runs when fetchUserData changes
  
    useFocusEffect(
      useCallback(() => {
        fetchUserData();
      }, [fetchUserData])
    );

 
 
 
  const saveChanges = (item) => {
    // Implement your delete logic here
    console.log('Deleting item with ID:', item.id);
    // Filter out the item from foodItems
    const updatedItems = foodItems.filter((i) => i.id !== item.id);
    setFoodItems(updatedItems);
    closeDeleteModal();
  };
 
 
  const renderFoodItem = ({ item }) => (
    <Card
      image={item.image}
      name={item.name}
      type={item.type}
      isVeg={item.isVeg}
      price={item.price}
      availability={item.availability}
    
      onEdit={() => openEditModal(item)} // Handle edit action
      onDelete={() => openDeleteModal(item)}
      searchQuery={searchQuery} // Pass searchQuery to Card component
     
    />
  );
 
  useEffect(() => {
    // Filter foodItems based on selectedFilter and searchQuery
    const filteredItems = foodItems.filter(
      (item) =>
        (selectedFilter === 'all' || item.type.toLowerCase().includes(selectedFilter.toLowerCase())) &&
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredFoodItems(filteredItems);
  }, [foodItems, selectedFilter, searchQuery]);
 
  const [filteredFoodItems, setFilteredFoodItems] = useState(foodItems); // State to hold filtered items
 
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.locationContainer}>
          <Text style={styles.locationText}>{selectedLocation}</Text>
         
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('VendorMemberSiderMenu')}>
        <View style={styles.userCircle}>
         
           
        {userData &&  <Text style={styles.userInitials}>
         {userData.name ? userData.name.charAt(0).toUpperCase() : ''}
       </Text>}
       </View>
        </TouchableOpacity>
      </View>
 
      {/* Search */}
      <View style={styles.searchBoxContainer}>
        <FeatherIcon name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchBox}
          placeholder="Search food items"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
      </View>
 
      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        <View style={styles.filters}>
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'all' && styles.selectedFilter]}
            onPress={() => setSelectedFilter('all')}
          >
            <Text style={[styles.filterText, selectedFilter === 'all' && styles.selectedFilterText]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'breakfast' && styles.selectedFilter]}
            onPress={() => setSelectedFilter('breakfast')}
          >
            <Text style={[styles.filterText, selectedFilter === 'breakfast' && styles.selectedFilterText]}>Breakfast</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'lunch' && styles.selectedFilter]}
            onPress={() => setSelectedFilter('lunch')}
          >
            <Text style={[styles.filterText, selectedFilter === 'lunch' && styles.selectedFilterText]}>Lunch</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'snack' && styles.selectedFilter]}
            onPress={() => setSelectedFilter('snack')}
          >
            <Text style={[styles.filterText, selectedFilter === 'snack' && styles.selectedFilterText]}>Snack</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'all day' && styles.selectedFilter]}
            onPress={() => setSelectedFilter('all day')}
          >
            <Text style={[styles.filterText, selectedFilter === 'all day' && styles.selectedFilterText]}>All Day</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'dinner' && styles.selectedFilter]}
            onPress={() => setSelectedFilter('dinner')}
          >
            <Text style={[styles.filterText, selectedFilter === 'dinner' && styles.selectedFilterText]}>Dinner</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
 
      {/* Food List */}
      <FlatList
        data={filteredFoodItems}
        renderItem={renderFoodItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.foodList}
      />
 
      {/* Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={closeEditModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Item</Text>
            <ScrollView>
              {/* Name */}
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.inputField}
                value={editItem?.name}
                onChangeText={(text) => setEditItem({ ...editItem, name: text })}
              />
 
              {/* Type */}
              <Text style={styles.inputLabel}>Type</Text>
              <TextInput
                style={styles.inputField}
                value={editItem?.type}
                onChangeText={(text) => setEditItem({ ...editItem, type: text })}
              />
 
              {/* Price */}
              <Text style={styles.inputLabel}>Price</Text>
              <TextInput
                style={styles.inputField}
                value={editItem?.price}
                onChangeText={(text) => setEditItem({ ...editItem, price: text })}
              />
 
              {/* Availability */}
              <Text style={styles.inputLabel}>Availability</Text>
              <TextInput
                style={styles.inputField}
                value={editItem?.availability}
                onChangeText={(text) => setEditItem({ ...editItem, availability: text })}
              />
 
              {/* Vendor */}
              <Text style={styles.inputLabel}>Vendor</Text>
              <TextInput
                style={styles.inputField}
                value={editItem?.vendor}
                onChangeText={(text) => setEditItem({ ...editItem, vendor: text })}
              />
 
              {/* Location */}
              <Text style={styles.inputLabel}>Location</Text>
              <TextInput
                style={styles.inputField}
                value={editItem?.location}
                onChangeText={(text) => setEditItem({ ...editItem, location: text })}
              />
 
              {/* Buttons */}
              <View style={styles.modalButtons}>
 
              <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
             
                 
                >
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
 
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                 
                  onPress={() => closeEditModal()}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
             
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
 
 
        {/* Delete Modal */}
        <Modal
  animationType="slide"
  transparent={true}
  visible={DeleteModalVisible}
  onRequestClose={closeDeleteModal}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Are you sure you want to delete this item?</Text>
      <ScrollView>
        <View style={styles.modalButtons}>
          <TouchableOpacity
            style={[styles.modalButton, styles.saveButton]}
            onPress={() => saveChanges(editItem)} // Pass the item to be deleted
          >
            <Text style={styles.buttonText}>Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            onPress={closeDeleteModal}
          >
            <Text style={styles.buttonText}>No</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  </View>
</Modal>
 
 
 
     
    </ScrollView>
  );
}
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#d3d3d3',
  },
  locationText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userCircle: {
    backgroundColor: '#007bff',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInitials: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchBoxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#d3d3d3',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchBox: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filterScroll: {
    marginTop: 20,
  },
  filters: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginHorizontal: 3,
  },
  filterText: {
    fontSize: 16,
    color: '#555',
  },
  selectedFilter: {
    backgroundColor: '#007bff',
  },
  selectedFilterText: {
    color: '#fff',
  },
  foodList: {
    marginTop: 10,
  },
  foodCard: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  foodImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  priceBadgeWhite: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  priceTextBlack: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  foodBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  foodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  foodName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 5,
  },
  vegIcon: {
    marginRight: 4,
    backgroundColor:'#57AF46',
    borderWidth:1,
    borderColor:'white',
    padding:1,
    borderRadius:5,

  },
  nonVegIcon: {
    marginRight: 4,
    backgroundColor:'red',
    borderWidth:1,
    borderColor:'white',
    padding:1,
    borderRadius:5,
  },
  vendorInfo: {
    alignItems: 'flex-end',
  },
  vendorName: {
    fontSize: 14,
    color: '#555',
  },
  vendorLocation: {
    fontSize: 12,
    color: '#999',
  },
  editDeleteIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editIcon: {
    marginRight: 15,
  },
  deleteIcon: {
    marginRight: 5,
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
    fontSize: 16,
    fontWeight: 'bold',
  },
});
 
 
 
 
 
 
 
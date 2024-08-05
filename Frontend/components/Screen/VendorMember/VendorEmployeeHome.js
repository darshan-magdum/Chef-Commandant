import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, Image, ScrollView, Modal } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useNavigation ,useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import styles from "./Styles/VendorHomeStyle";

 
const Card = ({ image, name, type, isVeg, price, availability, vendor, location, searchQuery }) => {
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
      <View style={styles.priceBadge}>
        <Text style={styles.priceText}>₹{price}</Text>
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
        <View style={styles.vendorInfo}>
          <Text style={styles.vendorName}>{vendor}</Text>
          <Text style={styles.vendorLocation}>{location}</Text>
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
  ]);
 
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('City A'); // Default location
 
  const openModal = () => {
    setModalVisible(true);
  };
 
  const closeModal = () => {
    setModalVisible(false);
  };
 
  const renderFoodItem = ({ item }) => (
    <Card
      image={item.image}
      name={item.name}
      type={item.type}
      isVeg={item.isVeg}
      price={item.price}
      availability={item.availability}
      vendor={item.vendor}
      location={item.location}
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



  const [foodItem, setFoodItem] = useState([]);
  useEffect(() => {
    fetchFoodItems();
  }, []);

  const fetchFoodItems = async () => {
    try {
      const vendormemberId = await AsyncStorage.getItem('vendorMemberId');
      const response = await axios.get(`http://192.168.0.114:3000/api/vendorMemberFoodRoutes/getfooditems/${vendormemberId}`);
  
  
      // Replace backslashes with forward slashes in image paths
      const updatedFoodItems = response.data.map(item => ({
        ...item,
        foodImage: item.foodImage ? item.foodImage.replace(/\\/g, '/') : null
      }));
  
  
      setFoodItem(updatedFoodItems);
    } catch (error) {
      Alert.alert('No Food Items Available');
    }
  };
  

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
    

      <View style={styles.header}>
        <TouchableOpacity onPress={openModal}>
          <View style={styles.locationContainer}>
            <Text style={styles.locationText}>{selectedLocation}</Text>
            <FeatherIcon name="chevron-down" size={20} color="#007bff" />
          </View>
        </TouchableOpacity>
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
      {filteredFoodItems.length > 0 ? (
        <FlatList
          data={filteredFoodItems}
          renderItem={renderFoodItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.foodList}
        />
      ) : (
        <View style={styles.noItemsContainer}>
          <Text style={styles.noItemsText}>No food items found</Text>
        </View>
      )}
 
      {/* Location Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Select Location</Text>
            {/* Replace ScrollView with Picker */}
            <Picker
  selectedValue={selectedLocation}
  onValueChange={(itemValue, itemIndex) => setSelectedLocation(itemValue)}
  style={styles.modalPicker}
>
  {foodItems.map((item) => (
    <Picker.Item
      key={item.location}
      label={item.location}
      value={item.location}
    />
  ))}
</Picker>


            {/* Buttons */}
            <View style={styles.modalButtonContainer}>
              {/* Done Button */}
              <TouchableOpacity
                style={[styles.modalButton, styles.modalDoneButton]}
                onPress={closeModal}
              >
                <Text style={styles.textStyle}>Done</Text>
              </TouchableOpacity>
              {/* Close Button */}
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCloseButton]}
                onPress={closeModal}
              >
                <Text style={styles.textStyle}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
 


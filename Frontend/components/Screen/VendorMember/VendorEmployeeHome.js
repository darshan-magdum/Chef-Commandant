import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, Image, ScrollView, Modal, Alert } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import styles from "./Styles/VendorHomeStyle";

const Card = ({ image, name, type, isVeg, price, availability, vendor, location, searchQuery }) => {
  let statusBackgroundColor = availability === 'finished' ? 'red' : '#57AF46'; // Color based on availability

  const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());

  return matchesSearch ? (
    <View style={styles.foodCard}>
      <Image source={{ uri: image }} style={styles.foodImage} resizeMode="cover" />
      <View style={styles.priceBadge}>
        <Text style={styles.priceText}>₹{price}</Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: statusBackgroundColor }]}>
        <Text style={styles.statusText}>{availability === 'available' ? 'Available' : 'Finished'}</Text>
      </View>
      <View style={styles.foodBottom}>
        <View style={styles.foodLeft}>
          <Text style={styles.foodName}>{name}</Text>
          <FeatherIcon
            name={isVeg ? "circle" : "circle"}
            size={16}
            color="white"
            style={isVeg ? styles.vegIcon : styles.nonVegIcon}
          />
        </View>
        <View style={styles.vendorInfo}>
          <Text style={styles.vendorName}>{vendor}</Text>
          <Text style={styles.vendorLocation}>{location.join(', ')}</Text>
        </View>
      </View>
    </View>
  ) : null;
};

export default function VendorEmployeeHome() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [foodItems, setFoodItems] = useState([]);
  const [filteredFoodItems, setFilteredFoodItems] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [userData, setUserData] = useState(null);

  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);

  const fetchFoodItems = useCallback(async () => {
    try {
      const vendormemberId = await AsyncStorage.getItem('vendorMemberId');
      const response = await axios.get(`http://192.168.0.114:3000/api/vendorMemberFoodRoutes/getfooditems/${vendormemberId}`);
      
      if (response.data.length === 0) {
        Alert.alert('No Food Items Available');
      }
  
      // Update food items state with fetched data
      const updatedFoodItems = response.data.map(item => ({
        id: item._id,
        name: item.name,
        type: item.category.toLowerCase(), // Match type with the filter
        isVeg: item.foodType.toLowerCase() === 'veg',
        price: item.price.toString(),
        image: `http://192.168.0.114:3000/${item.foodImage.replace(/\\/g, '/')}`, // Construct full URL
        availability: item.status.toLowerCase(),
        vendor: item.vendorId, // Assuming you will fetch vendor name separately if needed
        location: item.location,
      }));
      
      setFoodItems(updatedFoodItems);
      setFilteredFoodItems(updatedFoodItems); // Set filtered items initially
  
      // Set default location to the first available location
      if (updatedFoodItems.length > 0) {
        setSelectedLocation(updatedFoodItems[0].location[0] || ''); // Default to first location or empty string
      } else {
        setSelectedLocation(''); // Reset location if no items are available
      }
    } catch (error) {
      setFoodItems([]); // Ensure state is cleared on error
      setFilteredFoodItems([]);
    }
  }, []);
  
  useEffect(() => {
    fetchFoodItems(); // Fetch food items on component mount
  }, [fetchFoodItems]);
  
  useFocusEffect(
    useCallback(() => {
      fetchFoodItems(); // Fetch food items when screen gains focus
    }, [fetchFoodItems])
  );
  


  useEffect(() => {
    // Filter foodItems based on selectedFilter, selectedLocation, and searchQuery
    const filteredItems = foodItems.filter(
      (item) =>
        (selectedFilter === 'all' || item.type.includes(selectedFilter.toLowerCase())) &&
        (selectedLocation === '' || item.location.includes(selectedLocation)) &&
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredFoodItems(filteredItems);
  }, [foodItems, selectedFilter, selectedLocation, searchQuery]);

  const fetchUserData = useCallback(async () => {
    try {
      const vendormemberId = await AsyncStorage.getItem('vendorMemberId');
      const response = await axios.get(`http://192.168.0.114:3000/api/vendormember/${vendormemberId}`);
      if (response.status === 200) {
        setUserData(response.data);
      } else {
        console.error('Failed to fetch user details');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [fetchUserData])
  );

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
      searchQuery={searchQuery}
    />
  );

  // Extract unique locations for Picker
  const uniqueLocations = useMemo(() => {
    const locationsSet = new Set();
    foodItems.forEach(item => {
      item.location.forEach(loc => locationsSet.add(loc));
    });
    return Array.from(locationsSet);
  }, [foodItems]);


  const hasFoodItems = foodItems.length > 0;
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
      {hasFoodItems && (
          <TouchableOpacity onPress={openModal}>
            <View style={styles.locationContainer}>
              <Text style={styles.locationText}>{selectedLocation || 'Select Location'}</Text>
              <FeatherIcon name="chevron-down" size={20} color="#007bff" />
            </View>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => navigation.navigate('VendorMemberSiderMenu')}>
          <View style={styles.userCircle}>
            {userData && <Text style={styles.userInitials}>{userData.name ? userData.name.charAt(0).toUpperCase() : ''}</Text>}
          </View>
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchBoxContainer}>
        <FeatherIcon name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchBox}
          placeholder="Search food items"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        <View style={styles.filters}>
          {['all', 'breakfast', 'lunch', 'snack', 'all day', 'dinner'].map(filter => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterButton, selectedFilter === filter && styles.selectedFilter]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text style={[styles.filterText, selectedFilter === filter && styles.selectedFilterText]}>{filter.charAt(0).toUpperCase() + filter.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {filteredFoodItems.length > 0 ? (
        <FlatList
          data={filteredFoodItems}
          renderItem={renderFoodItem}
          keyExtractor={(item) => item.id}
          style={styles.foodList}
        />
      ) : (
        <View style={styles.noItemsContainer}>
          <Text style={styles.noItemsText}>No food items found</Text>
        </View>
      )}

<Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Select Location</Text>
            <Picker
              selectedValue={selectedLocation}
              onValueChange={(itemValue) => setSelectedLocation(itemValue)}
              style={styles.modalPicker}
            >
              {uniqueLocations.map((loc, index) => (
                <Picker.Item key={index} label={loc} value={loc} />
              ))}
            </Picker>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalDoneButton]}
                onPress={closeModal}
              >
                <Text style={styles.textStyle}>Done</Text>
              </TouchableOpacity>
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

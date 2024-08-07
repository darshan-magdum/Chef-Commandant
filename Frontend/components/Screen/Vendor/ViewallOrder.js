import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, FlatList, ActivityIndicator } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ViewallOrder({ navigation }) {
  const [foodOrders, setFoodOrders] = useState([]);
  const [filteredFoodOrders, setFilteredFoodOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10; // Number of items per page
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [vendorLocation, setVendorLocation] = useState([]);

  useEffect(() => {
    fetchVendorData();
  }, []);

  const fetchVendorData = async () => {
    try {
      const vendorId = await AsyncStorage.getItem('vendorId');
      console.log('Fetching vendor details for vendorId:', vendorId);
      const response = await axios.get(`http://192.168.0.107:3000/api/vendor/vendor/${vendorId}`);
      console.log('Vendor Details:', response.data);
      // Set vendor locations
      setVendorLocation(response.data.locations);
      // Fetch food orders after fetching vendor details
      fetchFoodOrders(response.data.locations);
    } catch (error) {
      console.error('Error fetching vendor details:', error);
      setLoading(false);
    }
  };

  const fetchFoodOrders = async (locations) => {
    try {
      const response = await axios.get('http://192.168.0.107:3000/api/UserOrdersRoutes/getallorder');
      // Filter orders based on vendor locations
      const filteredOrders = response.data.filter(order =>
        locations.includes(order.userlocation)
      );
      // Reverse the array of orders before setting state
      const reversedOrders = filteredOrders.reverse();
      setFoodOrders(reversedOrders);
      setFilteredFoodOrders(reversedOrders);
      setLoading(false);
      setTotalPages(Math.ceil(reversedOrders.length / itemsPerPage));
    } catch (error) {
      console.error('Error fetching food orders:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery.trim() !== '') {
      const filteredOrders = foodOrders.filter(order =>
        order.foodname.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFoodOrders(filteredOrders);
      setTotalPages(Math.ceil(filteredOrders.length / itemsPerPage));
    } else {
      setFilteredFoodOrders([]);
      setTotalPages(Math.ceil(foodOrders.length / itemsPerPage));
    }
    setCurrentPage(1);
  }, [searchQuery, foodOrders]);

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString) => {
    const dateObj = new Date(dateString);
    const day = dateObj.getDate();
    const month = dateObj.getMonth() + 1; // Months are zero indexed
    const year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.label}>Item Name:</Text>
        <Text style={styles.value}>{item.foodname}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Customer Name:</Text>
        <Text style={styles.value}>{item.username}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Location:</Text>
        <Text style={styles.value}>{item.userlocation}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Contact Number:</Text>
        <Text style={styles.value}>{item.usernamecontactno}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Quantity:</Text>
        <Text style={styles.value}>{item.quantity}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Date:</Text>
        <Text style={styles.value}>{formatDate(item.date)}</Text>
      </View>
    </View>
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrdersToDisplay = searchQuery ? filteredFoodOrders.slice(startIndex, endIndex) : foodOrders.slice(startIndex, endIndex);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FeatherIcon name="chevron-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Food Orders</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInput}>
          <FeatherIcon name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchTextInput}
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder="Search by food orders..."
            placeholderTextColor="#666"
          />
        </View>
      </View>

      {/* Render Food Order Cards or No Record Found */}
      {currentOrdersToDisplay.length === 0 ? (
        <View style={styles.noRecordContainer}>
          <Text style={styles.noRecordText}>No Record Found</Text>
        </View>
      ) : (
        <FlatList
          data={currentOrdersToDisplay}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.cardContainer}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <View style={styles.paginationContainer}>
          {Array.from({ length: totalPages }, (_, index) => (
            <TouchableOpacity key={index} onPress={() => handlePageChange(index + 1)}>
              <View style={[styles.pageNumber, { backgroundColor: currentPage === index + 1 ? '#0056b3' : '#007bff' }, currentPage === index + 1 && styles.currentPageNumber]}>
                <Text style={styles.pageNumberText}>{index + 1}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
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
  noRecordContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noRecordText: {
    fontSize: 18,
    color: '#999',
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
});

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, FlatList, ActivityIndicator } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import axios from 'axios';

export default function ViewUsers({ navigation }) {
  const [users, setUsers] = useState([]);
  const [originalUsers, setOriginalUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10; // Number of items per page
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/user/');
      setUsers(response.data);
      setOriginalUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

// Function to handle search input change
const handleSearch = (text) => {
  setSearchQuery(text);
  
  // Check if originalUsers is populated
  if (originalUsers && originalUsers.length > 0) {
    const filteredUsers = originalUsers.filter(user =>
      user.name && user.name.toLowerCase().includes(text.toLowerCase())
    );
    setUsers(filteredUsers);
    setCurrentPage(1); // Reset to first page after filtering
  }
};

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.label}>User Name:</Text>
        <Text style={styles.value}>{item.name}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{item.email}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Mobile:</Text>
        <Text style={styles.value}>{item.mobile}</Text>
      </View>
    </View>
  );

  // Pagination logic
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = users.slice(startIndex, endIndex);

  // Calculate total number of pages
  const totalPages = Math.ceil(users.length / itemsPerPage);

  // Function to handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FeatherIcon name="chevron-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Users List</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInput}>
          <FeatherIcon name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchTextInput}
            placeholder="Search By Name..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {/* Render User Cards or No Record Found */}
      {currentUsers.length === 0 ? (
        <View style={styles.noRecordContainer}>
          <Text style={styles.noRecordText}>No Record Found</Text>
        </View>
      ) : (
        <FlatList
          data={currentUsers}
          renderItem={renderItem}
          keyExtractor={item => item.id ? item.id.toString() : item._id.toString()} // Adjusted keyExtractor
          contentContainerStyle={styles.cardContainer}
        />
      )}

      {/* Pagination */}
      <View style={styles.paginationContainer}>
        {Array.from({ length: totalPages }, (_, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.pageNumber, currentPage === index + 1 && styles.currentPageNumber]}
            onPress={() => handlePageChange(index + 1)}
          >
            <Text style={styles.pageNumberText}>{index + 1}</Text>
          </TouchableOpacity>
        ))}
      </View>
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

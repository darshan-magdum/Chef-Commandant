import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, View, Text, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Modal, Alert } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import axios from 'axios';

export default function ViewFeedback({ navigation }) {
  const [feedbackList, setFeedbackList] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [originalFeedbackList, setOriginalFeedbackList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteFeedbackId, setDeleteFeedbackId] = useState(null);

  const itemsPerPage = 2; // Number of items per page
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/user/feedback/get-all-feedback');
      setOriginalFeedbackList(response.data);
      setFeedbackList(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.feedbackItem}>
      <View style={styles.feedbackHeader}>
        <Text style={styles.feedbackType}>{item.type}</Text>
        <Text style={styles.feedbackDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.feedbackDetailsContainer}>
        <Text style={styles.feedbackDetailLabel}>Name:</Text>
        <Text style={styles.feedbackDetail}>{item.username}</Text>
      </View>
      <View style={styles.feedbackDetailsContainer}>
        <Text style={styles.feedbackDetailLabel}>Mobile No:</Text>
        <Text style={styles.feedbackDetail}>{item.mobile}</Text>
      </View>
      <View style={styles.feedbackDetailsContainer}>
        <Text style={styles.feedbackDetailLabel}>Description:</Text>
        <Text style={styles.feedbackDetail}>{item.description}</Text>
      </View>
     
      <TouchableOpacity
  style={styles.deleteButton}
  onPress={() => handleDeleteFeedback(item._id)}
>
  <Text style={styles.deleteButtonText}>Delete</Text>
</TouchableOpacity>

    </View>
  );

  const handleDeleteFeedback = (feedbackId) => {
    setDeleteFeedbackId(feedbackId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:3000/api/user/feedback/delete-feedback/${deleteFeedbackId}`);
      // Refetch feedback after deletion
      fetchFeedback();
      setShowDeleteModal(false);
      Alert.alert("Record Deleted Successfully");
    } catch (error) {
      console.error('Error deleting feedback:', error);
      // Handle error or show message to user
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    filterFeedback(activeFilter, text);
  };

  const filterFeedback = (type, query = searchQuery) => {
    let filteredList = originalFeedbackList;

    if (type !== 'all') {
      filteredList = filteredList.filter((item) => item.type === type);
    }

    if (query) {
      filteredList = filteredList.filter((item) => item.username.toLowerCase().includes(query.toLowerCase()));
    }

    setFeedbackList(filteredList);
    setActiveFilter(type);
  };

  // Pagination logic
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFeedback = feedbackList.slice(startIndex, endIndex);

  // Calculate total number of pages
  const totalPages = Math.ceil(feedbackList.length / itemsPerPage);

  // Function to handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FeatherIcon name="chevron-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Users Messages</Text>
      </View>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, activeFilter === 'all' && styles.activeFilterButton]}
          onPress={() => filterFeedback('all')}
        >
          <Text style={[styles.filterButtonText, activeFilter === 'all' && styles.activeFilterButtonText]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, activeFilter === 'feedback' && styles.activeFilterButton]}
          onPress={() => filterFeedback('feedback')}
        >
          <Text style={[styles.filterButtonText, activeFilter === 'feedback' && styles.activeFilterButtonText]}>Feedback</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, activeFilter === 'complaint' && styles.activeFilterButton]}
          onPress={() => filterFeedback('complaint')}
        >
          <Text style={[styles.filterButtonText, activeFilter === 'complaint' && styles.activeFilterButtonText]}>Complaint</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, activeFilter === 'suggestion' && styles.activeFilterButton]}
          onPress={() => filterFeedback('suggestion')}
        >
          <Text style={[styles.filterButtonText, activeFilter === 'suggestion' && styles.activeFilterButtonText]}>Suggestion</Text>
        </TouchableOpacity>
      </View>
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
      {currentFeedback.length === 0 ? (
        <View style={styles.noRecordContainer}>
          <Text style={styles.noRecordText}>No Record Found</Text>
        </View>
      ) : (
        <FlatList
          data={currentFeedback}
          renderItem={renderItem}
          keyExtractor={(item) => item._id.toString()}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 10 }}
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

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Confirm Delete</Text>
            <Text style={styles.confirmText}>Are you sure you want to delete this Record?</Text>
          


            <View style={styles.modalButtons}>
  <TouchableOpacity
    style={[styles.modalButton, styles.saveButton]}
    onPress={confirmDelete}
  >
    <Text style={styles.buttonText}>Yes</Text>
  </TouchableOpacity>
  <TouchableOpacity
    style={[styles.modalButton, styles.cancelButton]}
    onPress={() => setShowDeleteModal(false)}
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
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(204, 204, 204, 1.00)', // Default border color
    backgroundColor: '#fff', // Default background color
  },
  activeFilterButton: {
    backgroundColor: '#007bff', // Active background color
  },
  activeFilterButtonText: {
    color: '#fff', // Active text color
  },
  filterButtonText: {
    // color: '#007bff', // Default text color
    // fontWeight: 'bold',
  },
  feedbackItem: {
    backgroundColor: '#e0e0e0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    position: 'relative', // Needed for absolute positioning of delete icon
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  feedbackType: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
  },
  feedbackDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  feedbackDetailLabel: {
    marginRight: 5,
    fontWeight: '500',
    color: '#333',
    fontSize: 16,
  },
  feedbackDetail: {
    flex: 1,
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
  deleteButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e74c3c',
    borderRadius: 4,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  feedbackDate: {
    flexDirection: 'row',
    alignItems: 'center',
    fontSize: 14,
    color: '#666',
  },
  currentPageNumber: {
    backgroundColor: '#0056b3', // Active background color
  },
  pageNumberText: {
    color: '#fff', // Default text color
    fontWeight: 'bold',
    fontSize: 16,
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
  },

 
});

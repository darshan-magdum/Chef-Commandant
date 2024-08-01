import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, TextInput, Alert, ScrollView, SafeAreaView } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import axios from 'axios';

export default ViewBranches = ({ navigation }) => {
  const [branches, setBranches] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);

  // State for editing form fields
  const [editCountry, setEditCountry] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editBranchName, setEditBranchName] = useState('');

  // State for validation errors
  const [countryError, setCountryError] = useState('');
  const [cityError, setCityError] = useState('');
  const [branchNameError, setBranchNameError] = useState('');

  // State for search functionality
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2; // Number of items per page

  useEffect(() => {
    fetchBranches(); // Fetch branches on component mount
  }, []);

  // Function to fetch all branches
  const fetchBranches = async () => {
    try {
      const response = await axios.get('http://192.168.0.114:3000/api/branchRoutes/viewallbranch');
      console.log('Fetched Branches:', response.data);
      setBranches(response.data);
    } catch (error) {
      console.error('Error fetching branches:', error);
      // Handle error scenarios
    }
  };

  // Function to handle edit button click
  const handleEdit = (branch) => {
    setSelectedBranch(branch);
    setEditCountry(branch.country);
    setEditCity(branch.city);
    setEditBranchName(branch.branch);
    setEditModalVisible(true);
  };

  // Function to handle delete button click
  const handleDelete = (branch) => {
    setSelectedBranch(branch);
    setDeleteModalVisible(true);
  };

  // Function to confirm delete action
  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`http://192.168.0.114:3000/api/branchRoutes/deletebranch/${selectedBranch._id}`);
      const updatedBranches = branches.filter(b => b._id !== selectedBranch._id);
      setBranches(updatedBranches);
      setDeleteModalVisible(false);
      Alert.alert("Record Deleted Successfully");
    } catch (error) {
      console.error('Error deleting branch:', error);
      // Handle delete error
    }
  };

  // Function to confirm edit action
  const handleConfirmEdit = async () => {
    // Reset previous errors
    setCountryError('');
    setCityError('');
    setBranchNameError('');

    // Validation
    let valid = true;
    if (!editCountry.trim()) {
      setCountryError('Country is required');
      valid = false;
    }
    if (!editCity.trim()) {
      setCityError('City is required');
      valid = false;
    }
    if (!editBranchName.trim()) {
      setBranchNameError('Branch Name is required');
      valid = false;
    }

    if (valid) {
      try {
        const updatedBranchData = {
          country: editCountry,
          city: editCity,
          branch: editBranchName
        };

        const response = await axios.put(`http://192.168.0.114:3000/api/branchRoutes/editbranch/${selectedBranch._id}`, updatedBranchData);

        if (response.status === 200) {
          const updatedBranches = branches.map(b =>
            b._id === selectedBranch._id ? { ...b, ...updatedBranchData } : b
          );
          setBranches(updatedBranches);
          setEditModalVisible(false);
        } else {
          throw new Error('Failed to update branch');
        }
      } catch (error) {
        console.error('Error updating branch:', error);
        // Handle update error
      }
    }
  };

  // Function to filter branches by country
// Function to filter branches by country starting with the search term or containing the second word from the search term
const filteredBranches = branches.filter(branch => {
  const terms = searchTerm.trim().toLowerCase().split(" ");
  if (terms.length > 1) {
    const secondWord = terms[1].toLowerCase();
    return branch.country.toLowerCase().startsWith(terms[0]) && branch.country.toLowerCase().includes(secondWord);
  } else {
    return branch.country.toLowerCase().startsWith(searchTerm.toLowerCase());
  }
});


  // Pagination logic
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBranches = filteredBranches.slice(startIndex, endIndex);

  // Calculate total number of pages
  const totalPages = Math.ceil(filteredBranches.length / itemsPerPage);

  // Function to handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FeatherIcon name="chevron-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Company Branches</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInput}>
          <FeatherIcon name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchTextInput}
            placeholder="Search By Country..."
            placeholderTextColor="#666"
            onChangeText={setSearchTerm}
            value={searchTerm}
          />
        </View>
      </View>

      {/* Branch Cards */}
      <ScrollView style={styles.cardContainer}>
        {currentBranches.length > 0 ? (
          currentBranches.map(branch => (
            <View key={branch._id} style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.label}>Country:</Text>
                <Text style={styles.value}>{branch.country}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>City:</Text>
                <Text style={styles.value}>{branch.city}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Branch:</Text>
                <Text style={styles.value}>{branch.branch}</Text>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(branch)}>
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(branch)}>
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

      {/* Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Branch</Text>

            {/* Form for editing branch */}
            <Text style={styles.inputLabel}>Country:</Text>
            <TextInput
              style={[styles.inputField, countryError ? styles.inputError : null]}
              value={editCountry}
              onChangeText={text => setEditCountry(text)}
            />
            {countryError ? <Text style={styles.errorText}>{countryError}</Text> : null}

            <Text style={styles.inputLabel}>City:</Text>
            <TextInput
              style={[styles.inputField, cityError ? styles.inputError : null]}
              placeholder="City"
              value={editCity}
              onChangeText={text => setEditCity(text)}
            />
            {cityError ? <Text style={styles.errorText}>{cityError}</Text> : null}

            <Text style={styles.inputLabel}>Branch Name:</Text>
            <TextInput
              style={[styles.inputField, branchNameError ? styles.inputError : null]}
              placeholder="Branch Name"
              value={editBranchName}
              onChangeText={text => setEditBranchName(text)}
            />
            {branchNameError ? <Text style={styles.errorText}>{branchNameError}</Text> : null}

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
            <Text style={styles.deleteText}>
              Are you sure you want to delete the branch "{selectedBranch ? selectedBranch.branch : ''}"?
            </Text>
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
    </SafeAreaView>
  );
};

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
    marginTop: 12,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchTextInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
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
    color: '#666'
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
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    marginBottom: 5,
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



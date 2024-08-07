import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, TextInput, ScrollView, FlatList } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import CheckBox from 'react-native-check-box';
import axios from 'axios';

export default function ViewVendors({ navigation }) {
  const [searchText, setSearchText] = useState('');
  const [vendors, setVendors] = useState([]);
  const [branches, setBranches] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [editVendorName, setEditVendorName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editMobile, setEditMobile] = useState('');
  const [selectedBranchIds, setSelectedBranchIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vendorResponse, branchResponse] = await Promise.all([
        axios.get('http://192.168.0.107:3000/api/vendor/getallvendor'),
        axios.get('http://192.168.0.107:3000/api/branchRoutes/viewallbranch')
      ]);
      console.log('Vendor Data:', vendorResponse.data); // Log vendor data
      setVendors(vendorResponse.data);
      setFilteredVendors(vendorResponse.data);
      setBranches(branchResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
 
  
  
  const handleEdit = (vendor) => {
    setSelectedVendor(vendor);
    setEditVendorName(vendor.name);
    setEditEmail(vendor.email);
    setEditMobile(vendor.mobile);
    setSelectedBranchIds(vendor.locations || []); // Initialize selected branch ids
    setEditModalVisible(true);
  };

  const handleDelete = (vendor) => {
    setSelectedVendor(vendor);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`http://192.168.0.107:3000/api/vendor/${selectedVendor._id}`);
      const updatedVendors = vendors.filter(vendor => vendor._id !== selectedVendor._id);
      setVendors(updatedVendors);
      setFilteredVendors(updatedVendors);
      setDeleteModalVisible(false);
    } catch (error) {
      console.error('Error deleting vendor:', error);
    }
  };

  console.log("selectedVendor",selectedVendor)
  const handleConfirmEdit = async () => {
    try {
      const updatedVendor = {
        name: editVendorName,
        email: editEmail,
        mobile: editMobile,
        locations: selectedBranchIds
      };
      await axios.put(`http://192.168.0.107:3000/api/vendor/${selectedVendor._id}`, updatedVendor);
      const updatedVendors = vendors.map(vendor =>
        vendor._id === selectedVendor._id
          ? { ...vendor, ...updatedVendor }
          : vendor
      );
      setVendors(updatedVendors);
      setFilteredVendors(updatedVendors);
      setEditModalVisible(false);
    } catch (error) {
      console.error('Error updating vendor:', error);
    }
  };

  const toggleBranchSelection = (branch) => {
    if (selectedBranchIds.includes(branch.branch)) {
      setSelectedBranchIds(selectedBranchIds.filter(id => id !== branch.branch));
    } else {
      setSelectedBranchIds([...selectedBranchIds, branch.branch]);
    }
  };

  const isBranchSelected = (branch) => {
    return selectedBranchIds.includes(branch.branch);
  };

  useEffect(() => {
    setFilteredVendors(
      vendors.filter(vendor =>
        vendor.name.toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [searchText, vendors]);
  

    // Pagination
    const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredVendors.slice(indexOfFirstItem, indexOfLastItem);
  
    const handlePageChange = (pageNumber) => {
      setCurrentPage(pageNumber);
    };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FeatherIcon name="chevron-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Company Vendors</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInput}>
          <FeatherIcon name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
  style={styles.searchTextInput}
  value={searchText}
  onChangeText={text => setSearchText(text)}
  placeholder="Search By Vendor Name..."
  placeholderTextColor="#666"
/>


        </View>
      </View>

      <ScrollView>
        {currentItems.length > 0 ? (
          currentItems.map(vendor => (
            <View key={vendor._id} style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.label}>Vendor Name:</Text>
                <Text style={styles.value}>{vendor.name}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{vendor.email}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Mobile:</Text>
                <Text style={styles.value}>{vendor.mobile}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Branch:</Text>
                <ScrollView style={styles.branchList}>
                  <FlatList
                    data={vendor.locations}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item, index }) => (
                      <View style={styles.locationContainer}>
                        <Text style={styles.locationIndex}>{index + 1}.  <Text style={styles.branchName}>{item}</Text></Text>
                      </View>
                    )}
                  />
                </ScrollView>
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(vendor)}>
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(vendor)}>
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



      <Modal
  animationType="slide"
  transparent={true}
  visible={editModalVisible}
  onRequestClose={() => setEditModalVisible(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Edit Vendor</Text>
      <View>
        <Text style={styles.inputLabel}>Vendor Name:</Text>
        <TextInput
          style={styles.inputField}
          value={editVendorName}
          onChangeText={text => setEditVendorName(text)}
          placeholder="Vendor Name"
        />
        <Text style={styles.inputLabel}>Email:</Text>
        <TextInput
          style={styles.inputField}
          value={editEmail}
          onChangeText={text => setEditEmail(text)}
          placeholder="Email"
          keyboardType="email-address"
        />
        <Text style={styles.inputLabel}>Mobile:</Text>
        <TextInput
          style={styles.inputField}
          value={editMobile}
          onChangeText={text => setEditMobile(text)}
          placeholder="Mobile"
          keyboardType="phone-pad"
        />
        <Text style={styles.inputLabel}>Select Branches</Text>
        <ScrollView style={styles.branchList}>
          {branches.map(branch => (
            <View key={branch._id} style={styles.checkboxContainer}>
              <CheckBox
                isChecked={isBranchSelected(branch)}
                onClick={() => toggleBranchSelection(branch)}
              />
              <Text style={styles.checkboxLabel}>
                {` ${branch.country} - ${branch.city} - ${branch.branch}`}
              </Text>
            </View>
          ))}
        </ScrollView>
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
  </View>
</Modal>

      <Modal visible={deleteModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Confirm Delete</Text>
          <Text style={styles.confirmText}>Are you sure you want to delete this Record?</Text>
          
          

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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
  },
  branchList: {
    maxHeight: 250, // Increased height for better visibility
    marginBottom: 10,
  },
  locationIndex: {
    marginRight: 5,
  },
  branchName: {
    flex: 1,
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

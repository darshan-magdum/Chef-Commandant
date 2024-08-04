import React, { useState } from 'react';
import { StyleSheet, SafeAreaView, View, Text, TextInput, TouchableOpacity, Modal, FlatList, Image, ScrollView, Alert } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

export default function ManageFoodCollection({ navigation }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    foodType: '',
  });

  const [foodTypeModalVisible, setFoodTypeModalVisible] = useState(false);
  const [selectedFoodType, setSelectedFoodType] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [errors, setErrors] = useState({
    name: '',
    description: '',
    foodType: '',
    image: '',  // Add image-related error
  });

  const handleChangeFoodType = (type) => {
    setSelectedFoodType(type);
    setForm({ ...form, foodType: type });
    setErrors({ ...errors, foodType: type ? '' : 'Please select Food Type' });
    setFoodTypeModalVisible(false);
  };

  const handleChangeName = (name) => {
    setForm({ ...form, name });
    setErrors({ ...errors, name: name.trim() ? '' : 'Please enter Food Name' });
  };

  const handleChangeDescription = (description) => {
    setForm({ ...form, description });
    setErrors({ ...errors, description: description.trim() ? '' : 'Please enter Food Description' });
  };

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    try {
      const { name, description, foodType } = form;
  
      let formValid = true;
      const newErrors = {
        name: name.trim() ? '' : 'Please enter Food Name',
        description: description.trim() ? '' : 'Please enter Food Description',
        foodType: foodType ? '' : 'Please select Food Type',
        image: selectedImage ? '' : 'Please select a photo',  // Add image validation
      };
  
      setErrors(newErrors);
  
      if (Object.values(newErrors).some(error => error !== '')) {
        formValid = false;
      }
  
      if (!formValid) {
        return;
      }
  
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('foodType', foodType);
      
      if (selectedImage) {
        const response = await fetch(selectedImage.uri);
        const blob = await response.blob();
        formData.append('foodImage', blob, selectedImage.fileName || 'photo.jpg');
      }
  
      const response = await axios.post('http://192.168.0.114:3000/api/fooditemroutes/createfoodtocollection', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      Alert.alert(response.data.message);
      navigation.goBack(); 
    } catch (error) {
      Alert.alert('Error submitting food item:', error.message);
    }
  };

  const renderFoodTypeItem = ({ item }) => {
    const iconName = item === 'Veg' ? 'circle' : 'circle';
    const iconColor = item === 'Veg' ? 'green' : 'red';

    return (
      <TouchableOpacity style={styles.pickerItem} onPress={() => handleChangeFoodType(item)}>
        <MaterialIcon
          name={iconName}
          size={24}
          color={iconColor}
          style={styles.pickerItemIcon}
        />
        <Text style={styles.pickerItemText}>{item}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <FeatherIcon name="chevron-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Food Collection</Text>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Add Food Item To Collection</Text>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Food Name</Text>
              <TextInput
                style={styles.textInput}
                value={form.name}
                onChangeText={handleChangeName}
                placeholder="Enter Food Name"
                placeholderTextColor="#999"
              />
              {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={styles.textArea}
                value={form.description}
                onChangeText={handleChangeDescription}
                multiline
                placeholder="Enter Food Description"
                placeholderTextColor="#999"
              />
              {errors.description ? <Text style={styles.errorText}>{errors.description}</Text> : null}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Food Type</Text>
              <TouchableOpacity style={styles.picker} onPress={() => setFoodTypeModalVisible(true)}>
                <View style={styles.pickerRow}>
                  {selectedFoodType ? (
                    <MaterialIcon
                      name={selectedFoodType === 'Veg' ? 'circle' : 'circle'}
                      size={24}
                      color={selectedFoodType === 'Veg' ? 'green' : 'red'}
                      style={styles.pickerItemIcon}
                    />
                  ) : null}
                  <Text style={styles.pickerText}>
                    {selectedFoodType || 'Please select Food Type'}
                  </Text>
                </View>
              </TouchableOpacity>
              {errors.foodType ? <Text style={styles.errorText}>{errors.foodType}</Text> : null}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Photo</Text>
              <TouchableOpacity style={styles.photoPicker} onPress={handleImagePick}>
                <Text style={styles.pickerText}>{selectedImage ? 'Photo Selected' : 'Pick a photo'}</Text>
              </TouchableOpacity>
              {selectedImage && <Image source={{ uri: selectedImage.uri }} style={styles.selectedImage} />}
              {errors.image ? <Text style={styles.errorText}>{errors.image}</Text> : null} {/* Add image error display */}
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={foodTypeModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Food Type</Text>
            <FlatList
              data={['Veg', 'Non-Veg']}
              renderItem={renderFoodTypeItem}
              keyExtractor={(item) => item}
            />
            <TouchableOpacity style={styles.closeButton} onPress={() => setFoodTypeModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
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
  sectionContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  formContainer: {
    marginTop: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
    height: 100,
    textAlignVertical: 'top',
    color: '#333',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerItemIcon: {
    marginRight: 8,
  },
  pickerText: {
    fontSize: 16,
    color: '#333',
  },
  photoPicker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
    alignItems: 'center',
  },
  selectedImage: {
    marginTop: 10,
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 4,
  },
  submitButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 4,
    marginTop: 20,
    marginHorizontal: 24,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 4,
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
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  closeButton: {
    marginTop: 20,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#007bff',
    borderRadius: 4,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  pickerItemText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
});

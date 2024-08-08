import React, { useState } from 'react';
import { StyleSheet, SafeAreaView, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import Joi from 'joi';
import AsyncStorage from '@react-native-async-storage/async-storage';



export default function ChangePassword({ navigation }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({
    newPassword: '',
    confirmPassword: '',
    apiError: ''
  });

  const handleChangeNewPassword = (newPassword) => {
    setNewPassword(newPassword);
  };

  const handleChangeConfirmPassword = (confirmPassword) => {
    setConfirmPassword(confirmPassword);
  };

  const handleSubmit = async () => {
    try {
      const schema = Joi.object({
        newPassword: Joi.string().min(6).required().label('New Password'),
        confirmPassword: Joi.any().valid(Joi.ref('newPassword')).required().label('Confirm Password')
          .messages({ 'any.only': 'Passwords do not match' }),
      });

      const { error } = schema.validate({ newPassword, confirmPassword });

      if (error) {
        if (error.details[0].path[0] === 'newPassword') {
          setErrors({ ...errors, newPassword: error.details[0].message });
        } else if (error.details[0].path[0] === 'confirmPassword') {
          setErrors({ ...errors, confirmPassword: error.details[0].message });
        }
        return;
      } else {
        setErrors({ ...errors, newPassword: '', confirmPassword: '' });
      }

   
      const adminId = await AsyncStorage.getItem('adminId');

      const response = await axios.put(`http://192.168.0.112:3000/api/admin/password/${adminId}`, {
        newPassword,
      });

      if (response.status === 200) {
        Alert.alert('Password updated successfully');
        navigation.goBack();
      } else {
        const { message } = response.data;
        setErrors({ ...errors, apiError: message });
      }
    } catch (error) {
      console.error('Error updating password:', error);
      Alert.alert('Error', 'Failed to update password. Please try again.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <FeatherIcon name="chevron-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Change Password</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>New Password</Text>
            <TextInput
              style={styles.input}
              secureTextEntry={true}
              value={newPassword}
              onChangeText={handleChangeNewPassword}
            placeholder="Enter your New Password"
                placeholderTextColor="#6b7280"
            />
            {errors.newPassword ? <Text style={styles.errorText}>{errors.newPassword}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              secureTextEntry={true}
              value={confirmPassword}
              onChangeText={handleChangeConfirmPassword}
                placeholder="Enter Password Again"
                placeholderTextColor="#6b7280"
            />
            {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
          </View>
        </View>

        {errors.apiError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.apiErrorText}>{errors.apiError}</Text>
          </View>
        ) : null}

        <TouchableOpacity style={styles.updateButton} onPress={handleSubmit}>
          <Text style={styles.updateButtonText}>Change Password</Text>
        </TouchableOpacity>
      </View>
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
  formContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    fontSize: 16,
  },
  updateButton: {
    marginHorizontal: 24,
    marginTop: 24,
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: 'red',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginHorizontal: 24,
    marginTop: 10,
  },
  apiErrorText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 5,
  },
});

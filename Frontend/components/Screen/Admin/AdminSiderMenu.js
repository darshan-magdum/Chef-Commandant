import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Switch,
  Image,
} from 'react-native';
import { useNavigation ,useFocusEffect } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import profile from '../../../assets/images/profile.jpg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';


export default function AdminSiderMenu() {
    const navigation = useNavigation();

    const [userData, setUserData] = useState(null); // State to hold user data

    const fetchUserData = useCallback(async () => {
      try {
        const adminId = await AsyncStorage.getItem('adminId'); // Retrieve user ID from AsyncStorage
        console.log('Fetching user details for userId:', adminId);
        const response = await axios.get(`http://192.168.0.112:3000/api/admin/${adminId}`);  // Fetch user details using user ID
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
  

    const handleLogout = async () => {
      try {
      
        await AsyncStorage.clear(); // Clear all AsyncStorage
        console.warn('Clearing AsyncStorage and navigating to Login screen');
        navigation.navigate('Login'); // Navigate to the login screen
      } catch (error) {
        console.error('Error clearing AsyncStorage:', error);
      }
    };
    
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.container}>
        <View style={styles.profile}>
          <TouchableOpacity
            onPress={() => {
              // handle onPress
            }}>
            <View style={styles.profileAvatarWrapper}>
              <Image
                alt=""
                source={profile}
                style={styles.profileAvatar} />

              <TouchableOpacity
              onPress={() => navigation.navigate('EditAdminProfile')}
>
                <View style={styles.profileAction}>
                  <FeatherIcon
                    color="#fff"
                    name="edit-3"
                    size={15} />
                </View>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          <View>
        
        
          {userData &&  <Text style={styles.profileName}>
            {userData.companyName &&
          userData.companyName
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ')
        }
          </Text>}

            {/* <Text style={styles.profileAddress}>
              123 Maple Street. Anytown, PA 17101
            </Text> */}
          </View>
        </View>

        <ScrollView>
  <View style={styles.section}>
    {/* Home */}
    <TouchableOpacity
      onPress={() => navigation.navigate('AdminHome')}
      style={styles.row}>
      <View style={[styles.rowIcon, { backgroundColor: '#007afe' }]}>
        <FeatherIcon color="#fff" name="home" size={20} />
      </View>
      <Text style={styles.rowLabel}>Home</Text>
      <View style={styles.rowSpacer} />
      <FeatherIcon color="#C6C6C6" name="chevron-right" size={20} />
    </TouchableOpacity>

    {/* Your Profile */}
    <TouchableOpacity
      onPress={() => navigation.navigate('AdminProfileView')}
      style={styles.row}>
      <View style={[styles.rowIcon, { backgroundColor: '#32c759' }]}>
        <FeatherIcon color="#fff" name="user" size={20} />
      </View>
      <Text style={styles.rowLabel}>Your Profile</Text>
      <View style={styles.rowSpacer} />
      <FeatherIcon color="#C6C6C6" name="chevron-right" size={20} />
    </TouchableOpacity>

    <TouchableOpacity    onPress={() => navigation.navigate('ChangePassword')}
    style={styles.row}>
      <View style={[styles.rowIcon, { backgroundColor: '#007bff' }]}>
        <FeatherIcon color="#fff" name="lock" size={20} />
      </View>
      <Text style={styles.rowLabel}>Change Password</Text>
      <View style={styles.rowSpacer} />
      <FeatherIcon color="#C6C6C6" name="chevron-right" size={20} />
    </TouchableOpacity>

    {/* Add Branches */}
    <TouchableOpacity
      onPress={() => navigation.navigate('AddBranches')}
   
      style={styles.row}>
      <View style={[styles.rowIcon, { backgroundColor: 'tomato' }]}>
        <FeatherIcon color="#fff" name="plus" size={20} />
      </View>
      <Text style={styles.rowLabel}>Add Branches</Text>
      <View style={styles.rowSpacer} />
      <FeatherIcon color="#C6C6C6" name="chevron-right" size={20} />
    </TouchableOpacity>



    <TouchableOpacity
    
      onPress={() => navigation.navigate('ViewBranches')}
      style={styles.row}>
      <View style={[styles.rowIcon, { backgroundColor: 'tomato' }]}>
        <FeatherIcon color="#fff" name="eye" size={20} />
      </View>
      <Text style={styles.rowLabel}>View Branches</Text>
      <View style={styles.rowSpacer} />
      <FeatherIcon color="#C6C6C6" name="chevron-right" size={20} />
    </TouchableOpacity>

    {/* Add Vendor */}
    <TouchableOpacity
   
   onPress={() => navigation.navigate('VendorRegistration')}
      style={styles.row}>
      <View style={[styles.rowIcon, { backgroundColor: '#fe9400' }]}>
        <FeatherIcon color="#fff" name="plus" size={20} />
      </View>
      <Text style={styles.rowLabel}>Add Vendors</Text>
      <View style={styles.rowSpacer} />
      <FeatherIcon color="#C6C6C6" name="chevron-right" size={20} />
    </TouchableOpacity>

    {/* View Vendor */}
    <TouchableOpacity
     onPress={() => navigation.navigate('ViewVendors')}
      style={styles.row}>
      <View style={[styles.rowIcon, { backgroundColor: '#8e8d91' }]}>
        <FeatherIcon color="#fff" name="eye" size={20} />
      </View>
      <Text style={styles.rowLabel}>View Vendors</Text>
      <View style={styles.rowSpacer} />
      <FeatherIcon color="#C6C6C6" name="chevron-right" size={20} />
    </TouchableOpacity>

    {/* View Users */}
    <TouchableOpacity
  onPress={() => navigation.navigate('ViewUsers')}

      
      style={styles.row}>
      <View style={[styles.rowIcon, { backgroundColor: '#5a9bd4' }]}>
        <FeatherIcon color="#fff" name="users" size={20} />
      </View>
      <Text style={styles.rowLabel}>View Users</Text>
      <View style={styles.rowSpacer} />
      <FeatherIcon color="#C6C6C6" name="chevron-right" size={20} />
    </TouchableOpacity>

    {/* Check Messages */}
    <TouchableOpacity
     onPress={() => navigation.navigate('ViewFeedback')}
      style={styles.row}>
      <View style={[styles.rowIcon, { backgroundColor: '#00bcd4' }]}>
        <FeatherIcon color="#fff" name="message-circle" size={20} />
      </View>
      <Text style={styles.rowLabel}>Check Messages</Text>
      <View style={styles.rowSpacer} />
      <FeatherIcon color="#C6C6C6" name="chevron-right" size={20} />
    </TouchableOpacity>
    <TouchableOpacity
            onPress={handleLogout}
              style={styles.row}>
              <View style={[styles.rowIcon, { backgroundColor: '#8e8d91' }]}>
                <FeatherIcon color="#fff" name="log-out" size={20} />
              </View>

              <Text style={styles.rowLabel}>Logout</Text>

              <View style={styles.rowSpacer} />

              <FeatherIcon
                color="#C6C6C6"
                name="chevron-right"
                size={20} />
            </TouchableOpacity>
  </View>
</ScrollView>


      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 0,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  /** Profile */
  profile: {
    padding: 24,
    backgroundColor: '#fff',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarWrapper: {
    position: 'relative',
  },
  profileAvatar: {
    width: 72,
    height: 72,
    borderRadius: 9999,
  },
  profileAction: {
    position: 'absolute',
    right: -4,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 9999,
    backgroundColor: '#007bff',
  },
  profileName: {
    marginTop: 20,
    fontSize: 19,
    fontWeight: '600',
    color: '#414d63',
    textAlign: 'center',
  },
  // profileAddress: {
  //   marginTop: 5,
  //   fontSize: 16,
  //   color: '#989898',
  //   textAlign: 'center',
  // },
  /** Section */
  section: {
    paddingHorizontal: 24,
  },
  /** Row */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 50,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 9999,
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    fontSize: 17,
    fontWeight: '400',
    color: '#0c0c0c',
  },
  rowSpacer: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
});

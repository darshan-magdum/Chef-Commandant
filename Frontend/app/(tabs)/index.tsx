import { StyleSheet, View ,Platform, KeyboardAvoidingView} from 'react-native';
import Login from "../../components/Development/Login"
import Signup from '../../components/Development/Signup';
import ForgotPassword from '../../components/Development/Forgotpassword';
import ConfirmationCode from '../../components/Development/ConfirmationCode';
import Usersetting from '../../components/Screen/User/Usersetting';
import UserSiderMenu from '../../components/Screen/User/UserSiderMenu';
import SplashScreen from '../../components/Screen/Intro/SplashScreen';
import SplashSceenSignup from '../../components/Screen/Intro/SplashSceenSignup';
import EditUserProfile from '../../components/Screen/User/EditUserProfile';
import UserProfileView from '../../components/Screen/User/UserProfileView';
import UserFeedback from '../../components/Screen/User/UserFeedback';
import UserOrder from '../../components/Screen/User/UserOrder';
import Orderview from '../../components/Screen/User/Orderview';
import UserHome from '../../components/Screen/User/UserHome';
import EditVendorProfile from '../../components/Screen/Vendor/EditVendorProfile';
import VendorHome from '../../components/Screen/Vendor/VendorHome';
import VendorProfileView from '../../components/Screen/Vendor/VendorProfileView';
import VendorSiderMenu from '../../components/Screen/Vendor/VendorSiderMenu';
import AddFoodItems from '../../components/Screen/Vendor/AddFoodItems';
import ManageFoodCollection from '../../components/Screen/Vendor/ManageFoodCollection';
import ViewFoodCollection from '../../components/Screen/Vendor/ViewFoodCollection';
import AddMembers from '../../components/Screen/Vendor/AddMembers';
import ViewMembers from '../../components/Screen/Vendor/ViewMembers';
import ViewallOrder from '../../components/Screen/Vendor/ViewallOrder';
import AdminHome from '../../components/Screen/Admin/AdminHome';
import AdminSiderMenu from '../../components/Screen/Admin/AdminSiderMenu';
import AdminProfileView from '../../components/Screen/Admin/AdminProfileView';
import EditAdminProfile from '../../components/Screen/Admin/EditAdminProfile';
import ChangePassword from '../../components/Screen/Admin/ChangePassword';
import ViewFeedback from '../../components/Screen/Admin/ViewFeeback';
import AddBranches from '../../components/Screen/Admin/AddBranches';
import ViewBranches from '../../components/Screen/Admin/ViewBranches';
import VendorRegistration from '../../components/Screen/Admin/VendorRegistration';
import ViewVendors from '../../components/Screen/Admin/ViewVendors';
import ViewUsers from '../../components/Screen/Admin/ViewUsers';
import ViewFoodItems from '../../components/Screen/VendorMember/ViewFoodItems';
import EditVendorMemberProfile from '../../components/Screen/VendorMember/EditVendorMemberProfile';
import VendorMemberProfileView from '../../components/Screen/VendorMember/VendorMemberProfileView';
import VendorMemberSiderMenu from '../../components/Screen/VendorMember/VendorMemberSiderMenu';
import VendorEmployeeHome from '../../components/Screen/VendorMember/VendorEmployeeHome';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {  useEffect, useState } from 'react';


export default function HomeScreen() {



  
  const Stack = createNativeStackNavigator();




  return (

    <>

<KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.Container}>
      

      <Stack.Navigator screenOptions={{headerShown:false}}>
      

          <Stack.Screen name="SplashScreen" component={SplashScreen} />
          <Stack.Screen name="Signup" component={Signup} />
          <Stack.Screen name="Login" component={Login} />
   
          <Stack.Screen name="SplashSceenSignup" component={SplashSceenSignup} />
               {/* User Screens */}
        <Stack.Screen name="UserHome" component={UserHome} />
        <Stack.Screen name="Usersetting" component={Usersetting} />
        <Stack.Screen name="EditUserProfile" component={EditUserProfile} />
        <Stack.Screen name="UserSiderMenu" component={UserSiderMenu} />
        <Stack.Screen name="UserProfileView" component={UserProfileView} />
        <Stack.Screen name="UserFeedback" component={UserFeedback} />
        <Stack.Screen name="UserOrder" component={UserOrder} />
        <Stack.Screen name="Orderview" component={Orderview} />
      
          
  

        <Stack.Screen name="ConfirmationCode" component={ConfirmationCode} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />

   
        
        {/* Vendor Screens */}
        <Stack.Screen name="VendorHome" component={VendorHome} />
        <Stack.Screen name="EditVendorProfile" component={EditVendorProfile} />
        <Stack.Screen name="VendorProfileView" component={VendorProfileView} />
        <Stack.Screen name="VendorSiderMenu" component={VendorSiderMenu} />
        <Stack.Screen name="ManageFoodCollection" component={ManageFoodCollection} />
        <Stack.Screen name="ViewFoodCollection" component={ViewFoodCollection} />
        <Stack.Screen name="AddMembers" component={AddMembers} />
        <Stack.Screen name="ViewMembers" component={ViewMembers} />
        <Stack.Screen name="ViewallOrder" component={ViewallOrder} />

        {/* Admin Screens */}
        

          <Stack.Screen name="AdminHome" component={AdminHome} /> 
        <Stack.Screen name="EditAdminProfile" component={EditAdminProfile} />
        <Stack.Screen name="AdminProfileView" component={AdminProfileView} />
        <Stack.Screen name="ViewFeedback" component={ViewFeedback} />
        <Stack.Screen name="AddBranches" component={AddBranches} />
        <Stack.Screen name="ViewBranches" component={ViewBranches} />
        <Stack.Screen name="AdminSiderMenu" component={AdminSiderMenu} />
        <Stack.Screen name="VendorRegistration" component={VendorRegistration} />
        <Stack.Screen name="ViewVendors" component={ViewVendors} />
        <Stack.Screen name="ViewUsers" component={ViewUsers} />        
        <Stack.Screen name="ChangePassword" component={ChangePassword} />        

        {/* VendorMember Screens */}

        <Stack.Screen name="VendorEmployeeHome" component={VendorEmployeeHome} />
       <Stack.Screen name="VendorMemberSiderMenu" component={VendorMemberSiderMenu} />
        <Stack.Screen name="AddFoodItems" component={AddFoodItems} />
        <Stack.Screen name="ViewFoodItems" component={ViewFoodItems} />
        <Stack.Screen name="EditVendorMemberProfile" component={EditVendorMemberProfile} />
        <Stack.Screen name="VendorMemberProfileView" component={VendorMemberProfileView} /> 
    

        



      </Stack.Navigator>

      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({

  Container: {
    padding: 0,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    paddingTop: Platform.OS === 'ios' ? 50 : 38,
  },

});

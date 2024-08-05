import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f0f0f0',
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      elevation: 2,
      borderWidth: 1,
      borderColor: '#d3d3d3', 
    },
    locationText: {
      fontSize: 16,
      marginRight: 8,
    },
    locationIcon: {
      marginLeft: 8,
    },
    userCircle: {
      backgroundColor: '#007bff',
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    userInitials: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
    searchBoxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#d3d3d3', 
    },
    searchIcon: {
      marginRight: 8,
    },
    searchBox: {
      flex: 1,
      fontSize: 16,
      color: '#333',
    },
    filterScroll: {
      marginBottom: 16,
    },
    filters: {
      flexDirection: 'row',
      marginBottom: 8,
    },
    filterButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 10,
      marginHorizontal: 3,
      backgroundColor: '#fff', // Default background color
    },
    filterText: {
      fontSize: 14,
      color: '#000', // Default text color
    },
   
    selectedFilter: {
      backgroundColor: '#007bff', // Selected background color
    },
    selectedFilterText: {
      color: '#fff', // Selected text color
      fontSize: 14,
      fontWeight: 'bold',
    },
    foodList: {
      marginBottom: 16,
    },
    foodCard: {
      backgroundColor: '#fff',
      borderRadius: 8,
      marginBottom: 16,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      marginLeft: 8,
      marginRight: 8,
    },
    foodImage: {
      width: '100%',
      height: 200,
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
    },
    priceBadge: {
      position: 'absolute',
      top: 12,
      left: 12,
      backgroundColor: 'white',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      elevation: 3,
      zIndex: 1,
    },
    priceText: {
      color: '#000',
      fontSize: 14,
      fontWeight: 'bold',
    },
    statusBadge: {
      position: 'absolute',
      top: 12,
      right: 12,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      elevation: 3,
      zIndex: 1,
    },
    statusText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
    },
    foodBottom: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 12,
      borderTopWidth: 1,
      borderTopColor: '#f0f0f0',
    },
    foodLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    foodName: {
      fontSize: 16,
      fontWeight: '600',
      marginRight: 8,
    },
    vegIcon: {
      marginRight: 4,
      backgroundColor:'#57AF46',
      borderWidth:1,
      borderColor:'white',
      padding:1,
      borderRadius:5,
  
    },
    nonVegIcon: {
      marginRight: 4,
      backgroundColor:'red',
      borderWidth:1,
      borderColor:'white',
      padding:1,
      borderRadius:5,
    },
    vendorInfo: {
      alignItems: 'flex-end',
    },
    vendorName: {
      fontSize: 14,
      color: '#666',
    },
    vendorLocation: {
      fontSize: 12,
      color: '#999',
    },
    // Modal Styles
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 22,
    },
    modalView: {
      margin: 20,
      backgroundColor: 'white',
      borderRadius: 20,
      padding: 35,
      alignItems: 'center',
      elevation: 5,
      width: '80%', // Adjust width as needed
      paddingBottom: 30, // Increase bottom padding for more space
    },
    
    
  
    modalText: {
      marginBottom: 15,
      textAlign: 'center',
      fontSize: 18,
      fontWeight: 'bold',
    },
  
  
    modalPicker: {
      height: 200, // Adjust height as needed
      width: '100%',
      marginTop: -20,
    },
    
  
  
  
    
    modalButtonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
    },
    modalButton: {
      borderRadius: 5,
      padding: 10,
      elevation: 2,
      width: '40%',
    },
    modalDoneButton: {
      backgroundColor: '#007bff',
    },
    modalCloseButton: {
      backgroundColor: 'tomato',
    },
    textStyle: {
      color: 'white',
      fontWeight: 'bold',
      textAlign: 'center',
    },
    noItemsContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 50,
    },
    noItemsText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
    },
  });

export default styles;

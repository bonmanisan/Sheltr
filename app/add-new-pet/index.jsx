import { useUser } from '@clerk/clerk-expo';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRouter } from 'expo-router';
import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View
} from 'react-native';
import { uploadToCloudinary } from '../../config/CloudinaryConfig';
import { db } from '../../config/FirebaseConfig';
import Colors from './../../constants/Colors';

export default function AddNewPet() {
  const navigation = useNavigation();
  const { user } = useUser();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    category: 'Dogs',
    breed: '',
    age: '',
    sex: 'Male',
    weight: '',
    address: '',
    about: ''
  });
  const [categoryList, setCategoryList] = useState([]);
  const [image, setImage] = useState(null);
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    navigation.setOptions({ headerTitle: 'Add New Pet' });
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'Category'));
      const categories = snapshot.docs.map((docSnap) => docSnap.data());
      console.log('Fetched categories:', categories); // Debug log
      setCategoryList(categories);
    } catch (error) {
      console.log('Error fetching categories:', error);
    }
  };

  const pickImage = async () => {
    // Request permissions first
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      ToastAndroid.show('Sorry, we need camera roll permissions!', ToastAndroid.SHORT);
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7, // Reduce quality to save bandwidth
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        console.log('Image selected:', result.assets[0].uri);
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log('Error picking image:', error);
      ToastAndroid.show('Error selecting image', ToastAndroid.SHORT);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!image) {
      ToastAndroid.show("Please upload a pet image", ToastAndroid.SHORT);
      return false;
    }
    
    const requiredFields = ['name', 'breed', 'age', 'weight', 'address', 'about'];
    for (let field of requiredFields) {
      if (!formData[field] || formData[field].trim() === '') {
        ToastAndroid.show(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`, ToastAndroid.SHORT);
        return false;
      }
    }
    return true;
  };

  const onSubmit = () => {
    if (!validateForm()) return;
    uploadImage();
  };

  // Cloudinary Upload Function using the helper
  const uploadImage = async () => {
    if (!user) {
      ToastAndroid.show("You must be logged in to upload", ToastAndroid.SHORT);
      return;
    }

    try {
      setLoader(true);
      
      console.log('📸 Starting image upload process...');
      
      const result = await uploadToCloudinary(image, 'pets');
      
      if (result.success) {
        console.log('✅ Cloudinary upload successful, saving to Firestore...');
        saveFormData(result.url);
      } else {
        console.log('❌ Cloudinary upload failed:', result.error);
        
        // Show more specific error messages
        let errorMessage = "Upload failed";
        if (result.error.includes("Unknown API key")) {
          errorMessage = "Invalid Cloudinary configuration. Check cloud name and upload preset.";
        } else if (result.error.includes("network")) {
          errorMessage = "Network error. Check your internet connection.";
        } else if (result.error.includes("413")) {
          errorMessage = "Image too large. Please choose a smaller image.";
        }
        
        ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
        setLoader(false);
      }
      
    } catch (err) {
      console.log("Unexpected upload error:", err);
      ToastAndroid.show("Upload failed unexpectedly", ToastAndroid.SHORT);
      setLoader(false);
    }
  };

  const saveFormData = async (imageUrl) => {
    try {
      const docId = Date.now().toString();
      const petData = {
        ...formData,
        imageUrl,
        username: user?.fullName || 'Unknown User',
        email: user?.primaryEmailAddress?.emailAddress || 'No email',
        userImage: user?.imageUrl || '',
        id: docId,
        createdAt: new Date().toISOString(),
        userId: user?.id,
      };

      console.log('💾 Saving to Firestore:', petData);
      
      await setDoc(doc(db, 'Pets', docId), petData);

      ToastAndroid.show("Pet added successfully!", ToastAndroid.SHORT);
      
      // Reset form
      setFormData({
        name: '',
        category: 'Dogs',
        breed: '',
        age: '',
        sex: 'Male',
        weight: '',
        address: '',
        about: ''
      });
      setImage(null);
      setLoader(false);
      
      // Navigate back
      router.replace('/(tabs)/home');
      
    } catch (err) {
      console.log("Save Error:", err);
      ToastAndroid.show("Failed to save pet data: " + err.message, ToastAndroid.SHORT);
      setLoader(false);
    }
  };

  return (
    <ScrollView style={{ padding: 20, backgroundColor: Colors.WHITE }}>
      <Text style={{ fontFamily: 'outfit-medium', fontSize: 20, marginBottom: 20 }}>
        Add New Pet for adoption
      </Text>

      {/* Image Upload Section */}
      <View style={styles.imageUploadContainer}>
        <Text style={styles.label}>Pet Photo *</Text>
        <Pressable onPress={pickImage} style={styles.imageButton}>
          {!image ? (
            <View style={styles.placeholderContainer}>
              <Image 
                source={require('./../../assets/images/bone.png')} 
                style={{ width: 60, height: 60, opacity: 0.5 }} 
              />
              <Text style={styles.placeholderText}>Tap to upload photo</Text>
              <Text style={styles.helperText}>JPG or PNG, max 10MB</Text>
            </View>
          ) : (
            <View>
              <Image 
                source={{ uri: image }} 
                style={styles.previewImage} 
                resizeMode="cover"
              />
              <TouchableOpacity 
                style={styles.changeImageButton}
                onPress={pickImage}
              >
                <Text style={styles.changeImageText}>Change Image</Text>
              </TouchableOpacity>
            </View>
          )}
        </Pressable>
      </View>

      {/* Form Fields */}
      {[
        { label: 'Pet Name', key: 'name', keyboard: 'default', placeholder: 'e.g., Max' },
        { label: 'Breed', key: 'breed', keyboard: 'default', placeholder: 'e.g., Golden Retriever' },
        { label: 'Age (years)', key: 'age', keyboard: 'decimal-pad', placeholder: 'e.g., 2.5' },
        { label: 'Weight (kg)', key: 'weight', keyboard: 'decimal-pad', placeholder: 'e.g., 15' },
        { label: 'Address', key: 'address', keyboard: 'default', placeholder: 'e.g., 123 Main St, City' },
        { label: 'About', key: 'about', keyboard: 'default', multiline: true, height: 100, placeholder: 'Tell us about this pet...' }
      ].map((field) => (
        <View style={styles.inputContainer} key={field.key}>
          <Text style={styles.label}>{field.label} *</Text>
          <TextInput
            style={[
              styles.input, 
              field.height && { height: field.height, textAlignVertical: 'top' }
            ]}
            keyboardType={field.keyboard}
            multiline={field.multiline || false}
            numberOfLines={field.multiline ? 4 : 1}
            value={formData[field.key]}
            onChangeText={(value) => handleInputChange(field.key, value)}
            placeholder={field.placeholder}
            placeholderTextColor="#999"
          />
        </View>
      ))}

      {/* Category Picker */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Pet Category *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            mode="dropdown"
            selectedValue={formData.category}
            style={[styles.picker, { color: '#ffffffff' }]}
            dropdownIconColor={Colors.PRIMARY}
            onValueChange={(value) => handleInputChange('category', value)}
          >
            {categoryList.length > 0 ? (
              categoryList.map((c, i) => (
                <Picker.Item
                  key={i}
                  label={c.name}
                  value={c.name}
                  color="#000"
                />
              ))
            ) : (
              <>
                <Picker.Item label="Dogs" value="Dogs" color="#000" />
                <Picker.Item label="Cats" value="Cats" color="#000" />
                <Picker.Item label="Birds" value="Birds" color="#000" />
              </>
            )}
          </Picker>
        </View>
      </View>

      {/* Gender Picker */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Gender *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            mode="dropdown"
            selectedValue={formData.sex}
            style={[styles.picker, { color: '#ffffffff' }]}
            dropdownIconColor={Colors.PRIMARY}
            onValueChange={(value) => handleInputChange('sex', value)}
          >
            <Picker.Item label="Male" value="Male" color="#000" />
            <Picker.Item label="Female" value="Female" color="#000" />
          </Picker>
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity 
        style={[styles.button, loader && styles.buttonDisabled]} 
        disabled={loader} 
        onPress={onSubmit}
        activeOpacity={0.8}
      >
        {loader ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size={'small'} color="white" />
            <Text style={styles.loadingText}>Uploading...</Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>Submit Pet for Adoption</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  inputContainer: { 
    marginVertical: 10 
  },
  input: { 
    padding: 15, 
    backgroundColor: '#f8f9fa', 
    borderRadius: 10, 
    fontFamily: 'outfit',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  label: { 
    marginBottom: 8, 
    fontFamily: 'outfit-medium',
    fontSize: 16,
    color: '#333',
  },
  button: { 
    padding: 18, 
    backgroundColor: Colors.PRIMARY, 
    borderRadius: 10, 
    marginVertical: 20,
    marginBottom: 40,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: { 
    fontFamily: 'outfit-medium', 
    textAlign: 'center', 
    color: 'white',
    fontSize: 18,
  },
  loaderContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontFamily: 'outfit',
    color: 'white',
    fontSize: 16,
  },
  imageUploadContainer: {
    marginBottom: 20,
  },
  imageButton: {
    width: '100%',
    height: 200,
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontFamily: 'outfit',
    color: '#6c757d',
    marginTop: 10,
    fontSize: 16,
  },
  helperText: {
    fontFamily: 'outfit',
    color: '#adb5bd',
    marginTop: 5,
    fontSize: 14,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 13,
  },
  changeImageButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
  },
  changeImageText: {
    color: 'white',
    fontFamily: 'outfit',
    fontSize: 14,
  },
  pickerContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
    overflow: 'hidden',
  },
  picker: {
    height: 55,
    paddingHorizontal: 10
  },
});
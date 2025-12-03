import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { uploadToCloudinary } from '../config/CloudinaryConfig';
import { db } from '../config/FirebaseConfig';
import Colors from '../constants/Colors';

export default function EditPost() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Separate state for each field
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [currentImage, setCurrentImage] = useState('');
  const [newImage, setNewImage] = useState(null);
  
  // Use refs to track if data has been loaded
  const dataLoadedRef = useRef(false);

  useEffect(() => {
    // Only fetch data once
    if (dataLoadedRef.current) {
      return;
    }

    const fetchPostData = async () => {
      if (params.postId) {
        try {
          const postRef = doc(db, 'Pets', params.postId);
          const docSnap = await getDoc(postRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            setName(data.name || '');
            setBreed(data.breed || '');
            setAge(data.age?.toString() || '');
            setDescription(data.description || '');
            setLocation(data.location || '');
            setCurrentImage(data.imageUrl || '');
            dataLoadedRef.current = true;
          } else {
            Alert.alert('Error', 'Post not found', [
              { text: 'OK', onPress: () => router.back() }
            ]);
          }
        } catch (error) {
          console.error('Error fetching post:', error);
          Alert.alert('Error', 'Failed to load post data', [
            { text: 'OK', onPress: () => router.back() }
          ]);
        } finally {
          setInitialLoading(false);
        }
      } else {
        Alert.alert('Error', 'No post data provided', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    };

    fetchPostData();
  }, []); // Empty dependency array - only run once on mount

  const pickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to change the image.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        console.log('New image selected:', result.assets[0].uri);
        setNewImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const uploadNewImage = async () => {
    if (!newImage) return null;
    
    setUploadingImage(true);
    try {
      console.log('Uploading new image to Cloudinary...');
      const result = await uploadToCloudinary(newImage, 'pets');
      
      if (result.success) {
        console.log('Image uploaded successfully:', result.url);
        setUploadingImage(false);
        return result.url;
      } else {
        console.log('Image upload failed:', result.error);
        Alert.alert('Upload Failed', 'Failed to upload new image. Please try again.');
        setUploadingImage(false);
        return null;
      }
    } catch (error) {
      console.error('Unexpected upload error:', error);
      Alert.alert('Upload Error', 'An unexpected error occurred during image upload.');
      setUploadingImage(false);
      return null;
    }
  };

  const handleUpdate = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a pet name');
      return;
    }
    
    if (!breed.trim()) {
      Alert.alert('Error', 'Please enter the breed');
      return;
    }
    
    if (!age.trim()) {
      Alert.alert('Error', 'Please enter the age');
      return;
    }
    
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum <= 0) {
      Alert.alert('Error', 'Please enter a valid age (positive number)');
      return;
    }

    setLoading(true);
    try {
      let imageUrl = currentImage;
      
      // Upload new image if selected
      if (newImage) {
        const uploadedUrl = await uploadNewImage();
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          setLoading(false);
          return; // Stop if image upload failed
        }
      }

      const postRef = doc(db, 'Pets', params.postId);
      await updateDoc(postRef, {
        name: name.trim(),
        breed: breed.trim(),
        age: ageNum,
        description: description?.trim() || '',
        location: location?.trim() || '',
        imageUrl: imageUrl,
        updatedAt: new Date().toISOString(),
      });
      
      Alert.alert('Success', 'Post updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error updating post:', error);
      Alert.alert('Error', 'Failed to update post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const displayImage = newImage ? newImage : currentImage;

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
        <Text style={styles.loadingText}>Loading post data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Edit Post</Text>

      {/* Image Upload Section */}
      <View style={styles.imageUploadContainer}>
        <Text style={styles.label}>Pet Photo {newImage ? '(New)' : ''}</Text>
        <Pressable onPress={pickImage} disabled={uploadingImage || loading}>
          <View style={styles.imageButton}>
            {displayImage ? (
              <View>
                <Image 
                  source={{ uri: displayImage }} 
                  style={styles.previewImage} 
                  resizeMode="cover"
                />
                <View style={styles.imageOverlay}>
                  <Text style={styles.changeImageText}>
                    {uploadingImage ? 'Uploading...' : 'Change Image'}
                  </Text>
                </View>
                {uploadingImage && (
                  <View style={styles.uploadingOverlay}>
                    <ActivityIndicator color="white" size="large" />
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.placeholderContainer}>
                <Text style={styles.placeholderText}>Tap to select image</Text>
                <Text style={styles.helperText}>JPG or PNG, max 10MB</Text>
              </View>
            )}
          </View>
        </Pressable>
        {newImage && (
          <Pressable 
            onPress={() => setNewImage(null)} 
            style={styles.removeImageButton}
            disabled={uploadingImage}
          >
            <Text style={styles.removeImageText}>Remove New Image</Text>
          </Pressable>
        )}
      </View>

      {/* Simple TextInput components */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Pet Name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter pet name"
          placeholderTextColor="#999"
          autoCapitalize="words"
          returnKeyType="next"
          editable={!loading && !uploadingImage}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Breed *</Text>
        <TextInput
          style={styles.input}
          value={breed}
          onChangeText={setBreed}
          placeholder="Enter breed"
          placeholderTextColor="#999"
          autoCapitalize="words"
          returnKeyType="next"
          editable={!loading && !uploadingImage}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Age (years) *</Text>
        <TextInput
          style={styles.input}
          value={age}
          onChangeText={setAge}
          placeholder="Enter age"
          placeholderTextColor="#999"
          keyboardType="number-pad"
          returnKeyType="next"
          maxLength={2}
          editable={!loading && !uploadingImage}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter description (optional)"
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          returnKeyType="default"
          editable={!loading && !uploadingImage}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="Enter location (optional)"
          placeholderTextColor="#999"
          autoCapitalize="words"
          returnKeyType="done"
          editable={!loading && !uploadingImage}
        />
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <Pressable
          style={[styles.button, (loading || uploadingImage) && styles.buttonDisabled]}
          onPress={handleUpdate}
          disabled={loading || uploadingImage}
        >
          {loading || uploadingImage ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.buttonText}>Update Post</Text>
          )}
        </Pressable>

        <Pressable
          style={[styles.cancelButton, (loading || uploadingImage) && styles.buttonDisabled]}
          onPress={() => router.back()}
          disabled={loading || uploadingImage}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.WHITE,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.WHITE,
  },
  loadingText: {
    marginTop: 10,
    fontFamily: 'outfit',
    color: Colors.GRAY,
    fontSize: 16,
  },
  title: {
    fontFamily: 'outfit-medium',
    fontSize: 20,
    marginBottom: 20,
    color: Colors.BLACK,
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
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    alignItems: 'center',
  },
  changeImageText: {
    color: 'white',
    fontFamily: 'outfit-medium',
    fontSize: 16,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#ff6b6b',
    borderRadius: 8,
    alignItems: 'center',
  },
  removeImageText: {
    color: 'white',
    fontFamily: 'outfit-medium',
    fontSize: 14,
  },
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
    color: Colors.BLACK,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  label: { 
    marginBottom: 8, 
    fontFamily: 'outfit-medium',
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  button: { 
    padding: 18, 
    backgroundColor: Colors.PRIMARY, 
    borderRadius: 10, 
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: { 
    fontFamily: 'outfit-medium', 
    color: 'white',
    fontSize: 18,
  },
  cancelButton: {
    padding: 18,
    backgroundColor: 'transparent',
    borderRadius: 10,
    marginVertical: 10,
    borderWidth: 2,
    borderColor: Colors.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  cancelButtonText: {
    fontFamily: 'outfit-medium',
    color: Colors.PRIMARY,
    fontSize: 18,
  },
});
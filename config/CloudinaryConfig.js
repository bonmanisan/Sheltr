// config/CloudinaryConfig.js
const CLOUDINARY_CLOUD_NAME = 'dukjdsdi0';
const CLOUDINARY_UPLOAD_PRESET = 'petupload';

export const CLOUDINARY_CONFIG = {
  cloudName: CLOUDINARY_CLOUD_NAME,
  uploadPreset: CLOUDINARY_UPLOAD_PRESET,
  apiUrl: `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
};

// Helper function with better error handling
export const uploadToCloudinary = async (imageUri, folder = 'pets') => {
  try {
    // Validate inputs
    if (!imageUri) {
      throw new Error('No image URI provided');
    }

    console.log('🔄 Starting Cloudinary upload...');
    console.log('Cloud Name:', CLOUDINARY_CLOUD_NAME);
    console.log('Upload Preset:', CLOUDINARY_UPLOAD_PRESET);
    console.log('Image URI:', imageUri);

    // Ensure the URI is correct (Expo often doesn't need 'file://' prefix)
    const fileUri = imageUri.startsWith('file://') ? imageUri : imageUri;
    
    // Create form data
    const formData = new FormData();
    
    // Get file extension for proper MIME type
    const extension = imageUri.split('.').pop().toLowerCase();
    const mimeType = extension === 'png' ? 'image/png' : 
                    extension === 'jpg' || extension === 'jpeg' ? 'image/jpeg' : 
                    'image/jpeg';
    
    formData.append('file', {
      uri: fileUri,
      type: mimeType,
      name: `pet_${Date.now()}.${extension}`,
    });
    
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);
    
    if (folder) {
      formData.append('folder', folder);
    }

    // Debug: Log what we're sending
    console.log('📤 Sending to Cloudinary...');
    console.log('MIME Type:', mimeType);
    console.log('Folder:', folder);

    // Make the request
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
      }
    );

    // Check if response is OK
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ HTTP Error:', response.status, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('📥 Cloudinary Response:', JSON.stringify(data, null, 2));
    
    if (data.error) {
      console.log('❌ Cloudinary Error:', data.error);
      throw new Error(data.error.message || 'Cloudinary upload error');
    }

    if (!data.secure_url) {
      console.log('❌ No secure_url in response');
      throw new Error('No URL returned from Cloudinary');
    }

    console.log('✅ Upload successful!');
    console.log('📎 URL:', data.secure_url);
    console.log('🆔 Public ID:', data.public_id);
    
    return {
      success: true,
      url: data.secure_url,
      publicId: data.public_id,
      format: data.format,
      bytes: data.bytes,
      width: data.width,
      height: data.height,
      data: data,
    };

  } catch (error) {
    console.error('🚨 Cloudinary upload error:', error.message);
    console.error('Stack:', error.stack);
    return {
      success: false,
      error: error.message,
      code: error.code || 'UNKNOWN_ERROR',
    };
  }
};
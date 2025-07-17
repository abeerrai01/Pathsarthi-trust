// Cloudinary upload utility
export async function uploadToCloudinary(file) {
  const url = 'https://api.cloudinary.com/v1_1/dgmhz64fs/image/upload';
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'admin-uploads');

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    throw new Error('Cloudinary upload failed');
  }
  const data = await response.json();
  return { imageUrl: data.secure_url, publicId: data.public_id };
} 
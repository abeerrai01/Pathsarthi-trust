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

// Delete image from Cloudinary by publicId
export async function deleteFromCloudinary(publicId) {
  const cloudName = 'dgmhz64fs';
  const apiKey = process.env.REACT_APP_CLOUDINARY_API_KEY;
  const apiSecret = process.env.REACT_APP_CLOUDINARY_API_SECRET;
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/delete_by_token`;

  // For security, actual deletion should be done server-side. This is a placeholder for client-side demo only.
  // In production, create a secure serverless function or backend endpoint to handle deletion.
  throw new Error('Cloudinary deletion must be handled server-side for security.');
} 
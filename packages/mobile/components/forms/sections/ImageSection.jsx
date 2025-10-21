import React from 'react';
import ImagePickerWithGallery from '../../ImagePickerWithGallery';
import { getImageUrl } from '../../../utils/imageUtils';

/**
 * Image picker section for LectureForm
 * Handles image selection and upload with preview
 */
const ImageSection = ({ value, onChange, onImageUriChange, loading }) => {
  const handleImageChange = (imagePath) => {
    onChange(imagePath);
    if (imagePath) {
      const uri = imagePath.startsWith('http') ? imagePath : getImageUrl(imagePath);
      onImageUriChange(uri);
    } else {
      onImageUriChange(null);
    }
  };

  return (
    <ImagePickerWithGallery
      value={value}
      onChange={handleImageChange}
      onUpload={true}
      disabled={loading}
      placeholder="Odaberite sliku predavanja"
    />
  );
};

export default ImageSection;

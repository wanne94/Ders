import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { DatePickerFixed } from '@/components/ui/date-picker-fixed';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { CloudUpload, X } from 'lucide-react';
import axiosInstance from '../utils/axiosConfig';
import { daijeService, udruzenjaService } from '@/services';
import { getImageUrl } from '../utils/imageUtils';
import { uploadImage } from '../utils/uploadService';

const LectureFormNew = ({ open, onClose, onSuccess, lecture: existingLecture }) => {
  const fileInputRef = useRef(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [daije, setDaije] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [useCustomSpeaker, setUseCustomSpeaker] = useState(false);
  const [useCustomOrganization, setUseCustomOrganization] = useState(false);
  const [showWeeklyOptions, setShowWeeklyOptions] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const [showExistingImages, setShowExistingImages] = useState(false);
  const [selectedExistingImage, setSelectedExistingImage] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    speaker: '',
    daijaId: '',
    organization: '',
    organizationId: '',
    date: '',
    time: '',
    address: '',
    city: '',
    shortDescription: '',
    description: '',
    image: null,
    isWeeklyLecture: false,
    totalWeeks: 4
  });

  // Initialize form when lecture prop changes
  useEffect(() => {
    if (existingLecture) {
      setIsEditMode(true);
      const isCustomSpeaker = !existingLecture.daija;
      const isCustomOrg = !existingLecture.organizationId;
      
      setUseCustomSpeaker(isCustomSpeaker);
      setUseCustomOrganization(isCustomOrg);
      setShowWeeklyOptions(existingLecture.isWeeklyLecture || false);
      
      setFormData({
        title: existingLecture.title || '',
        speaker: isCustomSpeaker ? (existingLecture.speaker || '') : '',
        daijaId: !isCustomSpeaker && existingLecture.daija ? existingLecture.daija._id : '',
        organization: isCustomOrg ? (existingLecture.organization || '') : '',
        organizationId: !isCustomOrg && existingLecture.organizationId ? 
          (typeof existingLecture.organizationId === 'object' ? 
            existingLecture.organizationId._id : 
            existingLecture.organizationId) : '',
        date: existingLecture.date ? existingLecture.date.split('T')[0] : '',
        time: existingLecture.time || '',
        address: existingLecture.address || '',
        city: existingLecture.city || '',
        shortDescription: existingLecture.shortDescription || '',
        description: existingLecture.description || '',
        image: existingLecture.image || null,
        isWeeklyLecture: existingLecture.isWeeklyLecture || false,
        totalWeeks: existingLecture.totalWeeks || 4,
        videoUrl: existingLecture.videoUrl || '',
        facebookUrl: existingLecture.facebookUrl || '',
        instagramUrl: existingLecture.instagramUrl || ''
      });
      
      if (existingLecture.image) {
        setImagePreview(getImageUrl(existingLecture.image));
      }
    } else {
      setIsEditMode(false);
      // Set today's date for new lectures
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      setFormData(prev => ({ ...prev, date: `${year}-${month}-${day}` }));
    }
  }, [existingLecture]);

  // Fetch daije, organizations and existing images
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [daijeResponse, orgsResponse, imagesResponse] = await Promise.all([
          daijeService.getAllDaije(),
          udruzenjaService.getAllUdruzenja(),
          axiosInstance.get('/existing-images')
        ]);
        
        if (daijeResponse) {
          console.log('📚 [LectureFormNew] Fetched', daijeResponse.length, 'daije');
          setDaije(Array.isArray(daijeResponse) ? daijeResponse : []);
        }
        if (orgsResponse) {
          console.log('🏢 [LectureFormNew] Fetched', orgsResponse.length, 'organizations');
          setOrganizations(Array.isArray(orgsResponse) ? orgsResponse : []);
        }
        if (imagesResponse?.data?.images) {
          console.log('🖼️ [LectureFormNew] Fetched', imagesResponse.data.images.length, 'existing images');
          setExistingImages(imagesResponse.data.images);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    if (open) {
      fetchData();
    }
  }, [open]);

  // Auto-fill organization fields
  useEffect(() => {
    if (formData.organizationId && !useCustomOrganization) {
      const selectedOrg = organizations.find(org => org._id === formData.organizationId);
      if (selectedOrg) {
        setFormData(prev => ({
          ...prev,
          address: selectedOrg.address || prev.address,
          city: selectedOrg.city || prev.city
        }));
      }
    }
  }, [formData.organizationId, organizations, useCustomOrganization]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Slika ne smije biti veća od 5MB');
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      let imageUrl = formData.image;
      
      // Upload image if new one selected
      if (imageFile) {
        try {
          const uploadedUrl = await uploadImage(imageFile);
          imageUrl = uploadedUrl;
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          setError('Greška pri učitavanju slike');
          setLoading(false);
          return;
        }
      }
      
      const dataToSend = {
        ...formData,
        image: imageUrl,
        daija: useCustomSpeaker ? null : formData.daijaId,
        daijaId: useCustomSpeaker ? null : formData.daijaId,
        speaker: useCustomSpeaker ? formData.speaker : '',
        organization: useCustomOrganization ? formData.organization : '',
        organizationId: useCustomOrganization ? null : formData.organizationId,
      };
      
      let response;
      if (isEditMode && existingLecture) {
        response = await axiosInstance.put(`/api/lectures/${existingLecture._id}`, dataToSend);
      } else {
        response = await axiosInstance.post('/api/lectures', dataToSend);
      }
      
      setSuccess(true);
      setTimeout(() => {
        onSuccess(response.data);
        onClose();
        resetForm();
      }, 1500);
    } catch (error) {
      console.error('Error saving lecture:', error);
      setError(error.response?.data?.message || 'Greška pri spremanju predavanja');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      speaker: '',
      daijaId: '',
      organization: '',
      organizationId: '',
      date: '',
      time: '',
      address: '',
      city: '',
      shortDescription: '',
      description: '',
      image: null,
      isWeeklyLecture: false,
      totalWeeks: 4,
      videoUrl: '',
      facebookUrl: '',
      instagramUrl: ''
    });
    setImageFile(null);
    setImagePreview(null);
    setUseCustomSpeaker(false);
    setUseCustomOrganization(false);
    setShowWeeklyOptions(false);
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    onClose();
    if (!isEditMode) {
      resetForm();
    }
  };

  const isOrganizationSelected = Boolean(formData.organizationId && !useCustomOrganization);

  return (
    <>
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Uredi predavanje' : 'Dodaj novo predavanje'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error/Success Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert>
              <AlertDescription>
                Predavanje je uspješno {isEditMode ? 'ažurirano' : 'dodano'}!
              </AlertDescription>
            </Alert>
          )}

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Slika predavanja</Label>
            
            {/* Image preview if selected */}
            {imagePreview && (
              <div className="mb-4 relative inline-block">
                <Image
                  src={imagePreview}
                  alt="Pregled"
                  width={400}
                  height={200}
                  className="max-w-full max-h-[200px] rounded object-contain"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                    setSelectedExistingImage(null);
                    setFormData(prev => ({ ...prev, image: null }));
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              {/* Upload new image */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                <input
                  ref={fileInputRef}
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <label htmlFor="image-upload" className="cursor-pointer block">
                  <CloudUpload className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                  <div className="text-sm font-medium text-gray-700">
                    Dodaj novu sliku
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Kliknite ili prevucite
                  </div>
                </label>
              </div>
              
              {/* Select existing image */}
              <div 
                className="border-2 border-solid border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors cursor-pointer"
                onClick={() => setShowExistingImages(!showExistingImages)}
              >
                <div className="h-10 w-10 mx-auto mb-2 flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-gray-700">
                  Odaberi postojeću
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Iz galerije slika
                </div>
              </div>
            </div>
            
            
            <div className="bg-gray-50 rounded-md p-3 text-sm text-gray-600">
              📋 Automatska optimizacija:
              <div className="mt-1">
                • Maksimalna veličina: <strong>5 MB</strong><br/>
                • Podržani formati: <strong>JPG, PNG, WebP</strong>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Naslov predavanja *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              maxLength={80}
              required
            />
            <span className="text-sm text-gray-500">
              {formData.title.length}/80 karaktera
            </span>
          </div>

          {/* Short Description */}
          <div className="space-y-2">
            <Label htmlFor="shortDescription">Kratki opis (neobavezno)</Label>
            <Textarea
              id="shortDescription"
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleChange}
              rows={3}
              maxLength={500}
              placeholder="Kratki opis predavanja koji će se prikazivati na kartici..."
            />
            <span className="text-sm text-gray-500">
              {formData.shortDescription.length}/500 karaktera
            </span>
          </div>

          {/* Speaker Selection */}
          <div className="space-y-2">
            <Label htmlFor="speaker">Daija *</Label>
            {!useCustomSpeaker ? (
              <Combobox
                options={[
                  ...daije.map(daija => ({
                    value: daija._id,
                    label: `${daija.name}${daija.title ? ` (${daija.title})` : ''}`
                  })),
                  { value: 'custom', label: 'Unesi prilagođeno ime...' }
                ]}
                value={formData.daijaId}
                onValueChange={(value) => {
                  if (value === 'custom') {
                    setUseCustomSpeaker(true);
                    setFormData(prev => ({
                      ...prev,
                      daijaId: '',
                      speaker: ''
                    }));
                  } else {
                    setUseCustomSpeaker(false);
                    const selectedDaija = daije.find(d => d._id === value);
                    setFormData(prev => ({
                      ...prev,
                      daijaId: value,
                      speaker: selectedDaija ? selectedDaija.name : ''
                    }));
                  }
                }}
                placeholder="Odaberi ili pretraži daiju..."
                searchPlaceholder="Pretraži daije..."
                emptyText="Nema pronađenih daija"
              />
            ) : null}
          </div>

          {/* Custom Speaker Input */}
          {useCustomSpeaker && (
            <div className="space-y-2">
              <Label htmlFor="customSpeaker">Ime predavača *</Label>
              <Input
                id="customSpeaker"
                name="speaker"
                value={formData.speaker}
                onChange={handleChange}
                placeholder="Unesite ime predavača..."
                required={useCustomSpeaker}
              />
            </div>
          )}

          {/* Organization Selection */}
          <div className="space-y-2">
            <Label htmlFor="organization">Udruženje</Label>
            {!useCustomOrganization ? (
              <Combobox
                options={[
                  { value: 'none', label: 'Bez udruženja' },
                  ...organizations.map(org => ({
                    value: org._id,
                    label: org.name
                  })),
                  { value: 'custom', label: 'Unesi prilagođeni naziv...' }
                ]}
                value={formData.organizationId || 'none'}
                onValueChange={(value) => {
                  if (value === 'custom') {
                    setUseCustomOrganization(true);
                    setFormData(prev => ({
                      ...prev,
                      organizationId: '',
                      organization: '',
                      address: '',
                      city: ''
                    }));
                  } else if (value === 'none') {
                    setUseCustomOrganization(false);
                    setFormData(prev => ({
                      ...prev,
                      organizationId: '',
                      organization: ''
                    }));
                  } else {
                    setUseCustomOrganization(false);
                    const selectedOrg = organizations.find(o => o._id === value);
                    setFormData(prev => ({
                      ...prev,
                      organizationId: value,
                      organization: selectedOrg ? selectedOrg.name : '',
                      address: selectedOrg ? selectedOrg.address : '',
                      city: selectedOrg ? selectedOrg.city : ''
                    }));
                  }
                }}
                placeholder="Odaberi ili pretraži udruženje..."
                searchPlaceholder="Pretraži udruženja..."
                emptyText="Nema pronađenih udruženja"
              />
            ) : null}
          </div>

          {/* Custom Organization Input */}
          {useCustomOrganization && (
            <div className="space-y-2">
              <Label htmlFor="customOrganization">Naziv udruženja</Label>
              <Input
                id="customOrganization"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                placeholder="Unesite naziv udruženja..."
                required={useCustomOrganization}
              />
            </div>
          )}

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Datum *</Label>
              <DatePickerFixed
                value={formData.date}
                onChange={(formattedDate) => {
                  setFormData(prev => ({ ...prev, date: formattedDate }));
                }}
                isEditing={isEditMode}
                placeholder="Izaberite datum"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Vrijeme *</Label>
              <Select
                value={formData.time}
                onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, time: value }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Odaberi vrijeme" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    '06:00', '06:15', '06:30', '06:45',
                    '07:00', '07:15', '07:30', '07:45',
                    '08:00', '08:15', '08:30', '08:45',
                    '09:00', '09:15', '09:30', '09:45',
                    '10:00', '10:15', '10:30', '10:45',
                    '11:00', '11:15', '11:30', '11:45',
                    '12:00', '12:15', '12:30', '12:45',
                    '13:00', '13:15', '13:30', '13:45',
                    '14:00', '14:15', '14:30', '14:45',
                    '15:00', '15:15', '15:30', '15:45',
                    '16:00', '16:15', '16:30', '16:45',
                    '17:00', '17:15', '17:30', '17:45',
                    '18:00', '18:15', '18:30', '18:45',
                    '19:00', '19:15', '19:30', '19:45',
                    '20:00', '20:15', '20:30', '20:45',
                    '21:00', '21:15', '21:30', '21:45',
                    '22:00', '22:15', '22:30', '22:45',
                    '23:00', '23:15', '23:30', '23:45'
                  ].map(time => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Address and City */}
          <div className="space-y-2">
            <Label htmlFor="address">Adresa *</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              disabled={isOrganizationSelected}
              required
            />
            {isOrganizationSelected && (
              <span className="text-sm text-gray-500">
                Adresa se automatski popunjava iz odabranog udruženja
              </span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Grad *</Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              disabled={isOrganizationSelected}
              required
            />
            {isOrganizationSelected && (
              <span className="text-sm text-gray-500">
                Mjesto se automatski popunjava iz odabranog udruženja
              </span>
            )}
          </div>

          {/* Weekly Lecture Options */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="weeklyLecture"
              checked={showWeeklyOptions}
              onCheckedChange={(checked) => {
                setShowWeeklyOptions(checked);
                setFormData(prev => ({ ...prev, isWeeklyLecture: checked }));
              }}
            />
            <Label htmlFor="weeklyLecture">
              Sedmično predavanje (ponavlja se svake sedmice)
            </Label>
          </div>

          {showWeeklyOptions && (
            <div className="space-y-2 pl-6">
              <Label htmlFor="totalWeeks">Broj sedmica</Label>
              <Input
                id="totalWeeks"
                name="totalWeeks"
                type="number"
                min="2"
                max="52"
                value={formData.totalWeeks}
                onChange={handleChange}
                placeholder="Npr. 4"
              />
              <span className="text-sm text-gray-500">
                Predavanje će se ponavljati {formData.totalWeeks} sedmica
              </span>
            </div>
          )}


          {/* Form Actions */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Otkaži
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Spremanje...' : (isEditMode ? 'Sačuvaj izmjene' : 'Dodaj predavanje')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    
    {/* Existing Images Modal */}
    <Dialog open={showExistingImages} onOpenChange={setShowExistingImages}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Odaberite postojeću sliku</DialogTitle>
          <DialogDescription>
            Kliknite na sliku koju želite koristiti za predavanje
          </DialogDescription>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[60vh] p-4">
          {existingImages.length > 0 ? (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {existingImages.map((img, index) => (
                <div
                  key={index}
                  className="relative cursor-pointer group"
                  onClick={() => {
                    setSelectedExistingImage(img.url);
                    const imageUrl = img.url.startsWith('http') ? img.url : getImageUrl(img.url);
                    setImagePreview(imageUrl);
                    setFormData(prev => ({ ...prev, image: img.url }));
                    setImageFile(null);
                    setShowExistingImages(false);
                  }}
                >
                  <div className={`border-2 rounded-lg overflow-hidden transition-all ${
                    selectedExistingImage === img.url 
                      ? 'border-blue-500 ring-2 ring-blue-200' 
                      : 'border-gray-200 hover:border-blue-400'
                  }`}>
                    <Image
                      src={img.url.startsWith('http') ? img.url : getImageUrl(img.url)}
                      alt={img.name}
                      width={200}
                      height={150}
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-2 bg-white">
                      <p className="text-xs text-gray-600 truncate">{img.name}</p>
                    </div>
                  </div>
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity rounded-lg pointer-events-none" />
                  
                  {/* Check mark for selected */}
                  {selectedExistingImage === img.url && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-2 text-sm text-gray-500">Nema dostupnih slika</p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowExistingImages(false)}>
            Zatvori
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    
    {/* Existing Images Modal */}
    <Dialog open={showExistingImages} onOpenChange={setShowExistingImages}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Odaberite postojeću sliku</DialogTitle>
          <DialogDescription>
            Kliknite na sliku koju želite koristiti za predavanje
          </DialogDescription>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[60vh] p-4">
          {existingImages.length > 0 ? (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {existingImages.map((img, index) => (
                <div
                  key={index}
                  className="relative cursor-pointer group"
                  onClick={() => {
                    setSelectedExistingImage(img.url);
                    const imageUrl = img.url.startsWith('http') ? img.url : getImageUrl(img.url);
                    setImagePreview(imageUrl);
                    setFormData(prev => ({ ...prev, image: img.url }));
                    setImageFile(null);
                    setShowExistingImages(false);
                  }}
                >
                  <div className={`border-2 rounded-lg overflow-hidden transition-all ${
                    selectedExistingImage === img.url 
                      ? 'border-blue-500 ring-2 ring-blue-200' 
                      : 'border-gray-200 hover:border-blue-400'
                  }`}>
                    <Image
                      src={img.url.startsWith('http') ? img.url : getImageUrl(img.url)}
                      alt={img.name}
                      width={200}
                      height={150}
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-2 bg-white">
                      <p className="text-xs text-gray-600 truncate">{img.name}</p>
                    </div>
                  </div>
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity rounded-lg pointer-events-none" />
                  
                  {/* Check mark for selected */}
                  {selectedExistingImage === img.url && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-2 text-sm text-gray-500">Nema dostupnih slika</p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowExistingImages(false)}>
            Zatvori
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default LectureFormNew;
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
  const [showSeminarOptions, setShowSeminarOptions] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    speaker: '',
    daijaId: '',
    daijaIds: [],  // Dodano za podršku više daija
    customSpeakers: [],  // Za prilagođene predavače
    organization: '',
    organizationId: '',
    date: '',
    time: '18:00',
    address: '',
    city: '',
    description: '',
    image: null,
    isWeeklyLecture: false,
    totalWeeks: 4,
    // Seminar fields
    isSeminar: false,
    endDate: ''
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
      setShowSeminarOptions(existingLecture.isSeminar || false);
      
      // Provjeri da li postojeće predavanje ima više daija
      const daijaIds = existingLecture.daijaIds || [];
      const customSpeakers = existingLecture.customSpeakers || [];
      
      // Ako nema novo polje daijaIds, koristi staru logiku
      if (daijaIds.length === 0 && existingLecture.daija) {
        daijaIds.push(existingLecture.daija._id || existingLecture.daija);
      }
      if (customSpeakers.length === 0 && isCustomSpeaker && existingLecture.speaker) {
        customSpeakers.push(existingLecture.speaker);
      }
      
      setFormData({
        title: existingLecture.title || '',
        speaker: '',
        daijaId: !isCustomSpeaker && existingLecture.daija ? existingLecture.daija._id : '',
        daijaIds: daijaIds,
        customSpeakers: customSpeakers,
        organization: isCustomOrg ? (existingLecture.organization || '') : '',
        organizationId: !isCustomOrg && existingLecture.organizationId ? 
          (typeof existingLecture.organizationId === 'object' ? 
            existingLecture.organizationId._id : 
            existingLecture.organizationId) : '',
        date: existingLecture.date ? existingLecture.date.split('T')[0] : '',
        time: existingLecture.time || '18:00',
        address: existingLecture.address || '',
        city: existingLecture.city || '',
        description: existingLecture.description || '',
        image: existingLecture.image || null,
        isWeeklyLecture: existingLecture.isWeeklyLecture || false,
        totalWeeks: existingLecture.totalWeeks || 4,
        // Seminar polja
        isSeminar: existingLecture.isSeminar || false,
        endDate: existingLecture.endDate ? existingLecture.endDate.split('T')[0] : ''
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

  // Fetch daije and organizations
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [daijeResponse, orgsResponse] = await Promise.all([
          daijeService.getAllDaije(),
          udruzenjaService.getAllUdruzenja()
        ]);
        
        if (daijeResponse) {
          console.log('📚 [LectureFormNew] Fetched', daijeResponse.length, 'daije');
          setDaije(Array.isArray(daijeResponse) ? daijeResponse : []);
        }
        if (orgsResponse) {
          console.log('🏢 [LectureFormNew] Fetched', orgsResponse.length, 'organizations');
          setOrganizations(Array.isArray(orgsResponse) ? orgsResponse : []);
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
    setError(null);
    
    // Validacija obaveznih polja
    const missingFields = [];
    
    if (!formData.title.trim()) {
      missingFields.push('Naslov predavanja');
    }
    
    // Provjeri da li ima bar jedan daija ili prilagođeni predavač
    if (formData.daijaIds.length === 0 && formData.customSpeakers.length === 0) {
      missingFields.push('Daija/Predavač (morate dodati bar jednog)');
    }
    
    if (!useCustomOrganization && !formData.organizationId) {
      missingFields.push('Organizator');
    } else if (useCustomOrganization && !formData.organization.trim()) {
      missingFields.push('Naziv organizacije');
    }
    
    if (!formData.date) {
      missingFields.push('Datum');
    }
    
    if (!formData.time.trim()) {
      missingFields.push('Vrijeme');
    }
    
    if (!formData.address.trim()) {
      missingFields.push('Adresa');
    }
    
    if (!formData.city.trim()) {
      missingFields.push('Grad');
    }
    
    if (missingFields.length > 0) {
      setError(`Molimo popunite sljedeća polja: ${missingFields.join(', ')}`);
      return;
    }
    
    // Validacija za seminare
    if (formData.isSeminar) {
      if (!formData.endDate) {
        setError('Datum završetka je obavezan za seminare');
        return;
      }
    }
    
    setLoading(true);
    
    try {
      let imageUrl = formData.image;
      
      // Upload image if new one selected
      if (imageFile) {
        try {
          const uploadResult = await uploadImage(imageFile);
          // uploadImage returns an object with { success, path, ... }
          if (uploadResult && uploadResult.path) {
            imageUrl = uploadResult.path;
            console.log('Image uploaded successfully:', imageUrl);
          } else {
            throw new Error('Upload result missing path');
          }
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
        // Pošalji sve daije i prilagođene predavače
        daijaIds: formData.daijaIds,
        customSpeakers: formData.customSpeakers,
        // Za kompatibilnost sa starim kodom, postavi prvi daija kao glavni
        daija: formData.daijaIds.length > 0 ? formData.daijaIds[0] : null,
        daijaId: formData.daijaIds.length > 0 ? formData.daijaIds[0] : null,
        speaker: formData.customSpeakers.length > 0 ? formData.customSpeakers.join(', ') : '',
        organization: useCustomOrganization ? formData.organization : '',
        organizationId: useCustomOrganization ? null : formData.organizationId,
        // Seminar podaci
        ...(formData.isSeminar && {
          isSeminar: true,
          endDate: formData.endDate,
          seminarTheme: formData.title, // Tema se uzima iz naslova
          totalDays: (() => {
            if (formData.date && formData.endDate) {
              const start = new Date(formData.date);
              const end = new Date(formData.endDate);
              const diffTime = Math.abs(end - start);
              return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            }
            return 1;
          })()
        })
      };
      
      let response;
      if (isEditMode && existingLecture) {
        response = await axiosInstance.put(`/lectures/${existingLecture._id}`, dataToSend);
      } else {
        response = await axiosInstance.post('/lectures', dataToSend);
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
      daijaIds: [],
      customSpeakers: [],
      organization: '',
      organizationId: '',
      date: '',
      time: '18:00',
      address: '',
      city: '',
      description: '',
      image: null,
      isWeeklyLecture: false,
      totalWeeks: 4,
      // Seminar fields
      isSeminar: false,
      endDate: ''
    });
    setImageFile(null);
    setImagePreview(null);
    setUseCustomSpeaker(false);
    setUseCustomOrganization(false);
    setShowWeeklyOptions(false);
    setShowSeminarOptions(false);
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
            {isEditMode ? 
              (showSeminarOptions ? 'Uredi seminar' : 'Uredi predavanje') : 
              (showSeminarOptions ? 'Dodaj novi seminar' : 'Dodaj novo predavanje')}
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
                    setFormData(prev => ({ ...prev, image: null }));
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            
            {/* Upload new image - prikaži samo ako nema slike */}
            {!imagePreview && (
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
            )}
            
            
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
            <Label htmlFor="title">Naslov predavanja ili seminara *</Label>
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


          {/* Multiple Speakers Section */}
          <div className="space-y-2">
            <Label>Daije / Predavači *</Label>
            
            {/* List of added speakers */}
            {formData.daijaIds.length > 0 || formData.customSpeakers.length > 0 ? (
              <div className="space-y-2 mb-2">
                {/* Existing daije */}
                {formData.daijaIds.map((daijaId, index) => {
                  const daija = daije.find(d => d._id === daijaId);
                  return daija ? (
                    <div key={`daija-${index}`} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm">{daija.name}{daija.title ? ` (${daija.title})` : ''}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            daijaIds: prev.daijaIds.filter((_, i) => i !== index)
                          }));
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : null;
                })}
                
                {/* Custom speakers */}
                {formData.customSpeakers.map((speaker, index) => (
                  <div key={`speaker-${index}`} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm">{speaker}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          customSpeakers: prev.customSpeakers.filter((_, i) => i !== index)
                        }));
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : null}
            
            {/* Add speaker interface */}
            {!useCustomSpeaker ? (
              <Select
                value=""
                onValueChange={(value) => {
                  if (value === 'custom') {
                    setUseCustomSpeaker(true);
                  } else if (value) {
                    setFormData(prev => ({
                      ...prev,
                      daijaIds: [...prev.daijaIds, value]
                    }));
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Odaberi daiju..." />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  {daije
                    .filter(d => !formData.daijaIds.includes(d._id))
                    .map(daija => (
                      <SelectItem key={daija._id} value={daija._id}>
                        {daija.name}{daija.title ? ` (${daija.title})` : ''}
                      </SelectItem>
                    ))}
                  <SelectItem value="custom">➕ Unesi prilagođeno ime...</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="flex gap-2">
                  <Input
                    placeholder="Unesite ime predavača..."
                    value={formData.speaker}
                    onChange={(e) => setFormData(prev => ({ ...prev, speaker: e.target.value }))}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && formData.speaker.trim()) {
                        e.preventDefault();
                        setFormData(prev => ({
                          ...prev,
                          customSpeakers: [...prev.customSpeakers, prev.speaker.trim()],
                          speaker: ''
                        }));
                        setUseCustomSpeaker(false);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      if (formData.speaker.trim()) {
                        setFormData(prev => ({
                          ...prev,
                          customSpeakers: [...prev.customSpeakers, prev.speaker.trim()],
                          speaker: ''
                        }));
                        setUseCustomSpeaker(false);
                      }
                    }}
                  >
                    Dodaj
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setUseCustomSpeaker(false);
                      setFormData(prev => ({ ...prev, speaker: '' }));
                    }}
                  >
                    Otkaži
                  </Button>
              </div>
            )}
            
            {/* Add more button */}
            {(formData.daijaIds.length > 0 || formData.customSpeakers.length > 0) && !useCustomSpeaker && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {}}
              >
                + Dodaj još jednog daiju
              </Button>
            )}
          </div>

          {/* Organization Selection */}
          <div className="space-y-2">
            <Label htmlFor="organization">Organizator *</Label>
            {!useCustomOrganization ? (
              <Select
                value={formData.organizationId}
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
              >
                <SelectTrigger>
                  <SelectValue placeholder="Odaberi organizatora..." />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  {organizations.map(org => (
                    <SelectItem key={org._id} value={org._id}>
                      {org.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">➕ Unesi prilagođeni naziv...</SelectItem>
                </SelectContent>
              </Select>
            ) : null}
          </div>

          {/* Custom Organization Input */}
          {useCustomOrganization && (
            <div className="space-y-2">
              <Label htmlFor="customOrganization">Naziv organizatora</Label>
              <Input
                id="customOrganization"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                placeholder="Unesite naziv organizatora..."
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
                Adresa se automatski popunjava iz odabranog organizatora
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
                Mjesto se automatski popunjava iz odabranog organizatora
              </span>
            )}
          </div>

          {/* Weekly Lecture Options */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="weeklyLecture"
              checked={showWeeklyOptions}
              disabled={showSeminarOptions}
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

          {/* Seminar Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="seminar"
              checked={showSeminarOptions}
              disabled={showWeeklyOptions}
              onCheckedChange={(checked) => {
                setShowSeminarOptions(checked);
                setFormData(prev => ({ ...prev, isSeminar: checked }));
              }}
            />
            <Label htmlFor="seminar" className="font-bold text-amber-600">
              Seminar (događaj koji traje više dana)
            </Label>
          </div>

          {/* Seminar Options */}
          {showSeminarOptions && (
            <div className="space-y-4 pl-6 border-l-4 border-amber-400">
              <div className="space-y-2">
                <Label htmlFor="endDate">Datum završetka seminara</Label>
                <DatePickerFixed
                  value={formData.endDate}
                  onChange={(formattedDate) => {
                    setFormData(prev => ({ ...prev, endDate: formattedDate }));
                  }}
                  isEditing={isEditMode}
                  placeholder="Izaberite datum završetka"
                />
              </div>

              <div className="space-y-2">
                <Label>Trajanje seminara</Label>
                <div className="p-3 bg-gray-50 rounded-md">
                  <span className="text-sm font-medium text-gray-700">
                    {formData.date && formData.endDate ? (
                      (() => {
                        const start = new Date(formData.date);
                        const end = new Date(formData.endDate);
                        const diffTime = Math.abs(end - start);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                        return `Seminar će trajati ${diffDays} ${diffDays === 1 ? 'dan' : diffDays < 5 ? 'dana' : 'dana'}`;
                      })()
                    ) : (
                      'Izaberite datume početka i završetka'
                    )}
                  </span>
                </div>
              </div>
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
              {loading ? 'Spremanje...' : (isEditMode ? 'Sačuvaj izmjene' : (showSeminarOptions ? 'Dodaj seminar' : 'Dodaj predavanje'))}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default LectureFormNew;
import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { DatePickerFixed } from '@/components/ui/date-picker-fixed';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Combobox } from '@/components/ui/combobox';
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
import { 
  CloudUpload, 
  X, 
  Plus, 
  Trash2,
  Facebook,
  Instagram,
  MessageCircle
} from 'lucide-react';
import axiosInstance from '../utils/axiosConfig';
import { getImageUrl } from '../utils/imageUtils';
import { uploadImage } from '../utils/uploadService';
import { daijeService, udruzenjaService } from '@/services';

const UnifiedFormNew = ({ 
  open, 
  onClose, 
  onSuccess, 
  type, // 'lecture', 'daija', 'organization'
  data = null, // existing data for editing
  approvalEnabled = true,
  daije = [], // for lecture form
  organizations = [] // for lecture form
}) => {
  const fileInputRef = useRef(null);
  const defaultsSet = useRef(false);
  
  // Initialize form data based on type
  const getInitialFormData = useCallback(() => {
    switch (type) {
      case 'lecture':
        return {
          title: '',
          description: '',
          shortDescription: '',
          date: '',
          time: '',
          address: '',
          city: '',
          speaker: '',
          daijaId: '',
          organization: '',
          organizationId: '',
          image: ''
        };
      case 'daija':
        return {
          name: '',
          title: 'prof',
          biography: '',
          image: '',
          status: 'pending',
          education: [],
          facebook: '',
          viber: '',
          telegram: ''
        };
      case 'organization':
        return {
          name: '',
          description: '',
          address: '',
          city: '',
          facebook: '',
          instagram: '',
          telegram: '',
          viber: '',
          status: 'pending',
          image: ''
        };
      default:
        return {};
    }
  }, [type]);

  const [formData, setFormData] = useState(getInitialFormData());
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useCustomSpeaker, setUseCustomSpeaker] = useState(false);
  const [useCustomOrganization, setUseCustomOrganization] = useState(false);
  const [fetchedDaije, setFetchedDaije] = useState([]);
  const [fetchedOrganizations, setFetchedOrganizations] = useState([]);

  // Fetch daije and organizations for lecture form
  useEffect(() => {
    const fetchData = async () => {
      if (type === 'lecture' && open) {
        try {
          const [daijeResponse, orgsResponse] = await Promise.all([
            daijeService.getAllDaije(),
            udruzenjaService.getAllUdruzenja()
          ]);
          
          if (daijeResponse) {
            console.log('📚 [UnifiedFormNew] Fetched', daijeResponse.length, 'daije');
            setFetchedDaije(Array.isArray(daijeResponse) ? daijeResponse : []);
          }
          if (orgsResponse) {
            console.log('🏢 [UnifiedFormNew] Fetched', orgsResponse.length, 'organizations');
            setFetchedOrganizations(Array.isArray(orgsResponse) ? orgsResponse : []);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    };
    
    fetchData();
  }, [type, open]);

  // Set default date for lectures
  useEffect(() => {
    if (type === 'lecture' && !data && !defaultsSet.current && typeof window !== 'undefined') {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      
      setFormData(prev => ({
        ...prev,
        date: `${year}-${month}-${day}`,
        time: '19:00'
      }));
      defaultsSet.current = true;
    }
  }, [type, data]);

  // Initialize form with existing data
  useEffect(() => {
    if (data) {
      if (type === 'lecture') {
        const isCustomSpeaker = !data.daija;
        const isCustomOrg = !data.organizationId;
        
        setUseCustomSpeaker(isCustomSpeaker);
        setUseCustomOrganization(isCustomOrg);
        
        setFormData({
          title: data.title || '',
          description: data.description || '',
          shortDescription: data.shortDescription || '',
          date: data.date ? data.date.split('T')[0] : '',
          time: data.time || '',
          address: data.address || '',
          city: data.city || '',
          speaker: isCustomSpeaker ? (data.speaker || '') : '',
          daijaId: !isCustomSpeaker && data.daija ? data.daija._id : '',
          organization: isCustomOrg ? (data.organization || '') : '',
          organizationId: !isCustomOrg && data.organizationId ? 
            (typeof data.organizationId === 'object' ? 
              data.organizationId._id : 
              data.organizationId) : '',
          image: data.image || ''
        });
      } else if (type === 'daija') {
        setFormData({
          name: data.name || '',
          title: data.title || 'prof',
          biography: data.biography || '',
          image: data.image || '',
          status: data.status || 'pending',
          education: data.education || [],
          facebook: data.facebook || '',
          viber: data.viber || '',
          telegram: data.telegram || ''
        });
      } else if (type === 'organization') {
        setFormData({
          name: data.name || '',
          description: data.description || '',
          address: data.address || '',
          city: data.city || '',
          facebook: data.facebook || '',
          instagram: data.instagram || '',
          telegram: data.telegram || '',
          viber: data.viber || '',
          status: data.status || 'pending',
          image: data.image || ''
        });
      }
      
      if (data.image) {
        setImagePreview(getImageUrl(data.image));
      }
    }
  }, [data, type]);

  // Auto-fill organization fields for lectures
  useEffect(() => {
    if (type === 'lecture' && formData.organizationId && !useCustomOrganization) {
      // Use either passed props or fetched data
      const orgs = organizations && organizations.length > 0 ? organizations : fetchedOrganizations;
      const selectedOrg = orgs.find(org => org._id === formData.organizationId);
      if (selectedOrg) {
        setFormData(prev => ({
          ...prev,
          address: selectedOrg.address || prev.address,
          city: selectedOrg.city || prev.city
        }));
      }
    }
  }, [formData.organizationId, organizations, fetchedOrganizations, type, useCustomOrganization]);

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

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Daija-specific handlers
  const handleAddEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { degree: '', field: '', institution: '', year: '' }]
    }));
  };

  const handleEducationChange = (index, field, value) => {
    const newEducation = [...formData.education];
    newEducation[index][field] = value;
    setFormData(prev => ({ ...prev, education: newEducation }));
  };

  const handleRemoveEducation = (index) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
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
          setIsSubmitting(false);
          return;
        }
      }
      
      let endpoint, method, dataToSend;
      
      switch (type) {
        case 'lecture':
          endpoint = data ? `/api/lectures/${data._id}` : '/api/lectures';
          method = data ? 'put' : 'post';
          dataToSend = {
            ...formData,
            image: imageUrl,
            daija: useCustomSpeaker ? null : formData.daijaId,
            daijaId: useCustomSpeaker ? null : formData.daijaId,
            speaker: useCustomSpeaker ? formData.speaker : '',
            organization: useCustomOrganization ? formData.organization : '',
            organizationId: useCustomOrganization ? null : formData.organizationId,
          };
          break;
          
        case 'daija':
          endpoint = data ? `/api/daije/${data._id}` : '/api/daije';
          method = data ? 'put' : 'post';
          dataToSend = {
            ...formData,
            image: imageUrl
          };
          break;
          
        case 'organization':
          endpoint = data ? `/api/organizations/${data._id}` : '/api/organizations';
          method = data ? 'put' : 'post';
          dataToSend = {
            ...formData,
            image: imageUrl
          };
          break;
          
        default:
          throw new Error('Invalid form type');
      }
      
      const response = await axiosInstance[method](endpoint, dataToSend);
      
      setSuccess(true);
      setTimeout(() => {
        onSuccess(response.data);
        handleClose();
      }, 1500);
    } catch (error) {
      console.error('Error saving:', error);
      setError(error.response?.data?.message || 'Greška pri spremanju');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData(getInitialFormData());
    setImageFile(null);
    setImagePreview(null);
    setError(null);
    setSuccess(false);
    setUseCustomSpeaker(false);
    setUseCustomOrganization(false);
    defaultsSet.current = false;
    onClose();
  };

  const getDialogTitle = () => {
    const titles = {
      lecture: data ? 'Uredi predavanje' : 'Dodaj novo predavanje',
      daija: data ? 'Uredi daiju' : 'Dodaj novu daiju',
      organization: data ? 'Uredi udruženje' : 'Dodaj novo udruženje'
    };
    return titles[type] || '';
  };

  const isOrganizationSelected = type === 'lecture' && Boolean(formData.organizationId && !useCustomOrganization);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
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
                Uspješno {data ? 'ažurirano' : 'dodano'}!
              </AlertDescription>
            </Alert>
          )}

          {/* Image Upload - Common for all types */}
          <div className="space-y-2">
            <Label>Slika</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                ref={fileInputRef}
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <label htmlFor="image-upload" className="cursor-pointer block">
                {imagePreview ? (
                  <div className="space-y-2">
                    <div className="relative inline-block">
                      <Image
                        src={imagePreview}
                        alt="Pregled"
                        width={400}
                        height={200}
                        className="max-w-full max-h-[200px] rounded object-contain mx-auto"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeImage();
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <CloudUpload className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-500">
                        Kliknite za promjenu slike
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <CloudUpload className="h-12 w-12 mx-auto text-gray-400" />
                    <div className="text-gray-600">
                      Kliknite za dodavanje slike
                    </div>
                    <div className="text-sm text-gray-500">
                      ili prevucite sliku ovdje
                    </div>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Lecture Form Fields */}
          {type === 'lecture' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="title">Naslov predavanja *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription">Kratki opis</Label>
                <Textarea
                  id="shortDescription"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Kratki opis predavanja..."
                />
              </div>

              {/* Speaker Selection */}
              <div className="space-y-2">
                <Label>Daija *</Label>
                {!useCustomSpeaker ? (
                  <Combobox
                    options={[
                      ...(daije && daije.length > 0 ? daije : fetchedDaije).map(daija => ({
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
                        const allDaije = daije && daije.length > 0 ? daije : fetchedDaije;
                        const selectedDaija = allDaije.find(d => d._id === value);
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
                ) : (
                  <Input
                    id="speaker"
                    name="speaker"
                    value={formData.speaker}
                    onChange={handleChange}
                    placeholder="Unesite ime predavača..."
                    required={useCustomSpeaker}
                  />
                )}
              </div>

              {/* Organization Selection */}
              <div className="space-y-2">
                <Label>Organizator</Label>
                {!useCustomOrganization ? (
                  <Combobox
                    options={[
                      ...(organizations && organizations.length > 0 ? organizations : fetchedOrganizations).map(org => ({
                        value: org._id,
                        label: org.name
                      })),
                      { value: 'custom', label: 'Unesi prilagođeni naziv...' }
                    ]}
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
                        const allOrgs = organizations && organizations.length > 0 ? organizations : fetchedOrganizations;
                        const selectedOrg = allOrgs.find(o => o._id === value);
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
                    searchPlaceholder="Pretraži organizatore..."
                    emptyText="Nema pronađenih organizatora"
                  />
                ) : (
                  <Input
                    id="organization"
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    placeholder="Unesite naziv organizatora..."
                  />
                )}
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Datum *</Label>
                  <DatePickerFixed
                    value={formData.date}
                    onChange={(formattedDate) => {
                      setFormData(prev => ({ ...prev, date: formattedDate }));
                    }}
                    isEditing={!!data}
                    placeholder="Izaberite datum"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Vrijeme *</Label>
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
                      {(() => {
                        const times = [];
                        for (let hour = 8; hour <= 22; hour++) {
                          times.push(`${hour.toString().padStart(2, '0')}:00`);
                          if (hour < 22) {
                            times.push(`${hour.toString().padStart(2, '0')}:30`);
                          }
                        }
                        return times.map(time => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ));
                      })()}
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
            </>
          )}

          {/* Daija Form Fields */}
          {type === 'daija' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Ime i prezime *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Titula</Label>
                <RadioGroup
                  value={formData.title}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, title: value }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="prof" id="prof" />
                    <Label htmlFor="prof">prof.</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dr" id="dr" />
                    <Label htmlFor="dr">dr.</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hafiz" id="hafiz" />
                    <Label htmlFor="hafiz">hafiz</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mr" id="mr" />
                    <Label htmlFor="mr">mr.</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="" id="none" />
                    <Label htmlFor="none">Bez titule</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="biography">Biografija</Label>
                <Textarea
                  id="biography"
                  name="biography"
                  value={formData.biography}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Ukratko o daiji..."
                />
              </div>

              {/* Education */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Obrazovanje</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddEducation}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Dodaj
                  </Button>
                </div>
                
                {formData.education.map((edu, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Obrazovanje {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEducation(index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Stepen (npr. Bachelor)"
                        value={edu.degree}
                        onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                      />
                      <Input
                        placeholder="Oblast (npr. Islamske studije)"
                        value={edu.field}
                        onChange={(e) => handleEducationChange(index, 'field', e.target.value)}
                      />
                      <Input
                        placeholder="Institucija"
                        value={edu.institution}
                        onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                      />
                      <Input
                        placeholder="Godina"
                        value={edu.year}
                        onChange={(e) => handleEducationChange(index, 'year', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Media Links */}
              <div className="space-y-3">
                <Label>Društvene mreže i kontakt</Label>
                
                <div className="flex gap-2">
                  <Facebook className="h-5 w-5 mt-2 text-gray-500" />
                  <Input
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleChange}
                    placeholder="Facebook link"
                    type="url"
                  />
                </div>
                
                <div className="flex gap-2">
                  <MessageCircle className="h-5 w-5 mt-2 text-gray-500" />
                  <Input
                    name="viber"
                    value={formData.viber}
                    onChange={handleChange}
                    placeholder="Viber grupa/kanal"
                    type="url"
                  />
                </div>
                
                <div className="flex gap-2">
                  <MessageCircle className="h-5 w-5 mt-2 text-gray-500" />
                  <Input
                    name="telegram"
                    value={formData.telegram}
                    onChange={handleChange}
                    placeholder="Telegram kanal"
                    type="url"
                  />
                </div>
              </div>
            </>
          )}

          {/* Organization Form Fields */}
          {type === 'organization' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Naziv udruženja *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Opis</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Opis udruženja..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adresa *</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Grad *</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Social Media */}
              <div className="space-y-3">
                <Label>Društvene mreže</Label>
                
                <div className="flex gap-2">
                  <Facebook className="h-5 w-5 mt-2 text-gray-500" />
                  <Input
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleChange}
                    placeholder="Facebook stranica"
                    type="url"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Instagram className="h-5 w-5 mt-2 text-gray-500" />
                  <Input
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    placeholder="Instagram profil"
                    type="url"
                  />
                </div>
                
                <div className="flex gap-2">
                  <MessageCircle className="h-5 w-5 mt-2 text-gray-500" />
                  <Input
                    name="telegram"
                    value={formData.telegram}
                    onChange={handleChange}
                    placeholder="Telegram grupa"
                    type="url"
                  />
                </div>
                
                <div className="flex gap-2">
                  <MessageCircle className="h-5 w-5 mt-2 text-gray-500" />
                  <Input
                    name="viber"
                    value={formData.viber}
                    onChange={handleChange}
                    placeholder="Viber grupa"
                    type="url"
                  />
                </div>
              </div>
            </>
          )}

          {/* Form Actions */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Otkaži
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Spremanje...' : (data ? 'Sačuvaj izmjene' : 'Dodaj')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UnifiedFormNew;
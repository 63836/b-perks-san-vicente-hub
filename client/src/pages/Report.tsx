import { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Header, BottomNavigation } from '@/components/ui/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { authStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { MapPin, Camera, Send, X, Search, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// San Vicente location database
const sanVicenteLocations = [
  { id: '1', name: 'Barangay Hall San Vicente', lat: 16.4023, lng: 120.5960 },
  { id: '2', name: 'San Vicente Elementary School', lat: 16.4018, lng: 120.5955 },
  { id: '3', name: 'San Vicente Health Center', lat: 16.4025, lng: 120.5965 },
  { id: '4', name: 'San Vicente Plaza', lat: 16.4020, lng: 120.5962 },
  { id: '5', name: 'San Vicente Chapel', lat: 16.4015, lng: 120.5958 },
  { id: '6', name: 'Purok 1 - Main Road', lat: 16.4030, lng: 120.5950 },
  { id: '7', name: 'Purok 2 - Residential Area', lat: 16.4035, lng: 120.5970 },
  { id: '8', name: 'Purok 3 - Upper San Vicente', lat: 16.4040, lng: 120.5945 },
  { id: '9', name: 'Purok 4 - Lower San Vicente', lat: 16.4010, lng: 120.5975 },
  { id: '10', name: 'San Vicente Market Area', lat: 16.4028, lng: 120.5968 },
  { id: '11', name: 'San Vicente Basketball Court', lat: 16.4022, lng: 120.5963 },
  { id: '12', name: 'Upper Bonifacio Street', lat: 16.4045, lng: 120.5940 },
  { id: '13', name: 'Lower Bonifacio Street', lat: 16.4005, lng: 120.5980 },
  { id: '14', name: 'Rizal Street San Vicente', lat: 16.4032, lng: 120.5952 },
  { id: '15', name: 'Del Pilar Street', lat: 16.4038, lng: 120.5948 },
  { id: '16', name: 'San Vicente Bridge Area', lat: 16.4012, lng: 120.5972 },
  { id: '17', name: 'Community Garden San Vicente', lat: 16.4026, lng: 120.5966 },
  { id: '18', name: 'San Vicente Water Station', lat: 16.4024, lng: 120.5961 },
  { id: '19', name: 'San Vicente Senior Center', lat: 16.4019, lng: 120.5959 },
  { id: '20', name: 'Main Entrance San Vicente', lat: 16.4033, lng: 120.5953 }
];

export default function Report() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const user = authStore.getCurrentUser();
  
  const [reportData, setReportData] = useState({
    title: '',
    description: '',
    location: 'San Vicente, Baguio City', // Default location
    lat: 16.4023,
    lng: 120.5960,
  });
  const [showLocationPreview, setShowLocationPreview] = useState(true);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationSearch, setLocationSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{id: string, name: string, lat: number, lng: number}>>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [mapInteractive, setMapInteractive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setReportData(prev => ({
            ...prev,
            lat: latitude,
            lng: longitude,
            location: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`
          }));
        },
        (error) => {
          console.log('Geolocation error:', error);
          // Keep default location if geolocation fails
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    }
  }, []);

  // Handle location search and suggestions
  const handleLocationSearch = (value: string) => {
    setLocationSearch(value);
    
    if (value.length > 2) {
      const filtered = sanVicenteLocations.filter(location =>
        location.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 8)); // Limit to 8 suggestions
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectLocation = (location: typeof sanVicenteLocations[0]) => {
    setReportData(prev => ({
      ...prev,
      location: location.name,
      lat: location.lat,
      lng: location.lng
    }));
    setLocationSearch(location.name);
    setShowSuggestions(false);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setReportData(prev => ({
            ...prev,
            lat: latitude,
            lng: longitude,
            location: `GPS Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          }));
          setLocationSearch(`GPS Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          setUserLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          toast({
            title: "Location Error",
            description: "Unable to get your current location. Please select from suggestions.",
            variant: "destructive",
          });
        }
      );
    }
  };

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Map click handler component
  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        if (mapInteractive) {
          const { lat, lng } = e.latlng;
          setReportData(prev => ({
            ...prev,
            lat: lat,
            lng: lng,
            location: `Custom Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`
          }));
          setLocationSearch(`Custom Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          setShowSuggestions(false);
        }
      },
    });
    return null;
  };

  const toggleMapInteraction = () => {
    setMapInteractive(!mapInteractive);
    if (!mapInteractive) {
      setShowSuggestions(false);
    }
  };

  const submitReportMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return fetch('/api/reports', {
        method: 'POST',
        body: formData,
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reports'] });
      toast({
        title: "Report Submitted",
        description: "Your report has been submitted successfully! The Barangay will review your concern.",
      });
      
      // Reset form
      setReportData({
        title: '',
        description: '',
        location: 'San Vicente, Baguio City',
        lat: 16.4023,
        lng: 120.5960,
      });
      setLocationSearch('');
      setSelectedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setReportData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reportData.title.trim() || !reportData.description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit a report",
        variant: "destructive",
      });
      return;
    }

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('userId', user.id.toString());
    formData.append('title', reportData.title.trim());
    formData.append('description', reportData.description.trim());
    formData.append('locationAddress', reportData.location);
    formData.append('locationLat', reportData.lat.toString());
    formData.append('locationLng', reportData.lng.toString());
    formData.append('status', 'pending');
    
    // Add image if selected
    if (selectedImage) {
      formData.append('image', selectedImage);
    }

    submitReportMutation.mutate(formData);
  };

  const handleCancel = () => {
    setReportData({
      title: '',
      description: '',
      location: 'San Vicente, Baguio City',
      lat: 16.4023,
      lng: 120.5960,
    });
    setLocationSearch('');
    setShowSuggestions(false);
    setMapInteractive(false);
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Submit Report" />

      <div className="p-4 space-y-6">
        {/* Location Preview */}
        {showLocationPreview && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-primary" />
                  Current Location
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLocationPreview(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="aspect-video rounded-lg overflow-hidden mb-3 relative">
                  <MapContainer
                    center={[reportData.lat, reportData.lng]}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                    className={`rounded-lg ${mapInteractive ? 'cursor-crosshair' : 'cursor-default'}`}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapClickHandler />
                    <Marker position={[reportData.lat, reportData.lng]}>
                      <Popup>
                        <div className="text-center">
                          <MapPin className="h-4 w-4 mx-auto mb-1" />
                          <strong>Report Location</strong>
                          <br />
                          <small>
                            {mapInteractive ? 'Click anywhere to move marker' : 
                             userLocation ? 'Your GPS Location' : 'Selected Location'}
                          </small>
                          <br />
                          <small className="text-xs text-muted-foreground">
                            {reportData.lat.toFixed(4)}, {reportData.lng.toFixed(4)}
                          </small>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                  
                  {/* Map Interaction Toggle */}
                  <div className="absolute top-2 right-2 z-[1000]">
                    <Button
                      type="button"
                      size="sm"
                      variant={mapInteractive ? "default" : "outline"}
                      onClick={toggleMapInteraction}
                      className="bg-background/90 backdrop-blur-sm"
                    >
                      <MapPin className="h-4 w-4 mr-1" />
                      {mapInteractive ? 'Click Map' : 'Set Location'}
                    </Button>
                  </div>
                  
                  {/* Interactive Map Instructions */}
                  {mapInteractive && (
                    <div className="absolute bottom-2 left-2 right-2 z-[1000]">
                      <div className="bg-primary/90 text-primary-foreground text-xs px-3 py-2 rounded-md backdrop-blur-sm">
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          Click anywhere on the map to set your exact location
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {reportData.location}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Lat: {reportData.lat}, Lng: {reportData.lng}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Report Form */}
        <Card>
          <CardHeader>
            <CardTitle>Report Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Issue Title *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Brief description of the issue"
                  value={reportData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Provide detailed information about the issue, including when it started, severity, and any other relevant details..."
                  value={reportData.description}
                  onChange={handleInputChange}
                  rows={4}
                  required
                />
              </div>

              {/* Smart Location Search */}
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <div className="relative">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        ref={searchInputRef}
                        id="location"
                        type="text"
                        placeholder="Search locations or click map to set exact position..."
                        value={locationSearch}
                        onChange={(e) => handleLocationSearch(e.target.value)}
                        className="pl-10"
                        onFocus={() => setShowSuggestions(suggestions.length > 0)}
                        disabled={mapInteractive}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={getCurrentLocation}
                      className="shrink-0"
                      disabled={mapInteractive}
                    >
                      <Navigation className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Location Suggestions Dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {suggestions.map((location) => (
                        <button
                          key={location.id}
                          type="button"
                          className="w-full px-4 py-2 text-left hover:bg-muted focus:bg-muted focus:outline-none text-sm"
                          onClick={() => selectLocation(location)}
                        >
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-primary" />
                            <span>{location.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Search for a location, use GPS, or click "Set Location" to point on the map
                </p>
              </div>

              {/* Photo Upload */}
              <div className="space-y-2">
                <Label htmlFor="photo">Add Photo (Optional)</Label>
                <div className="space-y-3">
                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Report preview"
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={removeImage}
                        className="absolute top-2 right-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  {/* Upload Button */}
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="photo-upload"
                      className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/75 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Camera className="w-6 h-6 mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {selectedImage ? 'Change photo' : 'Add photo of the issue'}
                        </p>
                      </div>
                      <input
                        ref={fileInputRef}
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Photos help officials understand the issue better. Max file size: 5MB
                </p>
              </div>

              {/* Photo Upload (Mock) */}
              <div className="space-y-2">
                <Label>Add Photo (Optional)</Label>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-24 border-dashed"
                  onClick={() => alert('Photo upload feature coming soon')}
                >
                  <div className="text-center">
                    <Camera className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Tap to add photo
                    </p>
                  </div>
                </Button>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1"
                  disabled={submitReportMutation.isPending}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={submitReportMutation.isPending}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {submitReportMutation.isPending ? 'Submitting...' : 'Submit Report'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Important Note */}
        <Card className="border-info/20 bg-info/5">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <div className="bg-info p-2 rounded-full">
                <MapPin className="h-4 w-4 text-info-foreground" />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-sm">Important Note</h4>
                <p className="text-sm text-muted-foreground">
                  Your location is automatically captured to help the Barangay respond effectively. 
                  Reports are reviewed within 24-48 hours. For emergencies, please call 911 or contact the Barangay directly.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
}
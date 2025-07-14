import { useState, useEffect } from 'react';
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
import { MapPin, Camera, Send, X } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

  const submitReportMutation = useMutation({
    mutationFn: (report: any) => apiRequest('/api/reports', {
      method: 'POST',
      body: JSON.stringify(report),
    }),
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

    const reportToSubmit = {
      userId: user.id,
      title: reportData.title.trim(),
      description: reportData.description.trim(),
      locationAddress: reportData.location,
      locationLat: reportData.lat,
      locationLng: reportData.lng,
      imageUrl: "/placeholder.svg", // Default placeholder for now
      status: 'pending',
    };

    submitReportMutation.mutate(reportToSubmit);
  };

  const handleCancel = () => {
    setReportData({
      title: '',
      description: '',
      location: 'San Vicente, Baguio City',
      lat: 16.4023,
      lng: 120.5960,
    });
  };

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
              <div className="aspect-video rounded-lg overflow-hidden mb-3">
                <MapContainer
                  center={[reportData.lat, reportData.lng]}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                  className="rounded-lg"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[reportData.lat, reportData.lng]}>
                    <Popup>
                      <div className="text-center">
                        <MapPin className="h-4 w-4 mx-auto mb-1" />
                        <strong>Report Location</strong>
                        <br />
                        <small>{userLocation ? 'Your GPS Location' : 'Default Location'}</small>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
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
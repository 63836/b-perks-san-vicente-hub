import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Header } from '@/components/ui/navigation';
import { useToast } from '@/hooks/use-toast';
import { notificationStore } from '@/store/notificationStore';
import { ArrowLeft, Upload, MapPin, Coins, Calendar } from 'lucide-react';
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

export default function CreateAnnouncement() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'announcement',
    imageFile: null as File | null,
    location: '',
    points: 0,
    startDate: '',
    endDate: '',
    coordinates: null as { lat: number; lng: number } | null
  });
  const [showMapDialog, setShowMapDialog] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let response;
      
      if (formData.type === 'event') {
        // Validate event-specific fields
        if (!formData.startDate || !formData.endDate || !formData.location || formData.points <= 0) {
          toast({
            title: "Error",
            description: "Please fill in all event fields including dates, location, and points.",
            variant: "destructive"
          });
          return;
        }
        
        // Create event
        response = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.title,
            description: formData.content,
            location: formData.location,
            locationLat: formData.locationLat,
            locationLng: formData.locationLng,
            pointsReward: formData.points,
            startDate: new Date(formData.startDate).toISOString(),
            endDate: new Date(formData.endDate).toISOString(),
            imageUrl: null
          })
        });
      } else {
        // Create announcement/news/alert
        response = await fetch('/api/news', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.title,
            content: formData.content,
            type: formData.type,
            authorId: 1 // Admin user ID
          })
        });
      }
      
      if (!response.ok) throw new Error(`Failed to create ${formData.type}`);
      
      toast({
        title: "Success",
        description: `${formData.type === 'event' ? 'Event' : 'Announcement'} created successfully!`,
      });
      
      // Add notification for users
      notificationStore.addNotification();
      
      setLocation('/admin/dashboard');
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to create ${formData.type}. Please try again.`,
        variant: "destructive"
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, imageFile: file }));
    }
  };

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setFormData(prev => ({
      ...prev,
      location: location.address,
      coordinates: { lat: location.lat, lng: location.lng }
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Create Announcement" />
      
      <div className="p-4 space-y-6">
        <Button 
          variant="outline" 
          onClick={() => setLocation('/admin/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Create New Content</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="type">Content Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="news">News</SelectItem>
                    <SelectItem value="alert">Alert</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="content">Content/Description</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter content or description"
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="image">Upload Image</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="flex-1"
                  />
                  <Upload className="h-4 w-4 text-muted-foreground" />
                </div>
                {formData.imageFile && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Selected: {formData.imageFile.name}
                  </p>
                )}
              </div>

              {formData.type === 'event' && (
                <>
                  <div>
                    <Label htmlFor="location">Event Location</Label>
                    <div className="border rounded-lg p-4 space-y-3">
                      {!formData.location ? (
                        <div className="text-center py-8">
                          <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                          <p className="text-sm text-muted-foreground mb-3">No location selected</p>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setShowMapDialog(true)}
                          >
                            <MapPin className="h-4 w-4 mr-2" />
                            Select Location on Map
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">Selected Location:</p>
                              <p className="text-xs text-muted-foreground">{formData.location}</p>
                            </div>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => setShowMapDialog(true)}
                            >
                              <MapPin className="h-4 w-4 mr-1" />
                              Change
                            </Button>
                          </div>
                          <div className="h-32 w-full rounded border overflow-hidden">
                            <MapContainer
                              center={formData.coordinates ? [formData.coordinates.lat, formData.coordinates.lng] : [16.4074, 120.5960]}
                              zoom={16}
                              style={{ height: '100%', width: '100%' }}
                              className="rounded-lg"
                              zoomControl={false}
                              scrollWheelZoom={false}
                              doubleClickZoom={false}
                              dragging={false}
                            >
                              <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                              />
                              {formData.coordinates && (
                                <Marker position={[formData.coordinates.lat, formData.coordinates.lng]}>
                                  <Popup>
                                    <div className="text-center">
                                      <MapPin className="h-4 w-4 mx-auto mb-1" />
                                      <strong>Event Location</strong>
                                    </div>
                                  </Popup>
                                </Marker>
                              )}
                            </MapContainer>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Start Date & Time</Label>
                      <Input
                        id="startDate"
                        type="datetime-local"
                        value={formData.startDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">End Date & Time</Label>
                      <Input
                        id="endDate"
                        type="datetime-local"
                        value={formData.endDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="points">Points Earnable</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="points"
                        type="number"
                        value={formData.points}
                        onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                        placeholder="Enter points"
                        min="1"
                        required
                      />
                      <Coins className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </>
              )}

              <div className="flex space-x-2">
                <Button type="submit" className="flex-1">
                  Create {formData.type === 'event' ? 'Event' : 'Announcement'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setLocation('/admin/dashboard')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Map Dialog for Event Location Selection */}
        <Dialog open={showMapDialog} onOpenChange={setShowMapDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Select Event Location
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="h-[400px] w-full relative">
                <MapContainer
                  center={[16.4074, 120.5960]}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                  className="rounded-lg cursor-crosshair"
                  eventHandlers={{
                    click: (e: any) => {
                      const { lat, lng } = e.latlng;
                      const address = `Event Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                      handleLocationSelect({ lat, lng, address });
                    }
                  }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {formData.coordinates && (
                    <Marker position={[formData.coordinates.lat, formData.coordinates.lng]}>
                      <Popup>
                        <div className="text-center">
                          <MapPin className="h-4 w-4 mx-auto mb-1" />
                          <strong>Event Location</strong>
                          <br />
                          <small>Click anywhere to move marker</small>
                          <br />
                          <small className="text-xs text-muted-foreground">
                            {formData.coordinates.lat.toFixed(4)}, {formData.coordinates.lng.toFixed(4)}
                          </small>
                        </div>
                      </Popup>
                    </Marker>
                  )}
                </MapContainer>
                
                {/* Instructions */}
                <div className="absolute bottom-2 left-2 right-2 z-[1000]">
                  <div className="bg-primary/90 text-primary-foreground text-xs px-3 py-2 rounded-md backdrop-blur-sm">
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      Click anywhere on the map to set the event location
                    </div>
                  </div>
                </div>
              </div>
              
              {formData.location && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Selected Location:</p>
                  <p className="text-sm text-muted-foreground">{formData.location}</p>
                </div>
              )}
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowMapDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowMapDialog(false)} disabled={!formData.location}>
                  Confirm Location
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
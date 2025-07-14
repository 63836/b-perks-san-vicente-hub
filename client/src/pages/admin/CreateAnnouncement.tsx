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
import { GISMap } from '@/components/GISMap';

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
    locationLat: null as number | null,
    locationLng: null as number | null
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

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setFormData(prev => ({
      ...prev,
      location: address,
      locationLat: lat,
      locationLng: lng
    }));
    setShowMapDialog(false);
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
                            <GISMap 
                              initialCenter={formData.coordinates ? [formData.coordinates.lat, formData.coordinates.lng] : [16.4074, 120.5960]}
                              initialZoom={16}
                              className="h-full w-full"
                              activeLayersState={{}}
                              showMarkerAtCenter={true}
                            />
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
            <div className="h-[500px] w-full">
              <GISMap 
                onLocationSelect={handleLocationSelect}
                showLocationPicker={true}
                initialCenter={[16.4074, 120.5960]} // Baguio City coordinates
                initialZoom={13}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
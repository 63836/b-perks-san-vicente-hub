import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Header, BottomNavigation } from '@/components/ui/navigation';
import { authStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { Calendar, MapPin, Users, Trophy, Upload, CheckCircle } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  pointsReward: number;
  isRegistered: boolean;
  hasSubmittedProof: boolean;
  proofFile?: File;
}

const sampleEvents: Event[] = [
  {
    id: '1',
    title: 'Community Clean-up Drive',
    description: 'Join us for a monthly community cleaning activity to keep our barangay clean and green.',
    location: 'Barangay Center',
    date: '2024-01-25',
    pointsReward: 50,
    isRegistered: false,
    hasSubmittedProof: false
  },
  {
    id: '2',
    title: 'Disaster Preparedness Seminar',
    description: 'Learn essential skills for disaster preparedness and emergency response.',
    location: 'Community Hall',
    date: '2024-01-30',
    pointsReward: 30,
    isRegistered: true,
    hasSubmittedProof: false
  },
  {
    id: '3',
    title: 'Tree Planting Activity',
    description: 'Help make our barangay greener by participating in our tree planting initiative.',
    location: 'Barangay Park',
    date: '2024-02-05',
    pointsReward: 40,
    isRegistered: true,
    hasSubmittedProof: true
  }
];

export default function Events() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState(authStore.getCurrentUser());
  const [events, setEvents] = useState<Event[]>(sampleEvents);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const currentUser = authStore.getCurrentUser();
    if (!currentUser) {
      setLocation('/login');
      return;
    }
    if (currentUser.isAdmin) {
      setLocation('/admin');
      return;
    }
    setUser(currentUser);
  }, [setLocation]);

  const handleRegister = (eventId: string) => {
    setEvents(events.map(event => 
      event.id === eventId ? { ...event, isRegistered: true } : event
    ));
    
    toast({
      title: "Registration Successful",
      description: "You have successfully registered for this event!",
    });
  };

  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/avi', 'video/mov'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload an image (JPEG, PNG, GIF) or video (MP4, AVI, MOV) file.",
          variant: "destructive"
        });
        return;
      }
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 10MB.",
          variant: "destructive"
        });
        return;
      }
      
      setProofFile(file);
    }
  };

  const handleSubmitProof = async () => {
    if (!selectedEvent || !proofFile) return;

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update event with proof submission
      setEvents(events.map(event => 
        event.id === selectedEvent.id 
          ? { ...event, hasSubmittedProof: true, proofFile } 
          : event
      ));
      
      toast({
        title: "Proof Submitted",
        description: "Your participation proof has been submitted for review!",
      });
      
      setSelectedEvent(null);
      setProofFile(null);
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to submit proof. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEventStatus = (event: Event) => {
    if (event.hasSubmittedProof) {
      return <Badge className="bg-success text-white">Proof Submitted</Badge>;
    } else if (event.isRegistered) {
      return <Badge variant="secondary">Registered</Badge>;
    } else {
      return <Badge variant="outline">Not Registered</Badge>;
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Community Events" />
      
      <div className="p-4 space-y-6">
        {/* Events Grid */}
        <div className="grid gap-4">
          {events.map((event) => (
            <Card key={event.id} className="shadow-soft">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(event.date)}
                    </div>
                  </div>
                  {getEventStatus(event)}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
                
                <div className="flex items-center justify-between text-sm mb-4">
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    {event.location}
                  </div>
                  <div className="flex items-center text-primary font-medium">
                    <Trophy className="h-4 w-4 mr-1" />
                    {event.pointsReward} points
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {!event.isRegistered && (
                    <Button 
                      onClick={() => handleRegister(event.id)}
                      className="flex-1"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Register
                    </Button>
                  )}
                  
                  {event.isRegistered && !event.hasSubmittedProof && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => setSelectedEvent(event)}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Proof
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Upload Participation Proof</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="proof-file">Upload Photo or Video</Label>
                            <Input
                              id="proof-file"
                              type="file"
                              accept="image/*,video/*"
                              onChange={handleProofUpload}
                              className="mt-2"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Accepted formats: JPEG, PNG, GIF, MP4, AVI, MOV (max 10MB)
                            </p>
                          </div>
                          
                          {proofFile && (
                            <div className="p-3 bg-muted rounded-lg">
                              <p className="text-sm font-medium">Selected file:</p>
                              <p className="text-sm text-muted-foreground">{proofFile.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(proofFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          )}
                          
                          <div className="flex gap-2 justify-end">
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                setSelectedEvent(null);
                                setProofFile(null);
                              }}
                            >
                              Cancel
                            </Button>
                            <Button 
                              onClick={handleSubmitProof}
                              disabled={!proofFile || isSubmitting}
                            >
                              {isSubmitting ? "Submitting..." : "Submit Proof"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                  
                  {event.hasSubmittedProof && (
                    <Button variant="outline" className="flex-1" disabled>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Proof Submitted
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
}
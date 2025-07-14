import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Header, BottomNavigation } from '@/components/ui/navigation';
import { authStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Calendar, MapPin, Users, Trophy, Upload, CheckCircle, Clock } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  lat: number;
  lng: number;
  pointsReward: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  imageUrl?: string;
  maxParticipants: number;
  createdAt: string;
}

interface EventParticipant {
  id: number;
  eventId: number;
  userId: number;
  joinedAt: string;
  status: 'registered' | 'participated' | 'approved' | 'declined';
  proofSubmitted?: {
    type: 'image' | 'video';
    url: string;
    submittedAt: string;
  };
  pointsAwarded?: number;
}

export default function Events() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(authStore.getCurrentUser());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch events
  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ['/api/events'],
  });

  // Fetch user's event participations
  const { data: userParticipations = [] } = useQuery<EventParticipant[]>({
    queryKey: ['/api/users', user?.id, 'events'],
    enabled: !!user?.id,
  });

  // Join event mutation
  const joinEventMutation = useMutation({
    mutationFn: (eventId: number) => apiRequest(`/api/events/${eventId}/join`, {
      method: 'POST',
      body: JSON.stringify({ userId: user?.id }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', user?.id, 'events'] });
      toast({
        title: "Success!",
        description: "You have successfully joined the event!",
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

  const handleRegister = (eventId: number) => {
    joinEventMutation.mutate(eventId);
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
      // For now, simulate API call - in real implementation, this would upload the file
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventStatus = (event: Event) => {
    const participation = userParticipations.find(p => p.eventId === event.id);
    
    if (participation) {
      if (participation.proofSubmitted) {
        return <Badge className="bg-green-500 text-white">Proof Submitted</Badge>;
      } else if (participation.status === 'registered') {
        return <Badge variant="secondary">Registered</Badge>;
      } else if (participation.status === 'approved') {
        return <Badge className="bg-blue-500 text-white">Approved</Badge>;
      }
    }
    
    return <Badge variant="outline">Not Registered</Badge>;
  };

  const isUserRegistered = (eventId: number) => {
    return userParticipations.some(p => p.eventId === eventId);
  };

  const hasSubmittedProof = (eventId: number) => {
    const participation = userParticipations.find(p => p.eventId === eventId);
    return participation?.proofSubmitted != null;
  };

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header title="Community Events" />
        <div className="p-4 flex items-center justify-center h-64">
          <div className="text-center">
            <Clock className="h-16 w-16 mx-auto text-muted-foreground mb-4 animate-spin" />
            <p className="text-muted-foreground">Loading events...</p>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

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
                      {formatDate(event.startDate)}
                    </div>
                  </div>
                  {getEventStatus(event)}
                </div>
              </CardHeader>
              <CardContent>
                {/* Event Image */}
                {event.imageUrl && (
                  <div className="aspect-video bg-muted rounded-lg mb-4 overflow-hidden">
                    <img 
                      src={event.imageUrl} 
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
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
                  {!isUserRegistered(event.id) && (
                    <Button 
                      onClick={() => handleRegister(event.id)}
                      className="flex-1"
                      disabled={joinEventMutation.isPending}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      {joinEventMutation.isPending ? 'Registering...' : 'Register'}
                    </Button>
                  )}
                  
                  {isUserRegistered(event.id) && !hasSubmittedProof(event.id) && (
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
import { useState } from 'react';
import { Header, BottomNavigation } from '@/components/ui/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Camera, CheckCircle } from 'lucide-react';

// Sample events data
const sampleEvents = [
  {
    id: '1',
    title: 'Community Clean-up Drive',
    description: 'Join us in cleaning our neighborhood streets and parks. Bring your own gloves and water bottle!',
    location: {
      lat: 16.4023,
      lng: 120.5960,
      address: 'San Vicente Plaza, Baguio City'
    },
    pointsReward: 50,
    startDate: '2024-01-20T08:00:00Z',
    endDate: '2024-01-20T12:00:00Z',
    isActive: true,
    imageUrl: '/placeholder.svg',
    participants: []
  },
  {
    id: '2',
    title: 'Disaster Preparedness Seminar',
    description: 'Learn essential disaster preparedness skills for earthquakes, typhoons, and other emergencies.',
    location: {
      lat: 16.4025,
      lng: 120.5965,
      address: 'Barangay Hall, San Vicente'
    },
    pointsReward: 30,
    startDate: '2024-01-22T14:00:00Z',
    endDate: '2024-01-22T17:00:00Z',
    isActive: true,
    imageUrl: '/placeholder.svg',
    participants: []
  },
  {
    id: '3',
    title: 'Tree Planting Activity',
    description: 'Help make our community greener! We will plant native trees in designated areas.',
    location: {
      lat: 16.4020,
      lng: 120.5955,
      address: 'San Vicente Park Area'
    },
    pointsReward: 75,
    startDate: '2024-01-25T07:00:00Z',
    endDate: '2024-01-25T11:00:00Z',
    isActive: true,
    imageUrl: '/placeholder.svg',
    participants: []
  },
  {
    id: '4',
    title: 'Health and Wellness Fair',
    description: 'Free health checkups, nutrition counseling, and fitness activities for all residents.',
    location: {
      lat: 16.4028,
      lng: 120.5970,
      address: 'San Vicente Covered Court'
    },
    pointsReward: 40,
    startDate: '2024-01-28T09:00:00Z',
    endDate: '2024-01-28T16:00:00Z',
    isActive: true,
    imageUrl: '/placeholder.svg',
    participants: []
  }
];

export default function Events() {
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([]);

  const handleRegister = (eventId: string) => {
    if (registeredEvents.includes(eventId)) return;
    
    setRegisteredEvents(prev => [...prev, eventId]);
    // TODO: Save to local storage and update user's registered events
    alert('Successfully registered for the event!');
  };

  const handleUploadProof = (eventId: string) => {
    // TODO: Implement file upload for proof of participation
    alert('Upload proof of participation (coming soon)');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isEventRegistered = (eventId: string) => registeredEvents.includes(eventId);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Community Events" />

      <div className="p-4 space-y-6">
        {/* Active Events */}
        <div className="space-y-4">
          {sampleEvents.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <Badge className="bg-accent text-accent-foreground">
                    +{event.pointsReward} pts
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <Calendar className="h-12 w-12 text-muted-foreground" />
                </div>

                <p className="text-sm text-muted-foreground">
                  {event.description}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{formatDate(event.startDate)} - {formatDate(event.endDate)}</span>
                  </div>
                  
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{event.location.address}</span>
                  </div>
                  
                  <div className="flex items-center text-muted-foreground">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{event.participants.length} participants</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {!isEventRegistered(event.id) ? (
                    <Button
                      onClick={() => handleRegister(event.id)}
                      className="flex-1"
                    >
                      Register
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" disabled className="flex-1">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Registered
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleUploadProof(event.id)}
                        className="flex-1"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Upload Proof
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {sampleEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No events available</h3>
            <p className="text-muted-foreground">
              Check back later for new community events
            </p>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
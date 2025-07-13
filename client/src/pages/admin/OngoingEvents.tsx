import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/ui/navigation';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Calendar, MapPin, Users, Coins, Eye, CheckCircle, XCircle } from 'lucide-react';

interface EventParticipant {
  id: string;
  name: string;
  joinedAt: string;
  proofSubmitted?: {
    type: 'image' | 'video';
    url: string;
    submittedAt: string;
  };
  status: 'registered' | 'participated' | 'approved' | 'declined';
  pointsAwarded?: number;
}

interface OngoingEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  pointsReward: number;
  startDate: string;
  endDate: string;
  participants: EventParticipant[];
  isActive: boolean;
}

export default function OngoingEvents() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedEvent, setSelectedEvent] = useState<OngoingEvent | null>(null);
  const [selectedParticipant, setSelectedParticipant] = useState<EventParticipant | null>(null);

  // Mock data for ongoing events
  const ongoingEvents: OngoingEvent[] = [
    {
      id: '1',
      title: 'Community Clean-up Drive',
      description: 'Monthly community cleaning activity',
      location: 'Barangay San Vicente Main Street',
      pointsReward: 50,
      startDate: '2024-01-15',
      endDate: '2024-01-15',
      isActive: true,
      participants: [
        {
          id: '1',
          name: 'Maria Santos',
          joinedAt: '2024-01-14',
          proofSubmitted: {
            type: 'image',
            url: '/placeholder.svg',
            submittedAt: '2024-01-15'
          },
          status: 'participated'
        },
        {
          id: '2',
          name: 'Juan Dela Cruz',
          joinedAt: '2024-01-14',
          status: 'registered'
        }
      ]
    },
    {
      id: '2',
      title: 'Tree Planting Activity',
      description: 'Plant trees around the barangay',
      location: 'Barangay San Vicente Park',
      pointsReward: 75,
      startDate: '2024-01-20',
      endDate: '2024-01-20',
      isActive: true,
      participants: [
        {
          id: '3',
          name: 'Ana Garcia',
          joinedAt: '2024-01-19',
          proofSubmitted: {
            type: 'video',
            url: '/placeholder.svg',
            submittedAt: '2024-01-20'
          },
          status: 'participated'
        }
      ]
    }
  ];

  const handleEndEvent = (eventId: string) => {
    // TODO: End event in backend
    toast({
      title: "Event Ended",
      description: "Event has been ended successfully.",
    });
  };

  const handleGrantPoints = (participantId: string, eventId: string) => {
    const event = ongoingEvents.find(e => e.id === eventId);
    if (!event) return;

    // TODO: Grant points to user in backend
    toast({
      title: "Points Granted",
      description: `${event.pointsReward} points granted to participant.`,
    });
  };

  const handleDeclineParticipant = (participantId: string) => {
    // TODO: Decline participant in backend
    toast({
      title: "Participant Declined",
      description: "Participant has been declined.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registered': return 'bg-blue-100 text-blue-800';
      case 'participated': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (selectedParticipant && selectedEvent) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Participant Details" />
        
        <div className="p-4 space-y-6">
          <Button 
            variant="outline" 
            onClick={() => setSelectedParticipant(null)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Participants
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>{selectedParticipant.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Event: {selectedEvent.title}</p>
                <p className="text-sm text-muted-foreground">Joined: {new Date(selectedParticipant.joinedAt).toLocaleDateString()}</p>
                <Badge className={getStatusColor(selectedParticipant.status)}>
                  {selectedParticipant.status.charAt(0).toUpperCase() + selectedParticipant.status.slice(1)}
                </Badge>
              </div>

              {selectedParticipant.proofSubmitted && (
                <div>
                  <h4 className="font-medium mb-2">Proof of Participation</h4>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm mb-2">
                      Type: {selectedParticipant.proofSubmitted.type.charAt(0).toUpperCase() + selectedParticipant.proofSubmitted.type.slice(1)}
                    </p>
                    <p className="text-sm mb-2">
                      Submitted: {new Date(selectedParticipant.proofSubmitted.submittedAt).toLocaleDateString()}
                    </p>
                    <img 
                      src={selectedParticipant.proofSubmitted.url} 
                      alt="Proof of participation"
                      className="w-full max-w-md h-48 object-cover rounded"
                    />
                  </div>
                </div>
              )}

              {selectedParticipant.status === 'participated' && (
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => handleGrantPoints(selectedParticipant.id, selectedEvent.id)}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Grant {selectedEvent.pointsReward} Points
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => handleDeclineParticipant(selectedParticipant.id)}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Decline
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (selectedEvent) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Event Participants" />
        
        <div className="p-4 space-y-6">
          <Button 
            variant="outline" 
            onClick={() => setSelectedEvent(null)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>{selectedEvent.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {selectedEvent.location}
                  </div>
                  <div className="flex items-center">
                    <Coins className="h-4 w-4 mr-1" />
                    {selectedEvent.pointsReward} points
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {selectedEvent.participants.length} participants
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Participants</h4>
                  {selectedEvent.participants.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{participant.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Joined: {new Date(participant.joinedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(participant.status)}>
                          {participant.status.charAt(0).toUpperCase() + participant.status.slice(1)}
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedParticipant(participant)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Button 
                  variant="destructive"
                  onClick={() => handleEndEvent(selectedEvent.id)}
                  className="w-full"
                >
                  End Event
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header title="Ongoing Events" />
      
      <div className="p-4 space-y-6">
        <Button 
          variant="outline" 
          onClick={() => setLocation('/admin/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="space-y-4">
          {ongoingEvents.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{event.title}</span>
                  <Badge variant="outline">{event.isActive ? 'Active' : 'Ended'}</Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">{event.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {event.location}
                    </div>
                    <div className="flex items-center">
                      <Coins className="h-4 w-4 mr-1" />
                      {event.pointsReward} points
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {event.participants.length} participants
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">
                      {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex space-x-2 mt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedEvent(event)}
                      className="flex-1"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      View Participants
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => handleEndEvent(event.id)}
                    >
                      End Event
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
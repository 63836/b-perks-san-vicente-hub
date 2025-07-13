import { Header, BottomNavigation } from '@/components/ui/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Layers, Navigation, Shield } from 'lucide-react';

// Sample data for map layers
const mapLayers = [
  { id: 'basemap', name: 'Street Map', active: true, type: 'Base Layer' },
  { id: 'satellite', name: 'Satellite View', active: false, type: 'Base Layer' },
  { id: 'reports', name: 'Community Reports', active: true, type: 'Data Layer' },
  { id: 'events', name: 'Event Locations', active: true, type: 'Data Layer' },
  { id: 'safety', name: 'Safety Levels', active: false, type: 'Data Layer' }
];

const safetyLevels = [
  { purok: 'Purok 1', level: 'high', description: 'Well-lit, regular patrol' },
  { purok: 'Purok 2', level: 'medium', description: 'Moderate lighting' },
  { purok: 'Purok 3', level: 'high', description: 'CCTV coverage' },
  { purok: 'Purok 4', level: 'low', description: 'Limited lighting' }
];

export default function GISMap() {
  const getSafetyColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-success';
      case 'medium': return 'bg-warning';
      case 'low': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Community Map" />

      <div className="p-4 space-y-6">
        {/* Map Container */}
        <Card>
          <CardContent className="p-0">
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
              {/* Mock Map Interface */}
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-primary/20"></div>
              
              {/* Map Placeholder */}
              <div className="text-center z-10">
                <MapPin className="h-16 w-16 mx-auto text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">Offline Map</h3>
                <p className="text-sm text-muted-foreground">
                  Barangay San Vicente, Baguio City
                </p>
              </div>

              {/* Mock Map Controls */}
              <div className="absolute top-4 right-4 space-y-2">
                <div className="bg-card p-2 rounded shadow-medium">
                  <Navigation className="h-5 w-5" />
                </div>
                <div className="bg-card p-2 rounded shadow-medium">
                  <Layers className="h-5 w-5" />
                </div>
              </div>

              {/* Mock Location Dot */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-4 h-4 bg-primary rounded-full border-2 border-background animate-pulse"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Map Layers Control */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Layers className="h-5 w-5 mr-2" />
              Map Layers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mapLayers.map((layer) => (
              <div key={layer.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{layer.name}</p>
                  <p className="text-xs text-muted-foreground">{layer.type}</p>
                </div>
                <Badge variant={layer.active ? 'default' : 'outline'}>
                  {layer.active ? 'ON' : 'OFF'}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Safety Levels */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Purok Safety Levels
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {safetyLevels.map((area, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{area.purok}</p>
                  <p className="text-xs text-muted-foreground">{area.description}</p>
                </div>
                <Badge className={`${getSafetyColor(area.level)} text-white capitalize`}>
                  {area.level}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Map Legend */}
        <Card>
          <CardHeader>
            <CardTitle>Map Legend</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-primary rounded-full"></div>
              <span className="text-sm">Current Location</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-destructive rounded-full"></div>
              <span className="text-sm">Report Locations</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-accent rounded-full"></div>
              <span className="text-sm">Event Locations</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-success rounded-full"></div>
              <span className="text-sm">Safe Areas</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
}
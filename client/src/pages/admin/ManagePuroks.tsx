import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { MapContainer, TileLayer, Polygon, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Header } from '@/components/ui/navigation';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Plus, Trash2, Edit, MapPin } from 'lucide-react';

interface PurokBoundary {
  id: string;
  name: string;
  coordinates: [number, number][];
  safetyLevel: 'high' | 'medium' | 'low';
}

const DrawingControl: React.FC<{
  onPolygonComplete: (coordinates: [number, number][]) => void;
  isDrawing: boolean;
  setIsDrawing: (drawing: boolean) => void;
}> = ({ onPolygonComplete, isDrawing, setIsDrawing }) => {
  const [currentPolygon, setCurrentPolygon] = useState<[number, number][]>([]);
  const map = useMap();

  useMapEvents({
    click(e) {
      if (isDrawing) {
        const newPoint: [number, number] = [e.latlng.lat, e.latlng.lng];
        setCurrentPolygon(prev => [...prev, newPoint]);
      }
    },
    dblclick() {
      if (isDrawing && currentPolygon.length >= 3) {
        onPolygonComplete([...currentPolygon]);
        setCurrentPolygon([]);
        setIsDrawing(false);
      }
    }
  });

  return currentPolygon.length > 0 ? (
    <Polygon
      positions={currentPolygon}
      pathOptions={{
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.3,
        weight: 2,
        dashArray: '5, 5'
      }}
    />
  ) : null;
};

const getSafetyColor = (level: 'high' | 'medium' | 'low') => {
  switch (level) {
    case 'high': return '#10b981';
    case 'medium': return '#f59e0b';
    case 'low': return '#ef4444';
    default: return '#6b7280';
  }
};

export default function ManagePuroks() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [puroks, setPuroks] = useState<PurokBoundary[]>([
    {
      id: '1',
      name: 'Purok 1 - Barangay Center',
      safetyLevel: 'high',
      coordinates: [
        [16.3950, 120.5960],
        [16.3960, 120.5960],
        [16.3960, 120.5975],
        [16.3950, 120.5975]
      ]
    },
    {
      id: '2',
      name: 'Purok 2 - Main Residential',
      safetyLevel: 'high',
      coordinates: [
        [16.3960, 120.5960],
        [16.3970, 120.5960],
        [16.3970, 120.5975],
        [16.3960, 120.5975]
      ]
    }
  ]);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedPurok, setSelectedPurok] = useState<PurokBoundary | null>(null);
  const [newPurokData, setNewPurokData] = useState({
    name: '',
    safetyLevel: 'medium' as 'high' | 'medium' | 'low'
  });

  const handlePolygonComplete = (coordinates: [number, number][]) => {
    if (newPurokData.name.trim() === '') {
      toast({
        title: "Error",
        description: "Please enter a purok name before drawing.",
        variant: "destructive"
      });
      return;
    }

    const newPurok: PurokBoundary = {
      id: Date.now().toString(),
      name: newPurokData.name,
      coordinates,
      safetyLevel: newPurokData.safetyLevel
    };

    setPuroks(prev => [...prev, newPurok]);
    setNewPurokData({ name: '', safetyLevel: 'medium' });
    
    toast({
      title: "Success",
      description: "New purok boundary created successfully!",
    });
  };

  const handleDeletePurok = (id: string) => {
    setPuroks(prev => prev.filter(p => p.id !== id));
    setSelectedPurok(null);
    toast({
      title: "Success",
      description: "Purok boundary deleted successfully!",
    });
  };

  const handleUpdateSafetyLevel = (id: string, safetyLevel: 'high' | 'medium' | 'low') => {
    setPuroks(prev => prev.map(p => 
      p.id === id ? { ...p, safetyLevel } : p
    ));
    toast({
      title: "Success",
      description: "Safety level updated successfully!",
    });
  };

  const startDrawing = () => {
    if (newPurokData.name.trim() === '') {
      toast({
        title: "Error",
        description: "Please enter a purok name first.",
        variant: "destructive"
      });
      return;
    }
    setIsDrawing(true);
    setSelectedPurok(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Manage Purok Boundaries" />
      
      <div className="p-4 space-y-6">
        <Button 
          variant="outline" 
          onClick={() => setLocation('/admin/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Container */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Barangay San Vicente Map
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 w-full rounded-lg overflow-hidden">
                  <MapContainer
                    center={[16.3954, 120.5968]}
                    zoom={16}
                    style={{ height: '100%', width: '100%' }}
                    className="rounded-lg"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {/* Existing Puroks */}
                    {puroks.map((purok) => (
                      <Polygon
                        key={purok.id}
                        positions={purok.coordinates}
                        pathOptions={{
                          color: getSafetyColor(purok.safetyLevel),
                          fillColor: getSafetyColor(purok.safetyLevel),
                          fillOpacity: selectedPurok?.id === purok.id ? 0.5 : 0.2,
                          weight: selectedPurok?.id === purok.id ? 3 : 2
                        }}
                        eventHandlers={{
                          click: () => setSelectedPurok(purok)
                        }}
                      />
                    ))}
                    
                    {/* Drawing Control */}
                    <DrawingControl
                      onPolygonComplete={handlePolygonComplete}
                      isDrawing={isDrawing}
                      setIsDrawing={setIsDrawing}
                    />
                  </MapContainer>
                </div>
                
                <div className="mt-4 text-sm text-muted-foreground">
                  <p><strong>Instructions:</strong></p>
                  <p>1. Enter purok name and select safety level</p>
                  <p>2. Click "Start Drawing" to begin</p>
                  <p>3. Click on map to add boundary points</p>
                  <p>4. Double-click to complete the boundary</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls Panel */}
          <div className="space-y-4">
            {/* Add New Purok */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  Add New Purok
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="purokName">Purok Name</Label>
                  <Input
                    id="purokName"
                    value={newPurokData.name}
                    onChange={(e) => setNewPurokData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter purok name"
                  />
                </div>

                <div>
                  <Label htmlFor="safetyLevel">Safety Level</Label>
                  <Select value={newPurokData.safetyLevel} onValueChange={(value: 'high' | 'medium' | 'low') => setNewPurokData(prev => ({ ...prev, safetyLevel: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select safety level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High Safety</SelectItem>
                      <SelectItem value="medium">Medium Safety</SelectItem>
                      <SelectItem value="low">Low Safety</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={startDrawing}
                  disabled={isDrawing}
                  className="w-full"
                >
                  {isDrawing ? 'Drawing...' : 'Start Drawing'}
                </Button>
              </CardContent>
            </Card>

            {/* Selected Purok Details */}
            {selectedPurok && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Edit className="h-5 w-5 mr-2" />
                    Edit Purok
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Purok Name</Label>
                    <p className="text-sm font-medium">{selectedPurok.name}</p>
                  </div>

                  <div>
                    <Label htmlFor="editSafetyLevel">Safety Level</Label>
                    <Select 
                      value={selectedPurok.safetyLevel} 
                      onValueChange={(value: 'high' | 'medium' | 'low') => handleUpdateSafetyLevel(selectedPurok.id, value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High Safety</SelectItem>
                        <SelectItem value="medium">Medium Safety</SelectItem>
                        <SelectItem value="low">Low Safety</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    variant="destructive"
                    onClick={() => handleDeletePurok(selectedPurok.id)}
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Purok
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Existing Puroks List */}
            <Card>
              <CardHeader>
                <CardTitle>Existing Puroks ({puroks.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {puroks.map((purok) => (
                    <div 
                      key={purok.id} 
                      className={`p-2 rounded border cursor-pointer transition-colors ${
                        selectedPurok?.id === purok.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedPurok(purok)}
                    >
                      <div className="font-medium text-sm">{purok.name}</div>
                      <div className="flex items-center justify-between mt-1">
                        <span 
                          className="inline-block w-3 h-3 rounded-full"
                          style={{ backgroundColor: getSafetyColor(purok.safetyLevel) }}
                        />
                        <span className="text-xs text-muted-foreground capitalize">
                          {purok.safetyLevel} safety
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
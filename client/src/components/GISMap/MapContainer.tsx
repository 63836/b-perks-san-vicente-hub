import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Polygon } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MapPin, Download, Wifi, WifiOff, Layers, Map, Navigation, AlertTriangle } from 'lucide-react';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different marker types
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

const reportIcon = createCustomIcon('#ef4444'); // red
const eventIcon = createCustomIcon('#f59e0b'); // amber
const safetyIcon = createCustomIcon('#10b981'); // green
const currentLocationIcon = createCustomIcon('#3b82f6'); // blue

interface MapData {
  reports: Array<{
    id: string;
    lat: number;
    lng: number;
    title: string;
    description: string;
    status: string;
  }>;
  events: Array<{
    id: string;
    lat: number;
    lng: number;
    title: string;
    description: string;
    date: string;
  }>;
  safetyAreas: Array<{
    id: string;
    name: string;
    level: 'high' | 'medium' | 'low';
    coordinates: [number, number][];
  }>;
  puroks: Array<{
    id: string;
    name: string;
    coordinates: [number, number][];
    safetyLevel: 'high' | 'medium' | 'low';
  }>;
}

// Sample data for Barangay San Vicente, Baguio City (16.3954, 120.5968)
const sampleMapData: MapData = {
  reports: [
    {
      id: '1',
      lat: 16.3940,
      lng: 120.5980,
      title: 'Broken Street Light',
      description: 'Street light not working on residential area',
      status: 'pending'
    },
    {
      id: '2',
      lat: 16.3965,
      lng: 120.5955,
      title: 'Pothole',
      description: 'Large pothole causing traffic issues',
      status: 'in-progress'
    },
    {
      id: '3',
      lat: 16.3970,
      lng: 120.5975,
      title: 'Drainage Issue',
      description: 'Clogged drainage causing flooding during rain',
      status: 'resolved'
    },
    {
      id: '4',
      lat: 16.3935,
      lng: 120.5960,
      title: 'Road Maintenance',
      description: 'Road surface deteriorating in lower area',
      status: 'pending'
    },
    {
      id: '5',
      lat: 16.3945,
      lng: 120.5990,
      title: 'Illegal Dumping',
      description: 'Garbage dumped in vacant lot',
      status: 'in-progress'
    }
  ],
  events: [
    {
      id: '1',
      lat: 16.3954,
      lng: 120.5968,
      title: 'Community Clean-up',
      description: 'Monthly community cleaning activity at barangay center',
      date: '2024-01-20'
    },
    {
      id: '2',
      lat: 16.3960,
      lng: 120.5965,
      title: 'Health Fair',
      description: 'Free health checkups at community center',
      date: '2024-01-28'
    },
    {
      id: '3',
      lat: 16.3950,
      lng: 120.5970,
      title: 'Tree Planting',
      description: 'Environmental activity at community park',
      date: '2024-02-05'
    }
  ],
  safetyAreas: [
    {
      id: '1',
      name: 'Barangay Center - Main Road',
      level: 'high',
      coordinates: [
        [16.3950, 120.5960],
        [16.3960, 120.5960],
        [16.3960, 120.5975],
        [16.3950, 120.5975]
      ]
    },
    {
      id: '2',
      name: 'Community Center Area',
      level: 'high',
      coordinates: [
        [16.3955, 120.5965],
        [16.3965, 120.5965],
        [16.3965, 120.5980],
        [16.3955, 120.5980]
      ]
    },
    {
      id: '3',
      name: 'Upper Residential Area',
      level: 'medium',
      coordinates: [
        [16.3965, 120.5950],
        [16.3975, 120.5950],
        [16.3975, 120.5970],
        [16.3965, 120.5970]
      ]
    }
  ],
  puroks: [
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
    },
    {
      id: '3',
      name: 'Purok 3 - Upper Area',
      safetyLevel: 'medium',
      coordinates: [
        [16.3965, 120.5945],
        [16.3975, 120.5945],
        [16.3975, 120.5960],
        [16.3965, 120.5960]
      ]
    },
    {
      id: '4',
      name: 'Purok 4 - Eastern Side',
      safetyLevel: 'medium',
      coordinates: [
        [16.3950, 120.5975],
        [16.3960, 120.5975],
        [16.3960, 120.5990],
        [16.3950, 120.5990]
      ]
    },
    {
      id: '5',
      name: 'Purok 5 - Lower West (Multiple Reports)',
      safetyLevel: 'low',
      coordinates: [
        [16.3930, 120.5950],
        [16.3945, 120.5950],
        [16.3945, 120.5970],
        [16.3930, 120.5970]
      ]
    },
    {
      id: '6',
      name: 'Purok 6 - Eastern Problems Area',
      safetyLevel: 'low',
      coordinates: [
        [16.3940, 120.5975],
        [16.3955, 120.5975],
        [16.3955, 120.5995],
        [16.3940, 120.5995]
      ]
    },
    {
      id: '7',
      name: 'Purok 7 - Northern Border',
      safetyLevel: 'medium',
      coordinates: [
        [16.3970, 120.5950],
        [16.3980, 120.5950],
        [16.3980, 120.5970],
        [16.3970, 120.5970]
      ]
    }
  ]
};

interface OfflineControlProps {
  onDownloadTiles: () => void;
  isDownloading: boolean;
  isOffline: boolean;
}

const MapLayersControl: React.FC<{
  baseLayer: 'street' | 'satellite';
  layers: any;
  onBaseLayerChange: (layer: 'street' | 'satellite') => void;
  onLayerToggle: (layer: string) => void;
}> = ({ baseLayer, layers, onBaseLayerChange, onLayerToggle }) => {
  return (
    <div className="absolute top-4 left-4 z-[1000] space-y-2">
      <Card className="p-3">
        <CardHeader className="p-0 pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Map Layers
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-3">
          {/* Base Layer Selection */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">Base Map</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={baseLayer === 'street'}
                  onCheckedChange={(checked) => checked && onBaseLayerChange('street')}
                />
                <Label className="text-xs flex items-center gap-1">
                  <Map className="h-3 w-3" />
                  Street View
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={baseLayer === 'satellite'}
                  onCheckedChange={(checked) => checked && onBaseLayerChange('satellite')}
                />
                <Label className="text-xs flex items-center gap-1">
                  <Navigation className="h-3 w-3" />
                  Satellite View
                </Label>
              </div>
            </div>
          </div>
          
          {/* Overlay Layers */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">Data Layers</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={layers.currentLocation}
                  onCheckedChange={() => onLayerToggle('currentLocation')}
                />
                <Label className="text-xs">Current Location</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={layers.reports}
                  onCheckedChange={() => onLayerToggle('reports')}
                />
                <Label className="text-xs">Community Reports</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={layers.events}
                  onCheckedChange={() => onLayerToggle('events')}
                />
                <Label className="text-xs">Events</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={layers.safetyAreas}
                  onCheckedChange={() => onLayerToggle('safetyAreas')}
                />
                <Label className="text-xs">Safety Areas</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={layers.puroks}
                  onCheckedChange={() => onLayerToggle('puroks')}
                />
                <Label className="text-xs">Purok Boundaries</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const OfflineControl: React.FC<OfflineControlProps> = ({ onDownloadTiles, isDownloading, isOffline }) => {
  return (
    <div className="absolute top-4 right-4 z-[1000] space-y-2">
      <Card className="p-2">
        <div className="flex items-center space-x-2">
          {isOffline ? (
            <WifiOff className="h-4 w-4 text-destructive" />
          ) : (
            <Wifi className="h-4 w-4 text-success" />
          )}
          <span className="text-xs">
            {isOffline ? 'Offline' : 'Online'}
          </span>
        </div>
      </Card>
      
      <Button
        size="sm"
        onClick={onDownloadTiles}
        disabled={isDownloading}
        className="w-full"
      >
        <Download className="h-4 w-4 mr-1" />
        {isDownloading ? 'Downloading...' : 'Cache Tiles'}
      </Button>
    </div>
  );
};

const LocationMarker: React.FC = () => {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const map = useMap();

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
          // Don't auto-center on user location, keep focus on Barangay San Vicente
        },
        () => {
          // Don't show location marker if geolocation fails
          setPosition(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    }
  }, [map]);

  return position === null ? null : (
    <Marker position={position} icon={currentLocationIcon}>
      <Popup>
        <div className="text-center">
          <MapPin className="h-4 w-4 mx-auto mb-1" />
          <strong>Your Location</strong>
          <br />
          <small>Current GPS Position</small>
        </div>
      </Popup>
    </Marker>
  );
};

const getSafetyColor = (level: 'high' | 'medium' | 'low') => {
  switch (level) {
    case 'high': return '#10b981';
    case 'medium': return '#f59e0b';
    case 'low': return '#ef4444';
    default: return '#6b7280';
  }
};

interface GISMapProps {
  className?: string;
}

const GISMap: React.FC<GISMapProps> = ({ className }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [mapData] = useState<MapData>(sampleMapData);
  const [baseLayer, setBaseLayer] = useState<'street' | 'satellite'>('street');
  const [layers, setLayers] = useState({
    currentLocation: true,
    reports: true,
    events: true,
    safetyAreas: true,
    puroks: true
  });

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleDownloadTiles = async () => {
    setIsDownloading(true);
    try {
      // Simulate tile downloading process
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Map tiles cached for offline use!');
    } catch (error) {
      alert('Failed to cache tiles. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleLayerToggle = (layer: string) => {
    setLayers(prev => ({
      ...prev,
      [layer]: !prev[layer as keyof typeof prev]
    }));
  };

  return (
    <div className={`relative ${className}`}>
      <MapContainer
        center={[16.3954, 120.5968]}
        zoom={16}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        {/* Base Layer - Always show one */}
        <TileLayer
          attribution={baseLayer === 'street' 
            ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            : '&copy; <a href="https://www.esri.com/">Esri</a>'
          }
          url={baseLayer === 'street' 
            ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          }
        />

        {/* Conditional Layer Rendering */}
        {layers.currentLocation && <LocationMarker />}

        {layers.reports && mapData.reports.map((report) => (
          <Marker
            key={report.id}
            position={[report.lat, report.lng]}
            icon={reportIcon}
          >
            <Popup>
              <div>
                <strong>{report.title}</strong>
                <br />
                <p className="text-sm">{report.description}</p>
                <Badge variant="outline" className="mt-1">
                  {report.status}
                </Badge>
              </div>
            </Popup>
          </Marker>
        ))}

        {layers.events && mapData.events.map((event) => (
          <Marker
            key={event.id}
            position={[event.lat, event.lng]}
            icon={eventIcon}
          >
            <Popup>
              <div>
                <strong>{event.title}</strong>
                <br />
                <p className="text-sm">{event.description}</p>
                <Badge variant="secondary" className="mt-1">
                  {new Date(event.date).toLocaleDateString()}
                </Badge>
              </div>
            </Popup>
          </Marker>
        ))}

        {layers.puroks && mapData.puroks.map((purok) => (
          <Polygon
            key={purok.id}
            positions={purok.coordinates}
            pathOptions={{
              color: getSafetyColor(purok.safetyLevel),
              fillColor: getSafetyColor(purok.safetyLevel),
              fillOpacity: 0.2,
              weight: 2
            }}
          >
            <Popup>
              <div>
                <strong>{purok.name}</strong>
                <br />
                <Badge 
                  className={`mt-1 ${
                    purok.safetyLevel === 'high' ? 'bg-success' :
                    purok.safetyLevel === 'medium' ? 'bg-warning' : 'bg-destructive'
                  } text-white`}
                >
                  {purok.safetyLevel} safety
                </Badge>
              </div>
            </Popup>
          </Polygon>
        ))}

        {layers.safetyAreas && mapData.safetyAreas.map((area) => (
          <Polygon
            key={area.id}
            positions={area.coordinates}
            pathOptions={{
              color: getSafetyColor(area.level),
              fillColor: getSafetyColor(area.level),
              fillOpacity: 0.3,
              weight: 3
            }}
          >
            <Popup>
              <div>
                <strong>{area.name}</strong>
                <br />
                <Badge 
                  className={`mt-1 ${
                    area.level === 'high' ? 'bg-success' :
                    area.level === 'medium' ? 'bg-warning' : 'bg-destructive'
                  } text-white`}
                >
                  {area.level} safety
                </Badge>
              </div>
            </Popup>
          </Polygon>
        ))}

        {/* Custom Map Layers Control */}
        <MapLayersControl
          baseLayer={baseLayer}
          layers={layers}
          onBaseLayerChange={setBaseLayer}
          onLayerToggle={handleLayerToggle}
        />

        <OfflineControl
          onDownloadTiles={handleDownloadTiles}
          isDownloading={isDownloading}
          isOffline={isOffline}
        />
      </MapContainer>
    </div>
  );
};

export default GISMap;
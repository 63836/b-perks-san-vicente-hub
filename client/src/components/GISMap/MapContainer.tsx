import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl, Circle, Polygon } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Download, Wifi, WifiOff } from 'lucide-react';

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

// Sample data for Barangay San Vicente, Baguio City
const sampleMapData: MapData = {
  reports: [
    {
      id: '1',
      lat: 16.4125,
      lng: 120.5950,
      title: 'Broken Street Light',
      description: 'Street light not working on Upper Gen. Luna Road',
      status: 'pending'
    },
    {
      id: '2',
      lat: 16.4105,
      lng: 120.5945,
      title: 'Pothole',
      description: 'Large pothole on Kayang Street',
      status: 'in-progress'
    },
    {
      id: '3',
      lat: 16.4095,
      lng: 120.5940,
      title: 'Drainage Issue',
      description: 'Clogged drainage near Session Road area',
      status: 'resolved'
    }
  ],
  events: [
    {
      id: '1',
      lat: 16.4115,
      lng: 120.5955,
      title: 'Community Clean-up',
      description: 'Monthly community cleaning activity at Session Road',
      date: '2024-01-20'
    },
    {
      id: '2',
      lat: 16.4100,
      lng: 120.5935,
      title: 'Health Fair',
      description: 'Free health checkups at Burnham Park area',
      date: '2024-01-28'
    },
    {
      id: '3',
      lat: 16.4130,
      lng: 120.5960,
      title: 'Tree Planting',
      description: 'Environmental activity at Upper Gen. Luna',
      date: '2024-02-05'
    }
  ],
  safetyAreas: [
    {
      id: '1',
      name: 'Session Road Commercial Area',
      level: 'high',
      coordinates: [
        [16.4110, 120.5930],
        [16.4120, 120.5930],
        [16.4120, 120.5950],
        [16.4110, 120.5950]
      ]
    },
    {
      id: '2',
      name: 'Burnham Park Area',
      level: 'high',
      coordinates: [
        [16.4090, 120.5920],
        [16.4110, 120.5920],
        [16.4110, 120.5940],
        [16.4090, 120.5940]
      ]
    },
    {
      id: '3',
      name: 'Upper Gen. Luna Residential',
      level: 'medium',
      coordinates: [
        [16.4120, 120.5940],
        [16.4140, 120.5940],
        [16.4140, 120.5970],
        [16.4120, 120.5970]
      ]
    }
  ],
  puroks: [
    {
      id: '1',
      name: 'Purok 1 - Session Road Area',
      safetyLevel: 'high',
      coordinates: [
        [16.4100, 120.5920],
        [16.4115, 120.5920],
        [16.4115, 120.5940],
        [16.4100, 120.5940]
      ]
    },
    {
      id: '2',
      name: 'Purok 2 - Central Business District',
      safetyLevel: 'high',
      coordinates: [
        [16.4115, 120.5920],
        [16.4130, 120.5920],
        [16.4130, 120.5940],
        [16.4115, 120.5940]
      ]
    },
    {
      id: '3',
      name: 'Purok 3 - Upper Gen. Luna',
      safetyLevel: 'medium',
      coordinates: [
        [16.4100, 120.5940],
        [16.4115, 120.5940],
        [16.4115, 120.5960],
        [16.4100, 120.5960]
      ]
    },
    {
      id: '4',
      name: 'Purok 4 - Residential Hills',
      safetyLevel: 'medium',
      coordinates: [
        [16.4115, 120.5940],
        [16.4130, 120.5940],
        [16.4130, 120.5960],
        [16.4115, 120.5960]
      ]
    },
    {
      id: '5',
      name: 'Purok 5 - Kayang Extension',
      safetyLevel: 'low',
      coordinates: [
        [16.4085, 120.5920],
        [16.4100, 120.5920],
        [16.4100, 120.5945],
        [16.4085, 120.5945]
      ]
    },
    {
      id: '6',
      name: 'Purok 6 - Lower Area',
      safetyLevel: 'low',
      coordinates: [
        [16.4085, 120.5945],
        [16.4100, 120.5945],
        [16.4100, 120.5970],
        [16.4085, 120.5970]
      ]
    },
    {
      id: '7',
      name: 'Purok 7 - Outer Boundary',
      safetyLevel: 'medium',
      coordinates: [
        [16.4130, 120.5920],
        [16.4145, 120.5920],
        [16.4145, 120.5950],
        [16.4130, 120.5950]
      ]
    }
  ]
};

interface OfflineControlProps {
  onDownloadTiles: () => void;
  isDownloading: boolean;
  isOffline: boolean;
}

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
          map.setView([latitude, longitude], 16);
        },
        () => {
          // Fallback to Barangay San Vicente center
          const fallbackPosition: [number, number] = [16.4115, 120.5940];
          setPosition(fallbackPosition);
          map.setView(fallbackPosition, 16);
        }
      );
    } else {
      // Fallback for browsers without geolocation
      const fallbackPosition: [number, number] = [16.4115, 120.5940];
      setPosition(fallbackPosition);
      map.setView(fallbackPosition, 16);
    }
  }, [map]);

  return position === null ? null : (
    <Marker position={position} icon={currentLocationIcon}>
      <Popup>
        <div className="text-center">
          <MapPin className="h-4 w-4 mx-auto mb-1" />
          <strong>Your Location</strong>
          <br />
          <small>Barangay San Vicente</small>
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

  return (
    <div className={`relative ${className}`}>
      <MapContainer
        center={[16.4115, 120.5940]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <LayersControl position="topleft">
          <LayersControl.BaseLayer checked name="Street Map">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          
          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>

          <LayersControl.Overlay checked name="Current Location">
            <LocationMarker />
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="Community Reports">
            <>
              {mapData.reports.map((report) => (
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
            </>
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="Events">
            <>
              {mapData.events.map((event) => (
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
            </>
          </LayersControl.Overlay>

          <LayersControl.Overlay name="Purok Boundaries">
            <>
              {mapData.puroks.map((purok) => (
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
            </>
          </LayersControl.Overlay>

          <LayersControl.Overlay name="Safety Areas">
            <>
              {mapData.safetyAreas.map((area) => (
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
            </>
          </LayersControl.Overlay>
        </LayersControl>

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
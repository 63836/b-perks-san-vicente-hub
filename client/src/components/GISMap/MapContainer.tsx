import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Polygon } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

// Status-based report icons
const getReportIcon = (status: string) => {
  switch (status) {
    case 'pending':
    case 'dropped':
      return createCustomIcon('#ef4444'); // red
    case 'resolved':
      return createCustomIcon('#10b981'); // green
    case 'in-progress':
      return createCustomIcon('#3b82f6'); // blue
    default:
      return createCustomIcon('#ef4444'); // red (default)
  }
};

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
    imageUrl?: string;
    createdAt?: string;
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
    },
    {
      id: '6',
      lat: 16.3941,
      lng: 120.5981,
      title: 'Noise Complaint',
      description: 'Loud music from nearby establishment',
      status: 'pending'
    },
    {
      id: '7',
      lat: 16.3942,
      lng: 120.5982,
      title: 'Stray Dogs',
      description: 'Multiple stray dogs in the area',
      status: 'pending'
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

// Utility function to calculate distance between two points in meters
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
           Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
           Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Function to check if reports are overlapping (within 90 meters)
const findOverlappingReports = (reports: MapData['reports']) => {
  const overlappingPairs: Array<{report1: MapData['reports'][0], report2: MapData['reports'][0]}> = [];
  
  for (let i = 0; i < reports.length; i++) {
    for (let j = i + 1; j < reports.length; j++) {
      const distance = calculateDistance(
        reports[i].lat, reports[i].lng,
        reports[j].lat, reports[j].lng
      );
      
      if (distance <= 90) { // 90 meters
        overlappingPairs.push({
          report1: reports[i],
          report2: reports[j]
        });
      }
    }
  }
  
  return overlappingPairs;
};

interface GISMapProps {
  className?: string;
  activeLayersState?: Record<string, boolean>;
}

const GISMap: React.FC<GISMapProps> = ({ className, activeLayersState = {} }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [mapData, setMapData] = useState<MapData>(sampleMapData);
  const [realReports, setRealReports] = useState<any[]>([]);
  
  // Determine base layer from the activeLayersState
  let baseLayer = 'street';
  if (activeLayersState.satellite) baseLayer = 'satellite';
  if (activeLayersState.cyclemap) baseLayer = 'cyclemap';
  if (activeLayersState.cyclosm) baseLayer = 'cyclosm';
  
  // Map the activeLayersState to the internal layer structure
  const layers = {
    currentLocation: activeLayersState.basemap || false, // Using basemap for current location
    reports: activeLayersState.reports || false,
    events: activeLayersState.events || false,
    safetyAreas: activeLayersState.safety || false,
    puroks: false // Removed purok boundaries
  };

  // Calculate overlapping reports for safety level visualization
  const overlappingReports = layers.safetyAreas ? findOverlappingReports(mapData.reports) : [];
  
  // Calculate overlapping reports for red circle visualization

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Fetch real data from the database
    const fetchData = async () => {
      try {
        // Fetch real reports
        const reportsResponse = await fetch('/api/reports');
        const reports = await reportsResponse.json();
        setRealReports(reports);
        
        // Fetch real events  
        const eventsResponse = await fetch('/api/events');
        const events = await eventsResponse.json();
        
        // Convert real reports to map format
        const convertedReports = reports.map((report: any) => ({
          id: report.id.toString(),
          lat: report.lat || 16.4023,
          lng: report.lng || 120.5960,
          title: report.title,
          description: report.description,
          status: report.status || 'pending',
          imageUrl: report.imageUrl || null,
          createdAt: report.createdAt || new Date().toISOString()
        }));
        
        // Convert real events to map format (only active events)
        const convertedEvents = events
          .filter((event: any) => event.isActive)
          .map((event: any) => ({
            id: event.id.toString(),
            lat: event.lat || 16.4023,
            lng: event.lng || 120.5960,
            title: event.title,
            description: event.description,
            date: new Date(event.startDate).toLocaleDateString()
          }));
        
        // Update map data with real data
        setMapData(prev => ({
          ...prev,
          reports: convertedReports,
          events: convertedEvents
        }));
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();

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
        center={[16.3954, 120.5968]}
        zoom={16}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        {/* Base Layer - Always show one */}
        <TileLayer
          attribution={
            baseLayer === 'street' ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' :
            baseLayer === 'satellite' ? '&copy; <a href="https://www.esri.com/">Esri</a>' :
            baseLayer === 'cyclemap' ? '&copy; <a href="https://www.opencyclemap.org/">OpenCycleMap</a>, Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' :
            baseLayer === 'cyclosm' ? '&copy; <a href="https://github.com/cyclosm/cyclosm-cartocss-style/releases">CyclOSM</a> | Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' :
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }
          url={
            baseLayer === 'street' ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" :
            baseLayer === 'satellite' ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" :
            baseLayer === 'cyclemap' ? "https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png" :
            baseLayer === 'cyclosm' ? "https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png" :
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
        />

        {/* Conditional Layer Rendering */}
        {layers.currentLocation && <LocationMarker />}

        {layers.reports && (
          <>
            {mapData.reports.map((report) => (
              <Marker
                key={report.id}
                position={[report.lat, report.lng]}
                icon={getReportIcon(report.status)}
              >
                <Popup>
                  <div className="p-1 min-w-64">
                    <strong className="text-sm">{report.title}</strong>
                    <br />
                    <p className="text-sm mt-1">{report.description}</p>
                    
                    {/* Display image if available */}
                    {report.imageUrl && report.imageUrl !== "/placeholder.svg" && (
                      <div className="mt-2">
                        <img 
                          src={report.imageUrl} 
                          alt="Report image" 
                          className="w-full h-28 object-cover rounded border"
                          onError={(e) => {
                            // Hide image if it fails to load
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="outline" className="text-xs">
                        {report.status}
                      </Badge>
                      {report.createdAt && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </>
        )}

        {/* Safety Level Visualization - Yellow circles with red overlapping areas */}
        {layers.safetyAreas && (
          <>
            {/* Yellow circles around each report (base layer) */}
            {mapData.reports.map((report) => (
              <Circle
                key={`safety-yellow-${report.id}`}
                center={[report.lat, report.lng]}
                radius={90}
                pathOptions={{
                  color: '#eab308', // yellow
                  fillColor: '#eab308',
                  fillOpacity: 0.15,
                  weight: 2,
                  opacity: 0.8
                }}
              />
            ))}

            {/* Red overlay circles only for overlapping areas */}
            {overlappingReports.map((overlap, index) => {
              // Calculate the midpoint between the two overlapping reports
              const midLat = (overlap.report1.lat + overlap.report2.lat) / 2;
              const midLng = (overlap.report1.lng + overlap.report2.lng) / 2;
              
              // Calculate the distance between reports
              const distance = calculateDistance(
                overlap.report1.lat, overlap.report1.lng,
                overlap.report2.lat, overlap.report2.lng
              );
              
              // Calculate the radius of the overlap area (smaller circle representing intersection)
              const overlapRadius = Math.max(10, (90 - distance/2)); // Minimum 10m radius
              
              return (
                <Circle
                  key={`overlap-${index}`}
                  center={[midLat, midLng]}
                  radius={overlapRadius}
                  pathOptions={{
                    color: '#ef4444', // red
                    fillColor: '#ef4444',
                    fillOpacity: 0.4,
                    weight: 3,
                    opacity: 1
                  }}
                />
              );
            })}
          </>
        )}

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

        {/* Removed polygon-based safety areas and puroks - using circles instead */}



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
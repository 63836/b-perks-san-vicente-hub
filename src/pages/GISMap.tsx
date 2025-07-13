import { useState } from 'react';
import { Header, BottomNavigation } from '@/components/ui/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import GISMap from '@/components/GISMap/MapContainer';
import { offlineMapManager, BARANGAY_BOUNDS } from '@/utils/offlineMap';
import { MapPin, Layers, Navigation, Shield, Download, Trash2 } from 'lucide-react';

// Sample data for map layers
const mapLayers = [
  { id: 'basemap', name: 'Street Map', active: true, type: 'Base Layer' },
  { id: 'satellite', name: 'Satellite View', active: false, type: 'Base Layer' },
  { id: 'reports', name: 'Community Reports', active: true, type: 'Data Layer' },
  { id: 'events', name: 'Event Locations', active: true, type: 'Data Layer' },
  { id: 'safety', name: 'Safety Levels', active: false, type: 'Data Layer' },
  { id: 'puroks', name: 'Purok Boundaries', active: false, type: 'Data Layer' }
];

const safetyLevels = [
  { purok: 'Purok 1', level: 'high', description: 'Well-lit, regular patrol' },
  { purok: 'Purok 2', level: 'medium', description: 'Moderate lighting' },
  { purok: 'Purok 3', level: 'high', description: 'CCTV coverage' },
  { purok: 'Purok 4', level: 'low', description: 'Limited lighting' }
];

export default function GISMap() {
  const [activeLayersState, setActiveLayersState] = useState(
    mapLayers.reduce((acc, layer) => ({ ...acc, [layer.id]: layer.active }), {})
  );
  const [isDownloadingTiles, setIsDownloadingTiles] = useState(false);
  const [cacheSize, setCacheSize] = useState(0);

  const getSafetyColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-success';
      case 'medium': return 'bg-warning';
      case 'low': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  const handleLayerToggle = (layerId: string) => {
    setActiveLayersState(prev => ({
      ...prev,
      [layerId]: !prev[layerId]
    }));
  };

  const handleDownloadOfflineMaps = async () => {
    setIsDownloadingTiles(true);
    try {
      await offlineMapManager.cacheTilesForArea(
        BARANGAY_BOUNDS,
        12, // min zoom
        18  // max zoom
      );
      
      const newCacheSize = await offlineMapManager.getCacheSize();
      setCacheSize(newCacheSize);
      
      alert(`Successfully cached map tiles for offline use! (${newCacheSize} tiles)`);
    } catch (error) {
      console.error('Failed to download offline maps:', error);
      alert('Failed to download offline maps. Please check your internet connection and try again.');
    } finally {
      setIsDownloadingTiles(false);
    }
  };

  const handleClearCache = async () => {
    try {
      await offlineMapManager.clearCache();
      setCacheSize(0);
      alert('Map cache cleared successfully!');
    } catch (error) {
      console.error('Failed to clear cache:', error);
      alert('Failed to clear cache.');
    }
  };

  // Load cache size on component mount
  useState(() => {
    offlineMapManager.getCacheSize().then(setCacheSize);
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Community GIS Map" />

      <div className="p-4 space-y-6">
        {/* Interactive Map */}
        <Card>
          <CardContent className="p-0">
            <div className="h-96 rounded-lg overflow-hidden">
              <GISMap className="h-full w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Offline Map Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="h-5 w-5 mr-2" />
              Offline Maps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Cache Status</p>
                <p className="text-xs text-muted-foreground">
                  {cacheSize > 0 ? `${cacheSize} tiles cached` : 'No tiles cached'}
                </p>
              </div>
              <Badge variant={cacheSize > 0 ? 'default' : 'outline'}>
                {cacheSize > 0 ? 'Available' : 'Not Available'}
              </Badge>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleDownloadOfflineMaps}
                disabled={isDownloadingTiles}
                className="flex-1"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                {isDownloadingTiles ? 'Downloading...' : 'Download for Offline'}
              </Button>
              
              {cacheSize > 0 && (
                <Button
                  onClick={handleClearCache}
                  variant="outline"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="text-xs text-muted-foreground">
              <p>• Downloads map tiles for Barangay San Vicente area</p>
              <p>• Enables map viewing without internet connection</p>
              <p>• Cache expires after 7 days</p>
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
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={activeLayersState[layer.id]}
                    onCheckedChange={() => handleLayerToggle(layer.id)}
                  />
                  <Label className="text-xs">
                    {activeLayersState[layer.id] ? 'ON' : 'OFF'}
                  </Label>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Purok Safety Levels */}
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
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Current Location</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-sm">Community Reports</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
                <span className="text-sm">Event Locations</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-sm">Safe Areas</span>
              </div>
            </div>
            
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-2">Purok Safety Levels:</p>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-500"></div>
                  <span className="text-xs">High</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-yellow-500"></div>
                  <span className="text-xs">Medium</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-red-500"></div>
                  <span className="text-xs">Low</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Map Controls Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Navigation className="h-5 w-5 mr-2" />
              Map Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm space-y-1">
              <p>• <strong>Zoom:</strong> Use + / - buttons or mouse wheel</p>
              <p>• <strong>Pan:</strong> Click and drag to move around</p>
              <p>• <strong>Layers:</strong> Use layer control (top-left) to toggle visibility</p>
              <p>• <strong>Location:</strong> Click markers for detailed information</p>
              <p>• <strong>Offline:</strong> Download tiles for offline access</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
}
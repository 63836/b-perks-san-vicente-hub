import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Download, Share2, Copy } from 'lucide-react';
import { pwaInstallManager } from '@/utils/pwaInstall';
import { useToast } from '@/hooks/use-toast';

export function PWAInstallPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = pwaInstallManager.onInstallabilityChange((installable) => {
      setIsInstallable(installable);
      
      // Show prompt after a delay if installable and not dismissed before
      if (installable && !localStorage.getItem('pwa-install-dismissed')) {
        setTimeout(() => {
          setIsVisible(true);
        }, 3000); // Show after 3 seconds
      }
    });

    return unsubscribe;
  }, []);

  const handleInstall = async () => {
    const success = await pwaInstallManager.promptInstall();
    if (success) {
      toast({
        title: "App Installing",
        description: "B-Perks is being installed on your device",
      });
      setIsVisible(false);
    }
  };

  const handleShare = async () => {
    const shared = await pwaInstallManager.shareApp();
    if (!shared) {
      // Fallback to copy URL
      const copied = await pwaInstallManager.copyAppUrl();
      if (copied) {
        toast({
          title: "Link Copied",
          description: "App link copied to clipboard",
        });
      }
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (!isVisible || !isInstallable) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:max-w-sm">
      <Card className="shadow-lg border-primary/20">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">Install B-Perks</CardTitle>
              <CardDescription className="text-sm">
                Get the full app experience with offline access
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Works offline with cached data</li>
              <li>• Faster loading and performance</li>
              <li>• Native app-like experience</li>
              <li>• Push notifications for alerts</li>
            </ul>
            
            <div className="flex gap-2 pt-2">
              <Button 
                onClick={handleInstall}
                className="flex-1 h-8 text-xs"
                size="sm"
              >
                <Download className="h-3 w-3 mr-1" />
                Install
              </Button>
              <Button 
                variant="outline" 
                onClick={handleShare}
                className="h-8 text-xs"
                size="sm"
              >
                <Share2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import { useState } from 'react';
import { Header, BottomNavigation } from '@/components/ui/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Newspaper, AlertTriangle, Megaphone, Clock } from 'lucide-react';

// Sample news and alerts data
const sampleNews = [
  {
    id: '1',
    title: 'New Waste Segregation Guidelines',
    content: 'Starting February 1, 2024, all households must follow the new three-bin waste segregation system. Biodegradable, non-biodegradable, and recyclable materials must be separated properly.',
    type: 'announcement' as const,
    imageUrl: '/placeholder.svg',
    publishedAt: '2024-01-15T10:00:00Z',
    authorId: 'admin-1'
  },
  {
    id: '2',
    title: 'Heavy Rainfall Warning',
    content: 'PAGASA has issued a yellow rainfall warning for Baguio City. Residents are advised to stay indoors and avoid low-lying areas prone to flooding.',
    type: 'alert' as const,
    imageUrl: '/placeholder.svg',
    publishedAt: '2024-01-14T06:30:00Z',
    authorId: 'admin-1'
  },
  {
    id: '3',
    title: 'Barangay Council Meeting Minutes',
    content: 'Summary of the January 10, 2024 Barangay Council meeting: Approved budget for street lighting improvement, discussed upcoming community events, and addressed resident concerns about traffic.',
    type: 'news' as const,
    imageUrl: '/placeholder.svg',
    publishedAt: '2024-01-12T16:00:00Z',
    authorId: 'admin-1'
  },
  {
    id: '4',
    title: 'Water Service Interruption Notice',
    content: 'Baguio Water District will conduct maintenance work on January 20, 2024, from 8:00 AM to 5:00 PM. Affected areas include Purok 1-3. Please store water in advance.',
    type: 'alert' as const,
    imageUrl: '/placeholder.svg',
    publishedAt: '2024-01-11T14:00:00Z',
    authorId: 'admin-1'
  },
  {
    id: '5',
    title: 'Senior Citizens Benefit Distribution',
    content: 'The quarterly cash assistance for senior citizens will be distributed on January 25-26, 2024, at the Barangay Hall. Please bring valid ID and social pension booklet.',
    type: 'announcement' as const,
    imageUrl: '/placeholder.svg',
    publishedAt: '2024-01-08T09:00:00Z',
    authorId: 'admin-1'
  },
  {
    id: '6',
    title: 'Fire Safety Reminder',
    content: 'With the dry season approaching, residents are reminded to check electrical connections, avoid overloading sockets, and maintain clear fire exits. Report fire hazards to the Barangay immediately.',
    type: 'news' as const,
    imageUrl: '/placeholder.svg',
    publishedAt: '2024-01-05T11:00:00Z',
    authorId: 'admin-1'
  }
];

export default function News() {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('2024');

  const filteredNews = sampleNews.filter(item => {
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const itemYear = new Date(item.publishedAt).getFullYear().toString();
    const matchesYear = selectedYear === 'all' || itemYear === selectedYear;
    return matchesType && matchesYear;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="h-4 w-4" />;
      case 'announcement':
        return <Megaphone className="h-4 w-4" />;
      default:
        return <Newspaper className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'alert':
        return 'destructive';
      case 'announcement':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="News & Alerts" />

      <div className="p-4 space-y-6">
        {/* Filters */}
        <div className="flex gap-4">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="news">News</SelectItem>
              <SelectItem value="alert">Alerts</SelectItem>
              <SelectItem value="announcement">Announcements</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Filter by year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* News List */}
        <div className="space-y-4">
          {filteredNews.map((item) => (
            <Card key={item.id} className={item.type === 'alert' ? 'border-destructive/20' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <Badge variant={getTypeColor(item.type)} className="flex items-center gap-1">
                    {getTypeIcon(item.type)}
                    {item.type}
                  </Badge>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatDate(item.publishedAt)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  {getTypeIcon(item.type)}
                </div>

                <p className="text-sm text-foreground leading-relaxed">
                  {item.content}
                </p>

                <Button variant="outline" size="sm" className="w-full">
                  Read More
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredNews.length === 0 && (
          <div className="text-center py-12">
            <Newspaper className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No items found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters
            </p>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
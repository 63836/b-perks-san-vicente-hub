import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header, BottomNavigation } from '@/components/ui/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Newspaper, AlertTriangle, Megaphone, Clock } from 'lucide-react';

interface NewsAlert {
  id: number;
  title: string;
  content: string;
  type: 'news' | 'alert' | 'announcement';
  imageUrl?: string;
  authorId: number;
  createdAt: string;
}

export default function News() {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('2025');

  // Fetch news/alerts from API
  const { data: news = [], isLoading } = useQuery<NewsAlert[]>({
    queryKey: ['/api/news'],
  });

  const filteredNews = news.filter(item => {
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const itemYear = new Date(item.createdAt).getFullYear().toString();
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header title="News & Alerts" />
        <div className="p-4 flex items-center justify-center h-64">
          <div className="text-center">
            <Clock className="h-16 w-16 mx-auto text-muted-foreground mb-4 animate-spin" />
            <p className="text-muted-foreground">Loading news...</p>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

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
                  {formatDate(item.createdAt)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {item.imageUrl && (
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

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
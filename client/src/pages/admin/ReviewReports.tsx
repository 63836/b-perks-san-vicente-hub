import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Header } from '@/components/ui/navigation';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, MapPin, Clock, User, Eye, Edit, Newspaper } from 'lucide-react';

interface Report {
  id: string;
  userId: string;
  userName: string;
  title: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  imageUrl?: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'dropped';
  submittedAt: string;
}

export default function ReviewReports() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch reports from API
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['/api/reports'],
    queryFn: async () => {
      const response = await fetch('/api/reports');
      if (!response.ok) throw new Error('Failed to fetch reports');
      const data = await response.json();
      
      // Transform API data to match component format
      return data.map((report: any) => ({
        id: report.id.toString(),
        userId: report.userId.toString(),
        userName: report.userName || 'Unknown User',
        title: report.title,
        description: report.description,
        location: {
          lat: parseFloat(report.locationLat) || 16.4023,
          lng: parseFloat(report.locationLng) || 120.5960,
          address: report.locationAddress || 'Unknown Location'
        },
        imageUrl: report.imageUrl || null,
        status: report.status || 'pending',
        submittedAt: report.createdAt || new Date().toISOString()
      }));
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          title="Review Reports" 
          onBack={() => setLocation('/admin')}
          leftButton={<ArrowLeft className="h-5 w-5" />}
        />
        <div className="p-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading reports...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleStatusUpdate = async (reportId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) throw new Error('Failed to update status');
      
      // Invalidate and refetch reports to update the UI
      queryClient.invalidateQueries({ queryKey: ['/api/reports'] });
      
      toast({
        title: "Status Updated",
        description: `Report status updated to ${newStatus}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update report status.",
        variant: "destructive"
      });
    }
  };

  const handlePublishToNews = async (report: Report) => {
    try {
      const response = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Report Update: ${report.title}`,
          content: `Status: ${report.status.toUpperCase()}\n\nLocation: ${report.location?.address}\n\nDescription: ${report.description}`,
          type: 'alert',
          authorId: 1 // Admin user ID
        })
      });
      
      if (!response.ok) throw new Error('Failed to publish to news');
      
      toast({
        title: "Published to News",
        description: "Report has been published to news and alerts.",
      });
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to publish report to news.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'dropped': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredReports = statusFilter === 'all' 
    ? reports 
    : reports.filter(report => report.status === statusFilter);

  if (selectedReport) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Report Details" />
        
        <div className="p-4 space-y-6">
          <Button 
            variant="outline" 
            onClick={() => setSelectedReport(null)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{selectedReport.title}</span>
                <Badge className={getStatusColor(selectedReport.status)}>
                  {selectedReport.status.charAt(0).toUpperCase() + selectedReport.status.slice(1)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{selectedReport.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Reporter</h4>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    <span className="text-sm">{selectedReport.userName}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Submitted</h4>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="text-sm">
                      {new Date(selectedReport.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Location</h4>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="text-sm">{selectedReport.location?.address || 'Unknown Location'}</span>
                </div>
              </div>

              {selectedReport.imageUrl && (
                <div>
                  <h4 className="font-medium mb-2">Image</h4>
                  <img 
                    src={selectedReport.imageUrl} 
                    alt="Report image"
                    className="w-full max-w-md h-48 object-cover rounded"
                  />
                </div>
              )}

              <div>
                <h4 className="font-medium mb-2">Update Status</h4>
                <Select 
                  value={selectedReport.status} 
                  onValueChange={(value) => handleStatusUpdate(selectedReport.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="dropped">Dropped</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => handlePublishToNews(selectedReport)}
                  className="flex-1"
                >
                  <Newspaper className="h-4 w-4 mr-2" />
                  Publish to News
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
      <Header title="Review Reports" />
      
      <div className="p-4 space-y-6">
        <Button 
          variant="outline" 
          onClick={() => setLocation('/admin/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium">Filter by Status:</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reports</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="dropped">Dropped</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {filteredReports.map((report) => (
            <Card key={report.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{report.title}</span>
                  <Badge className={getStatusColor(report.status)}>
                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {report.description}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {report.userName}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {report.location?.address || 'Unknown Location'}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(report.submittedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex space-x-2 mt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedReport(report)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handlePublishToNews(report)}
                    >
                      <Newspaper className="h-4 w-4 mr-2" />
                      Publish
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
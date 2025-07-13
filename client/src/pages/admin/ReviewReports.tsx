import { useState } from 'react';
import { useLocation } from 'wouter';
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
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Mock data for reports
  const reports: Report[] = [
    {
      id: '1',
      userId: '1',
      userName: 'Maria Santos',
      title: 'Broken Street Light',
      description: 'The street light on Main Street has been broken for 3 days',
      location: {
        lat: 16.4023,
        lng: 120.5960,
        address: 'Main Street, Barangay San Vicente'
      },
      imageUrl: '/placeholder.svg',
      status: 'pending',
      submittedAt: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      userId: '2',
      userName: 'Juan Dela Cruz',
      title: 'Pothole on Road',
      description: 'Large pothole causing traffic issues',
      location: {
        lat: 16.4025,
        lng: 120.5962,
        address: 'Secondary Road, Barangay San Vicente'
      },
      status: 'in-progress',
      submittedAt: '2024-01-14T14:30:00Z'
    },
    {
      id: '3',
      userId: '3',
      userName: 'Ana Garcia',
      title: 'Drainage Issue',
      description: 'Clogged drainage causing flooding during rain',
      location: {
        lat: 16.4020,
        lng: 120.5958,
        address: 'Park Avenue, Barangay San Vicente'
      },
      status: 'resolved',
      submittedAt: '2024-01-13T09:15:00Z'
    }
  ];

  const handleStatusUpdate = (reportId: string, newStatus: string) => {
    // TODO: Update status in backend
    toast({
      title: "Status Updated",
      description: `Report status updated to ${newStatus}.`,
    });
  };

  const handlePublishToNews = (report: Report) => {
    // TODO: Publish report to news/alerts
    toast({
      title: "Published to News",
      description: "Report has been published to news and alerts.",
    });
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
                  <span className="text-sm">{selectedReport.location.address}</span>
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
                      {report.location.address}
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
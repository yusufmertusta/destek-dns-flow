import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Plus, 
  Search, 
  Download, 
  Upload, 
  ArrowLeft,
  Edit,
  Trash2,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Copy,
  ExternalLink
} from "lucide-react";
import { dataService, Domain, DNSRecord } from "@/lib/data";
import { authService } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function DNSRecordsPage() {
  const { domainId } = useParams<{ domainId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [domain, setDomain] = useState<Domain | null>(null);
  const [records, setRecords] = useState<DNSRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingRecord, setEditingRecord] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form state for new/edit record
  const [formData, setFormData] = useState({
    type: 'A' as DNSRecord['type'],
    name: '',
    value: '',
    ttl: 3600,
    site: '',
    status: 'active' as DNSRecord['status']
  });

  useEffect(() => {
    const loadDomainAndRecords = async () => {
      if (!domainId) {
        navigate('/dashboard');
        return;
      }

      const user = authService.getCurrentUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const domainData = await dataService.getDomainById(domainId);
      if (!domainData || (user.role !== 'admin' && domainData.userId !== user.id)) {
        navigate('/dashboard');
        return;
      }

      setDomain(domainData);
      loadRecords();
    };

    loadDomainAndRecords();
  }, [domainId, navigate]);

  const loadRecords = async () => {
    if (domainId) {
      const domainRecords = await dataService.getDNSRecordsByDomainId(domainId);
      setRecords(domainRecords);
    }
  };

  const filteredRecords = records.filter(record =>
    record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      type: 'A',
      name: '',
      value: '',
      ttl: 3600,
      site: '',
      status: 'active'
    });
  };

  const handleAddRecord = async () => {
    if (!domainId || !formData.name || !formData.value) return;

    setIsLoading(true);
    try {
      const newRecord = await dataService.createDNSRecord({
        domainId,
        ...formData
      });

      if (newRecord) {
        setRecords(prev => [...prev, newRecord]);
      }
      setIsAddDialogOpen(false);
      resetForm();
      
      toast({
        title: "DNS Record Added",
        description: `${formData.type} record for ${formData.name} has been created.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add DNS record. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditRecord = (record: DNSRecord) => {
    setFormData({
      type: record.type,
      name: record.name,
      value: record.value,
      ttl: record.ttl,
      site: record.site,
      status: record.status
    });
    setEditingRecord(record.id);
  };

  const handleUpdateRecord = async (recordId: string) => {
    setIsLoading(true);
    try {
      const updatedRecord = await dataService.updateDNSRecord(recordId, formData);
      if (updatedRecord) {
        setRecords(prev => prev.map(r => r.id === recordId ? updatedRecord : r));
        setEditingRecord(null);
        resetForm();
        
        toast({
          title: "DNS Record Updated",
          description: "Record has been updated successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update DNS record. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRecord = async (record: DNSRecord) => {
    if (confirm(`Are you sure you want to delete the ${record.type} record for ${record.name}?`)) {
      const success = await dataService.deleteDNSRecord(record.id);
      if (success) {
        setRecords(prev => prev.filter(r => r.id !== record.id));
        toast({
          title: "DNS Record Deleted",
          description: `${record.type} record for ${record.name} has been deleted.`,
        });
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Value copied to clipboard.",
    });
  };

  const exportRecords = () => {
    const csvContent = [
      ['Type', 'Name', 'Value', 'TTL', 'Site', 'Status'].join(','),
      ...records.map(record => [
        record.type,
        record.name,
        record.value,
        record.ttl,
        record.site,
        record.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${domain?.domainName}-dns-records.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "DNS records exported successfully.",
    });
  };

  const getStatusBadge = (status: DNSRecord['status']) => {
    return status === 'active' ? (
      <Badge variant="secondary" className="bg-success/10 text-success">
        <CheckCircle className="h-3 w-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-destructive/10 text-destructive">
        <AlertCircle className="h-3 w-3 mr-1" />
        Inactive
      </Badge>
    );
  };

  if (!domain) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Domain not found</h3>
          <p className="text-muted-foreground">The requested domain could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link to="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Domains
          </Button>
        </Link>
      </div>

      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-3xl font-bold tracking-tight">{domain.domainName}</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(`https://${domain.domainName}`, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-muted-foreground">
            Manage DNS records for this domain
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={exportRecords}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:opacity-90">
                <Plus className="mr-2 h-4 w-4" />
                Add Record
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add DNS Record</DialogTitle>
                <DialogDescription>
                  Create a new DNS record for {domain.domainName}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as DNSRecord['type'] }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="AAAA">AAAA</SelectItem>
                        <SelectItem value="CNAME">CNAME</SelectItem>
                        <SelectItem value="MX">MX</SelectItem>
                        <SelectItem value="TXT">TXT</SelectItem>
                        <SelectItem value="NS">NS</SelectItem>
                        <SelectItem value="SRV">SRV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="www"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Value</Label>
                  <Input
                    id="value"
                    placeholder="192.168.1.1"
                    value={formData.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ttl">TTL (seconds)</Label>
                    <Input
                      id="ttl"
                      type="number"
                      value={formData.ttl}
                      onChange={(e) => setFormData(prev => ({ ...prev, ttl: parseInt(e.target.value) || 3600 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="site">Site/Description</Label>
                    <Input
                      id="site"
                      placeholder="Main site"
                      value={formData.site}
                      onChange={(e) => setFormData(prev => ({ ...prev, site: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddRecord} 
                  disabled={isLoading || !formData.name || !formData.value}
                  className="bg-gradient-primary hover:opacity-90"
                >
                  {isLoading ? "Adding..." : "Add Record"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search DNS records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>DNS Records ({records.length})</CardTitle>
          <CardDescription>
            Manage all DNS records for {domain.domainName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRecords.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No DNS records found</h3>
              <p className="text-muted-foreground mb-4">
                {records.length === 0 
                  ? "Get started by adding your first DNS record."
                  : "Try adjusting your search terms."
                }
              </p>
              {records.length === 0 && (
                <Button 
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-gradient-primary hover:opacity-90"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Record
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>TTL</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {record.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">
                        {editingRecord === record.id ? (
                          <Input
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-32"
                          />
                        ) : (
                          record.name || '@'
                        )}
                      </TableCell>
                      <TableCell className="font-mono max-w-xs">
                        {editingRecord === record.id ? (
                          <Input
                            value={formData.value}
                            onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                          />
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className="truncate">{record.value}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(record.value)}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingRecord === record.id ? (
                          <Input
                            type="number"
                            value={formData.ttl}
                            onChange={(e) => setFormData(prev => ({ ...prev, ttl: parseInt(e.target.value) || 3600 }))}
                            className="w-24"
                          />
                        ) : (
                          `${record.ttl}s`
                        )}
                      </TableCell>
                      <TableCell>
                        {editingRecord === record.id ? (
                          <Input
                            value={formData.site}
                            onChange={(e) => setFormData(prev => ({ ...prev, site: e.target.value }))}
                            className="w-32"
                          />
                        ) : (
                          record.site || '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(record.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {editingRecord === record.id ? (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUpdateRecord(record.id)}
                                disabled={isLoading}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingRecord(null);
                                  resetForm();
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditRecord(record)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteRecord(record)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
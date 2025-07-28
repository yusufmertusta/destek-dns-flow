import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Globe, 
  Search,
  Edit,
  Trash2,
  ExternalLink,
  Server,
  User
} from "lucide-react";
import { dataService, Domain } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface DomainWithUser extends Domain {
  userName?: string;
  userEmail?: string;
}

export function AdminDomainsPage() {
  const [domains, setDomains] = useState<DomainWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadDomains();
  }, []);

  const loadDomains = async () => {
    try {
      setLoading(true);
      
      // Get all domains
      const allDomains = await dataService.getAllDomains();
      
      // Get user profiles to map user info
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, name');
      
      if (profilesError) {
        console.warn('Could not fetch user profiles:', profilesError);
      }

      // Get auth users for email addresses
      // Note: admin.listUsers might not be available in client-side code
      // For now, we'll skip getting email addresses
      const authUsers = null;
      
      // Skip auth users for now

      // Combine domain data with user info
      const domainsWithUsers: DomainWithUser[] = allDomains.map(domain => {
        const profile = profiles?.find(p => p.user_id === domain.userId);
        const authUser = null; // Skip auth user lookup for now
        
        return {
          ...domain,
          userName: profile?.name || 'Unknown User',
          userEmail: 'N/A' // Skip email for now
        };
      });

      setDomains(domainsWithUsers);
    } catch (error) {
      console.error('Error loading domains:', error);
      toast({
        title: "Error",
        description: "Failed to load domains",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateDomainStatus = async (domainId: string, newStatus: 'active' | 'inactive' | 'pending') => {
    try {
      const { error } = await supabase
        .from('domains')
        .update({ status: newStatus })
        .eq('id', domainId);

      if (error) throw error;

      setDomains(domains.map(domain => 
        domain.id === domainId ? { ...domain, status: newStatus } : domain
      ));

      toast({
        title: "Success",
        description: `Domain status updated to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating domain status:', error);
      toast({
        title: "Error",
        description: "Failed to update domain status",
        variant: "destructive"
      });
    }
  };

  const deleteDomain = async (domainId: string) => {
    try {
      const success = await dataService.deleteDomain(domainId);
      
      if (success) {
        setDomains(domains.filter(domain => domain.id !== domainId));
        toast({
          title: "Success",
          description: "Domain deleted successfully",
        });
      } else {
        throw new Error('Failed to delete domain');
      }
    } catch (error) {
      console.error('Error deleting domain:', error);
      toast({
        title: "Error",
        description: "Failed to delete domain",
        variant: "destructive"
      });
    }
  };

  const filteredDomains = domains.filter(domain => {
    const matchesSearch = domain.domainName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         domain.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         domain.userEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || domain.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-success text-success-foreground',
      inactive: 'bg-destructive text-destructive-foreground',
      pending: 'bg-warning text-warning-foreground'
    };
    
    return (
      <Badge className={colors[status as keyof typeof colors] || colors.pending}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Globe className="h-8 w-8 text-primary mr-3" />
            All Domains
          </h1>
          <p className="text-muted-foreground">
            Manage all domains across the platform
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Domains ({domains.length})</CardTitle>
          <CardDescription>
            All domains registered in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search domains, users, or emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Records</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading domains...
                    </TableCell>
                  </TableRow>
                ) : filteredDomains.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No domains found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDomains.map((domain) => (
                    <TableRow key={domain.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4 text-primary" />
                          <span className="font-medium font-mono">{domain.domainName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{domain.userName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {domain.userEmail}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={domain.status}
                          onValueChange={(value: 'active' | 'inactive' | 'pending') => updateDomainStatus(domain.id, value)}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Server className="h-4 w-4 text-muted-foreground" />
                          <span>{domain.recordCount}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(domain.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/domain/${domain.id}`)}
                            title="View DNS Records"
                          >
                            <Server className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteDomain(domain.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
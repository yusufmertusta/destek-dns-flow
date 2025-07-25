import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Search, 
  Globe, 
  Calendar,
  Activity,
  Trash2,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { dataService, Domain } from "@/lib/data";
import { authService } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function UserDashboard() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newDomainName, setNewDomainName] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadDomains();
  }, []);

  const loadDomains = async () => {
    const user = authService.getCurrentUser();
    if (user) {
      const userDomains = await dataService.getDomainsByUserId(user.id);
      setDomains(userDomains);
    }
  };

  const filteredDomains = domains.filter(domain =>
    domain.domainName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddDomain = async () => {
    if (!newDomainName.trim()) return;

    setIsLoading(true);
    try {
      const user = authService.getCurrentUser();
      if (!user) return;

      const newDomain = await dataService.createDomain({
        userId: user.id,
        domainName: newDomainName.trim(),
        status: 'active'
      });

      if (newDomain) {
        setDomains(prev => [...prev, newDomain]);
        setNewDomainName('');
        setIsAddDialogOpen(false);
        
        toast({
          title: "Domain Added",
          description: `${newDomain.domainName} has been added successfully.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add domain. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDomain = async (domain: Domain) => {
    if (confirm(`Are you sure you want to delete ${domain.domainName}? This action cannot be undone.`)) {
      const success = await dataService.deleteDomain(domain.id);
      if (success) {
        setDomains(prev => prev.filter(d => d.id !== domain.id));
        toast({
          title: "Domain Deleted",
          description: `${domain.domainName} has been deleted.`,
        });
      }
    }
  };

  const getStatusIcon = (status: Domain['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'inactive':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: Domain['status']) => {
    const variants = {
      active: "bg-success/10 text-success hover:bg-success/20",
      pending: "bg-warning/10 text-warning hover:bg-warning/20",
      inactive: "bg-destructive/10 text-destructive hover:bg-destructive/20"
    };
    
    return (
      <Badge variant="secondary" className={variants[status]}>
        {getStatusIcon(status)}
        <span className="ml-1 capitalize">{status}</span>
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Domains</h1>
          <p className="text-muted-foreground">
            Manage your domains and DNS records
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90">
              <Plus className="mr-2 h-4 w-4" />
              Add Domain
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Domain</DialogTitle>
              <DialogDescription>
                Enter the domain name you want to manage with DESTEK.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="domain">Domain Name</Label>
                <Input
                  id="domain"
                  placeholder="example.com"
                  value={newDomainName}
                  onChange={(e) => setNewDomainName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddDomain()}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddDomain} 
                disabled={isLoading || !newDomainName.trim()}
                className="bg-gradient-primary hover:opacity-90"
              >
                {isLoading ? "Adding..." : "Add Domain"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search domains..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Domains</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{domains.length}</div>
            <p className="text-xs text-muted-foreground">
              Across all your projects
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Domains</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {domains.filter(d => d.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently operational
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DNS Records</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {domains.reduce((sum, domain) => sum + domain.recordCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total configured records
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Domains Grid */}
      {filteredDomains.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Globe className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {domains.length === 0 ? "No domains yet" : "No domains found"}
            </h3>
            <p className="text-muted-foreground text-center mb-6">
              {domains.length === 0 
                ? "Get started by adding your first domain to manage with DESTEK."
                : "Try adjusting your search terms or add a new domain."
              }
            </p>
            {domains.length === 0 && (
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-gradient-primary hover:opacity-90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Domain
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredDomains.map((domain) => (
            <Card 
              key={domain.id} 
              className="group hover:shadow-lg transition-all duration-300 cursor-pointer bg-gradient-card border-0"
              onClick={() => navigate(`/dashboard/domain/${domain.id}`)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                    {domain.domainName}
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`https://${domain.domainName}`, '_blank');
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDomain(domain);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Added {new Date(domain.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(domain.status)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {domain.recordCount} record{domain.recordCount !== 1 ? 's' : ''}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Users, 
  Globe, 
  Server, 
  Activity,
  Search,
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  Shield,
  Database
} from "lucide-react";
import { dataService } from "@/lib/data";
import { authService } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDomains: 0,
    totalRecords: 0,
    activeUsers: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  
  const { toast } = useToast();

  useEffect(() => {
    loadStats();
    loadRecentActivity();
  }, []);

  const loadStats = () => {
    const allDomains = dataService.getAllDomains();
    const allRecords = dataService.getAllDNSRecords();
    
    // Mock user statistics
    setStats({
      totalUsers: 3,
      totalDomains: allDomains.length,
      totalRecords: allRecords.length,
      activeUsers: 2
    });
  };

  const loadRecentActivity = () => {
    // Mock recent activity data
    const activities = [
      {
        id: '1',
        user: 'John Doe',
        action: 'Added domain',
        target: 'example.com',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        type: 'domain'
      },
      {
        id: '2',
        user: 'John Doe', 
        action: 'Created A record',
        target: 'www.example.com',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        type: 'record'
      },
      {
        id: '3',
        user: 'Jane Smith',
        action: 'Updated MX record',
        target: 'mail.testsite.org',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        type: 'record'
      },
      {
        id: '4',
        user: 'John Doe',
        action: 'Deleted CNAME record',
        target: 'old.example.com',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        type: 'record'
      }
    ];
    
    setRecentActivity(activities);
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now.getTime() - time.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'domain':
        return <Globe className="h-4 w-4 text-primary" />;
      case 'record':
        return <Database className="h-4 w-4 text-success" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Shield className="h-8 w-8 text-primary mr-3" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Overview of DESTEK DNS platform administration
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Domains</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDomains}</div>
            <p className="text-xs text-muted-foreground">
              +5 from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DNS Records</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRecords}</div>
            <p className="text-xs text-muted-foreground">
              +12 from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.activeUsers / stats.totalUsers) * 100)}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest actions across the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      <span className="text-primary">{activity.user}</span>
                      {' '}{activity.action}{' '}
                      <span className="font-mono text-xs bg-accent px-1 py-0.5 rounded">
                        {activity.target}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              System Status
            </CardTitle>
            <CardDescription>
              Platform health and performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-success/10">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-success rounded-full"></div>
                  <span className="text-sm font-medium">DNS Resolution</span>
                </div>
                <Badge variant="secondary" className="bg-success/20 text-success">
                  Operational
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-success/10">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-success rounded-full"></div>
                  <span className="text-sm font-medium">API Services</span>
                </div>
                <Badge variant="secondary" className="bg-success/20 text-success">
                  Operational
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-success/10">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-success rounded-full"></div>
                  <span className="text-sm font-medium">Database</span>
                </div>
                <Badge variant="secondary" className="bg-success/20 text-success">
                  Operational
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-warning rounded-full"></div>
                  <span className="text-sm font-medium">Monitoring</span>
                </div>
                <Badge variant="secondary" className="bg-warning/20 text-warning">
                  Maintenance
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button className="h-20 flex-col space-y-2 bg-gradient-primary hover:opacity-90">
              <Users className="h-6 w-6" />
              <span>Manage Users</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Globe className="h-6 w-6" />
              <span>View All Domains</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Server className="h-6 w-6" />
              <span>System Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
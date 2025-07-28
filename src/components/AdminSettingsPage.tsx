import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  Settings,
  Shield,
  Database,
  Mail,
  Bell,
  Save,
  Server,
  Lock,
  Globe,
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SystemSettings {
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  maxDomainsPerUser: number;
  maxRecordsPerDomain: number;
  defaultTTL: number;
  smtpEnabled: boolean;
  smtpServer: string;
  smtpPort: number;
  smtpUsername: string;
  backupEnabled: boolean;
  backupRetentionDays: number;
  apiRateLimit: number;
  maintenanceMessage: string;
  systemName: string;
  supportEmail: string;
}

export function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    maintenanceMode: false,
    registrationEnabled: true,
    maxDomainsPerUser: 10,
    maxRecordsPerDomain: 100,
    defaultTTL: 3600,
    smtpEnabled: false,
    smtpServer: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUsername: '',
    backupEnabled: true,
    backupRetentionDays: 30,
    apiRateLimit: 1000,
    maintenanceMessage: 'System is under maintenance. Please try again later.',
    systemName: 'DESTEK DNS',
    supportEmail: 'support@destek.com'
  });
  
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would save to a database or configuration service
      // For now, we'll just simulate saving
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Settings className="h-8 w-8 text-primary mr-3" />
            System Settings
          </h1>
          <p className="text-muted-foreground">
            Configure system-wide settings and preferences
          </p>
        </div>
        <Button onClick={handleSave} disabled={loading} className="bg-gradient-primary">
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              General Settings
            </CardTitle>
            <CardDescription>
              Basic system configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="systemName">System Name</Label>
              <Input
                id="systemName"
                value={settings.systemName}
                onChange={(e) => updateSetting('systemName', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input
                id="supportEmail"
                type="email"
                value={settings.supportEmail}
                onChange={(e) => updateSetting('supportEmail', e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Put the system in maintenance mode
                </p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => updateSetting('maintenanceMode', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>User Registration</Label>
                <p className="text-sm text-muted-foreground">
                  Allow new users to register
                </p>
              </div>
              <Switch
                checked={settings.registrationEnabled}
                onCheckedChange={(checked) => updateSetting('registrationEnabled', checked)}
              />
            </div>

            {settings.maintenanceMode && (
              <div className="space-y-2">
                <Label htmlFor="maintenanceMessage">Maintenance Message</Label>
                <Textarea
                  id="maintenanceMessage"
                  value={settings.maintenanceMessage}
                  onChange={(e) => updateSetting('maintenanceMessage', e.target.value)}
                  rows={3}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* DNS Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Server className="h-5 w-5 mr-2" />
              DNS Configuration
            </CardTitle>
            <CardDescription>
              DNS-specific settings and limits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="maxDomains">Max Domains per User</Label>
              <Input
                id="maxDomains"
                type="number"
                value={settings.maxDomainsPerUser}
                onChange={(e) => updateSetting('maxDomainsPerUser', parseInt(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxRecords">Max Records per Domain</Label>
              <Input
                id="maxRecords"
                type="number"
                value={settings.maxRecordsPerDomain}
                onChange={(e) => updateSetting('maxRecordsPerDomain', parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultTTL">Default TTL (seconds)</Label>
              <Input
                id="defaultTTL"
                type="number"
                value={settings.defaultTTL}
                onChange={(e) => updateSetting('defaultTTL', parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiRateLimit">API Rate Limit (requests/hour)</Label>
              <Input
                id="apiRateLimit"
                type="number"
                value={settings.apiRateLimit}
                onChange={(e) => updateSetting('apiRateLimit', parseInt(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Email Configuration
            </CardTitle>
            <CardDescription>
              SMTP settings for system emails
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable SMTP</Label>
                <p className="text-sm text-muted-foreground">
                  Enable email notifications
                </p>
              </div>
              <Switch
                checked={settings.smtpEnabled}
                onCheckedChange={(checked) => updateSetting('smtpEnabled', checked)}
              />
            </div>

            {settings.smtpEnabled && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="smtpServer">SMTP Server</Label>
                  <Input
                    id="smtpServer"
                    value={settings.smtpServer}
                    onChange={(e) => updateSetting('smtpServer', e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">Port</Label>
                    <Input
                      id="smtpPort"
                      type="number"
                      value={settings.smtpPort}
                      onChange={(e) => updateSetting('smtpPort', parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="smtpUsername">Username</Label>
                    <Input
                      id="smtpUsername"
                      value={settings.smtpUsername}
                      onChange={(e) => updateSetting('smtpUsername', e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Backup Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Backup & Security
            </CardTitle>
            <CardDescription>
              Data backup and security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Automatic Backups</Label>
                <p className="text-sm text-muted-foreground">
                  Enable daily database backups
                </p>
              </div>
              <Switch
                checked={settings.backupEnabled}
                onCheckedChange={(checked) => updateSetting('backupEnabled', checked)}
              />
            </div>

            {settings.backupEnabled && (
              <div className="space-y-2">
                <Label htmlFor="retentionDays">Backup Retention (days)</Label>
                <Input
                  id="retentionDays"
                  type="number"
                  value={settings.backupRetentionDays}
                  onChange={(e) => updateSetting('backupRetentionDays', parseInt(e.target.value))}
                />
              </div>
            )}

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium flex items-center">
                <Lock className="h-4 w-4 mr-2" />
                Security Status
              </h4>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-success/10">
                  <span className="text-sm">SSL Certificate</span>
                  <Badge className="bg-success/20 text-success">Valid</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-success/10">
                  <span className="text-sm">Database Encryption</span>
                  <Badge className="bg-success/20 text-success">Enabled</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10">
                  <span className="text-sm">Firewall</span>
                  <Badge className="bg-warning/20 text-warning">Monitoring</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            System Information
          </CardTitle>
          <CardDescription>
            Current system status and statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Server Uptime</p>
              <p className="text-2xl font-bold text-success">99.9%</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Database Size</p>
              <p className="text-2xl font-bold">2.4 GB</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Memory Usage</p>
              <p className="text-2xl font-bold">68%</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">API Requests/hr</p>
              <p className="text-2xl font-bold">1,247</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
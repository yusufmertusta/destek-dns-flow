import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  Book,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Video,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function SupportPage() {
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: '',
    priority: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();

  const submitTicket = async () => {
    if (!ticketForm.subject || !ticketForm.category || !ticketForm.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // In a real implementation, this would submit to a ticketing system
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Support ticket submitted successfully. We'll get back to you soon!",
      });
      
      // Reset form
      setTicketForm({
        subject: '',
        category: '',
        priority: '',
        description: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit ticket",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const faqs = [
    {
      question: "How do I add a new domain?",
      answer: "To add a new domain, go to your dashboard and click the 'Add Domain' button. Enter your domain name and follow the verification process. You'll need to update your nameservers or add verification records as instructed."
    },
    {
      question: "What DNS record types are supported?",
      answer: "We support all common DNS record types including A, AAAA, CNAME, MX, TXT, NS, and SRV records. Each record type serves different purposes for your domain configuration."
    },
    {
      question: "How long does DNS propagation take?",
      answer: "DNS changes typically propagate within 24-48 hours globally, though many changes are visible much sooner. The TTL (Time To Live) value affects how quickly changes are reflected."
    },
    {
      question: "Can I import DNS records from another provider?",
      answer: "Yes, you can manually add your existing DNS records or contact support for assistance with bulk imports from other DNS providers."
    },
    {
      question: "What is the maximum number of domains I can manage?",
      answer: "The limit depends on your subscription plan. Basic users can manage up to 10 domains, Pro users up to 50 domains, and Enterprise users have unlimited domains."
    },
    {
      question: "How do I enable DNSSEC?",
      answer: "DNSSEC can be enabled in your domain settings. Contact support for assistance with DNSSEC setup as it requires coordination with your domain registrar."
    }
  ];

  const resources = [
    {
      title: "Getting Started Guide",
      description: "Complete guide to setting up your first domain",
      type: "Documentation",
      icon: <Book className="h-5 w-5" />
    },
    {
      title: "DNS Best Practices",
      description: "Learn about optimal DNS configuration",
      type: "Guide",
      icon: <FileText className="h-5 w-5" />
    },
    {
      title: "Video Tutorials",
      description: "Step-by-step video guides",
      type: "Video",
      icon: <Video className="h-5 w-5" />
    },
    {
      title: "API Documentation",
      description: "Complete API reference and examples",
      type: "API",
      icon: <Download className="h-5 w-5" />
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <HelpCircle className="h-8 w-8 text-primary mr-3" />
            Support Center
          </h1>
          <p className="text-muted-foreground">
            Get help with DNS management and technical support
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Support Ticket Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="h-5 w-5 mr-2" />
                Submit Support Ticket
              </CardTitle>
              <CardDescription>
                Need help? Submit a ticket and our support team will assist you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    placeholder="Brief description of your issue"
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={ticketForm.category} onValueChange={(value) => setTicketForm(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical Issue</SelectItem>
                      <SelectItem value="billing">Billing & Account</SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                      <SelectItem value="general">General Question</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={ticketForm.priority} onValueChange={(value) => setTicketForm(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Please provide detailed information about your issue..."
                  rows={6}
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <Button onClick={submitTicket} disabled={loading} className="bg-gradient-primary">
                <Send className="h-4 w-4 mr-2" />
                {loading ? 'Submitting...' : 'Submit Ticket'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Multiple ways to reach our support team
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Email Support</p>
                  <p className="text-sm text-muted-foreground">support@destek.com</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Phone Support</p>
                  <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Business Hours</p>
                  <p className="text-sm text-muted-foreground">Mon-Fri, 9AM-6PM EST</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Response Times</CardTitle>
              <CardDescription>
                Expected response times by priority
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Low Priority</span>
                <Badge variant="secondary">24-48 hours</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Medium Priority</span>
                <Badge className="bg-primary text-primary-foreground">8-24 hours</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">High Priority</span>
                <Badge className="bg-warning text-warning-foreground">2-8 hours</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Urgent</span>
                <Badge className="bg-destructive text-destructive-foreground">1 hour</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>
            Common questions and answers about DNS management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-4">
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Resources & Documentation</CardTitle>
          <CardDescription>
            Helpful resources to get you started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {resources.map((resource, index) => (
              <div key={index} className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
                <div className="text-primary">
                  {resource.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{resource.title}</h4>
                  <p className="text-sm text-muted-foreground">{resource.description}</p>
                  <Badge variant="outline" className="mt-1 text-xs">
                    {resource.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
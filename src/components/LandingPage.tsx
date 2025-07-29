import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Zap, Globe, Server, CheckCircle, ArrowRight, Cloud, Lock, BarChart3 } from "lucide-react";
export function LandingPage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const features = [{
    icon: <Globe className="h-8 w-8" />,
    title: "Global DNS Network",
    description: "Lightning-fast DNS resolution with 99.99% uptime guarantee across our global network."
  }, {
    icon: <Shield className="h-8 w-8" />,
    title: "Advanced Security",
    description: "Enterprise-grade security with DDoS protection and real-time threat monitoring."
  }, {
    icon: <Zap className="h-8 w-8" />,
    title: "Instant Propagation",
    description: "DNS changes propagate instantly across our network with automated validation."
  }, {
    icon: <BarChart3 className="h-8 w-8" />,
    title: "Real-time Analytics",
    description: "Comprehensive analytics and monitoring for all your DNS queries and performance."
  }];
  const plans = [{
    name: "Starter",
    price: "Free",
    description: "Perfect for personal projects",
    features: ["Up to 3 domains", "Basic DNS records", "Community support", "99.9% uptime SLA"]
  }, {
    name: "Professional",
    price: "$19",
    period: "/month",
    description: "For growing businesses",
    features: ["Unlimited domains", "Advanced DNS records", "Priority support", "99.99% uptime SLA", "API access", "Analytics dashboard"],
    popular: true
  }, {
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations",
    features: ["Everything in Professional", "Dedicated account manager", "Custom SLA", "Advanced security", "White-label options", "24/7 phone support"]
  }];
  return <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Server className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">DESTEK DNS MANAGEMENT</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">
                Pricing
              </a>
              <a href="#contact" className="text-sm font-medium hover:text-primary transition-colors">
                Contact
              </a>
            </div>

            <div className="flex items-center space-x-3">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link to="/login">
                <Button size="sm" className="bg-gradient-primary hover:opacity-90">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 md:py-32 px-4">
        <div className="container mx-auto text-center">
          <div className="animate-fade-in-up">
            <Badge variant="secondary" className="mb-6">
              <Zap className="h-3 w-3 mr-1" />
              Trusted by 10,000+ businesses worldwide
            </Badge>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent">
              Professional DNS
              <br />
              Management Platform
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Manage your domains and DNS records with enterprise-grade performance, 
              security, and reliability. Built for developers, trusted by enterprises.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/login">
                <Button size="lg" className="bg-gradient-primary hover:opacity-90 shadow-primary group">
                  Start Managing DNS
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                View Documentation
              </Button>
            </div>
          </div>

          {/* Floating DNS Cards Animation */}
          <div className="mt-20 relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="animate-float bg-gradient-card border-0 shadow-lg" style={{
              animationDelay: '0s'
            }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">A Record</span>
                    <Badge variant="secondary" className="text-xs">Active</Badge>
                  </div>
                  <div className="text-lg font-mono">192.168.1.100</div>
                  <div className="text-sm text-muted-foreground">example.com</div>
                </CardContent>
              </Card>
              
              <Card className="animate-float bg-gradient-card border-0 shadow-lg" style={{
              animationDelay: '2s'
            }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">CNAME</span>
                    <Badge variant="secondary" className="text-xs">Active</Badge>
                  </div>
                  <div className="text-lg font-mono">cdn.example.com</div>
                  <div className="text-sm text-muted-foreground">www.example.com</div>
                </CardContent>
              </Card>
              
              <Card className="animate-float bg-gradient-card border-0 shadow-lg" style={{
              animationDelay: '4s'
            }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">MX Record</span>
                    <Badge variant="secondary" className="text-xs">Active</Badge>
                  </div>
                  <div className="text-lg font-mono">mail.example.com</div>
                  <div className="text-sm text-muted-foreground">Priority: 10</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose DESTEK?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built from the ground up for performance, security, and ease of use.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => <Card key={index} className={`p-6 text-center hover:shadow-lg transition-all duration-300 cursor-pointer bg-gradient-card border-0 ${hoveredFeature === index ? 'scale-105 shadow-primary' : ''}`} onMouseEnter={() => setHoveredFeature(index)} onMouseLeave={() => setHoveredFeature(null)}>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-primary/10 text-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground">
              Choose the plan that fits your needs. Upgrade or downgrade anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => <Card key={index} className={`relative p-8 ${plan.popular ? 'border-primary shadow-xl scale-105 bg-gradient-card' : 'bg-gradient-card border-0'}`}>
                {plan.popular && <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-primary">
                    Most Popular
                  </Badge>}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold mb-2">
                    {plan.price}
                    {plan.period && <span className="text-lg text-muted-foreground">{plan.period}</span>}
                  </div>
                  <p className="text-muted-foreground">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => <li key={featureIndex} className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>)}
                </ul>

                <Link to="/login" className="block">
                  <Button className={`w-full ${plan.popular ? 'bg-gradient-primary hover:opacity-90' : ''}`} variant={plan.popular ? 'default' : 'outline'}>
                    {plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
                  </Button>
                </Link>
              </Card>)}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of developers and businesses who trust DESTEK for their DNS management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            
            <Button size="lg" variant="outline" className="border-primary-foreground hover:bg-primary-foreground font-bold mx-0 text-lg text-center rounded-sm text-blue-500">Contact Us</Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Server className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">DESTEK</span>
              </div>
              <p className="text-muted-foreground">
                Professional DNS management platform for modern businesses.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Community</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 DESTEK. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>;
}
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { 
  Users, 
  DollarSign, 
  Clock, 
  Star,
  CheckCircle,
  TrendingUp,
  Shield,
  Smartphone,
  Calendar,
  BarChart3,
  ArrowRight,
  Phone,
  Mail,
  Sparkles,
  Zap
} from "lucide-react";
import { motion } from "motion/react";

interface ForProvidersProps {
  onPageChange: (page: string) => void;
}

export function ForProviders({ onPageChange }: ForProvidersProps) {
  const benefits = [
    {
      icon: Users,
      title: "Expand Your Customer Base",
      description: "Reach hundreds of potential customers actively looking for your services in Nanded."
    },
    {
      icon: DollarSign,
      title: "Increase Your Income",
      description: "Grow your business with steady customer flow and premium service opportunities."
    },
    {
      icon: Clock,
      title: "Flexible Schedule",
      description: "Work on your own terms. Set your availability and manage bookings as per your convenience."
    },
    {
      icon: Star,
      title: "Build Your Reputation",
      description: "Showcase your skills through customer reviews and ratings to attract more clients."
    },
    {
      icon: Shield,
      title: "Trust & Safety",
      description: "Our verification process builds customer confidence and ensures secure transactions."
    },
    {
      icon: Smartphone,
      title: "Easy Management",
      description: "Simple dashboard to manage bookings, track earnings, and communicate with customers."
    }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Register & Verify",
      description: "Complete your profile with service details, experience, and required documentation."
    },
    {
      step: "2",
      title: "Get Listed",
      description: "Once verified, your services become visible to customers searching in your area."
    },
    {
      step: "3",
      title: "Receive Bookings",
      description: "Get notifications for service requests and connect directly with customers."
    },
    {
      step: "4",
      title: "Deliver & Earn",
      description: "Provide excellent service, receive payments, and build your reputation."
    }
  ];

  const serviceCategories = [
    { name: "Tiffin Services", demand: "High", icon: "🍱" },
    { name: "Plumbing", demand: "Very High", icon: "🔧" },
    { name: "Electrical", demand: "High", icon: "⚡" },
    { name: "Tourism Guides", demand: "Medium", icon: "🧳" },
    { name: "Cleaning Services", demand: "High", icon: "🧽" },
    { name: "Home Repairs", demand: "High", icon: "🔨" }
  ];

  const stats = [
    { number: "₹25,000+", label: "Average Monthly Earning", subtext: "Top providers" },
    { number: "4.8/5", label: "Average Provider Rating", subtext: "Customer satisfaction" },
    { number: "500+", label: "Active Customers", subtext: "Growing daily" },
    { number: "48hrs", label: "Average Approval Time", subtext: "Quick onboarding" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-accent/30 to-secondary/20 py-20 px-4 sm:px-6 lg:px-8">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute top-10 right-20 w-32 h-32 bg-primary/10 rounded-full blur-2xl"
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute bottom-10 left-10 w-24 h-24 bg-accent/20 rounded-full blur-xl"
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Join MH26 Services
                  </Badge>
                </motion.div>
                <motion.h1 
                  className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  Grow Your Business with{" "}
                  <motion.span 
                    className="text-primary relative"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                  >
                    Trusted Customers
                    <motion.div
                      className="absolute -bottom-2 left-0 w-full h-3 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 1.2, duration: 0.8 }}
                    />
                  </motion.span>
                </motion.h1>
                <motion.p 
                  className="text-lg text-muted-foreground max-w-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
                  Connect with customers in Nanded who need your services. Build your reputation, increase your income, and grow your business with MH26 Services.
                </motion.p>
              </div>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" onClick={() => onPageChange('provider-login')} className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg">
                    <Zap className="w-4 h-4 mr-2" />
                    Get Started Today
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" size="lg" className="border-2 border-primary/30 hover:border-primary hover:bg-primary/5">
                    <Phone className="w-4 h-4 mr-2" />
                    Call: +91-9876543210
                  </Button>
                </motion.div>
              </motion.div>

              <motion.div 
                className="flex items-center space-x-4 text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.6 }}
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </motion.div>
                <span>Free to join • No hidden fees • Verified customers</span>
              </motion.div>
            </motion.div>

            <div className="relative">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb2NhbCUyMHNlcnZpY2UlMjBwcm92aWRlcnxlbnwxfHx8fDE3NTgwMDQ0NzZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Service provider at work"
                className="rounded-2xl shadow-2xl w-full h-[500px] object-cover"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-lg">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium">30% Income Increase</span>
                </div>
                <p className="text-xs text-muted-foreground">Average for our providers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center space-y-2">
                <div className="text-3xl font-bold text-primary">{stat.number}</div>
                <div className="text-sm font-medium text-foreground">{stat.label}</div>
                <div className="text-xs text-muted-foreground">{stat.subtext}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose MH26 Services?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join hundreds of successful service providers who have grown their business with us
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-medium mb-3">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Getting started is simple and straightforward
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white font-bold text-xl">{step.step}</span>
                </div>
                <h3 className="text-xl font-medium">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Services in Demand
            </h2>
            <p className="text-lg text-muted-foreground">
              Popular service categories with high customer demand
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceCategories.map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl">{category.icon}</div>
                      <div>
                        <h3 className="font-medium">{category.name}</h3>
                        <Badge 
                          variant={category.demand === "Very High" ? "default" : category.demand === "High" ? "secondary" : "outline"}
                          className="text-xs"
                        >
                          {category.demand} Demand
                        </Badge>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-muted-foreground">
              Fill out this form and we'll contact you within 24 hours
            </p>
          </div>

          <Card>
            <CardContent className="p-8">
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name *</label>
                    <Input placeholder="Enter your full name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone Number *</label>
                    <Input placeholder="+91 9876543210" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address *</label>
                    <Input type="email" placeholder="your.email@example.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Service Category *</label>
                    <Input placeholder="e.g., Plumbing, Tiffin Service" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Experience & Expertise</label>
                  <Textarea 
                    placeholder="Tell us about your experience, skills, and any certifications..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Service Area in Nanded</label>
                  <Input placeholder="e.g., Shivaji Nagar, Station Road, etc." />
                </div>

                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="terms" className="rounded" />
                  <label htmlFor="terms" className="text-sm text-muted-foreground">
                    I agree to the Terms of Service and Privacy Policy
                  </label>
                </div>

                <Button size="lg" className="w-full">
                  Submit Application
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Questions? We're Here to Help!
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Our team is ready to guide you through the onboarding process
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              <Phone className="w-4 h-4 mr-2" />
              Call: +91-9876543210
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
              <Mail className="w-4 h-4 mr-2" />
              Email: providers@mh26services.com
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
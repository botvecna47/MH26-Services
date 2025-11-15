import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { 
  Users, 
  User, 
  Settings, 
  ArrowRight, 
  Star, 
  Calendar, 
  DollarSign, 
  BarChart3,
  Shield,
  Clock,
  CheckCircle,
  Sparkles,
  MapPin
} from "lucide-react";
import { motion } from "motion/react";

interface PortalSelectionProps {
  onSelectPortal: (portal: 'customer' | 'provider' | 'admin') => void;
}

export function PortalSelection({ onSelectPortal }: PortalSelectionProps) {
  const portals = [
    {
      id: 'customer' as const,
      title: "Customer Portal",
      subtitle: "Book services and manage appointments", 
      description: "Find and book trusted local service providers in Nanded. From tiffin services to home repairs.",
      icon: Users,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      features: [
        { icon: Calendar, text: "Book Appointments" },
        { icon: Star, text: "Rate & Review" },
        { icon: DollarSign, text: "Secure Payments" },
        { icon: Clock, text: "Track Orders" }
      ],
      stats: { users: "2,500+", rating: "4.8", services: "150+" },
      image: "https://images.unsplash.com/photo-1758556549027-879615701c61?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXN0b21lciUyMHNlcnZpY2UlMjBib29raW5nJTIwYXBwb2ludG1lbnR8ZW58MXx8fHwxNzU5MjAzMDU5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      id: 'provider' as const,
      title: "Provider Portal",
      subtitle: "Grow your business with more customers",
      description: "Connect with local customers, manage your services, and grow your business in Nanded.",
      icon: User,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      features: [
        { icon: Users, text: "Customer Management" },
        { icon: Calendar, text: "Schedule Management" },
        { icon: BarChart3, text: "Earnings Dashboard" },
        { icon: Star, text: "Build Reputation" }
      ],
      stats: { providers: "150+", earnings: "₹50K+", rating: "4.9" },
      image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZXJ2aWNlJTIwcHJvdmlkZXIlMjBidXNpbmVzcyUyMG93bmVyfGVufDF8fHx8MTc1OTIwMzA5M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      id: 'admin' as const,
      title: "Admin Dashboard",
      subtitle: "Platform management and analytics",
      description: "Comprehensive platform management with advanced analytics, user oversight, and system configuration.",
      icon: Settings,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      features: [
        { icon: BarChart3, text: "Advanced Analytics" },
        { icon: Shield, text: "User Management" },
        { icon: CheckCircle, text: "Service Approvals" },
        { icon: Settings, text: "System Settings" }
      ],
      stats: { revenue: "₹5L+", growth: "25%", uptime: "99.9%" },
      image: "https://images.unsplash.com/photo-1748609160056-7b95f30041f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGFuYWx5dGljcyUyMGRhc2hib2FyZCUyMGNoYXJ0c3xlbnwxfHx8fDE3NTkxNzAxMzh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/20 to-secondary/10 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl"
          animate={{
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <motion.header 
          className="py-8 px-4 sm:px-6 lg:px-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-7xl mx-auto text-center">
            <motion.div 
              className="flex items-center justify-center space-x-3 mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-foreground">MH26 Services</h1>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3 h-3 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Nanded, Maharashtra</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Choose Your Portal
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Access your personalized dashboard and manage your experience on MH26 Services platform
              </p>
            </motion.div>
          </div>
        </motion.header>

        {/* Portal Cards */}
        <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {portals.map((portal, index) => (
                <motion.div
                  key={portal.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.2, duration: 0.6 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="h-full"
                >
                  <Card className={`h-full border-2 ${portal.borderColor} bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-2xl transition-all duration-500 overflow-hidden group cursor-pointer`}>
                    <CardHeader className="relative p-0">
                      <div className="relative overflow-hidden">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.4 }}
                        >
                          <ImageWithFallback
                            src={portal.image}
                            alt={portal.title}
                            className="w-full h-48 object-cover"
                          />
                        </motion.div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                        
                        {/* Portal Icon */}
                        <motion.div 
                          className={`absolute top-4 left-4 w-12 h-12 bg-gradient-to-br ${portal.color} rounded-xl flex items-center justify-center shadow-lg`}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <portal.icon className="w-6 h-6 text-white" />
                        </motion.div>

                        {/* Stats Badge */}
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-white/90 backdrop-blur-sm text-foreground border-white/30">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Popular
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-6 space-y-6">
                      {/* Title & Description */}
                      <div className="space-y-3">
                        <div>
                          <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                            {portal.title}
                          </CardTitle>
                          <CardDescription className="text-muted-foreground">
                            {portal.subtitle}
                          </CardDescription>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {portal.description}
                        </p>
                      </div>

                      {/* Features */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-foreground">Key Features:</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {portal.features.map((feature, idx) => (
                            <motion.div
                              key={idx}
                              className="flex items-center space-x-2 text-sm"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 1 + index * 0.2 + idx * 0.1 }}
                            >
                              <feature.icon className="w-4 h-4 text-primary" />
                              <span className="text-muted-foreground">{feature.text}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className={`${portal.bgColor} rounded-lg p-4 space-y-2`}>
                        <h4 className="font-medium text-foreground text-sm">Platform Stats:</h4>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          {Object.entries(portal.stats).map(([key, value]) => (
                            <div key={key}>
                              <div className="font-bold text-lg text-foreground">{value}</div>
                              <div className="text-xs text-muted-foreground capitalize">{key}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* CTA Button */}
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          onClick={() => onSelectPortal(portal.id)}
                          className={`w-full h-12 bg-gradient-to-r ${portal.color} hover:opacity-90 shadow-lg border-0`}
                        >
                          <span>Access {portal.title}</span>
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </main>

        {/* Footer */}
        <motion.footer 
          className="py-8 px-4 sm:px-6 lg:px-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.6 }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="flex items-center justify-center space-x-2">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">Secure & Verified</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">24/7 Support</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Star className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">Trusted by 2500+ Users</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 MH26 Services. Connecting Nanded with trusted local service providers.
            </p>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { EmptyState } from "./ui/EmptyState";
import {
  Search,
  MapPin,
  Star,
  CheckCircle,
  SlidersHorizontal,
  Clock,
  ArrowRight,
  DollarSign,
  Award,
  TrendingUp,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { sampleProviders, SampleProvider } from "../utils/sampleData";

type UserRole = 'visitor' | 'user' | 'provider' | 'admin';

interface EnhancedServicesPageProps {
  userRole: UserRole;
  onNavigate: (page: string, data?: any) => void;
}

// Provider images mapped from Unsplash
const providerImages: Record<string, string> = {
  'Plumbing': 'https://images.unsplash.com/photo-1599463698367-11cb72775b67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwbHVtYmVyJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc2MjkyMjU1MHww&ixlib=rb-4.1.0&q=80&w=1080',
  'Tiffin Service': 'https://images.unsplash.com/photo-1587033649773-5c231faa21e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB0aWZmaW4lMjBmb29kfGVufDF8fHx8MTc2MjkyMjU1MHww&ixlib=rb-4.1.0&q=80&w=1080',
  'Fitness Training': 'https://images.unsplash.com/photo-1630065612426-e03d3fec7348?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwdHJhaW5pbmclMjBpbmRpYXxlbnwxfHx8fDE3NjI5MjI1NTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
  'Tourism': 'https://images.unsplash.com/photo-1679841666844-562e7aaf7077?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB0b3VyaXNtJTIwdGVtcGxlfGVufDF8fHx8MTc2MjkyMjU1MXww&ixlib=rb-4.1.0&q=80&w=1080',
  'Electrical': 'https://images.unsplash.com/photo-1762330465376-b89b5584306d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpY2lhbiUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NjI4Njc2NTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
  'Cleaning': 'https://images.unsplash.com/photo-1760827797819-4361cd5cd353?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbmluZyUyMHNlcnZpY2UlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzYyODgwNTY2fDA&ixlib=rb-4.1.0&q=80&w=1080',
  'Salon & Beauty': 'https://images.unsplash.com/photo-1722935408489-2bf93349c8cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWxvbiUyMGhhaXJkcmVzc2VyJTIwaW5kaWF8ZW58MXx8fHwxNzYyOTIyNTUyfDA&ixlib=rb-4.1.0&q=80&w=1080',
};

export function EnhancedServicesPage({ userRole, onNavigate }: EnhancedServicesPageProps) {
  const isLoggedIn = userRole !== 'visitor';
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'jobs'>('rating');

  const categories = [
    { id: "all", name: "All Services", count: sampleProviders.length },
    { id: "Tiffin Service", name: "Tiffin Services", count: sampleProviders.filter(p => p.category === "Tiffin Service").length },
    { id: "Plumbing", name: "Plumbing", count: sampleProviders.filter(p => p.category === "Plumbing").length },
    { id: "Electrical", name: "Electrical", count: sampleProviders.filter(p => p.category === "Electrical").length },
    { id: "Tourism", name: "Tourism", count: sampleProviders.filter(p => p.category === "Tourism").length },
    { id: "Fitness Training", name: "Fitness", count: sampleProviders.filter(p => p.category === "Fitness Training").length },
    { id: "Cleaning", name: "Cleaning", count: sampleProviders.filter(p => p.category === "Cleaning").length },
    { id: "Salon & Beauty", name: "Beauty", count: sampleProviders.filter(p => p.category === "Salon & Beauty").length },
  ];

  const filteredProviders = sampleProviders
    .filter((provider) => {
      const matchesSearch =
        provider.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || provider.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'jobs') return b.completedJobs - a.completedJobs;
      return 0;
    });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-b from-muted/50 to-background py-16 px-4 border-b border-border">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2>Find Expert Service Providers in Nanded</h2>
            <p className="text-muted-foreground mt-2">
              Browse {sampleProviders.length} verified professionals ready to serve you
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-3 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for services, providers, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-card border-input-border focus:border-input-focus shadow-sm"
              />
            </div>
            <Button variant="outline" className="gap-2 h-12 px-6">
              <SlidersHorizontal className="w-4 h-4" />
              Advanced Filters
            </Button>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg border transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  selectedCategory === category.id
                    ? "bg-primary text-white border-primary shadow-md"
                    : "bg-card border-border hover:border-border-hover hover:bg-muted/50"
                }`}
              >
                <span className="font-medium text-sm">{category.name}</span>
                {category.count > 0 && (
                  <span className={`ml-2 text-xs ${
                    selectedCategory === category.id ? 'opacity-80' : 'text-muted-foreground'
                  }`}>
                    ({category.count})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Sort Options */}
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <p className="text-sm text-muted-foreground">
              {filteredProviders.length} {filteredProviders.length === 1 ? 'provider' : 'providers'} found
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-sm bg-card border border-border rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="rating">Highest Rated</option>
                <option value="jobs">Most Jobs</option>
                <option value="price">Price Range</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {filteredProviders.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No providers found"
              description="Try adjusting your search or filters to find what you're looking for"
              action={{
                label: "Clear Filters",
                onClick: () => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                },
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProviders.map((provider) => (
                <Card
                  key={provider.id}
                  className="overflow-hidden hover:shadow-lg transition-all duration-200 group border-border hover:border-primary/30"
                >
                  {/* Provider Image */}
                  <div className="relative h-48 overflow-hidden bg-muted">
                    <ImageWithFallback
                      src={providerImages[provider.category] || providerImages['Plumbing']}
                      alt={provider.businessName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      {provider.verified && (
                        <Badge className="bg-success/90 text-white border-0 backdrop-blur-sm">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {!provider.available && (
                        <Badge variant="secondary" className="backdrop-blur-sm">
                          Offline
                        </Badge>
                      )}
                    </div>
                    <div className="absolute top-3 right-3">
                      <div className="bg-card/95 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1 border border-border">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold text-sm">{provider.rating}</span>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-5 space-y-4">
                    {/* Header */}
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-semibold line-clamp-1">{provider.businessName}</h4>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {provider.category}
                      </Badge>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {provider.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Award className="w-4 h-4" />
                        <span>{provider.completedJobs} jobs</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{provider.responseTime}</span>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="line-clamp-1">{provider.location}</span>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div>
                        <p className="text-xs text-muted-foreground">Starting from</p>
                        <p className="font-semibold text-primary">{provider.pricing}</p>
                      </div>
                      <Button
                        onClick={() => onNavigate('service-detail', { serviceId: provider.id })}
                        className="gap-1"
                      >
                        View Details
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      {!isLoggedIn && (
        <section className="py-16 px-4 bg-muted/50 border-t border-border">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="space-y-3">
              <h3>Ready to Get Started?</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Sign up to book services, chat with providers, and track your orders
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" onClick={() => onNavigate('provider-onboarding')}>
                Become a Provider
              </Button>
              <Button size="lg" variant="outline">
                Sign Up as Customer
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

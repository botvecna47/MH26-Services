/**
 * MH26 Services Design System
 * 
 * This file documents and demonstrates all design tokens, components,
 * and patterns used throughout the application.
 * 
 * Spacing: 4/8/16/24/32/48/64px scale
 * Typography: Defined type scale from xs to 5xl
 * Colors: Semantic color system with WCAG AA compliance
 * Components: Complete library with all interaction states
 */

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  Check, 
  X, 
  Lock, 
  Eye, 
  Star, 
  AlertCircle, 
  CheckCircle, 
  Info,
  Loader2
} from "lucide-react";

export function DesignSystem() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div className="space-y-4">
          <h1>MH26 Services Design System</h1>
          <p className="text-muted-foreground">
            A comprehensive design system for the MH26 service provider platform.
            Built for consistency, accessibility, and scalability.
          </p>
        </div>

        {/* Colors */}
        <section className="space-y-6">
          <div>
            <h2>Color System</h2>
            <p className="text-muted-foreground mt-2">
              Semantic colors with WCAG AA contrast compliance
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ColorSwatch name="Primary" color="bg-primary" text="text-primary-foreground" />
            <ColorSwatch name="Secondary" color="bg-secondary" text="text-secondary-foreground" />
            <ColorSwatch name="Success" color="bg-success" text="text-success-foreground" />
            <ColorSwatch name="Warning" color="bg-warning" text="text-warning-foreground" />
            <ColorSwatch name="Destructive" color="bg-destructive" text="text-destructive-foreground" />
            <ColorSwatch name="Info" color="bg-info" text="text-info-foreground" />
            <ColorSwatch name="Muted" color="bg-muted" text="text-muted-foreground" />
            <ColorSwatch name="Accent" color="bg-accent" text="text-accent-foreground" />
          </div>
        </section>

        {/* Typography */}
        <section className="space-y-6">
          <div>
            <h2>Typography Scale</h2>
            <p className="text-muted-foreground mt-2">
              System-level typography with consistent hierarchy
            </p>
          </div>

          <Card>
            <CardContent className="p-8 space-y-6">
              <div>
                <h1>Heading 1 - 36px/Bold</h1>
                <small className="text-muted-foreground">Page titles, hero headlines</small>
              </div>
              <div>
                <h2>Heading 2 - 30px/Bold</h2>
                <small className="text-muted-foreground">Section headings</small>
              </div>
              <div>
                <h3>Heading 3 - 24px/Semibold</h3>
                <small className="text-muted-foreground">Subsection headings</small>
              </div>
              <div>
                <h4>Heading 4 - 20px/Semibold</h4>
                <small className="text-muted-foreground">Card titles</small>
              </div>
              <div>
                <h5>Heading 5 - 18px/Medium</h5>
                <small className="text-muted-foreground">List headings</small>
              </div>
              <div>
                <p>Body Text - 16px/Normal - The quick brown fox jumps over the lazy dog.</p>
                <small className="text-muted-foreground">Default body text with 1.625 line height</small>
              </div>
              <div>
                <small>Small Text - 14px/Normal</small>
                <br />
                <small className="text-muted-foreground">Captions, labels, secondary information</small>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Spacing */}
        <section className="space-y-6">
          <div>
            <h2>Spacing Scale</h2>
            <p className="text-muted-foreground mt-2">
              4px base unit - 4, 8, 16, 24, 32, 48, 64px
            </p>
          </div>

          <Card>
            <CardContent className="p-8 space-y-4">
              {[
                { size: '4px', class: 'h-1' },
                { size: '8px', class: 'h-2' },
                { size: '16px', class: 'h-4' },
                { size: '24px', class: 'h-6' },
                { size: '32px', class: 'h-8' },
                { size: '48px', class: 'h-12' },
                { size: '64px', class: 'h-16' },
              ].map(({ size, class: className }) => (
                <div key={size} className="flex items-center gap-4">
                  <div className={`${className} bg-primary rounded`} style={{ width: size }} />
                  <span className="text-sm font-medium">{size}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        {/* Buttons */}
        <section className="space-y-6">
          <div>
            <h2>Buttons</h2>
            <p className="text-muted-foreground mt-2">
              All button variants with interaction states
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Button Variants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Primary Buttons */}
              <div className="space-y-4">
                <h5>Primary</h5>
                <div className="flex flex-wrap gap-4 items-center">
                  <Button size="lg">Large Primary</Button>
                  <Button>Default Primary</Button>
                  <Button size="sm">Small Primary</Button>
                  <Button disabled>Disabled</Button>
                  <Button>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    With Icon
                  </Button>
                </div>
              </div>

              {/* Secondary Buttons */}
              <div className="space-y-4">
                <h5>Secondary</h5>
                <div className="flex flex-wrap gap-4 items-center">
                  <Button variant="secondary" size="lg">Large Secondary</Button>
                  <Button variant="secondary">Default Secondary</Button>
                  <Button variant="secondary" size="sm">Small Secondary</Button>
                  <Button variant="secondary" disabled>Disabled</Button>
                </div>
              </div>

              {/* Outline Buttons */}
              <div className="space-y-4">
                <h5>Outline</h5>
                <div className="flex flex-wrap gap-4 items-center">
                  <Button variant="outline" size="lg">Large Outline</Button>
                  <Button variant="outline">Default Outline</Button>
                  <Button variant="outline" size="sm">Small Outline</Button>
                  <Button variant="outline" disabled>Disabled</Button>
                </div>
              </div>

              {/* Ghost Buttons */}
              <div className="space-y-4">
                <h5>Ghost</h5>
                <div className="flex flex-wrap gap-4 items-center">
                  <Button variant="ghost" size="lg">Large Ghost</Button>
                  <Button variant="ghost">Default Ghost</Button>
                  <Button variant="ghost" size="sm">Small Ghost</Button>
                  <Button variant="ghost" disabled>Disabled</Button>
                </div>
              </div>

              {/* Destructive Buttons */}
              <div className="space-y-4">
                <h5>Destructive</h5>
                <div className="flex flex-wrap gap-4 items-center">
                  <Button variant="destructive">Delete Account</Button>
                  <Button variant="destructive" size="sm">Remove</Button>
                  <Button variant="destructive" disabled>Disabled</Button>
                </div>
              </div>

              {/* Loading State */}
              <div className="space-y-4">
                <h5>Loading States</h5>
                <div className="flex flex-wrap gap-4 items-center">
                  <Button disabled>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </Button>
                  <Button variant="outline" disabled>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Form Inputs */}
        <section className="space-y-6">
          <div>
            <h2>Form Inputs</h2>
            <p className="text-muted-foreground mt-2">
              Input fields with all interaction states
            </p>
          </div>

          <Card>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Default Input</label>
                <Input placeholder="Enter text here" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Input with Value</label>
                <Input value="Filled input value" readOnly />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Disabled Input</label>
                <Input placeholder="Disabled state" disabled />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Error State</label>
                <Input 
                  placeholder="Invalid input" 
                  className="border-destructive focus:ring-destructive"
                />
                <p className="text-sm text-destructive">This field is required</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Success State</label>
                <Input 
                  value="Valid email@example.com" 
                  className="border-success focus:ring-success"
                  readOnly
                />
                <p className="text-sm text-success flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Email verified
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Input with Icon</label>
                <div className="relative">
                  <Eye className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Password" className="pl-10" type="password" />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Badges */}
        <section className="space-y-6">
          <div>
            <h2>Badges</h2>
            <p className="text-muted-foreground mt-2">
              Status indicators and labels
            </p>
          </div>

          <Card>
            <CardContent className="p-8 space-y-6">
              <div className="flex flex-wrap gap-4 items-center">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge className="bg-success text-success-foreground">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Success
                </Badge>
                <Badge className="bg-warning text-warning-foreground">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Warning
                </Badge>
                <Badge className="bg-info text-info-foreground">
                  <Info className="w-3 h-3 mr-1" />
                  Info
                </Badge>
              </div>

              <div className="space-y-2">
                <h5>Badge Sizes</h5>
                <div className="flex flex-wrap gap-4 items-center">
                  <Badge className="text-xs px-2 py-0.5">Small</Badge>
                  <Badge>Default</Badge>
                  <Badge className="text-base px-3 py-1">Large</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Cards */}
        <section className="space-y-6">
          <div>
            <h2>Cards</h2>
            <p className="text-muted-foreground mt-2">
              Container components with consistent structure
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Card</CardTitle>
                <CardDescription>
                  Simple card with header and content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This is the card content area. Use consistent padding and spacing.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Interactive Card</CardTitle>
                <CardDescription>
                  Card with hover effect
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Cards can have hover states for clickable items.
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary bg-primary/5">
              <CardHeader>
                <CardTitle>Highlighted Card</CardTitle>
                <CardDescription>
                  Card with custom styling
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Use semantic colors for different card types.
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 content-locked">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 text-center">
                    <Lock className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">Locked Content</p>
                    <small className="text-muted-foreground">Sign in to view</small>
                  </div>
                </div>
              </div>
              <CardHeader>
                <CardTitle>Locked Card</CardTitle>
                <CardDescription>
                  Content restricted for non-logged users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This content is blurred and locked.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* States & Feedback */}
        <section className="space-y-6">
          <div>
            <h2>States & Feedback</h2>
            <p className="text-muted-foreground mt-2">
              Visual feedback for different content states
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-success bg-success/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-success">Success State</h5>
                    <p className="text-sm text-muted-foreground mt-1">
                      Operation completed successfully
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-warning bg-warning/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-warning">Warning State</h5>
                    <p className="text-sm text-muted-foreground mt-1">
                      Please review before proceeding
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive bg-destructive/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <X className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-destructive">Error State</h5>
                    <p className="text-sm text-muted-foreground mt-1">
                      Something went wrong
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-info bg-info/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-info">Info State</h5>
                    <p className="text-sm text-muted-foreground mt-1">
                      Additional information available
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Accessibility */}
        <section className="space-y-6">
          <div>
            <h2>Accessibility Guidelines</h2>
            <p className="text-muted-foreground mt-2">
              WCAG AA compliant design patterns
            </p>
          </div>

          <Card>
            <CardContent className="p-8 space-y-6">
              <div>
                <h5>Focus States</h5>
                <p className="text-sm text-muted-foreground mb-4">
                  All interactive elements have visible focus indicators
                </p>
                <div className="flex gap-4">
                  <Button className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                    Focus Me
                  </Button>
                  <Input placeholder="Tab to focus" />
                </div>
              </div>

              <div>
                <h5>Color Contrast</h5>
                <p className="text-sm text-muted-foreground mb-4">
                  Minimum 4.5:1 contrast ratio for text, 3:1 for large text
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary text-primary-foreground p-4 rounded-lg">
                    <p>Primary Background</p>
                    <small>WCAG AA Compliant</small>
                  </div>
                  <div className="bg-secondary text-secondary-foreground p-4 rounded-lg">
                    <p>Secondary Background</p>
                    <small>WCAG AA Compliant</small>
                  </div>
                </div>
              </div>

              <div>
                <h5>Icon + Text Labels</h5>
                <p className="text-sm text-muted-foreground mb-4">
                  Never rely on color or icons alone to convey meaning
                </p>
                <div className="flex gap-4">
                  <Button variant="outline">
                    <Check className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button variant="outline">
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

function ColorSwatch({ name, color, text }: { name: string; color: string; text: string }) {
  return (
    <div className="space-y-2">
      <div className={`${color} ${text} h-24 rounded-lg flex items-center justify-center shadow-sm`}>
        <span className="font-medium">{name}</span>
      </div>
      <p className="text-xs text-muted-foreground text-center">{name}</p>
    </div>
  );
}

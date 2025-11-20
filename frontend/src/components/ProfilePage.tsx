import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Shield,
  Bell,
  Eye,
  EyeOff,
  Camera,
  Save,
  Smartphone,
  Monitor,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";

type UserRole = 'visitor' | 'user' | 'provider' | 'admin';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'provider' | 'admin';
  avatar?: string;
  businessName?: string;
}

interface ProfilePageProps {
  user: User;
  userRole: UserRole;
}

interface ActiveSession {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
}

export function ProfilePage({ user, userRole }: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Mock active sessions
  const activeSessions: ActiveSession[] = [
    {
      id: '1',
      device: 'Chrome on Windows',
      location: 'Nanded, Maharashtra',
      lastActive: 'Active now',
      current: true,
    },
    {
      id: '2',
      device: 'Safari on iPhone',
      location: 'Nanded, Maharashtra',
      lastActive: '2 hours ago',
      current: false,
    },
    {
      id: '3',
      device: 'Chrome on Android',
      location: 'Mumbai, Maharashtra',
      lastActive: '1 day ago',
      current: false,
    },
  ];

  // Mock login alerts
  const loginAlerts = [
    {
      id: '1',
      type: 'success',
      message: 'Successful login from Chrome on Windows',
      location: 'Nanded, Maharashtra',
      time: '2 hours ago',
    },
    {
      id: '2',
      type: 'warning',
      message: 'New device login detected',
      location: 'Mumbai, Maharashtra',
      time: '1 day ago',
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1>Profile & Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings and security preferences
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={(user as any).avatarUrl} />
                      <AvatarFallback className="text-2xl">
                        {user.firstName[0]}{user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <Button 
                      size="sm" 
                      className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                  <div>
                    <h3 className="font-medium">{user.firstName} {user.lastName}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <Badge className="mt-2 capitalize">{user.role}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 mb-8">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="sessions">Sessions</TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Update your personal details and contact information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input 
                          id="firstName" 
                          defaultValue={user.firstName}
                          placeholder="Enter first name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input 
                          id="lastName" 
                          defaultValue={user.lastName}
                          placeholder="Enter last name"
                        />
                      </div>
                    </div>

                    {userRole === 'provider' && (
                      <div className="space-y-2">
                        <Label htmlFor="businessName">Business Name</Label>
                        <Input 
                          id="businessName" 
                          defaultValue={user.businessName || ''}
                          placeholder="Enter business name"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="email" 
                          type="email"
                          defaultValue={user.email}
                          placeholder="Enter email"
                          className="flex-1"
                        />
                        <Badge className="bg-success text-success-foreground">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        type="tel"
                        autoComplete="tel"
                        inputMode="numeric"
                        defaultValue="+91 9876543210"
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input 
                        id="location" 
                        defaultValue="Shivaji Nagar, Nanded"
                        placeholder="Enter location"
                      />
                    </div>

                    <Button>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="space-y-6">
                {/* Password Change */}
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>
                      Ensure your account is using a strong password
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input 
                          id="currentPassword" 
                          type={showCurrentPassword ? "text" : "password"}
                          placeholder="Enter current password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input 
                          id="newPassword" 
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Enter new password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Password must be at least 8 characters with uppercase, lowercase, and numbers
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input 
                        id="confirmPassword" 
                        type="password"
                        placeholder="Confirm new password"
                      />
                    </div>

                    <Button>Update Password</Button>
                  </CardContent>
                </Card>

                {/* Two-Factor Authentication */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Two-Factor Authentication (2FA)</CardTitle>
                        <CardDescription>
                          Add an extra layer of security to your account
                        </CardDescription>
                      </div>
                      <Switch 
                        checked={twoFactorEnabled}
                        onCheckedChange={setTwoFactorEnabled}
                      />
                    </div>
                  </CardHeader>
                  {twoFactorEnabled && (
                    <CardContent className="space-y-4">
                      <div className="p-4 border border-border rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Smartphone className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">Authenticator App</h4>
                            <p className="text-sm text-muted-foreground">
                              Use an app like Google Authenticator
                            </p>
                          </div>
                          <Badge className="bg-success text-success-foreground">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        </div>
                        <Separator className="my-3" />
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            View Backup Codes
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            Reconfigure
                          </Button>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground">
                        🔒 Two-factor authentication adds an extra layer of security by requiring a code
                        from your authenticator app in addition to your password.
                      </p>
                    </CardContent>
                  )}
                </Card>

                {/* Login Alerts */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Login Alerts</CardTitle>
                    <CardDescription>
                      Review recent login activity to your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {loginAlerts.map((alert) => (
                        <div 
                          key={alert.id}
                          className={`p-4 rounded-lg border ${
                            alert.type === 'warning' 
                              ? 'border-warning/30 bg-warning/5' 
                              : 'border-border bg-background'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {alert.type === 'warning' ? (
                              <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                            ) : (
                              <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                            )}
                            <div className="flex-1">
                              <p className="font-medium">{alert.message}</p>
                              <p className="text-sm text-muted-foreground">
                                {alert.location} • {alert.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                      Choose how you want to receive updates and alerts
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive updates and alerts via email
                        </p>
                      </div>
                      <Switch 
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>SMS Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Get text messages for important updates
                        </p>
                      </div>
                      <Switch 
                        checked={smsNotifications}
                        onCheckedChange={setSmsNotifications}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-medium">Email me about:</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="newBookings" className="font-normal">
                            {userRole === 'provider' ? 'New orders' : 'Booking confirmations'}
                          </Label>
                          <Switch id="newBookings" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="messages" className="font-normal">
                            New messages
                          </Label>
                          <Switch id="messages" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="payments" className="font-normal">
                            {userRole === 'provider' ? 'Payout notifications' : 'Payment receipts'}
                          </Label>
                          <Switch id="payments" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="reviews" className="font-normal">
                            New reviews and ratings
                          </Label>
                          <Switch id="reviews" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="promotions" className="font-normal">
                            Promotions and offers
                          </Label>
                          <Switch id="promotions" />
                        </div>
                      </div>
                    </div>

                    <Button>
                      <Save className="w-4 h-4 mr-2" />
                      Save Preferences
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Sessions Tab */}
              <TabsContent value="sessions" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Active Sessions</CardTitle>
                    <CardDescription>
                      Manage devices that are currently signed in to your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activeSessions.map((session) => (
                        <div 
                          key={session.id}
                          className={`p-4 rounded-lg border ${
                            session.current 
                              ? 'border-primary/30 bg-primary/5' 
                              : 'border-border bg-background'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="p-2 bg-muted rounded-lg">
                                <Monitor className="w-5 h-5" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium">{session.device}</h4>
                                  {session.current && (
                                    <Badge className="bg-primary text-primary-foreground">
                                      Current Session
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  <MapPin className="w-3 h-3 inline mr-1" />
                                  {session.location}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Last active: {session.lastActive}
                                </p>
                              </div>
                            </div>
                            {!session.current && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-destructive hover:text-destructive"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Terminate
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-6" />

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium mb-1">Sign out all other sessions</h4>
                        <p className="text-sm text-muted-foreground">
                          This will sign you out of all devices except this one
                        </p>
                      </div>
                      <Button variant="outline" className="text-destructive hover:text-destructive">
                        Sign Out All
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

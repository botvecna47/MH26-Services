import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Users,
  Shield,
  BarChart3,
  Settings,
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Package,
} from "lucide-react";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
}

interface AdminControlsProps {
  user: User;
}

export function AdminControls({ user }: AdminControlsProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const stats = [
    {
      label: "Total Users",
      value: "1,248",
      change: "+12% this month",
      icon: Users,
      color: "text-info",
      bgColor: "bg-info/10",
    },
    {
      label: "Active Providers",
      value: "156",
      change: "+8 new this week",
      icon: Shield,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      label: "Platform Revenue",
      value: "₹2.4L",
      change: "+18% this month",
      icon: DollarSign,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Total Bookings",
      value: "3,567",
      change: "+156 today",
      icon: Package,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
  ];

  const pendingApprovals = [
    {
      id: "1",
      name: "Amit Sharma Electrical Services",
      category: "Electrical",
      applicant: "Amit Sharma",
      date: "2 hours ago",
    },
    {
      id: "2",
      name: "Fresh Home Tiffin",
      category: "Tiffin Service",
      applicant: "Sneha Patil",
      date: "5 hours ago",
    },
    {
      id: "3",
      name: "Nanded City Tours & Travels",
      category: "Tourism",
      applicant: "Ravi Kumar",
      date: "1 day ago",
    },
  ];

  const recentUsers = [
    { id: "1", name: "John Doe", email: "john@example.com", role: "user", status: "active" },
    { id: "2", name: "Jane Smith", email: "jane@example.com", role: "user", status: "active" },
    { id: "3", name: "Bob Wilson", email: "bob@example.com", role: "provider", status: "pending" },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1>Admin Control Panel</h1>
              <p className="text-muted-foreground mt-2">
                Platform management and analytics
              </p>
            </div>
            <Badge className="bg-primary/10 text-primary border-primary/20">
              <Shield className="w-3 h-3 mr-1" />
              Administrator
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.label} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <div className="flex items-center gap-1 text-xs text-success">
                      <TrendingUp className="w-3 h-3" />
                      {stat.change}
                    </div>
                  </div>
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="providers">Providers</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Pending Approvals */}
              <Card>
                <CardHeader>
                  <CardTitle>Pending Provider Approvals</CardTitle>
                  <CardDescription>
                    {pendingApprovals.length} applications awaiting review
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pendingApprovals.map((approval) => (
                    <div
                      key={approval.id}
                      className="flex items-start justify-between p-4 bg-muted/50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-semibold">{approval.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {approval.applicant} • {approval.category}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Applied {approval.date}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-success border-success/30 hover:bg-success/10">
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button variant="outline" className="w-full">
                    View All Applications
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest platform events</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      action: "New user registered",
                      user: "Sarah Johnson",
                      time: "5 minutes ago",
                      icon: Users,
                      color: "text-info",
                    },
                    {
                      action: "Provider verified",
                      user: "QuickFix Plumbing",
                      time: "1 hour ago",
                      icon: CheckCircle,
                      color: "text-success",
                    },
                    {
                      action: "Booking completed",
                      user: "Customer #1247",
                      time: "2 hours ago",
                      icon: Package,
                      color: "text-primary",
                    },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className={`w-8 h-8 bg-muted rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <activity.icon className={`w-4 h-4 ${activity.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground truncate">{activity.user}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}

                  <Button variant="outline" className="w-full">
                    View All Activity
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Platform health indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6">
                  {[
                    { label: "API Status", value: "Operational", status: "success" },
                    { label: "Database", value: "Healthy", status: "success" },
                    { label: "Payment Gateway", value: "Connected", status: "success" },
                    { label: "Email Service", value: "Active", status: "success" },
                  ].map((item) => (
                    <div key={item.label} className="space-y-2">
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <Badge className="bg-success/10 text-success border-success/20">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {item.value}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage platform users and permissions</CardDescription>
                  </div>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search users..." className="pl-10" />
                </div>

                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr className="border-b border-border">
                        <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Role</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                        <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers.map((user, i) => (
                        <tr key={user.id} className={i !== recentUsers.length - 1 ? "border-b border-border" : ""}>
                          <td className="px-4 py-3">{user.name}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{user.email}</td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className="capitalize">
                              {user.role}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              className={
                                user.status === "active"
                                  ? "bg-success/10 text-success border-success/20"
                                  : "bg-warning/10 text-warning border-warning/20"
                              }
                            >
                              {user.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <Button size="sm" variant="ghost">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Providers Tab */}
          <TabsContent value="providers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Provider Management</CardTitle>
                <CardDescription>
                  Manage service providers and verification status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Shield className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h4 className="text-muted-foreground">Provider Management</h4>
                  <p className="text-sm text-muted-foreground mt-2">
                    View and manage all service providers on the platform
                  </p>
                  <Button className="mt-6">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Provider
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>Configure system-wide settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Settings className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h4 className="text-muted-foreground">Platform Configuration</h4>
                  <p className="text-sm text-muted-foreground mt-2">
                    Adjust platform settings, integrations, and configurations
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

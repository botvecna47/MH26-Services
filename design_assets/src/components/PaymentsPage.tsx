import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import {
  CreditCard,
  Download,
  DollarSign,
  TrendingUp,
  Calendar,
  Filter,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Wallet,
} from "lucide-react";

type UserRole = 'visitor' | 'user' | 'provider' | 'admin';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'provider' | 'admin';
}

interface PaymentsPageProps {
  user: User;
  userRole: UserRole;
}

interface Transaction {
  id: string;
  description: string;
  amount: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  type: 'payment' | 'refund' | 'payout';
  invoice?: string;
}

export function PaymentsPage({ user, userRole }: PaymentsPageProps) {
  const [activeTab, setActiveTab] = useState('transactions');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock transaction data - different for users vs providers
  const mockTransactions: Transaction[] = userRole === 'provider'
    ? [
        {
          id: 'PAY-1234',
          description: 'Payout for Week 45',
          amount: '₹23,400',
          date: 'Nov 10, 2024',
          status: 'completed',
          type: 'payout',
          invoice: 'INV-2024-1234',
        },
        {
          id: 'PAY-1233',
          description: 'Payout for Week 44',
          amount: '₹21,800',
          date: 'Nov 3, 2024',
          status: 'completed',
          type: 'payout',
          invoice: 'INV-2024-1233',
        },
        {
          id: 'PAY-1232',
          description: 'Payout for Week 43',
          amount: '₹25,600',
          date: 'Oct 27, 2024',
          status: 'completed',
          type: 'payout',
          invoice: 'INV-2024-1232',
        },
        {
          id: 'PAY-1231',
          description: 'Payout for Week 42',
          amount: '₹22,100',
          date: 'Oct 20, 2024',
          status: 'pending',
          type: 'payout',
        },
      ]
    : [
        {
          id: 'PAY-5678',
          description: 'Plumbing Service - QuickFix Plumbing',
          amount: '₹850',
          date: 'Nov 10, 2024',
          status: 'completed',
          type: 'payment',
          invoice: 'INV-2024-5678',
        },
        {
          id: 'PAY-5677',
          description: 'Tiffin Delivery - Maharashtrian Tiffin',
          amount: '₹150',
          date: 'Nov 8, 2024',
          status: 'completed',
          type: 'payment',
          invoice: 'INV-2024-5677',
        },
        {
          id: 'PAY-5676',
          description: 'City Tour - Nanded Heritage Tours',
          amount: '₹1,500',
          date: 'Nov 5, 2024',
          status: 'completed',
          type: 'payment',
          invoice: 'INV-2024-5676',
        },
        {
          id: 'PAY-5675',
          description: 'Refund - Cancelled Booking',
          amount: '₹600',
          date: 'Oct 28, 2024',
          status: 'completed',
          type: 'refund',
        },
      ];

  const stats = userRole === 'provider'
    ? [
        {
          label: 'Total Earnings',
          value: '₹93,900',
          icon: DollarSign,
          color: 'text-success',
          trend: '+18%',
        },
        {
          label: 'This Month',
          value: '₹23,400',
          icon: TrendingUp,
          color: 'text-primary',
          trend: '+12%',
        },
        {
          label: 'Pending Payouts',
          value: '₹22,100',
          icon: Clock,
          color: 'text-warning',
          trend: '1 pending',
        },
        {
          label: 'Avg. Weekly',
          value: '₹23,475',
          icon: Wallet,
          color: 'text-info',
          trend: 'Last 4 weeks',
        },
      ]
    : [
        {
          label: 'Total Spent',
          value: '₹3,100',
          icon: DollarSign,
          color: 'text-primary',
          trend: 'This month',
        },
        {
          label: 'Completed',
          value: '₹2,500',
          icon: CheckCircle,
          color: 'text-success',
          trend: '3 payments',
        },
        {
          label: 'Refunded',
          value: '₹600',
          icon: XCircle,
          color: 'text-warning',
          trend: '1 refund',
        },
        {
          label: 'Pending',
          value: '₹0',
          icon: Clock,
          color: 'text-muted-foreground',
          trend: 'No pending',
        },
      ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'payment':
        return 'text-destructive';
      case 'payout':
        return 'text-success';
      case 'refund':
        return 'text-primary';
      default:
        return 'text-foreground';
    }
  };

  const filteredTransactions = mockTransactions.filter(t =>
    t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1>{userRole === 'provider' ? 'Earnings & Payouts' : 'Payments & Invoices'}</h1>
          <p className="text-muted-foreground mt-2">
            {userRole === 'provider'
              ? 'Track your earnings and manage payouts'
              : 'View your payment history and manage invoices'
            }
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                    <stat.icon className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-bold mb-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.trend}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>{userRole === 'provider' ? 'Payout History' : 'Transaction History'}</CardTitle>
              <div className="flex gap-2">
                <div className="relative flex-1 sm:flex-none sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="invoices">Invoices</TabsTrigger>
                {userRole === 'provider' && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
              </TabsList>

              <TabsContent value="transactions" className="space-y-4">
                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium mb-2">No transactions found</h3>
                    <p className="text-muted-foreground">
                      {searchQuery ? 'Try adjusting your search' : 'You don\'t have any transactions yet'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredTransactions.map((transaction) => (
                      <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-start gap-4 flex-1">
                              <div className={`p-3 rounded-lg bg-muted ${getTypeColor(transaction.type)}`}>
                                {transaction.type === 'payment' && <CreditCard className="w-5 h-5" />}
                                {transaction.type === 'payout' && <Wallet className="w-5 h-5" />}
                                {transaction.type === 'refund' && <XCircle className="w-5 h-5" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium truncate">{transaction.description}</h4>
                                  <Badge className={getStatusColor(transaction.status)}>
                                    {transaction.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                                    {transaction.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                                    {transaction.status === 'failed' && <XCircle className="w-3 h-3 mr-1" />}
                                    <span className="capitalize">{transaction.status}</span>
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span>{transaction.id}</span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {transaction.date}
                                  </span>
                                  {transaction.invoice && (
                                    <span className="flex items-center gap-1">
                                      <FileText className="w-3 h-3" />
                                      {transaction.invoice}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <p className={`text-lg font-bold ${getTypeColor(transaction.type)}`}>
                                {transaction.type === 'refund' ? '+' : transaction.type === 'payout' ? '+' : '-'}
                                {transaction.amount}
                              </p>
                              {transaction.invoice && (
                                <Button variant="outline" size="sm">
                                  <Download className="w-4 h-4 mr-2" />
                                  Invoice
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="invoices">
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">Invoices</h3>
                  <p className="text-muted-foreground mb-4">
                    Download invoices for your {userRole === 'provider' ? 'payouts' : 'payments'}
                  </p>
                  <Button>
                    <Download className="w-4 h-4 mr-2" />
                    Download All Invoices
                  </Button>
                </div>
              </TabsContent>

              {userRole === 'provider' && (
                <TabsContent value="analytics">
                  <div className="text-center py-12">
                    <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium mb-2">Earnings Analytics</h3>
                    <p className="text-muted-foreground">
                      Detailed analytics and insights coming soon
                    </p>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

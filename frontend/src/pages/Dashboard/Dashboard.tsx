/**
 * Unified Dashboard
 * Tabs: Overview, Bookings, Transactions, Messages, Profile
 */
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useBookings } from '../../api/bookings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';

export default function Dashboard() {
  const { user } = useAuth();
  const { data: bookings } = useBookings();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Total Bookings</h3>
                <p className="text-2xl font-bold mt-2">{bookings?.pagination.total || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Pending</h3>
                <p className="text-2xl font-bold mt-2">
                  {bookings?.data.filter((b) => b.status === 'PENDING').length || 0}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Completed</h3>
                <p className="text-2xl font-bold mt-2">
                  {bookings?.data.filter((b) => b.status === 'COMPLETED').length || 0}
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bookings">
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Your Bookings</h2>
                <Button variant="outline" size="sm">
                  Export CSV
                </Button>
              </div>
              {/* Bookings list will be implemented */}
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-500">Bookings list coming soon...</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="transactions">
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Transactions</h2>
              <p className="text-gray-500">Transactions list coming soon...</p>
            </div>
          </TabsContent>

          <TabsContent value="messages">
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Messages</h2>
              <p className="text-gray-500">Messages coming soon...</p>
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Profile</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1 text-gray-900">{user?.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-gray-900">{user?.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="mt-1 text-gray-900">{user?.phone || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


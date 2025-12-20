import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useServices, useCreateService, useDeleteService, Service } from '../api/services';
import { useCategories } from '../api/categories';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import {
  Plus,
  Package,
  Clock,
  DollarSign,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import AddServiceModal from './AddServiceModal';

export default function MyServicesSection() {
  const { user } = useUser();
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Fetch provider's services
  const { data: servicesData, isLoading } = useServices({ providerId: user?.provider?.id });
  const services = servicesData?.data || [];
  
  // Delete mutation
  const deleteServiceMutation = useDeleteService();
  
  const handleDeleteService = async (serviceId: string, serviceName: string) => {
    if (window.confirm(`Are you sure you want to delete "${serviceName}"? This cannot be undone.`)) {
      try {
        await deleteServiceMutation.mutateAsync(serviceId);
        toast.success('Service deleted successfully');
      } catch (error) {
        toast.error('Failed to delete service');
      }
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-700"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'PENDING':
      default:
        return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="h-3 w-3 mr-1" />Pending Approval</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">My Services</h2>
          <p className="text-sm text-gray-600">Manage the services you offer to customers</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-[#ff6b35] hover:bg-[#ff5722]">
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Services Grid */}
      {services.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-200">
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No services yet</h3>
            <p className="text-gray-600 mb-4">Add your first service to start receiving bookings</p>
            <Button onClick={() => setShowAddModal(true)} className="bg-[#ff6b35] hover:bg-[#ff5722]">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Service
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service: Service) => (
            <Card key={service.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">{service.title}</CardTitle>
                  {getStatusBadge(service.status)}
                </div>
                <CardDescription className="line-clamp-2">{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-1 text-gray-600">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-medium">₹{service.price}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{service.durationMin} min</span>
                  </div>
                </div>
                {service.status !== 'APPROVED' && (
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {service.status === 'PENDING' ? 'Awaiting admin approval' : 'Please update and resubmit'}
                  </p>
                )}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => handleDeleteService(service.id, service.title)}
                    disabled={deleteServiceMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Service Modal */}
      {showAddModal && (
        <AddServiceModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}



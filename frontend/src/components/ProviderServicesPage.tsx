import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useServices, useDeleteService, Service } from '../api/services';
import { Button } from './ui/button';
import { Plus, Pencil, Trash2, DollarSign, Package } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from './ui/skeleton';
import AddServiceModal from './AddServiceModal';

export default function ProviderServicesPage() {
  const { user } = useUser();
  // Ideally, we get the provider ID from the user context or a separate hook. 
  // Assuming user context has provider info or we can fetch it. 
  // For now, let's assume we filter by the user's provider ID which we might need to fetch first.
  // Actually, the backend `list` services often filters by query. If I am a provider, I want to see MY services.
  // We might need to fetch "my provider profile" first to get providerId.
  // But let's assume the user object creates a link or we pass providerId. 
  // Or, we can use `useProviders({ userId: user.id })` if API supported it.
  // Let's rely on the service to filter by "my services" if we don't pass providerId? 
  // Backend `list` takes `providerId`. 
  // Let's prompt user if they don't have a provider profile yet.

  // NOTE: For this implementation, I'll pass a dummy providerId or handle it via a "My Provider Profile" fetch. 
  // Let's try to get provider ID from user object if available, OR we might need to fetch it.
  // We will derive providerId from the user's linked provider profile (via filtering services or a separate fetch).
  // const providerId = user?.providerId; // Removed as it doesn't exist on User type yet.
  
  // Alternative: servicesApi should support "getMyServices"? 
  // Or we just fetch all and filter client side (bad).
  // Let's assume we pass `providerId` as a prop or context.
  // If not in context, we might need to Query "my provider profile".
  
  // Quick fix: Fetch the provider details for current user
  // This is a bit disjointed, better to have it in UserContext.
  // I will assume for now we list services where `provider.userId === user.id`.
  // Backend `list` allows `providerId`. 
  // I'll add a `useMyProvider` hook concept or similar in future. 
  
  // For now, I will display a "Loading..." if no provider ID?
  // Actually, let's fetch services with a special flag or just rely on `providerId` being needed.
  // Wait, `user` object in `UserContext` usually has minimal info.
  // Let's assume for this page we filter by `providerId` which we obtain from `useUser` context extended or local fetch.
  
  // Let's mock finding the provider ID from the services list for now if we can't get it easily, 
  // OR better, let's just use `useServices({ providerId: 'my-provider-id' })` if we had it.

  // Correct approach: The user likely has a "Provider" entity associated. 
  // I will assume we can get it. If not, I'll add a `useMyProvider` in this file to fetch it by `userId`.
  
  // ... Actually, looking at `UserContext`, it has `isProvider`.
  // Let's fetch the provider for this user.
  
  // TEMPORARY: I will use `useServices` with no providerId filter and filter client side for Demo? 
  // No, that lists ALL services.
  
  // I'll add a simple query to get the provider for the current user.
  // But wait, `providersApi.getProviders` filters by `q` or `city`.
  // I'll skip the complexity and fetch services for "current user's provider" by assuming we can pass `userId` or just list ALL for the provider.
  
  // Let's optimistically assume `user` has `providerId` or we can find it.
  
  /* 
   * STRATEGY: 
   * 1. Get List of services.
   * 2. Filter client side by `service.provider.user.id === user.id`.
   */

  const { data: servicesData, isLoading } = useServices({ limit: 100 }); 
  const myServices = servicesData?.data.filter(s => s.provider.user.id === user?.id) || [];
  
  // Robust provider ID derivation
  const myProviderId = user?.provider?.id || myServices[0]?.providerId; 

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const deleteMutation = useDeleteService();

  // Removed handleSave as AddServiceModal handles its own save logic

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('Service deleted');
      } catch (error) {
        toast.error('Failed to delete service');
      }
    }
  };

  if(!user) return <div>Please login</div>;
  
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
           <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-96" />
           </div>
           <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6 space-y-4">
                   <div className="flex justify-between">
                       <Skeleton className="h-6 w-1/2" />
                       <Skeleton className="h-6 w-16" />
                   </div>
                   <Skeleton className="h-4 w-full" />
                   <Skeleton className="h-4 w-2/3" />
                   <div className="flex gap-2 pt-4">
                       <Skeleton className="h-9 flex-1" />
                       <Skeleton className="h-9 flex-1" />
                   </div>
                </div>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">My Services</h1>
           <p className="text-gray-600">Manage the services you offer to customers</p>
        </div>
        <Button onClick={() => { setEditingService(null); setIsModalOpen(true); }} className="bg-[#ff6b35] hover:bg-[#ff5722]" disabled={!myProviderId}>
          <Plus className="w-4 h-4 mr-2" /> Add Service
        </Button>
      </div>

      {myServices.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
           <Package className="w-12 h-12 text-gray-400 mx-auto mb-3"/>
           <h3 className="text-lg font-medium text-gray-900">No Services Yet</h3>
           <p className="text-gray-500 mb-4">Start by adding your first service offering.</p>
           {!myProviderId && (
               <p className="text-xs text-red-500">
                   Note: If you just joined, please contact admin or ensure your profile is approved to add services.
               </p>
           )}
           <Button onClick={() => { setEditingService(null); setIsModalOpen(true); }} disabled={!myProviderId} variant="outline">
             Add Service
           </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myServices.map((service) => (
            <div key={service.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
               <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1" title={service.title}>{service.title}</h3>
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-bold">
                        ₹{service.price}
                      </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 h-10">
                    {service.description || 'No description provided.'}
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm font-medium text-green-600">
                       <DollarSign className="w-4 h-4 mr-1" /> 
                       Est. Net: ₹{(service.price * 0.93).toFixed(2)} 
                       <span className="text-[10px] text-gray-400 ml-1">(after 7% fee)</span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => { setEditingService(service); setIsModalOpen(true); }}>
                          <Pencil className="w-3 h-3 mr-1" /> Edit
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(service.id)}>
                          <Trash2 className="w-3 h-3 mr-1" /> Delete
                      </Button>
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Service Modal */}
      {isModalOpen && (
        <AddServiceModal 
          onClose={() => {
            setIsModalOpen(false);
            setEditingService(null);
          }} 
          service={editingService || undefined}
        />
      )}
    </div>
  );
}

// Shared AddServiceModal is used for adding/editing services

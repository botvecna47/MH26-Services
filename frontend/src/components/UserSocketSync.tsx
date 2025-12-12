import { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useUser } from '../context/UserContext';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function UserSocketSync() {
  const { socket } = useSocket();
  const { user, setUser } = useUser();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket || !user) return;

    const handleWalletUpdate = ({ totalSpending }: { totalSpending: number }) => {
       setUser({ ...user, totalSpending });
       toast.success(`Spending updated: ₹${totalSpending.toLocaleString()}`);
    };

    const handleRevenueUpdate = ({ totalRevenue }: { totalRevenue: number }) => {
       if (user.provider) {
           setUser({ ...user, provider: { ...user.provider, totalRevenue } });
       }
    };
    
    // Listen for booking updates to refresh lists and analytics
    const handleBookingUpdate = (data: any) => {
        // Invalidate all booking related queries
        queryClient.invalidateQueries({ queryKey: ['bookings'] });
        queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
        queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
        queryClient.invalidateQueries({ queryKey: ['provider-stats'] });
        
        // Optional: Show toast if it's a significant update and not the one initiating it?
        // But for now, just silent refresh or specific toast
        // toast.info(`Booking status updated: ${data?.status || 'Active'}`);
    };

    socket.on('wallet:update', handleWalletUpdate);
    socket.on('revenue:update', handleRevenueUpdate);
    socket.on('booking:update', handleBookingUpdate);

    return () => {
      socket.off('wallet:update', handleWalletUpdate);
      socket.off('revenue:update', handleRevenueUpdate);
      socket.off('booking:update', handleBookingUpdate);
    };
  }, [socket, user, setUser, queryClient]);

  return null;
}

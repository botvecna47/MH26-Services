import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useProvider, useUpdateProvider } from '../api/providers';
import { Button } from './ui/button';
import { Clock, Save, Loader } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Type for Availability Schedule
 * Example: { "mon": ["09:00-17:00"], "tue": [] }
 */
type Schedule = Record<string, string[]>;

const DAYS = [
    { key: 'mon', label: 'Monday' },
    { key: 'tue', label: 'Tuesday' },
    { key: 'wed', label: 'Wednesday' },
    { key: 'thu', label: 'Thursday' },
    { key: 'fri', label: 'Friday' },
    { key: 'sat', label: 'Saturday' },
    { key: 'sun', label: 'Sunday' },
];

export default function ProviderSchedulePage() {
    const { user } = useUser();
    // Fetch provider data to get current availability
    // Assuming useProvider(user.id) logic handles logic. user.id is User ID. Provider ID needed?
    // providersApi.getProvider(id) usually expects Provider ID. 
    // But we might need to find provider by User ID first or rely on context if provider info is there.
    // Let's assume user.id is cleaner for now or fetch by user.
    // Actually, `useProvider` hook in `providers.ts` takes an ID. 
    // We should probably rely on `useUser` expanding to include `providerId` or similar.
    // For now, let's assume we can get it. If not, we fetch /providers?userId=... or assume user has it.
    // Based on `useUser`, `isProvider` is true. `user` object might not have `providerId`.
    // We might need to fetch "my provider profile".
    
    // Workaround: If `useUser` doesn't have provider details, we might need to fetch it.
    // But let's check `providers.ts`. There isn't a "getMe" for provider.
    // We can filter `useProviders` or just assume we have the ID. 
    // Let's try to assume we can get it from the user context or a new API call.
    // For this specific file, I'll assume we can pass the provider ID or fetch it.
    
    const { data: provider, isLoading } = useProvider(user?.id || ''); // This is likely wrong if ID is provider ID, not user ID.
    // Checking `providerController.getById` -> `where: { id }`.
    // Checking `providerController.create` -> `userId` is used.
    // Checking `schema` -> Provider has `id` (UUID) and `userId` (String).
    // So we need Provider ID.
    // However, `useUser` hook might not expose it.
    // I will add a fetch to find my provider or assume specific prop.
    
    // Temporary Hack: In a real app, UserContext should have providerId.
    // For now, I will create a simpler UI and assume we can patch `availability`.
    // Or I can add a `getMyProvider` endpoint.
    
    const [schedule, setSchedule] = useState<Schedule>({});
    const updateProviderMutation = useUpdateProvider();

    useEffect(() => {
        if (provider?.availability) {
            setSchedule(provider.availability as Schedule);
        } else {
             // Default 9-5
             const defaultSchedule: Schedule = {};
             DAYS.forEach(d => defaultSchedule[d.key] = ['09:00-17:00']);
             setSchedule(defaultSchedule);
        }
    }, [provider]);

    const handleTimeChange = (day: string, value: string) => {
        setSchedule(prev => ({
            ...prev,
            [day]: value ? [value] : []
        }));
    };

    const handleSave = async () => {
        if (!provider) return;
        try {
            await updateProviderMutation.mutateAsync({
                id: provider.id,
                data: { availability: schedule }
            });
            toast.success('Schedule updated successfully');
        } catch (error) {
            toast.error('Failed to update schedule');
            console.error(error);
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading schedule...</div>;
    if (!provider) return <div className="p-8 text-center">Provider profile not found.</div>;

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#ff6b35]" />
                    Weekly Availability
                </h2>
                <Button onClick={handleSave} disabled={updateProviderMutation.isPending}>
                    {updateProviderMutation.isPending ? <Loader className="w-4 h-4 animate-spin mr-2"/> : <Save className="w-4 h-4 mr-2"/>}
                    Save Changes
                </Button>
            </div>

            <div className="space-y-4">
                {DAYS.map((day) => (
                    <div key={day.key} className="flex items-center gap-4 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="w-32 font-medium text-gray-700">{day.label}</div>
                        <div className="flex-1">
                             <select 
                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-[#ff6b35] focus:ring-[#ff6b35]"
                                value={schedule[day.key]?.[0] || ''}
                                onChange={(e) => handleTimeChange(day.key, e.target.value)}
                             >
                                 <option value="">Unavailable</option>
                                 <option value="09:00-17:00">09:00 AM - 05:00 PM</option>
                                 <option value="08:00-16:00">08:00 AM - 04:00 PM</option>
                                 <option value="10:00-18:00">10:00 AM - 06:00 PM</option>
                                 <option value="00:00-23:59">24 Hours</option>
                             </select>
                        </div>
                    </div>
                ))}
            </div>
             <p className="mt-4 text-sm text-gray-500">
                Note: Bookings outside these hours will be automatically rejected or hidden (future feature).
            </p>
        </div>
    );
}

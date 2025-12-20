import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useProvider, useUpdateProvider } from '../api/providers';
import { Button } from './ui/button';
import { Clock, Save, Loader2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Type for Availability Schedule
 * Format: { "monday": { enabled: true, start: "09:00", end: "17:00" }, ... }
 */
interface DaySchedule {
  enabled: boolean;
  start: string;
  end: string;
}

type Schedule = Record<string, DaySchedule>;

const DAYS = [
    { key: 'monday', label: 'Monday', short: 'Mon' },
    { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
    { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
    { key: 'thursday', label: 'Thursday', short: 'Thu' },
    { key: 'friday', label: 'Friday', short: 'Fri' },
    { key: 'saturday', label: 'Saturday', short: 'Sat' },
    { key: 'sunday', label: 'Sunday', short: 'Sun' },
];

const DEFAULT_SCHEDULE: Schedule = {
  monday: { enabled: true, start: '09:00', end: '18:00' },
  tuesday: { enabled: true, start: '09:00', end: '18:00' },
  wednesday: { enabled: true, start: '09:00', end: '18:00' },
  thursday: { enabled: true, start: '09:00', end: '18:00' },
  friday: { enabled: true, start: '09:00', end: '18:00' },
  saturday: { enabled: true, start: '10:00', end: '16:00' },
  sunday: { enabled: false, start: '09:00', end: '17:00' },
};

export default function ProviderSchedulePage() {
    const { user } = useUser();
    const { data: provider, isLoading } = useProvider(user?.provider?.id || '');
    const [schedule, setSchedule] = useState<Schedule>(DEFAULT_SCHEDULE);
    const updateProviderMutation = useUpdateProvider();

    useEffect(() => {
        if (provider?.availability) {
            // Merge with defaults to ensure all days exist
            const savedSchedule = provider.availability as unknown as Schedule;
            setSchedule({ ...DEFAULT_SCHEDULE, ...savedSchedule });
        }
    }, [provider]);

    const handleToggleDay = (day: string) => {
        setSchedule(prev => ({
            ...prev,
            [day]: { ...prev[day], enabled: !prev[day].enabled }
        }));
    };

    const handleTimeChange = (day: string, field: 'start' | 'end', value: string) => {
        setSchedule(prev => ({
            ...prev,
            [day]: { ...prev[day], [field]: value }
        }));
    };

    const handleSave = async () => {
        if (!provider) return;
        try {
            await updateProviderMutation.mutateAsync({
                id: provider.id,
                data: { availability: schedule as unknown as Record<string, string[]> }
            });
            toast.success('Availability saved successfully!');
        } catch (error) {
            toast.error('Failed to save availability');
            console.error(error);
        }
    };

    if (isLoading) {
        return (
            <div className="p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                <p className="mt-2 text-gray-500">Loading schedule...</p>
            </div>
        );
    }
    
    if (!provider) {
        return (
            <div className="p-8 text-center bg-red-50 rounded-lg">
                <p className="text-red-700">Provider profile not found. Please contact support.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-[#ff6b35]" />
                        Weekly Availability
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Set your working hours for each day</p>
                </div>
                <Button 
                    onClick={handleSave} 
                    disabled={updateProviderMutation.isPending}
                    className="bg-[#ff6b35] hover:bg-[#ff5722]"
                >
                    {updateProviderMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2"/>
                    ) : (
                        <Save className="w-4 h-4 mr-2"/>
                    )}
                    Save Changes
                </Button>
            </div>

            <div className="space-y-3">
                {DAYS.map((day) => (
                    <div 
                        key={day.key} 
                        className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                            schedule[day.key]?.enabled 
                                ? 'bg-white border-gray-200 hover:border-[#ff6b35]/30' 
                                : 'bg-gray-50 border-gray-100'
                        }`}
                    >
                        {/* Day Toggle */}
                        <button
                            onClick={() => handleToggleDay(day.key)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                                schedule[day.key]?.enabled
                                    ? 'bg-green-100 text-green-600'
                                    : 'bg-gray-200 text-gray-400'
                            }`}
                        >
                            {schedule[day.key]?.enabled ? (
                                <Check className="w-5 h-5" />
                            ) : (
                                <X className="w-5 h-5" />
                            )}
                        </button>

                        {/* Day Label */}
                        <div className="w-28">
                            <span className={`font-medium ${
                                schedule[day.key]?.enabled ? 'text-gray-900' : 'text-gray-400'
                            }`}>
                                {day.label}
                            </span>
                        </div>

                        {/* Time Inputs */}
                        {schedule[day.key]?.enabled ? (
                            <div className="flex items-center gap-2 flex-1">
                                <input
                                    type="time"
                                    value={schedule[day.key]?.start || '09:00'}
                                    onChange={(e) => handleTimeChange(day.key, 'start', e.target.value)}
                                    className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff6b35]/20 focus:border-[#ff6b35] outline-none"
                                />
                                <span className="text-gray-400">to</span>
                                <input
                                    type="time"
                                    value={schedule[day.key]?.end || '18:00'}
                                    onChange={(e) => handleTimeChange(day.key, 'end', e.target.value)}
                                    className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff6b35]/20 focus:border-[#ff6b35] outline-none"
                                />
                            </div>
                        ) : (
                            <div className="flex-1 text-gray-400 text-sm italic">
                                Not available
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> Customers can only book during your available hours. 
                    Click the circle to toggle each day on/off.
                </p>
            </div>
        </div>
    );
}

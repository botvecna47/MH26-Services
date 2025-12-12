import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { Button } from './ui/button';
import { LayoutDashboard, User, Mail, Phone, MapPin, Save, Loader2, Key, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { axiosClient } from '../api/axiosClient';

export default function CustomerProfilePage() {
  const { user, setUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
  });

  const [newEmail, setNewEmail] = useState('');
  const [isEmailLoading, setIsEmailLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axiosClient.patch('/users/me', formData);
      // Update local user context
      setUser({ ...user!, ...response.data });
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChangeRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;

    setIsEmailLoading(true);
    try {
      await axiosClient.post('/auth/change-email-request', { newEmail });
      toast.success('Verification link sent to your new email address');
      setNewEmail('');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to request email change');
    } finally {
      setIsEmailLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-orange-100 flex items-center justify-center text-3xl font-bold text-[#ff6b35]">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                  <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
                  <p className="text-gray-500">{user?.email}</p>
                  <p className="text-sm text-blue-600 mt-1 uppercase font-semibold tracking-wide">{user?.role}</p>
              </div>
          </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Personal Details Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-[#ff6b35]" />
                Personal Details
            </h3>
            
                <div className="flex flex-col items-center mb-6">
                    <div className="h-24 w-24 rounded-full bg-orange-100 flex items-center justify-center text-3xl font-bold text-[#ff6b35] overflow-hidden border-2 border-white shadow-md">
                         <span>{user?.name?.[0]?.toUpperCase() || 'U'}</span>
                    </div>
                </div>

                <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                   <input
                       type="text"
                       value={formData.name}
                       onChange={(e) => setFormData({...formData, name: e.target.value})}
                       className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#ff6b35]/20 focus:border-[#ff6b35] outline-none transition-all"
                   />
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                   <div className="relative">
                       <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                       <input
                           type="tel"
                           value={formData.phone}
                           onChange={(e) => setFormData({...formData, phone: e.target.value})}
                           className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#ff6b35]/20 focus:border-[#ff6b35] outline-none transition-all"
                       />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                value={formData.city}
                                onChange={(e) => setFormData({...formData, city: e.target.value})}
                                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#ff6b35]/20 focus:border-[#ff6b35] outline-none transition-all"
                            />
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                            placeholder="Street, Area..."
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#ff6b35]/20 focus:border-[#ff6b35] outline-none transition-all"
                        />
                    </div>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full bg-[#ff6b35] hover:bg-[#ff5722]">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                </Button>
            </form>
        </div>

        {/* Account Security (Change Email/Password) */}
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Mail className="h-5 w-5 text-[#ff6b35]" />
                    Change Email
                </h3>
                 <form onSubmit={handleEmailChangeRequest} className="space-y-4">
                     <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">New Email Address</label>
                         <input
                             type="email"
                             value={newEmail}
                             onChange={(e) => setNewEmail(e.target.value)}
                             placeholder="Enter new email"
                             className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#ff6b35]/20 focus:border-[#ff6b35] outline-none transition-all"
                         />
                         <p className="text-xs text-gray-500 mt-1">We'll send a verification link to this address.</p>
                     </div>
                     <Button type="submit" variant="outline" disabled={isEmailLoading || !newEmail} className="w-full">
                         {isEmailLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Request Change'}
                     </Button>
                 </form>
            </div>

             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Key className="h-5 w-5 text-[#ff6b35]" />
                    Password
                </h3>
                <p className="text-sm text-gray-600 mb-4">To change your password, please use the "Forgot Password" flow from the logout screen for security purposes.</p>
                <Button variant="ghost" className="w-full text-red-500 hover:text-red-600 hover:bg-red-50">
                    Log Out to Reset Password
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
}

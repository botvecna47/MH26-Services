/**
 * Settings Page
 * For Admin, Users, and Providers
 */
import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { ProfilePictureUpload } from '../components/ProfilePictureUpload';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosClient } from '../api/axiosClient';
import { authApi } from '../api/auth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';
import { Loader2, User, Lock, Mail, Phone, Save, CheckCircle } from 'lucide-react';

export default function Settings() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  
  // Profile update mutation with toast handling
  const updateMeMutation = useMutation({
    mutationFn: async (data: { name: string; phone?: string }) => {
      const response = await axiosClient.patch('/users/me', data);
      return response.data;
    },
    onSuccess: async () => {
      // Invalidate user queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
      toast.success('Profile updated successfully');
      // User context will sync automatically via localStorage
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    },
  });

  // Profile settings
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  // Password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Phone verification state
  const [isPhoneVerified, setIsPhoneVerified] = useState(user?.phoneVerified || false);
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otp, setOtp] = useState('');
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);

  // Update local state when user prop changes
  useEffect(() => {
    if (user?.phoneVerified !== undefined) setIsPhoneVerified(user.phoneVerified);
  }, [user]);

  const handleSendOTP = async () => {
    if (!profileData.phone || profileData.phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setIsSendingOTP(true);
    try {
      // Extract only digits
      const phoneDigits = profileData.phone.replace(/\D/g, '');
      const phoneToSend = phoneDigits.slice(-10);
      
      await authApi.sendPhoneOTP(phoneToSend);
      setShowOTPInput(true);
      toast.success("OTP sent successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to send OTP");
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsVerifyingOTP(true);
    try {
      const phoneDigits = profileData.phone.replace(/\D/g, '');
      const phoneToVerify = phoneDigits.slice(-10);

      await authApi.verifyPhoneOTP(phoneToVerify, otp);
      setIsPhoneVerified(true);
      setShowOTPInput(false);
      setOtp('');
      toast.success("Phone number verified successfully");
      // Update user context to reflect verification
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Invalid OTP");
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await axiosClient.post('/auth/change-password', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowPasswordForm(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to change password');
    },
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    updateMeMutation.mutate({
      name: profileData.name,
      phone: profileData.phone,
    });
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    await changePasswordMutation.mutateAsync({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">Manage your account settings and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Profile Picture */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Picture
              </CardTitle>
              <CardDescription>Update your profile picture</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfilePictureUpload 
                size="lg"
                onUploadComplete={() => {
                  // User context will sync automatically via localStorage
                  queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
                }}
              />
            </CardContent>
          </Card>

          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Email cannot be changed</p>
                </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="phone"
                            type="tel"
                            autoComplete="tel"
                            inputMode="numeric"
                            value={profileData.phone || ''}
                            onChange={(e) => {
                              // Only allow digits, max 10 digits
                              const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                              setProfileData({ ...profileData, phone: value });
                              if (isPhoneVerified && value !== user?.phone) {
                                setIsPhoneVerified(false);
                              }
                            }}
                            placeholder="9876543210"
                            maxLength={10}
                            className="pl-9"
                          />
                        </div>
                        {isPhoneVerified ? (
                          <div className="bg-green-100 text-green-800 h-10 px-3 flex items-center justify-center rounded-md min-w-[100px] text-sm font-medium">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Verified
                          </div>
                        ) : (
                          !showOTPInput && (
                            <Button 
                              type="button" 
                              variant="outline"
                              onClick={handleSendOTP}
                              disabled={isSendingOTP || !profileData.phone || profileData.phone.length !== 10}
                              className="min-w-[100px]"
                            >
                              {isSendingOTP ? "Sending..." : "Verify"}
                            </Button>
                          )
                        )}
                      </div>

                      {showOTPInput && !isPhoneVerified && (
                        <div className="flex gap-2 items-center bg-gray-50 p-3 rounded-lg border border-gray-200 mt-2">
                          <Input
                            type="text"
                            inputMode="numeric"
                            placeholder="Enter 6-digit OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            maxLength={6}
                            className="w-32 bg-white"
                          />
                          <Button 
                            type="button"
                            onClick={handleVerifyOTP}
                            disabled={isVerifyingOTP || otp.length !== 6}
                            size="sm"
                          >
                            {isVerifyingOTP ? "Verifying..." : "Submit OTP"}
                          </Button>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setShowOTPInput(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                    {profileData.phone && profileData.phone.length !== 10 && (
                      <p className="text-xs text-gray-500">Phone number must be 10 digits</p>
                    )}
                    {profileData.phone && !/^[6-9]/.test(profileData.phone) && profileData.phone.length > 0 && (
                      <p className="text-xs text-red-500">Phone number must start with 6, 7, 8, or 9</p>
                    )}
                  </div>

                <Button
                  type="submit"
                  disabled={updateMeMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  {updateMeMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Password Change */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Change Password
              </CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent>
              {!showPasswordForm ? (
                <Button
                  variant="outline"
                  onClick={() => setShowPasswordForm(true)}
                  className="w-full sm:w-auto"
                >
                  Change Password
                </Button>
              ) : (
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="Enter new password (min 8 characters)"
                      required
                      minLength={8}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="Confirm new password"
                      required
                      minLength={8}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={changePasswordMutation.isPending}
                      className="flex-1 sm:flex-none"
                    >
                      {changePasswordMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Changing...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Change Password
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setPasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: '',
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Role</span>
                <span className="text-sm font-medium text-gray-900 capitalize">{user?.role?.toLowerCase()}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Email Verified</span>
                <span className={`text-sm font-medium ${user?.emailVerified ? 'text-green-600' : 'text-red-600'}`}>
                  {user?.emailVerified ? 'Verified' : 'Not Verified'}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Phone Verified</span>
                <span className={`text-sm font-medium ${user?.phoneVerified ? 'text-green-600' : 'text-red-600'}`}>
                  {user?.phoneVerified ? 'Verified' : 'Not Verified'}
                </span>
              </div>
              {user?.provider && (
                <>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Business Name</span>
                    <span className="text-sm font-medium text-gray-900">{user.provider.businessName}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Provider Status</span>
                    <span className={`text-sm font-medium capitalize ${
                      user.provider.status === 'APPROVED' ? 'text-green-600' :
                      user.provider.status === 'PENDING' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {user.provider.status?.toLowerCase()}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


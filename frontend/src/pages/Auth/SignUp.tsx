/**
 * Sign Up Page
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { axiosClient } from '../../api/axiosClient';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import Input from '../../components/ui/Input';
import { Eye, EyeOff, Mail } from 'lucide-react';

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string()
    .regex(/^[6-9]\d{9}$/, 'Phone number must be 10 digits starting with 6-9')
    .length(10, 'Phone number must be exactly 10 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  role: z.enum(['CUSTOMER', 'PROVIDER']).default('CUSTOMER'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUp() {
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'CUSTOMER' | 'PROVIDER'>('CUSTOMER');
  const [requiresOTP, setRequiresOTP] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [registrationEmail, setRegistrationEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<SignUpFormData & { otp?: string }>({
    resolver: zodResolver(signUpSchema.extend({
      otp: z.string().length(6, 'OTP must be 6 digits').optional(),
    })),
    defaultValues: {
      role: 'CUSTOMER',
    },
  });

  const otp = watch('otp');

  const onSubmit = async (data: SignUpFormData & { otp?: string }) => {
    setIsLoading(true);
    try {
      if (requiresOTP && otpSent) {
        // Step 2: Verify OTP and complete registration
        try {
          const response = await axiosClient.post('/auth/verify-registration-otp', {
            email: registrationEmail,
            otp: data.otp,
          });

          const { user: userData, tokens } = response.data;

          localStorage.setItem('accessToken', tokens.accessToken);
          localStorage.setItem('refreshToken', tokens.refreshToken);
          localStorage.setItem('user', JSON.stringify(userData));

          toast.success('Account created successfully!');
          
          // Navigate based on role
          if (userData.role === 'PROVIDER') {
            window.location.href = '/provider-onboarding';
          } else {
            window.location.href = '/dashboard';
          }
        } catch (error: any) {
          toast.error(error.response?.data?.error || 'Invalid OTP. Please try again.');
          throw error;
        }
      } else {
        // Step 1: Send OTP to email
        const result = await registerUser({
          name: data.name,
          email: data.email,
          phone: data.phone,
          password: data.password,
          role: selectedRole,
        });

        if (result?.requiresOTP) {
          setRequiresOTP(true);
          setOtpSent(true);
          setRegistrationEmail(data.email);
          toast.success('OTP sent to your email address. Please check your inbox.');
        }
      }
    } catch (error: any) {
      // Error handled by useAuth hook or shown above
      if (!error.response?.data?.requiresOTP) {
        // Only show error if it's not an OTP requirement
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/auth/signin" className="font-medium text-[#ff6b35] hover:text-[#ff5722]">
              Sign in
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              I want to
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSelectedRole('CUSTOMER')}
                className={`p-4 border-2 rounded-lg text-center transition-colors ${
                  selectedRole === 'CUSTOMER'
                    ? 'border-[#ff6b35] bg-[#ff6b35]/10'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="font-medium">Book Services</div>
                <div className="text-sm text-gray-600">As a Customer</div>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('PROVIDER')}
                className={`p-4 border-2 rounded-lg text-center transition-colors ${
                  selectedRole === 'PROVIDER'
                    ? 'border-[#ff6b35] bg-[#ff6b35]/10'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="font-medium">Offer Services</div>
                <div className="text-sm text-gray-600">As a Provider</div>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {!otpSent ? (
              <>
                <Input
                  label="Full Name"
                  {...register('name')}
                  error={errors.name?.message}
                  placeholder="John Doe"
                  disabled={isLoading}
                />

                <Input
                  label="Email address"
                  type="email"
                  {...register('email')}
                  error={errors.email?.message}
                  placeholder="you@example.com"
                  disabled={isLoading}
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  {...register('phone')}
                  error={errors.phone?.message}
                  placeholder="9876543210"
                  maxLength={10}
                  onChange={(e) => {
                    // Only allow digits
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setValue('phone', value);
                  }}
                  disabled={isLoading}
                />

                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    error={errors.password?.message}
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...register('confirmPassword')}
                    error={errors.confirmPassword?.message}
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Check your email</p>
                      <p className="text-sm text-blue-700 mt-1">
                        We've sent a 6-digit verification code to <strong>{registrationEmail}</strong>
                      </p>
                    </div>
                  </div>
                </div>

                <Input
                  label="Enter Verification Code"
                  type="text"
                  maxLength={6}
                  {...register('otp')}
                  error={errors.otp?.message}
                  placeholder="000000"
                  disabled={isLoading}
                  className="text-center text-2xl tracking-widest font-mono"
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setValue('otp', value);
                  }}
                />

                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setRequiresOTP(false);
                    setValue('otp', '');
                  }}
                  className="text-sm text-[#ff6b35] hover:text-[#ff5722] w-full text-center"
                  disabled={isLoading}
                >
                  Change email address
                </button>
              </>
            )}
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}>
            {otpSent 
              ? 'Verify & Create Account' 
              : selectedRole === 'PROVIDER' 
                ? 'Continue to Onboarding' 
                : 'Create Account'
            }
          </Button>

          <p className="text-xs text-center text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </form>
      </div>
    </div>
  );
}


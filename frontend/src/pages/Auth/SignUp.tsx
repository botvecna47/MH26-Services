/**
 * Sign Up Page
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Eye, EyeOff } from 'lucide-react';

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+91-[6-9]\d{9}$/, 'Invalid phone format (+91-XXXXXXXXXX)'),
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      role: 'CUSTOMER',
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    try {
      await registerUser({
        ...data,
        role: selectedRole,
      });
    } catch (error) {
      // Error handled by useAuth hook
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
            <Input
              label="Full Name"
              {...register('name')}
              error={errors.name?.message}
              placeholder="John Doe"
            />

            <Input
              label="Email address"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              placeholder="you@example.com"
            />

            <Input
              label="Phone Number"
              type="tel"
              {...register('phone')}
              error={errors.phone?.message}
              placeholder="+91-9876543210"
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                error={errors.password?.message}
                placeholder="••••••••"
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
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}>
            {selectedRole === 'PROVIDER' ? 'Continue to Onboarding' : 'Create Account'}
          </Button>

          <p className="text-xs text-center text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </form>
      </div>
    </div>
  );
}


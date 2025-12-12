import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, Phone, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useUser } from '../context/UserContext';
import { AuthAPI } from '../services/api';
import { toast } from 'sonner@2.0.3';

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>(
    searchParams.get('mode') === 'signup' ? 'signup' : 'signin'
  );

  const [signInForm, setSignInForm] = useState({
    email: '',
    password: '',
    userType: 'customer' as 'customer' | 'provider' | 'admin',
  });

  const [signUpForm, setSignUpForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    userType: 'customer' as 'customer' | 'provider' | 'admin',
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await AuthAPI.login(signInForm);

      if (response.success && response.data) {
        const { user, tokens } = response.data;
        
        // Store token
        localStorage.setItem('authToken', tokens.accessToken);
        
        // Convert user type to role for context
        const role = user.userType.toUpperCase() as 'CUSTOMER' | 'PROVIDER' | 'ADMIN';
        
        setUser({
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: role,
        });

        toast.success('Welcome back!');
        
        // Navigate based on role
        if (user.userType === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        toast.error(response.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await AuthAPI.register(signUpForm);

      if (response.success && response.data) {
        const { user, tokens } = response.data;
        
        // Store token
        localStorage.setItem('authToken', tokens.accessToken);
        
        // Convert user type to role for context
        const role = user.userType.toUpperCase() as 'CUSTOMER' | 'PROVIDER' | 'ADMIN';
        
        setUser({
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: role,
        });

        toast.success('Account created successfully!');
        navigate('/dashboard');
      } else {
        toast.error(response.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="max-w-md w-full px-4">
        {/* Card */}
        <div className="glass-strong rounded-2xl p-8 shadow-xl">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#ff6b35] rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white text-2xl">MH</span>
            </div>
            <h1 className="text-gray-900 mb-2">Welcome to MH26 Services</h1>
            <p className="text-sm text-gray-600">
              {mode === 'signin'
                ? 'Sign in to manage your services'
                : 'Create an account to get started'}
            </p>
          </div>

          <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-full">
            <TabsList className="glass grid w-full grid-cols-2 mb-6">
              <TabsTrigger
                value="signin"
                className="data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            {/* Sign In Form */}
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <Label htmlFor="signin-email">Email</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <Input
                      id="signin-email"
                      type="email"
                      value={signInForm.email}
                      onChange={(e) =>
                        setSignInForm({ ...signInForm, email: e.target.value })
                      }
                      placeholder="your@email.com"
                      className="glass-strong pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <Input
                      id="signin-password"
                      type={showPassword ? 'text' : 'password'}
                      value={signInForm.password}
                      onChange={(e) =>
                        setSignInForm({ ...signInForm, password: e.target.value })
                      }
                      placeholder="Enter password"
                      className="glass-strong pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-500" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="signin-usertype">Sign in as</Label>
                  <select
                    id="signin-usertype"
                    value={signInForm.userType}
                    onChange={(e) =>
                      setSignInForm({
                        ...signInForm,
                        userType: e.target.value as any,
                      })
                    }
                    className="glass-strong w-full px-3 py-2 rounded-lg mt-1 border border-white/30 focus:ring-2 focus:ring-[#ff6b35]/30 focus:outline-none"
                  >
                    <option value="customer">Customer</option>
                    <option value="provider">Provider</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#ff6b35] hover:bg-[#e85a2d] text-white shadow-lg shadow-orange-200/50 active:scale-95 transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>

                <div className="glass rounded-lg p-3 mt-4 text-sm text-gray-600">
                  <strong>Demo Login:</strong> demo@mh26.com / demo123
                </div>
              </form>
            </TabsContent>

            {/* Sign Up Form */}
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="signup-firstname">First Name</Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                      <Input
                        id="signup-firstname"
                        type="text"
                        value={signUpForm.firstName}
                        onChange={(e) =>
                          setSignUpForm({ ...signUpForm, firstName: e.target.value })
                        }
                        placeholder="John"
                        className="glass-strong pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="signup-lastname">Last Name</Label>
                    <Input
                      id="signup-lastname"
                      type="text"
                      value={signUpForm.lastName}
                      onChange={(e) =>
                        setSignUpForm({ ...signUpForm, lastName: e.target.value })
                      }
                      placeholder="Doe"
                      className="glass-strong mt-1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <Input
                      id="signup-email"
                      type="email"
                      value={signUpForm.email}
                      onChange={(e) =>
                        setSignUpForm({ ...signUpForm, email: e.target.value })
                      }
                      placeholder="your@email.com"
                      className="glass-strong pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="signup-phone">Phone Number</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <Input
                      id="signup-phone"
                      type="tel"
                      value={signUpForm.phone}
                      onChange={(e) =>
                        setSignUpForm({ ...signUpForm, phone: e.target.value })
                      }
                      placeholder="+91-9876543210"
                      className="glass-strong pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <Input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      value={signUpForm.password}
                      onChange={(e) =>
                        setSignUpForm({ ...signUpForm, password: e.target.value })
                      }
                      placeholder="Create password"
                      className="glass-strong pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-500" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="signup-usertype">Register as</Label>
                  <select
                    id="signup-usertype"
                    value={signUpForm.userType}
                    onChange={(e) =>
                      setSignUpForm({
                        ...signUpForm,
                        userType: e.target.value as any,
                      })
                    }
                    className="glass-strong w-full px-3 py-2 rounded-lg mt-1 border border-white/30 focus:ring-2 focus:ring-[#ff6b35]/30 focus:outline-none"
                  >
                    <option value="customer">Customer</option>
                    <option value="provider">Service Provider</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#ff6b35] hover:bg-[#e85a2d] text-white shadow-lg shadow-orange-200/50 active:scale-95 transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

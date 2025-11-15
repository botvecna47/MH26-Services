import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import UnbanRequestForm from './UnbanRequestForm';
import { useNavigate } from 'react-router-dom';

/**
 * Demo Forms Component
 * Contains demo forms for testing unban requests and new provider applications
 */
export default function DemoForms() {
  const navigate = useNavigate();
  const [showUnbanForm, setShowUnbanForm] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Demo Forms</h1>
          <p className="text-gray-600">Test forms for provider appeals and applications</p>
        </div>

        <Tabs defaultValue="unban" className="space-y-6">
          <TabsList>
            <TabsTrigger value="unban">Unban Request</TabsTrigger>
            <TabsTrigger value="provider">New Provider</TabsTrigger>
          </TabsList>

          {/* Unban Request Demo */}
          <TabsContent value="unban">
            <Card>
              <CardHeader>
                <CardTitle>Unban Request Form (Demo)</CardTitle>
                <CardDescription>
                  This form allows providers to submit an appeal for unbanning their account.
                  Fill out the form below to test the functionality.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Demo Instructions:</strong> Click the button below to open the unban request form.
                      This form is available to providers who have been banned, suspended, or rejected.
                    </p>
                  </div>

                  <Button onClick={() => setShowUnbanForm(true)} className="w-full">
                    Open Unban Request Form
                  </Button>

                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Form Features:</h4>
                    <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                      <li>Select appeal type (Unban, Suspension Appeal, Rejection Appeal, Other)</li>
                      <li>Provide reason for appeal</li>
                      <li>Add additional details</li>
                      <li>Submit for admin review</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* New Provider Demo */}
          <TabsContent value="provider">
            <Card>
              <CardHeader>
                <CardTitle>New Provider Application (Demo)</CardTitle>
                <CardDescription>
                  This form allows new users to apply to become a service provider on the platform.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Demo Instructions:</strong> Click the button below to navigate to the provider onboarding page.
                      This is the actual provider registration flow.
                    </p>
                  </div>

                  <Button
                    onClick={() => navigate('/auth?mode=join')}
                    className="w-full bg-[#ff6b35] hover:bg-[#ff5722]"
                  >
                    Start Provider Application
                  </Button>

                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Application Process:</h4>
                    <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                      <li>Sign up or login to your account</li>
                      <li>Select "Join as Provider" option</li>
                      <li>Complete the onboarding form with business details</li>
                      <li>Upload required documents</li>
                      <li>Submit for admin review</li>
                      <li>Wait for approval notification</li>
                    </ol>
                  </div>

                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> The provider onboarding form includes OTP verification for phone numbers.
                      Make sure you have access to the phone number you provide.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Unban Request Form Modal */}
      <UnbanRequestForm
        isOpen={showUnbanForm}
        onClose={() => setShowUnbanForm(false)}
        providerStatus="SUSPENDED"
      />
    </div>
  );
}


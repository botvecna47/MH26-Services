import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-[#ff6b35] mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">Cookie Policy</h1>
        <p className="text-gray-600 mb-4">Last updated: December 2024</p>

        <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. What Are Cookies</h2>
            <p className="text-gray-700">Cookies are small text files stored on your device when you visit our website. They help us provide a better user experience and remember your preferences.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. How We Use Cookies</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li><strong>Essential Cookies:</strong> Required for basic website functionality and authentication.</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and choices.</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our site.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Managing Cookies</h2>
            <p className="text-gray-700">You can control cookies through your browser settings. Note that disabling cookies may affect the functionality of our website.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Third-Party Cookies</h2>
            <p className="text-gray-700">We may use third-party services that set their own cookies for analytics and performance purposes.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Updates to This Policy</h2>
            <p className="text-gray-700">We may update this Cookie Policy from time to time. Changes will be posted on this page with an updated revision date.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Contact Us</h2>
            <p className="text-gray-700">If you have questions about our use of cookies, contact us at: MH26 Services, Nanded, Maharashtra, India.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-[#ff6b35] mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms & Conditions</h1>
        <p className="text-gray-600 mb-4">Last updated: December 2024</p>

        <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p className="text-gray-700">By accessing and using MH26 Services, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Service Description</h2>
            <p className="text-gray-700">MH26 Services is a platform connecting customers with local service providers in Nanded and surrounding areas. We facilitate bookings but do not directly provide the services.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. User Responsibilities</h2>
            <p className="text-gray-700">Users must provide accurate information, maintain account security, and use the platform responsibly. Any misuse may result in account suspension.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Booking & Payments</h2>
            <p className="text-gray-700">Bookings are confirmed once accepted by the provider. A 7% platform fee applies to all transactions. Cancellation policies may vary by service type.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Provider Terms</h2>
            <p className="text-gray-700">Service providers must maintain accurate profiles, respond promptly to bookings, and provide quality services. Failure to meet standards may result in suspension.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Limitation of Liability</h2>
            <p className="text-gray-700">MH26 Services acts as a facilitator and is not liable for the quality of services provided by third-party providers or any disputes between users and providers.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Contact</h2>
            <p className="text-gray-700">For questions about these terms, contact us at: MH26 Services, Nanded, Maharashtra, India.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

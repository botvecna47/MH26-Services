import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin,
  Youtube 
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="glass rounded-2xl p-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* About Section */}
            <div>
              <h3 className="text-gray-900 mb-4">MH26 Services</h3>
              <p className="text-sm text-gray-700 mb-4">
                Connecting Nanded residents with trusted local service providers. 
                Your one-stop solution for all home and professional services.
              </p>
              <div className="flex gap-3">
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-[#ff6b35] transition-colors text-gray-700"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-[#ff6b35] transition-colors text-gray-700"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-[#ff6b35] transition-colors text-gray-700"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-[#ff6b35] transition-colors text-gray-700"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a 
                  href="https://youtube.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-[#ff6b35] transition-colors text-gray-700"
                  aria-label="YouTube"
                >
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-gray-900 mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/" className="hover:text-[#ff6b35] transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/services" className="hover:text-[#ff6b35] transition-colors">
                    All Services
                  </Link>
                </li>
                <li>
                  <Link to="/provider-onboarding" className="hover:text-[#ff6b35] transition-colors">
                    Become a Provider
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="hover:text-[#ff6b35] transition-colors">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-gray-900 mb-4">Our Services</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/services?category=plumbing" className="hover:text-[#ff6b35] transition-colors">Plumbing</Link></li>
                <li><Link to="/services?category=electrical" className="hover:text-[#ff6b35] transition-colors">Electrical</Link></li>
                <li><Link to="/services?category=catering" className="hover:text-[#ff6b35] transition-colors">Catering</Link></li>
                <li><Link to="/services?category=salon" className="hover:text-[#ff6b35] transition-colors">Salon & Beauty</Link></li>
                <li><Link to="/services" className="text-[#ff6b35] hover:underline font-medium">View All Services →</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-gray-900 mb-4">Contact Us</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                  <span>Near NSB College, Nanded, Maharashtra 431601</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-[#ff6b35] flex-shrink-0" />
                  <a href="tel:+918432822104" className="hover:text-[#ff6b35] transition-colors">
                    +91 84328 22104
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-[#ff6b35] flex-shrink-0" />
                  <a href="mailto:mh26services@gmail.com" className="hover:text-[#ff6b35] transition-colors">
                    mh26services@gmail.com
                  </a>
                </li>
              </ul>
              <div className="mt-4">
                <p className="text-xs text-gray-400">Business Hours:</p>
                <p className="text-sm">Mon - Sat: 9:00 AM - 8:00 PM</p>
                <p className="text-sm">Sunday: 10:00 AM - 6:00 PM</p>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-400">
                © {currentYear} MH26 Services. All rights reserved.
              </p>
              <div className="flex gap-6 text-sm">
                <Link to="/privacy" className="hover:text-[#ff6b35] transition-colors">Privacy Policy</Link>
                <Link to="/terms" className="hover:text-[#ff6b35] transition-colors">Terms of Service</Link>
                <Link to="/cookies" className="hover:text-[#ff6b35] transition-colors">Cookie Policy</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
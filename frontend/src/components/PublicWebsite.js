import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Phone, Mail, MapPin, Menu, X, Package } from 'lucide-react';

const PublicWebsite = () => {
  const [settings, setSettings] = useState({});
  const [cargoCategories, setCargoCategories] = useState([]);
  const [cargoItems, setCargoItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [quoteData, setQuoteData] = useState({
    name: '',
    email: '',
    phone: '',
    cargo_type: '',
    message: ''
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchCargoCategories();
    fetchCargoItems();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchCargoCategories = async () => {
    try {
      const response = await axios.get('/api/cargo-categories');
      setCargoCategories(response.data);
    } catch (error) {
      console.error('Error fetching cargo categories:', error);
    }
  };

  const fetchCargoItems = async () => {
    try {
      const response = await axios.get('/api/cargo-items');
      setCargoItems(response.data);
    } catch (error) {
      console.error('Error fetching cargo items:', error);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/contact', formData);
      toast.success('Message sent successfully!');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    }
  };

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/quote', quoteData);
      toast.success('Quote request sent successfully!');
      setQuoteData({ name: '', email: '', phone: '', cargo_type: '', message: '' });
    } catch (error) {
      toast.error('Failed to send quote request. Please try again.');
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              {settings.logo_url ? (
                <img 
                  src={settings.logo_url} 
                  alt="Logo" 
                  className="h-10 w-10 object-contain rounded-lg"
                  onError={(e) => {
                    e.target.src = '/lg.png';
                  }}
                />
              ) : (
                <img 
                  src="/lg.png" 
                  alt="Logo" 
                  className="h-10 w-10 object-contain rounded-lg"
                />
              )}
              <h1 className="text-xl font-bold text-gray-900">{settings.company_name || 'V K SHIPPING SERVICES'}</h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8">
              <button onClick={() => scrollToSection('home')} className="text-gray-700 hover:text-blue-600 transition">Home</button>
              <button onClick={() => scrollToSection('about')} className="text-gray-700 hover:text-blue-600 transition">About</button>
              <button onClick={() => scrollToSection('services')} className="text-gray-700 hover:text-blue-600 transition">Services</button>
              <button onClick={() => scrollToSection('cargo')} className="text-gray-700 hover:text-blue-600 transition">Cargo Gallery</button>
              <button onClick={() => scrollToSection('contact')} className="text-gray-700 hover:text-blue-600 transition">Contact</button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-700">
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button onClick={() => scrollToSection('home')} className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600">Home</button>
              <button onClick={() => scrollToSection('about')} className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600">About</button>
              <button onClick={() => scrollToSection('services')} className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600">Services</button>
              <button onClick={() => scrollToSection('cargo')} className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600">Cargo Gallery</button>
              <button onClick={() => scrollToSection('contact')} className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600">Contact</button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-16 min-h-screen flex items-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900" style={{backgroundImage: "linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')", backgroundSize: 'cover', backgroundPosition: 'center'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {settings.logo_url ? (
              <img 
                src={settings.logo_url} 
                alt="Logo" 
                className="mx-auto h-20 w-20 object-contain rounded-lg mb-6"
                onError={(e) => {
                  e.target.src = '/lg.png';
                }}
              />
            ) : (
              <img 
                src="/lg.png" 
                alt="Logo" 
                className="mx-auto h-20 w-20 object-contain rounded-lg mb-6"
              />
            )}
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              {settings.company_name || 'V K IMPEX'}
            </h1>
            <p className="text-2xl md:text-3xl text-yellow-400 font-semibold mb-6">
              {settings.tagline || 'WE CARRY, WE CARE'}
            </p>
            <p className="text-lg text-gray-200 mb-8 max-w-3xl mx-auto">
              Connecting businesses worldwide through reliable import-export solutions
            </p>
            <button 
              onClick={() => scrollToSection('contact')}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition transform hover:scale-105"
            >
              Get Started
            </button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">About Us</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-lg text-gray-600 leading-relaxed">
                {settings.about_us || 'We are a leading import-export company with years of experience in international trade. Our expertise lies in connecting businesses across borders and facilitating seamless global commerce.'}
              </p>
              <div className="grid grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <h3 className="text-3xl font-bold text-blue-600">15+</h3>
                  <p className="text-gray-600">Years Experience</p>
                </div>
                <div className="text-center">
                  <h3 className="text-3xl font-bold text-blue-600">5+</h3>
                  <p className="text-gray-600">Global Presence</p>
                </div>
                <div className="text-center">
                  <h3 className="text-3xl font-bold text-blue-600">600+</h3>
                  <p className="text-gray-600">Projects Executed</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-100 rounded-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Choose V K SHIPPING SERVICES?</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span className="text-gray-700">Ability To Meet Strict Deadlines</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span className="text-gray-700">Hassle Free Custom Clearance</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span className="text-gray-700">Complete Transparency</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span className="text-gray-700">24/7 Customer Support</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">Our Services</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: '📋', title: 'Customs Clearance', desc: 'Expert handling of customs documentation and procedures with 100% compliance' },
              { icon: '🚢', title: 'Sea Freight', desc: 'Cost-effective shipping solutions for large cargo volumes' },
              { icon: '✈️', title: 'Air Freight', desc: 'Fast and reliable air transportation services' },
              { icon: '🚚', title: 'Land Transport', desc: 'Efficient ground transportation solutions' },
              { icon: '🏭', title: 'Warehousing', desc: 'Secure storage solutions with advanced inventory management' },
              { icon: '📦', title: 'Cargo Insurance', desc: 'Comprehensive insurance coverage for your valuable cargo' }
            ].map((service, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition">
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-600">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cargo Gallery Section */}
      <section id="cargo" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">Cargo Gallery</h2>
          
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-6 py-2 rounded-full transition ${selectedCategory === null ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              All Categories
            </button>
            {cargoCategories.map((category) => (
              <button
                key={category._id}
                onClick={() => setSelectedCategory(category._id)}
                className={`px-6 py-2 rounded-full transition ${selectedCategory === category._id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Cargo Items Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cargoItems
              .filter(item => !selectedCategory || item.category_id === selectedCategory)
              .map((item) => (
                <div key={item._id} className="bg-gray-50 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition">
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.name} 
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <div className="text-center">
                        <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No Image</p>
                      </div>
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.name}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">Contact Us</h2>
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Get in Touch</h3>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <input
                  type="text"
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <textarea
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Quote Form */}
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Get a Quote</h3>
              <form onSubmit={handleQuoteSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={quoteData.name}
                  onChange={(e) => setQuoteData({...quoteData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  value={quoteData.email}
                  onChange={(e) => setQuoteData({...quoteData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <input
                  type="tel"
                  placeholder="Your Phone"
                  value={quoteData.phone}
                  onChange={(e) => setQuoteData({...quoteData, phone: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <select
                  value={quoteData.cargo_type}
                  onChange={(e) => setQuoteData({...quoteData, cargo_type: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Cargo Type</option>
                  {cargoCategories.map((category) => (
                    <option key={category._id} value={category.name}>{category.name}</option>
                  ))}
                </select>
                <textarea
                  placeholder="Additional Details"
                  value={quoteData.message}
                  onChange={(e) => setQuoteData({...quoteData, message: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  Get Quote
                </button>
              </form>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mt-12 bg-white p-8 rounded-lg shadow-lg">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex items-start space-x-4">
                <MapPin className="text-blue-600 mt-1" size={24} />
                <div>
                  <h4 className="font-semibold text-gray-900">Address</h4>
                  <p className="text-gray-600">{settings.address || 'Office No. M-1, first floor, Kashish Arcade, Master Marine Services Pvt. Ltd, near Zero Point, Mundra, Gujarat 370421'}</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <Phone className="text-blue-600 mt-1" size={24} />
                <div>
                  <h4 className="font-semibold text-gray-900">Phone</h4>
                  <p className="text-gray-600">{settings.phone || '+91-7573041747/7573041744'}</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <Mail className="text-blue-600 mt-1" size={24} />
                <div>
                  <h4 className="font-semibold text-gray-900">Email</h4>
                  <p className="text-gray-600">{settings.email || 'export@vknathgroup.in'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                {settings.logo_url && (
                  <img src={settings.logo_url} alt="Logo" className="h-8 w-8 object-contain" />
                )}
                <h3 className="text-xl font-bold">{settings.company_name || 'V K SHIPPING SERVICES'}</h3>
              </div>
              <p className="text-gray-400">Your trusted partner in global commerce</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => scrollToSection('home')} className="hover:text-white transition">Home</button></li>
                <li><button onClick={() => scrollToSection('about')} className="hover:text-white transition">About</button></li>
                <li><button onClick={() => scrollToSection('services')} className="hover:text-white transition">Services</button></li>
                <li><button onClick={() => scrollToSection('contact')} className="hover:text-white transition">Contact</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact Info</h4>
              <ul className="space-y-2 text-gray-400">
                <li>{settings.address || 'Mundra, Gujarat 370421'}</li>
                <li>{settings.phone || '+91-7573041747/7573041744'}</li>
                <li>{settings.email || 'export@vknathgroup.in'}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="https://www.facebook.com/share/16VFWUUGXe/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
                  <i className="fab fa-facebook text-xl"></i>
                </a>
                <a href="https://www.instagram.com/v_k_shipping_services?igsh=MXdxeDRxYmM5dmExaw==" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
                  <i className="fab fa-instagram text-xl"></i>
                </a>
                <a href="https://wa.me/7096960043" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
                  <i className="fab fa-whatsapp text-xl"></i>
                </a>
                <a href="https://x.com/v_k_group?t=CpxJysg9RJzLkRtG25r4Sg&s=09" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
                  <i className="fab fa-twitter text-xl"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 {settings.company_name || 'V K SHIPPING SERVICES'}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicWebsite;

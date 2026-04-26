import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Settings, 
  Package, 
  Mail, 
  LogOut, 
  Plus, 
  Edit, 
  Trash2, 
  Users,
  TrendingUp,
  Globe
} from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Configure axios with baseURL
const axiosInstance = axios.create({
  baseURL: API_BASE,
});

// Add token interceptor for authentication
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [settings, setSettings] = useState({});
  const [cargoCategories, setCargoCategories] = useState([]);
  const [cargoItems, setCargoItems] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const navigate = useNavigate();

  // Form states
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', image_url: '' });
  const [itemForm, setItemForm] = useState({ name: '', description: '', category_id: '', image_url: '' });
  const [settingsForm, setSettingsForm] = useState({
    company_name: '',
    tagline: '',
    about_us: '',
    phone: '',
    email: '',
    address: '',
    logo_url: ''
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [settingsRes, categoriesRes, itemsRes, leadsRes] = await Promise.all([
        axiosInstance.get('/api/settings'),
        axiosInstance.get('/api/cargo-categories'),
        axiosInstance.get('/api/cargo-items'),
        axiosInstance.get('/api/leads')
      ]);

      setSettings(settingsRes.data);
      setSettingsForm(settingsRes.data);
      setCargoCategories(categoriesRes.data);
      setCargoItems(itemsRes.data);
      setLeads(leadsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin');
    toast.success('Logged out successfully');
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.put('/api/settings', settingsForm);
      setSettings(settingsForm);
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingCategory) {
        await axiosInstance.put(`/api/cargo-categories/${editingCategory._id}`, categoryForm);
        toast.success('Category updated successfully');
      } else {
        await axiosInstance.post('/api/cargo-categories', categoryForm);
        toast.success('Category created successfully');
      }
      fetchAllData();
      resetCategoryForm();
    } catch (error) {
      toast.error('Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  const handleItemSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingItem) {
        await axiosInstance.put(`/api/cargo-items/${editingItem._id}`, itemForm);
        toast.success('Item updated successfully');
      } else {
        await axiosInstance.post('/api/cargo-items', itemForm);
        toast.success('Item created successfully');
      }
      fetchAllData();
      resetItemForm();
    } catch (error) {
      toast.error('Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await axiosInstance.delete(`/api/cargo-categories/${categoryId}`);
        toast.success('Category deleted successfully');
        fetchAllData();
      } catch (error) {
        toast.error('Failed to delete category');
      }
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axiosInstance.delete(`/api/cargo-items/${itemId}`);
        toast.success('Item deleted successfully');
        fetchAllData();
      } catch (error) {
        toast.error('Failed to delete item');
      }
    }
  };

  const handleDeleteLead = async (leadId) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await axiosInstance.delete(`/api/leads/${leadId}`);
        toast.success('Lead deleted successfully');
        fetchAllData();
      } catch (error) {
        toast.error('Failed to delete lead');
      }
    }
  };

  const resetCategoryForm = () => {
    setCategoryForm({ name: '', description: '', image_url: '' });
    setEditingCategory(null);
    setShowCategoryForm(false);
  };

  const resetItemForm = () => {
    setItemForm({ name: '', description: '', category_id: '', image_url: '' });
    setEditingItem(null);
    setShowItemForm(false);
  };

  const editCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm(category);
    setShowCategoryForm(true);
  };

  const editItem = (item) => {
    setEditingItem(item);
    setItemForm(item);
    setShowItemForm(true);
  };

  const handleFileUpload = async (file, type) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    try {
      // Don't manually set Content-Type - let axios handle it with the boundary
      const response = await axiosInstance.post('/api/upload', formData, {
        headers: {
          // Remove manual Content-Type header - axios will set it automatically
        }
      });
      
      // Ensure we have the full URL
      const imageUrl = response.data.url;
      
      // If URL is relative, prepend the API_BASE
      if (imageUrl.startsWith('/')) {
        return `${API_BASE}${imageUrl}`;
      }
      
      return imageUrl;
    } catch (error) {
      console.error('File upload error:', error);
      toast.error('File upload failed');
      return null;
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const logoUrl = await handleFileUpload(file, 'logo');
      if (logoUrl) {
        setSettingsForm(prev => ({ ...prev, logo_url: logoUrl }));
        toast.success('Logo uploaded successfully!');
      }
    }
  };

  const stats = {
    totalCategories: cargoCategories.length,
    totalItems: cargoItems.length,
    totalLeads: leads.length,
    recentLeads: leads.filter(lead => {
      const leadDate = new Date(lead.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return leadDate > weekAgo;
    }).length
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f9f9f9' }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: '#fff', 
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        borderBottom: '1px solid #ccc'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center" style={{ height: '70px' }}>
            <div className="flex items-center space-x-3">
              <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="company-icon" style={{ 
                  fontSize: '1.8rem', 
                  color: '#0077b6',
                  marginRight: '10px',
                  transition: 'transform 0.3s ease'
                }}>📦</span>
                <div>
                  <h1 style={{ 
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: '#333',
                    letterSpacing: '2px',
                    margin: '0'
                  }}>Admin Panel</h1>
                  <span style={{ 
                    fontSize: '0.9rem',
                    color: '#666' 
                  }}>V K Shipping Services</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#333',
                backgroundColor: '#f1f1f1',
                border: '1px solid #ccc',
                padding: '0.75rem 1.5rem',
                borderRadius: '5px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fountain: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#0077b6';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f1f1f1';
                e.currentTarget.style.color = '#333';
              }}
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside style={{
          width: '250px',
          backgroundColor: '#fff',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          minHeight: 'calc(100vh - 70px)',
          position: 'fixed',
          left: 0,
          top: '70px',
          overflowY: 'auto'
        }}>
          <nav style={{ marginTop: '1rem' }}>
            {[
              { id: 'dashboard', icon: TrendingUp, label: 'Dashboard' },
              { id: 'settings', icon: Settings, label: 'Global Settings' },
              { id: 'categories', icon: Package, label: 'Cargo Categories' },
              { id: 'items', icon: Globe, label: 'Cargo Items' },
              { id: 'leads', icon: Mail, label: 'Leads' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '1rem 1.5rem',
                  textAlign: 'left',
                  border: 'none',
                  background: activeTab === item.id ? '#f1f1f1' : '#fff',
                  color: activeTab === item.id ? '#0077b6' : '#666',
                  borderRight: activeTab === item.id ? '3px solid #0077b6' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '0.95rem',
                  fontWeight: activeTab === item.id ? '600' : '500'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== item.id) {
                    e.currentTarget.style.backgroundColor = '#f9f9f9';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== item.id) {
                    e.currentTarget.style.backgroundColor = '#fff';
                  }
                }}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main style={{ 
          marginLeft: '250px',
          padding: '2rem',
          width: 'calc(100% - 250px)'
        }}>
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div>
              <h2 style={{ 
                fontSize: '2rem',
                fontWeight: '700',
                color: '#2c3e50',
                marginBottom: '2rem'
              }}>Dashboard Overview</h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                {[
                  { label: 'Total Categories', value: stats.totalCategories, icon: Package, color: '#0077b6' },
                  { label: 'Total Items', value: stats.totalItems, icon: Globe, color: '#27ae60' },
                  { label: 'Total Leads', value: stats.totalLeads, icon: Users, color: '#9b59b6' },
                  { label: 'Recent Leads', value: stats.recentLeads, icon: TrendingUp, color: '#e67e22' }
                ].map((stat, idx) => (
                  <div key={idx} style={{
                    background: '#fff',
                    padding: '1.5rem',
                    borderRadius: '10px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'transform 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div>
                      <p style={{ fontSize: '0.9rem', color: '#666', margin: '0 0 0.5rem 0' }}>{stat.label}</p>
                      <p style={{ fontSize: '1.8rem', fontWeight: '700', color: '#333', margin: '0' }}>{stat.value}</p>
                    </div>
                    <stat.icon size={40} color={stat.color} />
                  </div>
                ))}
              </div>

              <div style={{
                background: '#fff',
                padding: '1.5rem',
                borderRadius: '10px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  color: '#2c3e50',
                  marginBottom: '1.5rem'
                }}>Recent Leads</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #f1f1f1' }}>
                        <th style={{ textAlign: 'left', padding: '1rem', color: '#666', fontWeight: '500' }}>Name</th>
                        <th style={{ textAlign: 'left', padding: '1rem', color: '#666', fontWeight: '500' }}>Email</th>
                        <th style={{ textAlign: 'left', padding: '1rem', color: '#666', fontWeight: '500' }}>Type</th>
                        <th style={{ textAlign: 'left', padding: '1rem', color: '#666', fontWeight: '500' }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.slice(0, 5).map((lead) => (
                        <tr key={lead._id} style={{ borderBottom: '1px solid #f1f1f1' }}>
                          <td style={{ padding: '1rem', color: '#333' }}>{lead.name}</td>
                          <td style={{ padding: '1rem', color: '#666' }}>{lead.email}</td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{
                              padding: '0.4rem 0.8rem',
                              borderRadius: '20px',
                              fontSize: '0.8rem',
                              backgroundColor: lead.type === 'contact' ? '#e3f2fd' : '#e8f5e9',
                              color: lead.type === 'contact' ? '#1976d2' : '#388e3c'
                            }}>
                              {lead.type}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', color: '#666' }}>
                            {new Date(lead.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Global Settings</h2>
              
              <form onSubmit={handleSettingsSubmit} className="bg-white p-6 rounded-lg shadow">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                    <input
                      type="text"
                      value={settingsForm.company_name}
                      onChange={(e) => setSettingsForm({...settingsForm, company_name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
                    <input
                      type="text"
                      value={settingsForm.tagline}
                      onChange={(e) => setSettingsForm({...settingsForm, tagline: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">About Us</label>
                    <textarea
                      value={settingsForm.about_us}
                      onChange={(e) => setSettingsForm({...settingsForm, about_us: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="text"
                      value={settingsForm.phone}
                      onChange={(e) => setSettingsForm({...settingsForm, phone: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={settingsForm.email}
                      onChange={(e) => setSettingsForm({...settingsForm, email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <textarea
                      value={settingsForm.address}
                      onChange={(e) => setSettingsForm({...settingsForm, address: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
                    <div className="flex items-center space-x-4">
                      {settingsForm.logo_url && (
                        <img 
                          src={settingsForm.logo_url} 
                          alt="Current Logo" 
                          className="h-16 w-16 object-contain rounded-lg border border-gray-300"
                        />
                      )}
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold"
                        />
                        <p className="text-xs text-gray-500 mt-1">Upload company logo (PNG, JPG, GIF - Max 5MB)</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Cargo Categories</h2>
                <button
                  onClick={() => setShowCategoryForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center space-x-2"
                >
                  <Plus size={20} />
                  <span>Add Category</span>
                </button>
              </div>

              {showCategoryForm && (
                <div className="bg-white p-6 rounded-lg shadow mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                  </h3>
                  <form onSubmit={handleCategorySubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                        <input
                          type="text"
                          value={categoryForm.name}
                          onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                        <input
                          type="text"
                          value={categoryForm.image_url}
                          onChange={(e) => setCategoryForm({...categoryForm, image_url: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                          value={categoryForm.description}
                          onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
                          required
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex space-x-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                      >
                        {loading ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={resetCategoryForm}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cargoCategories.map((category) => (
                      <tr key={category._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {category.image_url && (
                              <img src={category.image_url} alt={category.name} className="h-10 w-10 object-cover rounded mr-3" />
                            )}
                            <div className="text-sm font-medium text-gray-900">{category.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{category.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => editCategory(category)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Items Tab */}
          {activeTab === 'items' && (
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem'
              }}>
                <h2 style={{ 
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#2c3e50',
                  margin: '0'
                }}>Cargo Items</h2>
                <button
                  onClick={() => setShowItemForm(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#0077b6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '25px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease',
                    fontSize: '0.95rem'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#023e8a'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0077b6'}
                >
                  <Plus size={20} />
                  <span>Add Item</span>
                </button>
              </div>

              {showItemForm && (
                <div style={{
                  background: '#fff',
                  padding: '1.5rem',
                  borderRadius: '10px',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                  marginBottom: '2rem'
                }}>
                  <h3 style={{
                    fontSize: '1.3rem',
                    fontWeight: '600',
                    color: '#2c3e50',
                    marginBottom: '1.5rem'
                  }}>
                    {editingItem ? 'Edit Item' : 'Add New Item'}
                  </h3>
                  <form onSubmit={handleItemSubmit}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                      gap: '1rem',
                      marginBottom: '1.5rem'
                    }}>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.9rem',
                          fontWeight: '500',
                          color: '#333',
                          marginBottom: '0.5rem'
                        }}>Name</label>
                        <input
                          type="text"
                          value={itemForm.name}
                          onChange={(e) => setItemForm({...itemForm, name: e.target.value})}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #ccc',
                            borderRadius: '5px',
                            fontSize: '0.95rem'
                          }}
                          required
                        />
                      </div>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.9rem',
                          fontWeight: '500',
                          color: '#333',
                          marginBottom: '0.5rem'
                        }}>Category</label>
                        <select
                          value={itemForm.category_id}
                          onChange={(e) => setItemForm({...itemForm, category_id: e.target.value})}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #ccc',
                            borderRadius: '5px',
                            fontSize: '0.95rem'
                          }}
                          required
                        >
                          <option value="">Select Category</option>
                          {cargoCategories.map((category) => (
                            <option key={category._id} value={category._id}>{category.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        color: '#333',
                        marginBottom: '0.5rem'
                      }}>Item Image</label>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                      }}>
                        {itemForm.image_url && (
                          <img 
                            src={itemForm.image_url} 
                            alt="" 
                            style={{
                              height: '80px',
                              width: '80px',
                              objectFit: 'cover',
                              borderRadius: '10px',
                              border: '1px solid #ccc'
                            }}
                          />
                        )}
                        <div style={{ flex: 1 }}>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const imageUrl = await handleFileUpload(file, 'cargo');
                                if (imageUrl) {
                                  setItemForm({...itemForm, image_url: imageUrl});
                                  toast.success('Image uploaded successfully!');
                                }
                              }
                            }}
                            style={{
                              width: '100%',
                              padding: '0.75rem',
                              border: '1px solid #ccc',
                              borderRadius: '5px'
                            }}
                          />
                          <p style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.5rem' }}>
                            Upload item image (PNG, JPG, GIF - Max 5MB)
                          </p>
                        </div>
                      </div>
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        color: '#333',
                        marginBottom: '0.5rem'
                      }}>Description</label>
                      <textarea
                        value={itemForm.description}
                        onChange={(e) => setItemForm({...itemForm, description: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #ccc',
                          borderRadius: '5px',
                          minHeight: '100px',
                          fontSize: '0.95rem'
                        }}
                        required
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button
                        type="submit"
                        disabled={loading}
                        style={{
                          padding: '0.75rem 1.5rem',
                          backgroundColor: '#0077b6',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '25px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          opacity: loading ? 0.5 : 1,
                          transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#023e8a')}
                        onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#0077b6')}
                      >
                        {loading ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={resetItemForm}
                        style={{
                          padding: '0.75rem 1.5rem',
                          backgroundColor: '#f1f1f1',
                          color: '#333',
                          border: '1px solid #ccc',
                          borderRadius: '25px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0e0e0'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f1f1f1'}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div style={{
                background: '#fff',
                borderRadius: '10px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                overflow: 'hidden'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9f9f9', borderBottom: '2px solid #f1f1f1' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#666', fontWeight: '500', fontSize: '0.85rem' }}>Name</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#666', fontWeight: '500', fontSize: '0.85rem' }}>Category</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#666', fontWeight: '500', fontSize: '0.85rem' }}>Description</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#666', fontWeight: '500', fontSize: '0.85rem' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cargoItems.map((item) => {
                      const category = cargoCategories.find(cat => cat._id === item.category_id);
                      return (
                        <tr key={item._id} style={{ borderBottom: '1px solid #f1f1f1' }}>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              {item.image_url && (
                                <img src={item.image_url} alt={item.name} style={{
                                  height: '40px',
                                  width: '40px',
                                  objectFit: 'cover',
                                  borderRadius: '5px'
                                }} />
                              )}
                              <div style={{ fontSize: '0.9rem', fontWeight: '500', color: '#333' }}>{item.name}</div>
                            </div>
                          </td>
                          <td style={{ padding: '1rem', color: '#666', fontSize: '0.9rem' }}>
                            {category ? category.name : 'Unknown'}
                          </td>
                          <td style={{ padding: '1rem', color: '#666', fontSize: '0.9rem' }}>{item.description.substring(0, 50)}...</td>
                          <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                            <button
                              onClick={() => editItem(item)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#0077b6',
                                cursor: 'pointer',
                                marginRight: '1rem',
                                transition: 'color 0.2s ease'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.color = '#023e8a'}
                              onMouseLeave={(e) => e.currentTarget.style.color = '#0077b6'}
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item._id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#e74c3c',
                                cursor: 'pointer',
                                transition: 'color 0.2s ease'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.color = '#c0392b'}
                              onMouseLeave={(e) => e.currentTarget.style.color = '#e74c3c'}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Leads Tab */}
          {activeTab === 'leads' && (
            <div>
              <h2 style={{ 
                fontSize: '2rem',
                fontWeight: '700',
                color: '#2c3e50',
                marginBottom: '2rem'
              }}>Lead Management</h2>
              
              <div style={{
                background: '#fff',
                borderRadius: '10px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                overflow: 'hidden'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9f9f9', borderBottom: '2px solid #f1f1f1' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#666', fontWeight: '500', fontSize: '0.85rem' }}>Name</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#666', fontWeight: '500', fontSize: '0.85rem' }}>Email</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#666', fontWeight: '500', fontSize: '0.85rem' }}>Type</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#666', fontWeight: '500', fontSize: '0.85rem' }}>Subject/Cargo</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#666', fontWeight: '500', fontSize: '0.85rem' }}>Date</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#666', fontWeight: '500', fontSize: '0.85rem' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr key={lead._id} style={{ borderBottom: '1px solid #f1f1f1' }}>
                        <td style={{ padding: '1rem', fontWeight: '500', color: '#333' }}>{lead.name}</td>
                        <td style={{ padding: '1rem', color: '#666' }}>{lead.email}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            padding: '0.4rem 0.8rem',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            backgroundColor: lead.type === 'contact' ? '#e3f2fd' : '#e8f5e9',
                            color: lead.type === 'contact' ? '#1976d2' : '#388e3c'
                          }}>
                            {lead.type}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', color: '#666' }}>
                          {lead.subject || lead.cargo_type || '-'}
                        </td>
                        <td style={{ padding: '1rem', color: '#666' }}>
                          {new Date(lead.created_at).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <button
                            onClick={() => handleDeleteLead(lead._id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#e74c3c',
                              cursor: 'pointer',
                              transition: 'color 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#c0392b'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#e74c3c'}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;

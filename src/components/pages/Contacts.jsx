import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { contactService } from '@/services';
import ContactCard from '@/components/molecules/ContactCard';
import ContactForm from '@/components/organisms/ContactForm';
import SearchBar from '@/components/molecules/SearchBar';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    filterContacts();
  }, [contacts, searchQuery]);

  const loadContacts = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await contactService.getAll();
      setContacts(result);
    } catch (err) {
      setError(err.message || 'Failed to load contacts');
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const filterContacts = () => {
    if (!searchQuery.trim()) {
      setFilteredContacts(contacts);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = contacts.filter(contact =>
(contact.Name || contact.name || '').toLowerCase().includes(query) ||
      contact.email.toLowerCase().includes(query) ||
      contact.company.toLowerCase().includes(query) ||
      contact.position.toLowerCase().includes(query)
    );
    setFilteredContacts(filtered);
  };

  const handleContactSaved = (savedContact) => {
    if (editingContact) {
      setContacts(prev => prev.map(contact => 
        contact.id === savedContact.id ? savedContact : contact
      ));
    } else {
      setContacts(prev => [savedContact, ...prev]);
    }
    setShowForm(false);
    setEditingContact(null);
  };

  const handleEditContact = (contact) => {
    setEditingContact(contact);
    setShowForm(true);
  };

  const handleDeleteContact = async (contactId) => {
    try {
      await contactService.delete(contactId);
      setContacts(prev => prev.filter(contact => contact.id !== contactId));
      toast.success('Contact deleted successfully');
    } catch (err) {
      toast.error('Failed to delete contact');
    }
  };

  const handleViewContact = (contact) => {
    // In a real app, this would navigate to a detailed contact view
    console.log('View contact:', contact);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingContact(null);
  };

  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 3 }}
      >
        <ApperIcon name="Users" className="w-16 h-16 text-gray-300 mx-auto" />
      </motion.div>
      <h3 className="mt-4 text-lg font-medium text-gray-900">No contacts yet</h3>
      <p className="mt-2 text-gray-500">Get started by adding your first contact</p>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          className="mt-4"
          icon="Plus"
          onClick={() => setShowForm(true)}
        >
          Add Contact
        </Button>
      </motion.div>
    </motion.div>
  );

  const LoadingState = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="animate-pulse bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  );

  const ErrorState = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12"
    >
      <ApperIcon name="AlertCircle" className="w-16 h-16 text-error mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load contacts</h3>
      <p className="text-gray-500 mb-4">{error}</p>
      <Button onClick={loadContacts} icon="RefreshCw">
        Try Again
      </Button>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse mb-6">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="flex justify-between items-center mb-6">
            <div className="h-10 bg-gray-200 rounded w-80"></div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
        <LoadingState />
      </div>
    );
  }

  if (error && contacts.length === 0) {
    return (
      <div className="p-6">
        <ErrorState />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-full overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
            <p className="text-gray-600">Manage your customer relationships</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-primary text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <ApperIcon name="Grid3X3" className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-primary text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <ApperIcon name="List" className="w-4 h-4" />
              </motion.button>
            </div>
            <Button 
              icon="Plus"
              onClick={() => setShowForm(true)}
            >
              Add Contact
            </Button>
          </div>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 max-w-md">
            <SearchBar
              placeholder="Search contacts..."
              onSearch={setSearchQuery}
              className="w-full"
            />
          </div>
          <div className="text-sm text-gray-500">
            {filteredContacts.length} of {contacts.length} contacts
          </div>
        </div>
      </motion.div>

      {/* Contact Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={handleCancelForm}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <ContactForm
                contact={editingContact}
                onSuccess={handleContactSaved}
                onCancel={handleCancelForm}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contacts Grid/List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {filteredContacts.length === 0 ? (
          searchQuery ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <ApperIcon name="Search" className="w-16 h-16 text-gray-300 mx-auto" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No contacts found</h3>
              <p className="mt-2 text-gray-500">
                Try adjusting your search terms or add a new contact
              </p>
              <Button
                className="mt-4"
                variant="outline"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </Button>
            </motion.div>
          ) : (
            <EmptyState />
          )
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }>
            <AnimatePresence>
              {filteredContacts.map((contact, index) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onEdit={handleEditContact}
                  onDelete={handleDeleteContact}
                  onView={handleViewContact}
                  index={index}
                  className={viewMode === 'list' ? 'w-full' : ''}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Contacts;
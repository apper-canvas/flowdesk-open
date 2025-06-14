import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { dealService, contactService } from '@/services';
import DealPipeline from '@/components/organisms/DealPipeline';
import DealForm from '@/components/organisms/DealForm';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';

const Deals = () => {
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [viewingDeal, setViewingDeal] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dealsResult, contactsResult] = await Promise.all([
        dealService.getAll(),
        contactService.getAll()
      ]);
      
      // Create a contact lookup map
      const contactMap = {};
      contactsResult.forEach(contact => {
        contactMap[contact.id] = contact;
      });

// Add contact names to deals
      const dealsWithContacts = dealsResult.map(deal => ({
        ...deal,
        contactName: contactMap[deal.contact_id]?.Name || contactMap[deal.contact_id]?.name || 'Unknown Contact'
      }));

      setDeals(dealsWithContacts);
      setContacts(contactsResult);
    } catch (err) {
      setError(err.message || 'Failed to load deals');
      toast.error('Failed to load deals');
    } finally {
      setLoading(false);
    }
  };

const handleDealSaved = (savedDeal) => {
    // Find contact name for the saved deal
    const contact = contacts.find(c => c.id === savedDeal.contact_id);
    const dealWithContact = {
      ...savedDeal,
      contactName: contact?.Name || contact?.name || 'Unknown Contact'
    };

    if (editingDeal) {
      setDeals(prev => prev.map(deal => 
        deal.id === savedDeal.id ? dealWithContact : deal
      ));
    } else {
      setDeals(prev => [dealWithContact, ...prev]);
    }
    setShowForm(false);
    setEditingDeal(null);
  };

  const handleEditDeal = (deal) => {
    setEditingDeal(deal);
    setShowForm(true);
  };

  const handleViewDeal = (deal) => {
    setViewingDeal(deal);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingDeal(null);
  };

  const handleCancelView = () => {
    setViewingDeal(null);
  };

  const calculatePipelineStats = () => {
    const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
    const openDeals = deals.filter(deal => !['Closed Won', 'Closed Lost'].includes(deal.stage));
    const openValue = openDeals.reduce((sum, deal) => sum + deal.value, 0);
    const wonDeals = deals.filter(deal => deal.stage === 'Closed Won');
    const wonValue = wonDeals.reduce((sum, deal) => sum + deal.value, 0);

    return {
      totalDeals: deals.length,
      totalValue,
      openDeals: openDeals.length,
      openValue,
      wonDeals: wonDeals.length,
      wonValue
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const stats = calculatePipelineStats();

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
        <ApperIcon name="Target" className="w-16 h-16 text-gray-300 mx-auto" />
      </motion.div>
      <h3 className="mt-4 text-lg font-medium text-gray-900">No deals yet</h3>
      <p className="mt-2 text-gray-500">Start tracking your sales opportunities</p>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          className="mt-4"
          icon="Plus"
          onClick={() => setShowForm(true)}
        >
          Create Deal
        </Button>
      </motion.div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse mb-6">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="flex justify-between items-center mb-6">
            <div className="h-4 bg-gray-200 rounded w-96"></div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="grid grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-lg p-4">
              <div className="space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && deals.length === 0) {
    return (
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <ApperIcon name="AlertCircle" className="w-16 h-16 text-error mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load deals</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={loadData} icon="RefreshCw">
            Try Again
          </Button>
        </motion.div>
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
            <h1 className="text-2xl font-bold text-gray-900">Sales Pipeline</h1>
            <p className="text-gray-600">Track and manage your deals through the sales process</p>
          </div>
          <Button 
            icon="Plus"
            onClick={() => setShowForm(true)}
          >
            New Deal
          </Button>
        </div>

        {/* Pipeline Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 rounded-lg border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Deals</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDeals}</p>
              </div>
              <ApperIcon name="Target" className="w-8 h-8 text-primary" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-4 rounded-lg border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Pipeline</p>
                <p className="text-2xl font-bold text-accent">{formatCurrency(stats.openValue)}</p>
              </div>
              <ApperIcon name="TrendingUp" className="w-8 h-8 text-accent" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-4 rounded-lg border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Closed Won</p>
                <p className="text-2xl font-bold text-success">{formatCurrency(stats.wonValue)}</p>
              </div>
              <ApperIcon name="CheckCircle" className="w-8 h-8 text-success" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-4 rounded-lg border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Win Rate</p>
                <p className="text-2xl font-bold text-info">
                  {stats.totalDeals > 0 ? Math.round((stats.wonDeals / stats.totalDeals) * 100) : 0}%
                </p>
              </div>
              <ApperIcon name="Award" className="w-8 h-8 text-info" />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Deal Form Modal */}
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
              <DealForm
                deal={editingDeal}
                onSuccess={handleDealSaved}
                onCancel={handleCancelForm}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deal View Modal */}
      <AnimatePresence>
        {viewingDeal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={handleCancelView}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Deal Details</h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCancelView}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <ApperIcon name="X" className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{viewingDeal.title}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Value</span>
                      <p className="text-xl font-bold text-accent">{formatCurrency(viewingDeal.value)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Stage</span>
                      <p className="font-medium">{viewingDeal.stage}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Probability</span>
                      <p className="font-medium">{viewingDeal.probability}%</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Expected Close</span>
                      <p className="font-medium">
                        {viewingDeal.expectedClose 
                          ? new Date(viewingDeal.expectedClose).toLocaleDateString()
                          : 'Not set'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-sm text-gray-500">Contact</span>
                  <p className="font-medium">{viewingDeal.contactName}</p>
                </div>

                {viewingDeal.notes && (
                  <div>
                    <span className="text-sm text-gray-500">Notes</span>
                    <p className="mt-1 text-gray-700">{viewingDeal.notes}</p>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <Button
                    variant="outline"
                    icon="Edit2"
                    onClick={() => {
                      handleCancelView();
                      handleEditDeal(viewingDeal);
                    }}
                  >
                    Edit Deal
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pipeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {deals.length === 0 ? (
          <EmptyState />
        ) : (
          <DealPipeline
            onEditDeal={handleEditDeal}
            onViewDeal={handleViewDeal}
          />
        )}
      </motion.div>
    </div>
  );
};

export default Deals;
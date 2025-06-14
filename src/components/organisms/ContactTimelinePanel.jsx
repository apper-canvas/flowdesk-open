import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import ActivityItem from '@/components/molecules/ActivityItem';
import { activityService } from '@/services';

const ContactTimelinePanel = ({ isOpen, contact, onClose }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && contact) {
      loadActivities();
    } else {
      // Reset state when panel closes
      setActivities([]);
      setError(null);
    }
  }, [isOpen, contact]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const loadActivities = async () => {
    if (!contact) return;
    
    setLoading(true);
    setError(null);
    try {
      const contactActivities = await activityService.getByContactId(contact.id);
      setActivities(contactActivities);
    } catch (err) {
      setError('Failed to load activity timeline');
      toast.error('Failed to load activity timeline');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailClick = (e) => {
    e.stopPropagation();
    window.open(`mailto:${contact.email}`, '_blank');
  };

  const handlePhoneClick = (e) => {
    e.stopPropagation();
    window.open(`tel:${contact.phone}`, '_blank');
  };

  if (!contact) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Side Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 w-full max-w-lg h-full bg-white z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center font-semibold text-lg">
                  {contact.name?.charAt(0)?.toUpperCase() || 'C'}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{contact.name}</h2>
                  <p className="text-sm text-gray-500">{contact.position}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2"
              >
                <ApperIcon name="X" className="w-5 h-5" />
              </Button>
            </div>

            {/* Contact Details */}
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <ApperIcon name="Building2" className="w-4 h-4 mr-3 text-gray-400" />
                  <span className="flex-1">{contact.company}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <ApperIcon name="Mail" className="w-4 h-4 mr-3 text-gray-400" />
                  <button
                    onClick={handleEmailClick}
                    className="text-primary hover:underline flex-1 text-left"
                  >
                    {contact.email}
                  </button>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <ApperIcon name="Phone" className="w-4 h-4 mr-3 text-gray-400" />
                  <button
                    onClick={handlePhoneClick}
                    className="text-primary hover:underline flex-1 text-left"
                  >
                    {contact.phone}
                  </button>
                </div>

                {contact.notes && (
                  <div className="flex items-start text-sm text-gray-600">
                    <ApperIcon name="FileText" className="w-4 h-4 mr-3 text-gray-400 mt-0.5" />
                    <p className="flex-1">{contact.notes}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <span className="text-xs text-gray-400">
                    Added {new Date(contact.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={handleEmailClick}
                      className="text-xs"
                    >
                      <ApperIcon name="Mail" className="w-3 h-3 mr-1" />
                      Email
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={handlePhoneClick}
                      className="text-xs"
                    >
                      <ApperIcon name="Phone" className="w-3 h-3 mr-1" />
                      Call
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Content */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="p-6 pb-4">
                <div className="flex items-center">
                  <ApperIcon name="Clock" className="w-5 h-5 text-gray-400 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Activity Timeline</h3>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 pb-6">
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse flex space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-3 bg-gray-200 rounded w-full"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <ApperIcon name="AlertCircle" className="w-12 h-12 text-error mx-auto mb-3" />
                    <p className="text-sm text-gray-500 mb-4">{error}</p>
                    <Button onClick={loadActivities} variant="outline" size="sm">
                      <ApperIcon name="RefreshCw" className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                ) : activities.length > 0 ? (
                  <div className="space-y-4">
                    {activities.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <ActivityItem
                          activity={activity}
                          showContact={false}
                          index={index}
                        />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <ApperIcon name="Clock" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    </motion.div>
<h4 className="text-lg font-medium text-gray-900 mb-2">No activities yet</h4>
                    <p className="text-sm text-gray-500 mb-4">
                      Start engaging with {contact?.name?.split(' ')?.[0] ?? 'this contact'} to build your relationship
                    </p>
                    <div className="flex justify-center space-x-3">
                      <Button onClick={handleEmailClick} variant="outline" size="sm">
                        <ApperIcon name="Mail" className="w-4 h-4 mr-2" />
                        Send Email
                      </Button>
                      <Button onClick={handlePhoneClick} variant="outline" size="sm">
                        <ApperIcon name="Phone" className="w-4 h-4 mr-2" />
                        Make Call
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ContactTimelinePanel;
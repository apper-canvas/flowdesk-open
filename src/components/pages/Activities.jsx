import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { activityService, contactService, dealService } from '@/services';
import ActivityItem from '@/components/molecules/ActivityItem';
import ActivityForm from '@/components/organisms/ActivityForm';
import SearchBar from '@/components/molecules/SearchBar';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import Card from '@/components/atoms/Card';
import ApperIcon from '@/components/ApperIcon';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const activityTypes = [
    { value: 'all', label: 'All Activities', count: 0 },
    { value: 'call', label: 'Calls', count: 0, color: 'info' },
    { value: 'email', label: 'Emails', count: 0, color: 'secondary' },
    { value: 'meeting', label: 'Meetings', count: 0, color: 'accent' },
    { value: 'note', label: 'Notes', count: 0, color: 'warning' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterActivities();
  }, [activities, searchQuery, typeFilter]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [activitiesResult, contactsResult, dealsResult] = await Promise.all([
        activityService.getAll(),
        contactService.getAll(),
        dealService.getAll()
      ]);
      
      // Create lookup maps
      const contactMap = {};
      contactsResult.forEach(contact => {
        contactMap[contact.id] = contact;
      });

      const dealMap = {};
      dealsResult.forEach(deal => {
        dealMap[deal.id] = deal;
      });

      // Add contact and deal names to activities
      const activitiesWithNames = activitiesResult.map(activity => ({
        ...activity,
        contactName: contactMap[activity.contactId]?.name || 'Unknown Contact',
        dealTitle: dealMap[activity.dealId]?.title || null
      }));

      setActivities(activitiesWithNames);
      setContacts(contactsResult);
      setDeals(dealsResult);
    } catch (err) {
      setError(err.message || 'Failed to load activities');
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const filterActivities = () => {
    let filtered = [...activities];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(activity =>
        activity.subject.toLowerCase().includes(query) ||
        activity.notes.toLowerCase().includes(query) ||
        activity.contactName.toLowerCase().includes(query) ||
        (activity.dealTitle && activity.dealTitle.toLowerCase().includes(query))
      );
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(activity => activity.type === typeFilter);
    }

    setFilteredActivities(filtered);
  };

  const getActivityTypeCounts = () => {
    const counts = activityTypes.map(type => ({
      ...type,
      count: type.value === 'all' 
        ? activities.length 
        : activities.filter(activity => activity.type === type.value).length
    }));
    return counts;
  };

  const handleActivitySaved = (savedActivity) => {
    // Find contact and deal names for the saved activity
    const contact = contacts.find(c => c.id === savedActivity.contactId);
    const deal = deals.find(d => d.id === savedActivity.dealId);
    
    const activityWithNames = {
      ...savedActivity,
      contactName: contact?.name || 'Unknown Contact',
      dealTitle: deal?.title || null
    };

    if (editingActivity) {
      setActivities(prev => prev.map(activity => 
        activity.id === savedActivity.id ? activityWithNames : activity
      ));
    } else {
      setActivities(prev => [activityWithNames, ...prev]);
    }
    setShowForm(false);
    setEditingActivity(null);
  };

  const handleEditActivity = (activity) => {
    setEditingActivity(activity);
    setShowForm(true);
  };

  const handleDeleteActivity = async (activityId) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      try {
        await activityService.delete(activityId);
        setActivities(prev => prev.filter(activity => activity.id !== activityId));
        toast.success('Activity deleted successfully');
      } catch (err) {
        toast.error('Failed to delete activity');
      }
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingActivity(null);
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
        <ApperIcon name="Clock" className="w-16 h-16 text-gray-300 mx-auto" />
      </motion.div>
      <h3 className="mt-4 text-lg font-medium text-gray-900">No activities yet</h3>
      <p className="mt-2 text-gray-500">Start logging your customer interactions</p>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          className="mt-4"
          icon="Plus"
          onClick={() => setShowForm(true)}
        >
          Log Activity
        </Button>
      </motion.div>
    </motion.div>
  );

  const LoadingState = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="animate-pulse bg-white rounded-lg p-4">
          <div className="flex space-x-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-4 bg-gray-200 rounded w-48"></div>
                <div className="flex space-x-2">
                  <div className="h-5 bg-gray-200 rounded w-12"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              <div className="flex justify-between">
                <div className="h-3 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>
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
      <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load activities</h3>
      <p className="text-gray-500 mb-4">{error}</p>
      <Button onClick={loadData} icon="RefreshCw">
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
          <div className="flex space-x-2 mb-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded w-20"></div>
            ))}
          </div>
        </div>
        <LoadingState />
      </div>
    );
  }

  if (error && activities.length === 0) {
    return (
      <div className="p-6">
        <ErrorState />
      </div>
    );
  }

  const typeCounts = getActivityTypeCounts();

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
            <h1 className="text-2xl font-bold text-gray-900">Activities</h1>
            <p className="text-gray-600">Track all your customer interactions</p>
          </div>
          <Button 
            icon="Plus"
            onClick={() => setShowForm(true)}
          >
            Log Activity
          </Button>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1 max-w-md">
              <SearchBar
                placeholder="Search activities..."
                onSearch={setSearchQuery}
                className="w-full"
              />
            </div>
            <div className="text-sm text-gray-500">
              {filteredActivities.length} of {activities.length} activities
            </div>
          </div>

          {/* Type filters */}
          <div className="flex flex-wrap gap-2">
            {typeCounts.map((type) => (
              <motion.button
                key={type.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTypeFilter(type.value)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  typeFilter === type.value
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.label} {type.count > 0 && `(${type.count})`}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Activity Form Modal */}
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
              <ActivityForm
                activity={editingActivity}
                onSuccess={handleActivitySaved}
                onCancel={handleCancelForm}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Activities List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {filteredActivities.length === 0 ? (
          searchQuery || typeFilter !== 'all' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <ApperIcon name="Search" className="w-16 h-16 text-gray-300 mx-auto" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No activities found</h3>
              <p className="mt-2 text-gray-500">
                Try adjusting your search terms or filters
              </p>
              <div className="mt-4 space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery('')}
                >
                  Clear Search
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setTypeFilter('all')}
                >
                  Clear Filter
                </Button>
              </div>
            </motion.div>
          ) : (
            <EmptyState />
          )
        ) : (
          <Card padding="none">
            <div className="divide-y divide-gray-100">
              <AnimatePresence>
                {filteredActivities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative"
                  >
                    <ActivityItem
                      activity={activity}
                      index={index}
                      showContact={true}
                    />
                    
                    {/* Action buttons */}
                    <div className="absolute top-4 right-4 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEditActivity(activity)}
                        className="p-1 text-gray-400 hover:text-primary transition-colors"
                      >
                        <ApperIcon name="Edit2" className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteActivity(activity.id)}
                        className="p-1 text-gray-400 hover:text-error transition-colors"
                      >
                        <ApperIcon name="Trash2" className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </Card>
        )}
      </motion.div>
    </div>
  );
};

export default Activities;
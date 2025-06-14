import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import ActivityItem from '@/components/molecules/ActivityItem';
import { activityService } from '@/services';
const ContactCard = ({ 
  contact, 
  onEdit, 
  onDelete, 
  onView,
  index = 0,
  className = '',
  ...props 
}) => {
  const [showTimeline, setShowTimeline] = useState(false);
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${contact.name}?`)) {
      onDelete?.(contact.id);
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

  const loadActivities = async () => {
    if (activities.length > 0) return; // Already loaded
    
    setLoadingActivities(true);
    try {
      const contactActivities = await activityService.getByContactId(contact.id);
      setActivities(contactActivities);
    } catch (error) {
      toast.error('Failed to load activity timeline');
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleTimelineToggle = async (e) => {
    e.stopPropagation();
    if (!showTimeline) {
      await loadActivities();
    }
    setShowTimeline(!showTimeline);
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -2 }}
      className={className}
      {...props}
    >
      <Card 
        hover 
        className="cursor-pointer group"
        onClick={() => onView?.(contact)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-semibold">
              {contact.name?.charAt(0)?.toUpperCase() || 'C'}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                {contact.name}
              </h3>
              <p className="text-sm text-gray-500">{contact.position}</p>
            </div>
          </div>
          
          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(contact);
              }}
              className="p-1 text-gray-400 hover:text-primary transition-colors"
            >
              <ApperIcon name="Edit2" className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              className="p-1 text-gray-400 hover:text-error transition-colors"
            >
              <ApperIcon name="Trash2" className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <ApperIcon name="Building2" className="w-4 h-4 mr-2 text-gray-400" />
            <span className="truncate">{contact.company}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <ApperIcon name="Mail" className="w-4 h-4 mr-2 text-gray-400" />
            <button
              onClick={handleEmailClick}
              className="text-primary hover:underline truncate"
            >
              {contact.email}
            </button>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <ApperIcon name="Phone" className="w-4 h-4 mr-2 text-gray-400" />
            <button
              onClick={handlePhoneClick}
              className="text-primary hover:underline"
            >
              {contact.phone}
            </button>
          </div>
        </div>
        
        {contact.notes && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">
            {contact.notes}
          </p>
        )}
        
<div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            Added {new Date(contact.createdAt).toLocaleDateString()}
          </span>
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant="ghost"
              onClick={handleEmailClick}
              className="text-xs"
            >
              Email
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={handlePhoneClick}
              className="text-xs"
            >
              Call
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleTimelineToggle}
              className="text-xs"
              icon={showTimeline ? "ChevronUp" : "Clock"}
            >
              {showTimeline ? "Hide" : "Timeline"}
            </Button>
          </div>
        </div>

        {/* Timeline Section */}
        <AnimatePresence>
          {showTimeline && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 pt-4 border-t border-gray-100"
            >
              <div className="flex items-center mb-3">
                <ApperIcon name="Clock" className="w-4 h-4 text-gray-400 mr-2" />
                <h4 className="text-sm font-medium text-gray-900">Activity Timeline</h4>
              </div>

              {loadingActivities ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse flex space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : activities.length > 0 ? (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {activities.map((activity, index) => (
                    <ActivityItem
                      key={activity.id}
                      activity={activity}
                      showContact={false}
                      index={index}
                      className="text-xs"
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <ApperIcon name="Clock" className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">No activities yet</p>
                  <p className="text-xs text-gray-400">Start engaging with this contact</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

export default ContactCard;
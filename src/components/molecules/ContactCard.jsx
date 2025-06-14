import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import { useTimelinePanel } from '@/Layout';

const ContactCard = ({ 
  contact, 
  onEdit, 
  onDelete, 
  onView,
  index = 0,
  className = '',
  ...props 
}) => {
  const { openTimelinePanel } = useTimelinePanel();
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

  const handleTimelineClick = (e) => {
    e.stopPropagation();
    openTimelinePanel(contact);
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
              onClick={handleTimelineClick}
              className="text-xs"
              icon="Clock"
            >
              Timeline
            </Button>
          </div>
        </div>
</Card>
    </motion.div>
  );
};

export default ContactCard;
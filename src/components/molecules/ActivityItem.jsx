import { motion } from 'framer-motion';
import { format } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Badge from '@/components/atoms/Badge';

const ActivityItem = ({ 
  activity, 
  showContact = true,
  index = 0,
  className = '',
  ...props 
}) => {
  const typeIcons = {
    call: 'Phone',
    email: 'Mail',
    meeting: 'Users',
    note: 'FileText'
  };

  const typeColors = {
    call: 'info',
    email: 'secondary',
    meeting: 'accent',
    note: 'warning'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`flex space-x-3 p-4 hover:bg-gray-50 rounded-lg transition-colors ${className}`}
      {...props}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        typeColors[activity.type] === 'info' ? 'bg-info/10 text-info' :
        typeColors[activity.type] === 'secondary' ? 'bg-secondary/10 text-secondary' :
        typeColors[activity.type] === 'accent' ? 'bg-accent/10 text-accent' :
        'bg-warning/10 text-warning'
      }`}>
        <ApperIcon name={typeIcons[activity.type]} className="w-4 h-4" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {activity.subject}
          </h4>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Badge variant={typeColors[activity.type]} size="xs">
              {activity.type}
            </Badge>
            <span className="text-xs text-gray-500">
              {format(new Date(activity.date), 'MMM d, h:mm a')}
            </span>
          </div>
        </div>
        
        {activity.notes && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
            {activity.notes}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          {showContact && activity.contactName && (
            <span className="flex items-center">
              <ApperIcon name="User" className="w-3 h-3 mr-1" />
              {activity.contactName}
            </span>
          )}
          
          {activity.duration > 0 && (
            <span className="flex items-center">
              <ApperIcon name="Clock" className="w-3 h-3 mr-1" />
              {activity.duration} min
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ActivityItem;
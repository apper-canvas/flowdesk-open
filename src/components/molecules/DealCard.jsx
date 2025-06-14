import { motion } from 'framer-motion';
import { format } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Card from '@/components/atoms/Card';
import Badge from '@/components/atoms/Badge';

const DealCard = ({ 
  deal, 
  onEdit, 
  onDelete, 
  onView,
  isDragging = false,
  index = 0,
  className = '',
  ...props 
}) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getProbabilityColor = (probability) => {
    if (probability >= 75) return 'success';
    if (probability >= 50) return 'warning';
    if (probability >= 25) return 'info';
    return 'default';
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${deal.title}"?`)) {
      onDelete?.(deal.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      whileHover={!isDragging ? { scale: 1.02 } : {}}
      className={`${isDragging ? 'rotate-3 shadow-lg' : ''} ${className}`}
      {...props}
    >
      <Card 
        className="cursor-pointer group mb-3"
        onClick={() => onView?.(deal)}
      >
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
            {deal.title}
          </h3>
          
          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(deal);
              }}
              className="p-1 text-gray-400 hover:text-primary transition-colors"
            >
              <ApperIcon name="Edit2" className="w-3 h-3" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleDelete}
              className="p-1 text-gray-400 hover:text-error transition-colors"
            >
              <ApperIcon name="Trash2" className="w-3 h-3" />
            </motion.button>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-accent">
              {formatCurrency(deal.value)}
            </span>
            <Badge variant={getProbabilityColor(deal.probability)} size="sm">
              {deal.probability}%
            </Badge>
          </div>
          
          {deal.contactName && (
            <div className="flex items-center text-sm text-gray-600">
              <ApperIcon name="User" className="w-4 h-4 mr-2 text-gray-400" />
              <span className="truncate">{deal.contactName}</span>
            </div>
          )}
          
          <div className="flex items-center text-sm text-gray-600">
            <ApperIcon name="Calendar" className="w-4 h-4 mr-2 text-gray-400" />
<span>
              {(deal.expected_close || deal.expectedClose)
                ? format(new Date(deal.expected_close || deal.expectedClose), 'MMM d, yyyy')
                : 'No close date set'
              }
            </span>
          </div>
          
          {deal.notes && (
            <p className="text-sm text-gray-500 line-clamp-2">
              {deal.notes}
            </p>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default DealCard;
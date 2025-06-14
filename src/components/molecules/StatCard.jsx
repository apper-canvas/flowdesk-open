import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Card from '@/components/atoms/Card';

const StatCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  trendValue,
  color = 'primary',
  loading = false,
  className = '',
  ...props 
}) => {
  const colorClasses = {
    primary: 'text-primary bg-primary/10',
    secondary: 'text-secondary bg-secondary/10',
    accent: 'text-accent bg-accent/10',
    success: 'text-success bg-success/10',
    warning: 'text-warning bg-warning/10',
    error: 'text-error bg-error/10',
    info: 'text-info bg-info/10'
  };

  const trendClasses = {
    up: 'text-success',
    down: 'text-error',
    neutral: 'text-gray-500'
  };

  if (loading) {
    return (
      <Card className={`animate-pulse ${className}`}>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      {...props}
    >
      <Card hover className={className}>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            
            {trend && trendValue && (
              <div className={`flex items-center text-sm ${trendClasses[trend]}`}>
                <ApperIcon 
                  name={trend === 'up' ? 'TrendingUp' : trend === 'down' ? 'TrendingDown' : 'Minus'} 
                  className="w-4 h-4 mr-1" 
                />
                {trendValue}
              </div>
            )}
          </div>
          
          {icon && (
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
              <ApperIcon name={icon} className="w-6 h-6" />
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default StatCard;
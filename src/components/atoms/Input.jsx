import { useState, forwardRef } from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const Input = forwardRef(({ 
  label,
  type = 'text',
  error,
  icon,
  iconPosition = 'left',
  className = '',
  placeholder,
  value,
  onChange,
  ...props 
}, ref) => {
  const [focused, setFocused] = useState(false);
  const [filled, setFilled] = useState(!!value);

  const handleFocus = () => setFocused(true);
  const handleBlur = (e) => {
    setFocused(false);
    setFilled(!!e.target.value);
  };

  const handleChange = (e) => {
    setFilled(!!e.target.value);
    onChange?.(e);
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <motion.label
          animate={{
            y: focused || filled ? -20 : 0,
            scale: focused || filled ? 0.85 : 1,
            color: focused ? '#4F46E5' : error ? '#EF4444' : '#6B7280'
          }}
          transition={{ duration: 0.2 }}
          className="absolute left-3 top-2.5 text-sm font-medium pointer-events-none origin-left z-10"
        >
          {label}
        </motion.label>
      )}
      
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <ApperIcon name={icon} className="w-5 h-5" />
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={focused ? placeholder : ''}
          className={`
            w-full px-3 py-2.5 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1
            ${label ? 'pt-6 pb-2' : ''}
            ${icon && iconPosition === 'left' ? 'pl-10' : ''}
            ${icon && iconPosition === 'right' ? 'pr-10' : ''}
            ${error 
              ? 'border-error focus:border-error focus:ring-error/20' 
              : focused 
                ? 'border-primary focus:border-primary focus:ring-primary/20'
                : 'border-gray-300 hover:border-gray-400'
            }
          `}
          {...props}
        />
        
        {icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <ApperIcon name={icon} className="w-5 h-5" />
          </div>
        )}
      </div>
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-sm text-error flex items-center"
        >
          <ApperIcon name="AlertCircle" className="w-4 h-4 mr-1" />
          {error}
        </motion.p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
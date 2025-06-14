import { useState } from 'react';
import { motion } from 'framer-motion';
import Input from '@/components/atoms/Input';

const SearchBar = ({ 
  placeholder = 'Search...', 
  onSearch, 
  debounceMs = 300,
  className = '',
  ...props 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Debounce search
  const handleSearch = (value) => {
    setSearchTerm(value);
    
    const timeoutId = setTimeout(() => {
      onSearch?.(value);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative ${className}`}
    >
      <Input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        icon="Search"
        iconPosition="left"
        className="w-full"
        {...props}
      />
      
      {searchTerm && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            setSearchTerm('');
            onSearch?.('');
          }}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <ApperIcon name="X" className="w-4 h-4" />
        </motion.button>
      )}
    </motion.div>
  );
};

export default SearchBar;
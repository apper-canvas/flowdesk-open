import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { dealService, contactService } from '@/services';
import Input from '@/components/atoms/Input';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';

const DealForm = ({ deal, onSuccess, onCancel, className = '' }) => {
const [formData, setFormData] = useState({
    title: deal?.title || '',
    value: deal?.value || '',
    stage: deal?.stage || 'Lead',
    contactId: deal?.contact_id || deal?.contactId || '',
    probability: deal?.probability || 25,
    expectedClose: deal?.expected_close || deal?.expectedClose || '',
    notes: deal?.notes || ''
  });
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [errors, setErrors] = useState({});

  const stages = [
    'Lead',
    'Qualified', 
    'Proposal',
    'Negotiation',
    'Closed Won',
    'Closed Lost'
  ];

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setLoadingContacts(true);
    try {
      const result = await contactService.getAll();
      setContacts(result);
    } catch (err) {
      toast.error('Failed to load contacts');
    } finally {
      setLoadingContacts(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Deal title is required';
    }
    
    if (!formData.value || formData.value <= 0) {
      newErrors.value = 'Deal value must be greater than 0';
    }
    
    if (!formData.contactId) {
      newErrors.contactId = 'Please select a contact';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const dealData = {
        ...formData,
        value: parseFloat(formData.value),
        probability: parseInt(formData.probability)
      };

      let savedDeal;
      if (deal?.id) {
        savedDeal = await dealService.update(deal.id, dealData);
        toast.success('Deal updated successfully');
      } else {
        savedDeal = await dealService.create(dealData);
        toast.success('Deal created successfully');
      }
      onSuccess?.(savedDeal);
    } catch (err) {
      toast.error(deal?.id ? 'Failed to update deal' : 'Failed to create deal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-white rounded-lg shadow-lg p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {deal?.id ? 'Edit Deal' : 'New Deal'}
        </h2>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
        >
          <ApperIcon name="X" className="w-5 h-5" />
        </motion.button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Deal Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            error={errors.title}
            icon="Target"
            required
          />
          
          <Input
            label="Deal Value"
            name="value"
            type="number"
            min="0"
            step="0.01"
            value={formData.value}
            onChange={handleChange}
            error={errors.value}
            icon="DollarSign"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Stage
            </label>
            <select
              name="stage"
              value={formData.stage}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
            >
              {stages.map(stage => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Contact
            </label>
            <select
              name="contactId"
              value={formData.contactId}
              onChange={handleChange}
              className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 ${
                errors.contactId ? 'border-error' : 'border-gray-300'
              }`}
              disabled={loadingContacts}
            >
              <option value="">Select a contact</option>
{contacts.map(contact => (
                <option key={contact.id} value={contact.id}>
                  {contact.Name || contact.name} - {contact.company}
                </option>
              ))}
            </select>
            {errors.contactId && (
              <p className="text-sm text-error flex items-center">
                <ApperIcon name="AlertCircle" className="w-4 h-4 mr-1" />
                {errors.contactId}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Probability (%)
            </label>
            <input
              type="range"
              name="probability"
              min="0"
              max="100"
              step="5"
              value={formData.probability}
              onChange={handleChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>0%</span>
              <span className="font-medium text-primary">{formData.probability}%</span>
              <span>100%</span>
            </div>
          </div>
          
          <Input
            label="Expected Close Date"
            name="expectedClose"
            type="date"
            value={formData.expectedClose}
            onChange={handleChange}
            icon="Calendar"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 resize-none"
            placeholder="Additional notes about this deal..."
          />
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            icon={deal?.id ? "Save" : "Plus"}
          >
            {deal?.id ? 'Update Deal' : 'Create Deal'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default DealForm;
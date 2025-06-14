import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { activityService, contactService, dealService } from '@/services';
import Input from '@/components/atoms/Input';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';

const ActivityForm = ({ activity, onSuccess, onCancel, className = '' }) => {
  const [formData, setFormData] = useState({
    type: activity?.type || 'call',
    subject: activity?.subject || '',
    notes: activity?.notes || '',
    contactId: activity?.contactId || '',
    dealId: activity?.dealId || '',
    date: activity?.date ? activity.date.slice(0, 16) : new Date().toISOString().slice(0, 16),
    duration: activity?.duration || 0
  });
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [errors, setErrors] = useState({});

  const activityTypes = [
    { value: 'call', label: 'Phone Call', icon: 'Phone' },
    { value: 'email', label: 'Email', icon: 'Mail' },
    { value: 'meeting', label: 'Meeting', icon: 'Users' },
    { value: 'note', label: 'Note', icon: 'FileText' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoadingData(true);
    try {
      const [contactsResult, dealsResult] = await Promise.all([
        contactService.getAll(),
        dealService.getAll()
      ]);
      setContacts(contactsResult);
      setDeals(dealsResult);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoadingData(false);
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
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
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
      const activityData = {
        ...formData,
        duration: parseInt(formData.duration) || 0,
        date: new Date(formData.date).toISOString()
      };

      let savedActivity;
      if (activity?.id) {
        savedActivity = await activityService.update(activity.id, activityData);
        toast.success('Activity updated successfully');
      } else {
        savedActivity = await activityService.create(activityData);
        toast.success('Activity logged successfully');
      }
      onSuccess?.(savedActivity);
    } catch (err) {
      toast.error(activity?.id ? 'Failed to update activity' : 'Failed to log activity');
    } finally {
      setLoading(false);
    }
  };

  const selectedType = activityTypes.find(type => type.value === formData.type);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-white rounded-lg shadow-lg p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {activity?.id ? 'Edit Activity' : 'Log Activity'}
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
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Activity Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {activityTypes.map(type => (
                <motion.button
                  key={type.value}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                  className={`p-3 rounded-lg border-2 transition-all flex items-center space-x-2 ${
                    formData.type === type.value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <ApperIcon name={type.icon} className="w-4 h-4" />
                  <span className="text-sm font-medium">{type.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          <Input
            label="Date & Time"
            name="date"
            type="datetime-local"
            value={formData.date}
            onChange={handleChange}
            icon="Calendar"
            required
          />
        </div>

        <Input
          label="Subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          error={errors.subject}
          icon={selectedType?.icon}
          placeholder={`Enter ${selectedType?.label.toLowerCase()} subject...`}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              disabled={loadingData}
            >
              <option value="">Select a contact</option>
              {contacts.map(contact => (
                <option key={contact.id} value={contact.id}>
                  {contact.name} - {contact.company}
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

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Related Deal (Optional)
            </label>
            <select
              name="dealId"
              value={formData.dealId}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
              disabled={loadingData}
            >
              <option value="">No deal selected</option>
              {deals.map(deal => (
                <option key={deal.id} value={deal.id}>
                  {deal.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(formData.type === 'call' || formData.type === 'meeting') && (
          <Input
            label="Duration (minutes)"
            name="duration"
            type="number"
            min="0"
            value={formData.duration}
            onChange={handleChange}
            icon="Clock"
            placeholder="How long did this take?"
          />
        )}

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
            placeholder="What happened? Key takeaways, next steps, etc..."
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
            icon={activity?.id ? "Save" : "Plus"}
          >
            {activity?.id ? 'Update Activity' : 'Log Activity'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default ActivityForm;
import { toast } from 'react-toastify';

const dealService = {
  async getAll() {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        Fields: ['Name', 'title', 'value', 'stage', 'probability', 'expected_close', 'notes', 'created_at', 'contact_id', 'Tags', 'Owner'],
        orderBy: [
          {
            FieldName: "created_at",
            SortType: "DESC"
          }
        ]
      };
      
      const response = await apperClient.fetchRecords('deal', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching deals:", error);
      toast.error("Failed to load deals");
      return [];
    }
  },

  async getById(id) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        fields: ['Name', 'title', 'value', 'stage', 'probability', 'expected_close', 'notes', 'created_at', 'contact_id', 'Tags', 'Owner']
      };
      
      const response = await apperClient.getRecordById('deal', id, params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching deal with ID ${id}:`, error);
      return null;
    }
  },

  async getByContactId(contactId) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        Fields: ['Name', 'title', 'value', 'stage', 'probability', 'expected_close', 'notes', 'created_at', 'contact_id', 'Tags', 'Owner'],
        where: [
          {
            FieldName: "contact_id",
            Operator: "ExactMatch",
            Values: [contactId.toString()]
          }
        ]
      };
      
      const response = await apperClient.fetchRecords('deal', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching deals by contact:", error);
      return [];
    }
  },

  async create(dealInfo) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        records: [
          {
            Name: dealInfo.title,
            title: dealInfo.title,
            value: parseFloat(dealInfo.value),
            stage: dealInfo.stage,
            probability: parseInt(dealInfo.probability),
            expected_close: dealInfo.expectedClose,
            notes: dealInfo.notes,
            contact_id: parseInt(dealInfo.contactId),
            created_at: new Date().toISOString()
          }
        ]
      };
      
      const response = await apperClient.createRecord('deal', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
          throw new Error("Failed to create deal");
        }
        
        const successfulRecord = response.results.find(result => result.success);
        return successfulRecord?.data;
      }
    } catch (error) {
      console.error("Error creating deal:", error);
      throw error;
    }
  },

  async update(id, updates) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        records: [
          {
            Id: parseInt(id),
            Name: updates.title || updates.Name,
            title: updates.title,
            value: updates.value ? parseFloat(updates.value) : undefined,
            stage: updates.stage,
            probability: updates.probability ? parseInt(updates.probability) : undefined,
            expected_close: updates.expectedClose || updates.expected_close,
            notes: updates.notes,
            contact_id: updates.contactId ? parseInt(updates.contactId) : updates.contact_id
          }
        ]
      };
      
      // Remove undefined values
      Object.keys(params.records[0]).forEach(key => {
        if (params.records[0][key] === undefined) {
          delete params.records[0][key];
        }
      });
      
      const response = await apperClient.updateRecord('deal', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to update ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
          throw new Error("Failed to update deal");
        }
        
        const successfulRecord = response.results.find(result => result.success);
        return successfulRecord?.data;
      }
    } catch (error) {
      console.error("Error updating deal:", error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        RecordIds: [parseInt(id)]
      };
      
      const response = await apperClient.deleteRecord('deal', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to delete ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          throw new Error("Failed to delete deal");
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error deleting deal:", error);
      throw error;
    }
  },

  async updateStage(id, newStage) {
    return this.update(id, { stage: newStage });
  }
};

export default dealService;
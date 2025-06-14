import { toast } from 'react-toastify';

const activityService = {
  async getAll() {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        Fields: ['Name', 'type', 'subject', 'notes', 'contact_id', 'deal_id', 'date', 'duration', 'Tags', 'Owner'],
        orderBy: [
          {
            FieldName: "date",
            SortType: "DESC"
          }
        ]
      };
      
      const response = await apperClient.fetchRecords('Activity1', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching activities:", error);
      toast.error("Failed to load activities");
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
        fields: ['Name', 'type', 'subject', 'notes', 'contact_id', 'deal_id', 'date', 'duration', 'Tags', 'Owner']
      };
      
      const response = await apperClient.getRecordById('Activity1', id, params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching activity with ID ${id}:`, error);
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
        Fields: ['Name', 'type', 'subject', 'notes', 'contact_id', 'deal_id', 'date', 'duration', 'Tags', 'Owner'],
        where: [
          {
            FieldName: "contact_id",
            Operator: "ExactMatch",
            Values: [contactId.toString()]
          }
        ],
        orderBy: [
          {
            FieldName: "date",
            SortType: "DESC"
          }
        ]
      };
      
      const response = await apperClient.fetchRecords('Activity1', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching activities by contact:", error);
      return [];
    }
  },

  async getByDealId(dealId) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        Fields: ['Name', 'type', 'subject', 'notes', 'contact_id', 'deal_id', 'date', 'duration', 'Tags', 'Owner'],
        where: [
          {
            FieldName: "deal_id",
            Operator: "ExactMatch",
            Values: [dealId.toString()]
          }
        ],
        orderBy: [
          {
            FieldName: "date",
            SortType: "DESC"
          }
        ]
      };
      
      const response = await apperClient.fetchRecords('Activity1', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching activities by deal:", error);
      return [];
    }
  },

  async create(activityInfo) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        records: [
          {
            Name: activityInfo.subject,
            type: activityInfo.type,
            subject: activityInfo.subject,
            notes: activityInfo.notes,
            contact_id: activityInfo.contactId ? parseInt(activityInfo.contactId) : null,
            deal_id: activityInfo.dealId ? parseInt(activityInfo.dealId) : null,
            date: activityInfo.date || new Date().toISOString(),
            duration: activityInfo.duration ? parseInt(activityInfo.duration) : 0
          }
        ]
      };
      
      const response = await apperClient.createRecord('Activity1', params);
      
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
          throw new Error("Failed to create activity");
        }
        
        const successfulRecord = response.results.find(result => result.success);
        return successfulRecord?.data;
      }
    } catch (error) {
      console.error("Error creating activity:", error);
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
            Name: updates.subject,
            type: updates.type,
            subject: updates.subject,
            notes: updates.notes,
            contact_id: updates.contactId ? parseInt(updates.contactId) : updates.contact_id,
            deal_id: updates.dealId ? parseInt(updates.dealId) : updates.deal_id,
            date: updates.date,
            duration: updates.duration ? parseInt(updates.duration) : undefined
          }
        ]
      };
      
      // Remove undefined values
      Object.keys(params.records[0]).forEach(key => {
        if (params.records[0][key] === undefined) {
          delete params.records[0][key];
        }
      });
      
      const response = await apperClient.updateRecord('Activity1', params);
      
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
          throw new Error("Failed to update activity");
        }
        
        const successfulRecord = response.results.find(result => result.success);
        return successfulRecord?.data;
      }
    } catch (error) {
      console.error("Error updating activity:", error);
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
      
      const response = await apperClient.deleteRecord('Activity1', params);
      
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
          throw new Error("Failed to delete activity");
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error deleting activity:", error);
      throw error;
    }
  },

  async getRecent(limit = 10) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        Fields: ['Name', 'type', 'subject', 'notes', 'contact_id', 'deal_id', 'date', 'duration', 'Tags', 'Owner'],
        orderBy: [
          {
            FieldName: "date",
            SortType: "DESC"
          }
        ],
        PagingInfo: {
          Limit: limit,
          Offset: 0
        }
      };
      
      const response = await apperClient.fetchRecords('Activity1', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      return [];
    }
  }
};

export default activityService;
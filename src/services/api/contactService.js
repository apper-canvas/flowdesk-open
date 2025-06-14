import { toast } from 'react-toastify';

const contactService = {
  async getAll() {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        Fields: ['Name', 'email', 'phone', 'company', 'position', 'notes', 'created_at', 'Tags', 'Owner', 'CreatedOn', 'ModifiedOn'],
        orderBy: [
          {
            FieldName: "created_at",
            SortType: "DESC"
          }
        ]
      };
      
      const response = await apperClient.fetchRecords('contact', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast.error("Failed to load contacts");
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
        fields: ['Name', 'email', 'phone', 'company', 'position', 'notes', 'created_at', 'Tags', 'Owner', 'CreatedOn', 'ModifiedOn']
      };
      
      const response = await apperClient.getRecordById('contact', id, params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching contact with ID ${id}:`, error);
      return null;
    }
  },

  async create(contactInfo) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        records: [
          {
            Name: contactInfo.name,
            email: contactInfo.email,
            phone: contactInfo.phone,
            company: contactInfo.company,
            position: contactInfo.position,
            notes: contactInfo.notes,
            created_at: new Date().toISOString()
          }
        ]
      };
      
      const response = await apperClient.createRecord('contact', params);
      
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
          throw new Error("Failed to create contact");
        }
        
        const successfulRecord = response.results.find(result => result.success);
        return successfulRecord?.data;
      }
    } catch (error) {
      console.error("Error creating contact:", error);
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
            Name: updates.name,
            email: updates.email,
            phone: updates.phone,
            company: updates.company,
            position: updates.position,
            notes: updates.notes
          }
        ]
      };
      
      const response = await apperClient.updateRecord('contact', params);
      
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
          throw new Error("Failed to update contact");
        }
        
        const successfulRecord = response.results.find(result => result.success);
        return successfulRecord?.data;
      }
    } catch (error) {
      console.error("Error updating contact:", error);
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
      
      const response = await apperClient.deleteRecord('contact', params);
      
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
          throw new Error("Failed to delete contact");
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error deleting contact:", error);
      throw error;
    }
  },

  async search(query) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        Fields: ['Name', 'email', 'phone', 'company', 'position', 'notes', 'created_at', 'Tags', 'Owner'],
        where: [
          {
            FieldName: "Name",
            Operator: "Contains",
            Values: [query]
          }
        ],
        whereGroups: [
          {
            operator: "OR",
            SubGroups: [
              {
                conditions: [
                  {
                    FieldName: "email",
                    Operator: "Contains",
                    Values: [query]
                  }
                ]
              },
              {
                conditions: [
                  {
                    FieldName: "company",
                    Operator: "Contains",
                    Values: [query]
                  }
                ]
              }
            ]
          }
        ]
      };
      
      const response = await apperClient.fetchRecords('contact', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error searching contacts:", error);
      return [];
    }
  }
};

export default contactService;
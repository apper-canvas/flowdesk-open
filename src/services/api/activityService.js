import activityData from '../mockData/activity.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let activities = [...activityData];

const activityService = {
  async getAll() {
    await delay(300);
    return [...activities].sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  async getById(id) {
    await delay(200);
    const activity = activities.find(a => a.id === id);
    return activity ? { ...activity } : null;
  },

  async getByContactId(contactId) {
    await delay(250);
    return activities
      .filter(a => a.contactId === contactId)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(a => ({ ...a }));
  },

  async getByDealId(dealId) {
    await delay(250);
    return activities
      .filter(a => a.dealId === dealId)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(a => ({ ...a }));
  },

  async create(activityInfo) {
    await delay(400);
    const newActivity = {
      ...activityInfo,
      id: Date.now().toString(),
      date: activityInfo.date || new Date().toISOString()
    };
    activities.push(newActivity);
    return { ...newActivity };
  },

  async update(id, updates) {
    await delay(300);
    const index = activities.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Activity not found');
    
    activities[index] = {
      ...activities[index],
      ...updates
    };
    return { ...activities[index] };
  },

  async delete(id) {
    await delay(250);
    const index = activities.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Activity not found');
    
    const deleted = activities.splice(index, 1)[0];
    return { ...deleted };
  },

  async getRecent(limit = 10) {
    await delay(200);
    return [...activities]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit)
      .map(a => ({ ...a }));
  }
};

export default activityService;
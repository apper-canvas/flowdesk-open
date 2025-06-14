import dealData from '../mockData/deal.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let deals = [...dealData];

const dealService = {
  async getAll() {
    await delay(300);
    return [...deals];
  },

  async getById(id) {
    await delay(200);
    const deal = deals.find(d => d.id === id);
    return deal ? { ...deal } : null;
  },

  async getByContactId(contactId) {
    await delay(250);
    return deals.filter(d => d.contactId === contactId).map(d => ({ ...d }));
  },

  async create(dealInfo) {
    await delay(400);
    const newDeal = {
      ...dealInfo,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    deals.push(newDeal);
    return { ...newDeal };
  },

  async update(id, updates) {
    await delay(300);
    const index = deals.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Deal not found');
    
    deals[index] = {
      ...deals[index],
      ...updates
    };
    return { ...deals[index] };
  },

  async delete(id) {
    await delay(250);
    const index = deals.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Deal not found');
    
    const deleted = deals.splice(index, 1)[0];
    return { ...deleted };
  },

  async updateStage(id, newStage) {
    await delay(200);
    return this.update(id, { stage: newStage });
  }
};

export default dealService;
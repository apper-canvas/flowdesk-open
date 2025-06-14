import contactData from '../mockData/contact.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let contacts = [...contactData];

const contactService = {
  async getAll() {
    await delay(300);
    return [...contacts];
  },

  async getById(id) {
    await delay(200);
    const contact = contacts.find(c => c.id === id);
    return contact ? { ...contact } : null;
  },

  async create(contactInfo) {
    await delay(400);
    const newContact = {
      ...contactInfo,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    contacts.push(newContact);
    return { ...newContact };
  },

  async update(id, updates) {
    await delay(300);
    const index = contacts.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Contact not found');
    
    contacts[index] = {
      ...contacts[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return { ...contacts[index] };
  },

  async delete(id) {
    await delay(250);
    const index = contacts.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Contact not found');
    
    const deleted = contacts.splice(index, 1)[0];
    return { ...deleted };
  },

  async search(query) {
    await delay(200);
    const lowercaseQuery = query.toLowerCase();
    return contacts.filter(contact =>
      contact.name.toLowerCase().includes(lowercaseQuery) ||
      contact.email.toLowerCase().includes(lowercaseQuery) ||
      contact.company.toLowerCase().includes(lowercaseQuery)
    );
  }
};

export default contactService;
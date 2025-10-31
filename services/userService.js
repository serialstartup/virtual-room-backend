class UserService {
  constructor() {
    this.users = [];
  }

  async getAllUsers() {
    return this.users;
  }

  async getUserById(id) {
    return this.users.find(user => user.id === id);
  }

  async createUser(userData) {
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date()
    };
    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id, userData) {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    this.users[userIndex] = {
      ...this.users[userIndex],
      ...userData,
      updatedAt: new Date()
    };
    
    return this.users[userIndex];
  }

  async deleteUser(id) {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    return this.users.splice(userIndex, 1)[0];
  }
}

module.exports = new UserService();
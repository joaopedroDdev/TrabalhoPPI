const users = [];
const messages = [];

module.exports = {
  addUser: user => users.push(user),
  getUsers: () => users,
  addMessage: message => messages.push(message),
  getMessages: () => messages,
};
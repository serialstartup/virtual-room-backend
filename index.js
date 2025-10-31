require('dotenv').config();
const express = require('express');
const cors = require('cors');
const userController = require('./controllers/userController');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Virtual Room Backend API is running!',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/users', userController.getAllUsers.bind(userController));
app.get('/api/users/:id', userController.getUserById.bind(userController));
app.post('/api/users', userController.createUser.bind(userController));
app.put('/api/users/:id', userController.updateUser.bind(userController));
app.delete('/api/users/:id', userController.deleteUser.bind(userController));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
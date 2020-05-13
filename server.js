const express = require('express');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000; 

const app = express();

// Connect Database
connectDB();

// Init middleware
app.use(express.json({extended: false}));

app.get('/', (req, res) => {
    res.send('API Running');
});

// Define routes 
app.use('/api/users', require('./routes/api/users'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/auth', require('./routes/api/auth'));

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

// mongodb+srv://chris:tOVdxwZyhA2sWT9D@ceedevelopment-a80vf.mongodb.net/test?authSource=admin&replicaSet=CeeDevelopment-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true
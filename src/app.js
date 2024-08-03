const express = require('express');
const app = express();
const exampleMiddleware = require('./middleware/middleware');
const cors = require('cors');

// Middleware to parse JSON bodies
app.use(express.json());
// app.use(cors({ origin: 'http://localhost:5173' })); 
app.use(cors({ origin: '*' }));

// Use relevant middleware
app.use(exampleMiddleware);

// Routes
const indexRouter = require('./routes/index');
const userRouter = require('./routes/userRoutes');
const contactRouter = require('./routes/contact');
app.use('/', indexRouter);
app.use('/users', userRouter);

app.use('/contacts', contactRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;

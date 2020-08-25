const express = require('express');
const graphqlHTTP = require('express-graphql');
const schema = require('./schema/schema');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const isAuth = require('./middleware/is-auth');
dotenv.config();

const app = express();

// Database connection
const URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.jiiju.mongodb.net/${process.env.MONGO_TEST_DB}?retryWrites=true&w=majority`;
mongoose.connect(URI, { useNewUrlParser: true });
mongoose.connection.once('open', () => {
    console.log(`Connected to Mongo DB:${process.env.MONGO_DB}`);
});

// Middleware
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization',
    );
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});
if (process.env.NODE_ENV === 'production') {
    app.use(express.static('client/build'));

    const path = require('path');
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

app.use(isAuth);
app.use(
    '/graphql',
    graphqlHTTP({
        schema,
        graphiql: true,
    }),
);
const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log('Now listening to port 8000.');
});

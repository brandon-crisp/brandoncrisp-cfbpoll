const express = require('express');

const app = express();
app.use(express.json({limit: '30mb', extended: true}));
app.use(express.urlencoded({ extended: true }));
app.use(express.text({ limit: '50mb', type: 'application/xml' }));

app.listen(process.env.PORT || 3000, (error) => {
    if (error) {
        return console.log(`Error starting server ❌\n${error}`);
    }
    console.log('✔️ Server successfully started!');
});

app.get('/', (req, res) => {
    res.send('OK');
});

// Endpoints

const cfbRoute = require('./routes/cfb');
app.use('/cfb', cfbRoute);
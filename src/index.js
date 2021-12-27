const express = require('express');
const axios = require('axios');
const responseTime = require('response-time');
const redis = require('redis');
const { response } = require('express');

const client = redis.createClient({
    host: '127.0.0.1',
    port: 6379
});

client.connect();
client.on('error', (err) => console.log('Redis Client Error', err));

const app = express();

app.use(responseTime());

app.get('/character', async (req, res) => {
    client.get('characters').then( async data => {
        if (data){
            return res.json(JSON.parse(data));
        } else {
            await axios.get('https://rickandmortyapi.com/api/character').then(r => {
                client.set('characters', JSON.stringify(r.data)).then(dataRedis => {
                    return res.json(r.data);
                });
            });
        }
    }).catch(error => console.log(error));
});

app.listen(3000);
console.log('Running on port 3000');
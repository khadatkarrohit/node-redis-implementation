let express = require("express");
let app = express();
const Joi = require('joi'); //used for validation
const redis = require('redis');
const axios = require('axios');
// create and connect redis client to local instance.
const client = redis.createClient();
// check connect
client.on('ready', function () {
  console.log("Redis is ready");
});
// if error
client.on('error', (err) => {
  console.log("Error " + err);
});
// clear cache
client.del("getData", function (err, reply) {
  console.log("Redis Del", reply);
});

app.use(express.json());

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server Listening on port ${port}..`));
const users = [
  { id: 1, name: 'Rohit', },
  { id: 2, name: 'Ravi' },
  { id: 3, name: 'Rohan' }  
]

app.get('/api/usersData', (req, res) => {
  res.send(users);
});

// get user data using user data
app.get('/api/getUsersData', (req, res) => {
  const getUser = `http://localhost:3000/api/usersData`;
  return client.get(`getData`, (err, resultData) => {
    if (resultData) {
      const userList = JSON.parse(resultData);
      return res.status(200).json(userList);
    } else {
      return axios.get(getUser)
        .then(response => {
          const userData = response.data;
          client.setex(`getData`, 3600, JSON.stringify({ userData }));
          return res.status(200).json({ userData });
        })
        .catch(err => {
          return res.json(err);
        });
    }
  });
});
module.exports = app
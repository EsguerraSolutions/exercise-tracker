const express = require('express');
const app = express();
const cors = require('cors');
const moment = require('moment');
const {mongoConnect} = require('./mongo');

const usersDB = require('./users.model');
const logsDB = require('./logs.model');

require('dotenv').config();

app.use(cors());
app.use(express.static('public'));

app.use(express.urlencoded());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', async (req,res) => {
  const { username } = req.body;
  const newUser = {
    username , count : 0
  };
  const newUserDoc = await usersDB.create(newUser);
  return res.json({
    username: newUserDoc.username,
    _id: newUserDoc._id
  });
});

app.get('/api/users', async (req,res) => {
  const allUsers = await usersDB.find({}, '_id username');
  return res.json(allUsers);
});

app.post('/api/users/:_id/exercises', async (req,res) => {
  const { description , duration } = req.body;
  // var today = moment(new Date()).format('YYYY-MM-DD[T00:00:00.000Z]');
  // var reqDate = moment(new Date(req.body.date)).format('YYYY-MM-DD[T00:00:00.000Z]');
  let date = new Date(req.body.date) != 'Invalid Date' ? new Date(req.body.date) : new Date();
  const id = req.params['_id'];
  const updatedUserDoc = await usersDB.findById(id);
  if (updatedUserDoc) {
    const newLog = {
      userID : updatedUserDoc.id,
      description,
      duration,
      date
    };
    const newLogDoc = await logsDB.create(newLog);
    if (newLogDoc) {
      await usersDB.updateOne({_id : id}, {count: updatedUserDoc.count + 1});
    }
    return res.json({
      username : updatedUserDoc.username,
      description : newLogDoc.description,
      duration : newLogDoc.duration,
      date : newLogDoc.date.toDateString(),
      _id : newLogDoc.userID
    });
  }

  else {
    return res.json({error : 'Invalid ID'});
  }
});

app.get('/api/users/:_id/logs', async (req,res) => {
  const id = req.params['_id'];
  const userInfo = await usersDB.findOne({_id : id},'-__v');
  const {from , to , limit} = req.query;
  const gte = new Date(from);
  const lte = new Date(to);
  let filter = {};
  if (gte != 'Invalid Date' && lte != 'Invalid Date') {
    filter = { 
      userID : id,
      date: {
        $gte: gte,
        $lte : lte
      }}
  }

  else {
    filter = { userID : id }
  }
  const userLogsData = await logsDB.find(filter, 'description duration date -_id').limit(limit);
  console.log(`user logs: ${userLogsData}`);
  const userLogsDataConverted = userLogsData.map((log) => {
    console.log(typeof log.date.toString());
    return {
      description : log.description,
      duration : log.duration,
      date : log.date.toString()  
    }
  })
  const userLogs = {
    username : userInfo.username,
    count : userInfo.count,
    '_id' : userInfo._id,
    log : userLogsDataConverted
  };
  console.log(userLogs);
  return res.json(userLogs);
});

async function startServer() {
  await mongoConnect();
  const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('Your app is listening on port ' + listener.address().port)
  })
}

startServer();
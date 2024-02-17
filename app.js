const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const app = express()
const dbpath = path.join(__dirname, 'cricketTeam.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server started')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

const convertDBObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

app.get('/players/', async (request, response) => {
  const getPlayersList = `
    SELECT *
    FROM cricket_team
    ORDER BY 
    player_id`
  const playersArray = await db.all(getPlayersList)

  response.send(
    playersArray.map(eachPlayer => {
      return convertDBObjectToResponseObject(eachPlayer)
    }),
  )
})

app.use(express.json())

// POST METHOD
app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails

  const addPlayer = `
  INSERT INTO 
  cricket_team (player_name, jersey_number, role)
  VALUES 
  ( '${playerName}',${jerseyNumber},'${role}')`

  const dbResponse = await db.run(addPlayer)
  response.send('Player Added to Team')
})

//GET METHOD PLAYER
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getplayerId = `
  SELECT *
  FROM cricket_team
  WHERE
  player_id = ${playerId}`

  const player = await db.get(getplayerId)
  response.send(convertDBObjectToResponseObject(player))
})

// PUT METHOD

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const updatePlayer = `
        UPDATE 
        cricket_team
        SET
        player_name = '${playerName}',
        jersey_number = ${jerseyNumber},
        role = '${role}'
        WHERE
        player_id = ${playerId}`

  const newPlayer = await db.run(updatePlayer)
  response.send('Player Details Updated')
})

//DELETE METHOD
app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayer = `
  DELETE 
  FROM cricket_team
  WHERE
  player_id = ${playerId}`

  const newPlayerList = await db.run(deletePlayer)
  response.send('Player Removed')
})

module.exports = app

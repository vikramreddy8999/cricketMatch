const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");

const sqlite3 = require("sqlite3");
const path = require("path");
const dbpath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;
const intialiseDbAndServer = async () => {
  try {
    db = await open({
      fileName: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000);
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

intialiseDbAndServer();
 const convertplayerObjectToResponseOb=(dbO)=>{
     return{
         playerId:dbO.player_id,
         playerName:dbO.player_name,
     };
 };


 const convertMatchObjectToResponseOb=(dbO)=>{
     return{
         matchId:dbO.match_id,
         match:dbO.match,
         year:dbO.year,
     };
 };

app.get("/players/", async (request, response) => {
  const getPlayer = `
    SELECT *
    FROM player_details;`;
  const playerArray = await db.all(getPlayer);
  response.send(playerArray.map((each)=>convertplayerObjectToResponseOb(each)));
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT *
    FROM player_details
    WHERE player_id=${playerId};`;
  const player = await db.get(getPlayerQuery);
  response.send(convertplayerObjectToResponseOb(player));
});



app.put("/players/:playerId/",async(request,response)=>{
    const {playerId}=request.params;
    const {playerName}=requst.body;
    const updatePlayer=`
    UPDATE
    player_details
       SET
       player_name:`${playerName}`;
       WHERE player_id=${playerId}`;
    await db.get(updatePlayer);
    response.send("Player Details Updated")
});


app.get("/matches/:matchId/",async(request,response)=>{
    const {matchId}=request.params;
    const matchDetails=`
    SELECT *
    FROM match_details
    WHERE match_id=${matchId};`
    const match=await db.run(matchDetails);
    response.send(convertMatchObjectToResponseOb(match));
});


app.get("/players/:playerId/matches",async(request,response)=>{
    const{playerId}=request.params;
    const playerMatch=`
    SELECT *
    FROM player_match_score NATURAL JOIN match_details
    WHERE player_id=${playerId}`;
    const match=await db.run(playerMatch);
    response.send(match.map((each)=>convertMatchObjectToResponseOb(each)));
})

app.get("/matches/:matchId/players",async(request,response)=>{
    
    const {matchId}=request.params;
    const playerDetailsMatch=`
    SELECT 
    *
    FROM player_details NATURAL JOIN player_match_score
   
    WHERE match_id=${matchId} `

    const player=await db.run(playerDetailsMatch);
    response.send(player.map((each)=>convertplayerObjectToResponseOb(each)));
    
});

app.get("/players/:playerId/playerScores",(request,response)=>{
    const {playerId}=request.params;
    const getPlayerScore=`
    SELECT
     player_id AS playerId,
    player_name AS playerName,
    SUM(score) AS totalScore,
    SUM(fours) AS totalFours,
    SUM(sixes) AS totalSixes
    FROM  player_match_score NATURAL JOIN player_details
    where player_id=${playerId};`;
    const playerscore=await db.get(getPlayerScore)
    response.send(playerscore);
    
});

module.exports=app;
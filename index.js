const walker = require('./walker');
const fs = require('fs');

const starter = async () => {
  const rawGames = await walker('./games', error => {
    throw Error(error);
  });

  // const groupByTeam = function(xs, key) {
  //   return xs.reduce(function(rv, x) {
  //     (rv[x[key]] = rv[x[key]] || []).push(x);
  //     return rv;
  //   }, {});
  // };

  // const teamSets = rawGames.map(g => [g.gameData.teams.away.triCode, g.gameData.teams.home.triCode].sort());

  // console.log(teamSets);


  const games = [];

  rawGames.forEach(game => {
    // const awayCode = game.gameData.teams.away.triCode;
    // const homeCode = game.gameData.teams.home.triCode;

    let _games = [];

    const elapsedSeconds = (time, period) => {
      const timeInSeconds =
        parseInt(time.split(':')[0], 10) * 60 +
        parseInt(time.split(':')[1], 10);

      return timeInSeconds + (period - 1) * 1200;
    };

    var triCodes = [game.gameData.teams.away.triCode, game.gameData.teams.home.triCode];

    triCodes.forEach(code => {
      const shots = game.liveData.plays.allPlays
        .filter(
          play =>
            (play.result.eventTypeId === 'GOAL' || play.result.eventTypeId === 'SHOT' || play.result.eventTypeId === 'MISSED_SHOT') && play.team.triCode === code,
        )
        .map(shot => ({
          time: shot.about.periodTime,
          period: shot.about.period,
          elapsedSeconds: elapsedSeconds(
            shot.about.periodTime,
            shot.about.period,
          ),
          type: shot.result.eventTypeId,
        }));

      // const shots = rawShots.map(shot => {
      //   time: shot.about.periodTime;
      // });

      _games.push({
        triCode: code,
        shots,
      });
    });

    games.push({
      gameData: game.gameData,
      shots: _games,
    });

    var gameNamer = (a, b) => [a, b].sort().join('_');

    const teamedGames = [];

    games.forEach(game => {
      var name = gameNamer(game.gameData.teams.away.triCode, game.gameData.teams.home.triCode);
      const existing = teamedGames.find(tg => tg.name === name);

      if (!existing) {
        teamedGames.push({
          name,
          prettyName: [game.gameData.teams.away.name, game.gameData.teams.home.name].sort(),
          prettyCode: [game.gameData.teams.away.triCode, game.gameData.teams.home.triCode].sort(),
          games: [game],
        })
      } else {
        existing.games.push(game);
      }
    });

    fs.writeFileSync('./gui/data.js', `window.data = ${JSON.stringify(teamedGames)}`);
  });
};

starter();

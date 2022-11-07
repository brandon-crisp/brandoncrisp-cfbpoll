const router = require('express').Router();
const Axios = require('axios').default;
const mainURL = 'https://api.collegefootballdata.com';
const apiKey = '4OMIzV4ef3QobWuvZc4fCL7q4pPO4ufUeMvXCEPcD+Npc8A6hisNY7V14EE/GsNT';
const allTeams = require('../teams.json');
const currentYear = new Date().getFullYear();

router.get('/teams', async (req, res) => {
    try {

        // Getting all teams
        const teams = await Axios.get(`${mainURL}/teams/fbs`, {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });

        return res.status(200).send({
            teams: teams.data,
        });
    } catch (error) {
        return res.status(500).send({
            status: 'error',
            data: error.message
        });
    }
});

router.get('/teamRecords', async (req, res) => {
    try {

        // Looping through all teams, getting their total games, total wins, and total losses, and adding them to an array.
        let teamRecords = [];
        for (let i = 0; i < allTeams.length; i++) {
            const team = allTeams[i];
            const teamRecord = await Axios.get(`${mainURL}/records?year=${currentYear}&team=${team}`, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                }
            });
            teamRecords.push(`${team}|${teamRecord.data[0]?.total.games}|${teamRecord.data[0]?.total.wins}|${teamRecord.data[0]?.total.losses}`);
        }

        return res.status(200).send({
            records: teamRecords,
        });
    } catch (error) {
        return res.status(500).send({
            status: 'error',
            data: error.message
        });
    }
});

router.get('/points', async (req, res) => {
    try {

        // Looping through all teams. Each object has two teams, one is the team in the loop, and the other is the opponent. We want to get the points scored by each team. All points by the team in the loop are added to a points scored array, and all points by the opponent are added to a points allowed array.
        let pointsScored = 0;
        let pointsAllowed = 0;
        let pointsArray = [];
        for (let i = 0; i < allTeams.length; i++) {
            const team = allTeams[i];
            const teamStats = await Axios.get(`${mainURL}/games/teams?year=${currentYear}&team=${team}`, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                }
            });
            for (let j = 0; j < teamStats.data.length; j++) {
                for (let k = 0; k < teamStats.data[j].teams.length; k++) {
                    if (teamStats.data[j].teams[k].school === decodeURIComponent(team)) {
                        pointsScored += teamStats.data[j].teams[k].points;
                    } else {
                        pointsAllowed += teamStats.data[j].teams[k].points;
                    }
                }
            }
            pointsArray.push(`${pointsScored}|${pointsAllowed}`);
            pointsScored = 0;
            pointsAllowed = 0;
        }

        return res.status(200).send({
            points: pointsArray,
        });
    } catch (error) {
        return res.status(500).send({
            status: 'error',
            data: error.message
        });
    }
});

router.get('/stats', async (req, res) => {
    try {

        // Looping through all teams. Each object has two teams, one is the team in the loop, and the other is the opponent.
        let rushingYards = 0; // rushingYards
        let passingYards = 0; // netPassingYards
        let penaltyYards = 0; // totalPenaltiesYards
        let possessionTime = 0; // possessionTime
        let rushingYardsAllowed = 0; // rushingYardsAllowed
        let passingYardsAllowed = 0; // netPassingYardsAllowed
        let turnoversLost = 0; // turnovers
        let turnoversGained = 0; // turnovers
        let statsArray = [];
        for (let i = 0; i < allTeams.length; i++) {
            const team = allTeams[i];
            const teamStats = await Axios.get(`${mainURL}/games/teams?year=${currentYear}&team=${team}`, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                }
            });
            for (let j = 0; j < teamStats.data.length; j++) {
                for (let k = 0; k < teamStats.data[j].teams.length; k++) {
                    if (teamStats.data[j].teams[k].school === decodeURIComponent(team)) {
                        rushingYards += parseInt(teamStats.data[j].teams[k].stats.filter(stat => stat.category === 'rushingYards')[0]?.stat);
                        passingYards += parseInt(teamStats.data[j].teams[k].stats.filter(stat => stat.category === 'netPassingYards')[0]?.stat);
                        penaltyYards += parseInt(teamStats.data[j].teams[k].stats.filter(stat => stat.category === 'totalPenaltiesYards')[0]?.stat.split('-')[1]);
                        // For posessionTime, time comes through like "38:22", indicating 38 minutes and 22 seconds. We need to convert this to seconds.
                        possessionTime += parseInt(teamStats.data[j].teams[k].stats.filter(stat => stat.category === 'possessionTime')[0]?.stat.split(':')[0]) * 60 + parseInt(teamStats.data[j].teams[k].stats.filter(stat => stat.category === 'possessionTime')[0]?.stat.split(':')[1]);
                        turnoversLost += parseInt(teamStats.data[j].teams[k].stats.filter(stat => stat.category === 'turnovers')[0]?.stat) || 0;
                    } else {
                        // Adding up rushing and passing yards allowed, where the category in stats is rushingYards and netPassingYards, and adding the value in stat.
                        rushingYardsAllowed += parseInt(teamStats.data[j].teams[k].stats.filter(stat => stat.category === 'rushingYards')[0]?.stat);
                        passingYardsAllowed += parseInt(teamStats.data[j].teams[k].stats.filter(stat => stat.category === 'netPassingYards')[0]?.stat);
                        turnoversGained += parseInt(teamStats.data[j].teams[k].stats.filter(stat => stat.category === 'turnovers')[0]?.stat) || 0;
                    }
                }
            }
            statsArray.push(`${rushingYards}|${passingYards}|${penaltyYards}|${possessionTime}|${turnoversGained}|${turnoversLost}|${rushingYardsAllowed}|${passingYardsAllowed}`);
            rushingYards = 0;
            passingYards = 0;
            penaltyYards = 0;
            possessionTime = 0;
            turnoversGained = 0;
            turnoversLost = 0;
            rushingYardsAllowed = 0;
            passingYardsAllowed = 0;
        }

        return res.status(200).send({
            stats: statsArray,
        });
    } catch (error) {
        return res.status(500).send({
            status: 'error',
            data: error.message
        });
    }
});

module.exports = router;
const router = require('express').Router();
const Axios = require('axios').default;
const mainURL = 'https://api.collegefootballdata.com';
const apiKey = process.env.cfbApiKey;

router.get('/allTeams', async (req, res) => {
    
    console.log(process.env);


    try {

        // Getting all teams
        const teams = await Axios.get(`${mainURL}/teams/fbs`, {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });

        return res.status(200).send({
            status: 'success',
            data: teams.data
        });
    } catch (error) {
        return res.status(500).send({
            status: 'error',
            data: error.message
        });
    }
});

module.exports = router;
const express = require('express');
const app = express();
var fetch = require('sync-fetch');
const { WebhookClient, Image } = require('dialogflow-fulfillment')
const bodyParser = require('body-parser');

app.use(bodyParser.json());

app.post('/dialogflow-fulfillment', (request, response) => {
    dialogflowFulfillment(request, response);
})

app.get('/', (req, res) => {
    res.send("hello world");
})

// Fetching from TMDB (API KEY)
var api_key = 'a2fc2372c77a3bdb7ae1313c79f6e191';


// DialogFlow fulfillment function
const dialogflowFulfillment = (request, response) => {
    const agent = new WebhookClient({request, response});

    function sayHello(agent) {
        agent.add("Hi there! this is from webhook");
    }

    function trendingMovie(agent) {
        let data = fetch(`https://api.themoviedb.org/3/trending/all/day?api_key=${api_key}`).json()

        let text = 'Film yang trending hari ini: \n';
        for (let i = 0; i < data.results.length; i++) {
            const title = data.results[i].original_title || data.results[i].original_name 
            text += `${i+1}. ${title} \n`;
        }

        agent.add(text); 
    }


    const searchMovie = (agent) => {
        const movieTitle = agent.parameters.movie[0];
        const url = `https://api.themoviedb.org/3/search/movie?api_key=${api_key}&language=en-US&query=${movieTitle}&page=1&include_adult=false`;
        let data = fetch(url).json();

        let imageUrl = `http://image.tmdb.org/t/p/w185${data.results[0].poster_path}`;
        let detail = `Title:\n ${data.results[0].title}\n`;
        detail += `Overview:\n ${data.results[0].overview}`;
        
        agent.add(new Image(imageUrl));
        agent.add(detail);
    }

    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', sayHello);
    intentMap.set('Trending Movie', trendingMovie);
    intentMap.set('Movie Search', searchMovie);

    agent.handleRequest(intentMap);
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log("server started on port", PORT))
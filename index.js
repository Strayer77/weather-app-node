const express = require('express');
const https = require('https');
const bodyParser = require('body-parser');
const { response } = require('express');


const app = express()


app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({
    extended: true
}))

app.use(express.static("public"))



app.get('/', (req, res) => {
    res.render('index', {data: ''});
})

app.post('/', (req, res) => {
    const location = req.body.location
    const apiKey = '6c6e5e0af6715fa27517e424f5b069d2'
    const location_url = "https://api.openweathermap.org/data/2.5/forecast/daily?q="+location+"&units=imperial&cnt=7&appid="+apiKey
    console.log(location_url)
    // location_url = "https://www.metaweather.com/api/location/search/?query=" + location
    https.get(location_url, (response) => {
        if (response.statusCode === 200) {
            response.on("data", (data) => {
                const locationData = JSON.parse(data);
                console.log(locationData)
                res.render('index', {data: locationData});
            })
            
        } else {
            res.render('index', {data: "0"})
        }
        
    })
    
})


app.listen(3000, function() {
    console.log('Example app')

})

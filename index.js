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
    const location_url = "https://api.openweathermap.org/data/2.5/forecast/daily?q="+location+"&units=imperial&cnt=8&appid="+apiKey


    var today = new Date();
    var date = (today.getMonth()+1)+'/'+today.getDate()+'/'+today.getFullYear();
 
    // location_url = "https://www.metaweather.com/api/location/search/?query=" + location
    https.get(location_url, (response) => {
        if (response.statusCode === 200) {
            response.on("data", (data) => {
                const locationData = JSON.parse(data);
              
                for (var i=0; i < locationData['list'].length; i++) {
                    locationData['list'][i]['sunrise'] = convertUnixTimeStamp(locationData['list'][i]['sunrise'])
                    locationData['list'][i]['sunset'] = convertUnixTimeStamp(locationData['list'][i]['sunset'])
                }
                res.render('index', {data: locationData, date: date});
            })
            
        } else {
            res.render('index', {data: "0"})
        }
        
    })
    
})

// this function takes the timestamps output by the weather
// api and converts them to readable dates
function convertUnixTimeStamp(timestamp) {
    var new_date = new Date(timestamp * 1000);
    var hour = new_date.getHours();
    var min = new_date.getMinutes();

    return hour + ':' + min
}

app.listen(3000, function() {
    console.log('Running Weather app')

})

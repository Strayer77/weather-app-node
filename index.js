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
                  
                    var day = retrieveDay(locationData['list'][i]['dt']);
                    locationData['list'][i]['day'] = day;
                    var icon = retrieveWeatherIcon(locationData['list'][i]['weather'][0]['main']);
                    locationData['list'][i]['icon'] = icon
                    locationData['list'][i]['dt'] = convertUnixTimeStamp(locationData['list'][i]['dt'], '');
                    locationData['list'][i]['deg'] = degreeToText(locationData['list'][i]['deg']);
                    locationData['list'][i]['sunrise'] = convertUnixTimeStamp(locationData['list'][i]['sunrise'], 'hours');
                    locationData['list'][i]['sunset'] = convertUnixTimeStamp(locationData['list'][i]['sunset'], 'hours');
                
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
function convertUnixTimeStamp(timestamp, timeformat) {
    if (timeformat === 'hours') {
        var new_date = new Date(timestamp * 1000);
        var hour = new_date.getHours();
        var min = "0" + new_date.getMinutes();

        return hour + ':' + min.substr(-2)

    } else {
        var new_date = new Date(timestamp * 1000);
        var month = (new_date.getMonth() + 1);
        var day = new_date.getDate()

        return month + '/' + day
    }
    
}


// get day of week based on timestamp passed in
function retrieveDay(timestamp) {
    var new_date = new Date(timestamp * 1000);
    weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    var day_num = new_date.getDay()
    var day = weekdays[day_num]

    return day
}


// function to take degrees and return text description
function  degreeToText(degree){
    if (degree>337.5) return 'N';
    if (degree>292.5) return 'NW';
    if(degree>247.5) return 'W';
    if(degree>202.5) return 'SW';
    if(degree>157.5) return 'S';
    if(degree>122.5) return 'SE';
    if(degree>67.5) return 'E';
    if(degree>22.5){return 'NE';}
    return 'N';
}


function retrieveWeatherIcon(weatherDescription) {
    var iconObject = {
        'Thunderstorm': 'thunder.svg',
        'Drizzle': 'rainy-1.svg',
        'Rain': 'rainy-6.svg',
        'Snow': 'snowy-3.svg',
        'Atmosphere': 'day.svg',
        'Clear': 'day.svg',
        'Clouds': 'cloudy.svg'
    }
    return iconObject[weatherDescription]
}

app.listen(3000, function() {
    console.log('Running Weather app')

})

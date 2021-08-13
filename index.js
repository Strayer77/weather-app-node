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


const apiKey = '6c6e5e0af6715fa27517e424f5b069d2'


// get main page - makes call to weather api for boise's weather to display when user
// first enters page - was considering doing based on IP address but didn't like
// allow location popup at start
app.get('/', (req, res) => {
    
    date = getCurrentDate()
    home_url = 'https://api.openweathermap.org/data/2.5/forecast/daily?q=Boise&units=imperial&cnt=8&appid=' + apiKey
    https.get(home_url, (response) => {
        if (response.statusCode === 200) {
            response.on("data", (data) => {
                const homeData = JSON.parse(data);
                formatted_data = formatData(homeData)
                res.render('index', {data: '', date: date, homeData: formatted_data});
            })
            
        } else {
            res.render('index', {data: "0"})
        }
    })   
})
    

// takes user input and sends request to openweathermap api
// response is parsed and formatted to be displayed in view
app.post('/', (req, res) => {
    const location = req.body.location
    const location_url = "https://api.openweathermap.org/data/2.5/forecast/daily?q="+location+"&units=imperial&cnt=8&appid=" + apiKey
    date = getCurrentDate()

    https.get(location_url, (response) => {
        if (response.statusCode === 200) {
            response.on("data", (data) => {
                const locationData = JSON.parse(data);
                formatted_data = formatData(locationData)
                // console.log(formatted_data)
                res.render('index', {data: formatted_data, date: date});
            })
        } else {
            res.render('index', {data: "0"})
        }
    })
    
})


// loops through weather data forecast list and formats/converts values
// and assigns icons
function formatData(data) {
    for (var i=0; i < data['list'].length; i++) {
        var day = retrieveDay(data['list'][i]['dt']);
        data['list'][i]['day'] = day;
        var icon = retrieveWeatherIcon(data['list'][i]['weather'][0]['main']);
        data['list'][i]['icon'] = icon
        data['list'][i]['dt'] = convertUnixTimeStamp(data['list'][i]['dt'], '');
        data['list'][i]['deg'] = degreeToText(data['list'][i]['deg']);
        data['list'][i]['sunrise'] = convertUnixTimeStamp(data['list'][i]['sunrise'], 'hours');
        data['list'][i]['sunset'] = convertUnixTimeStamp(data['list'][i]['sunset'], 'hours');
    }

    return data
}


// grabs current date formatted MM/DD/YYYY
function getCurrentDate() {
    var today = new Date();
    var date = (today.getMonth()+1)+'/'+today.getDate()+'/'+today.getFullYear();

    return date
}


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
    if (degree > 337.5) return 'N';
    if (degree > 292.5) return 'NW';
    if (degree > 247.5) return 'W';
    if (degree > 202.5) return 'SW';
    if (degree > 157.5) return 'S';
    if (degree > 122.5) return 'SE';
    if (degree > 67.5) return 'E';
    if (degree > 22.5) {return 'NE';}

    return 'N';
}


// takes main weather description used as key to pull
// svg file name (value) to match up with current weather states
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

const api = 'https://api.wheretheiss.at/v1/satellites/25544'

const issIcon = L.icon({
    iconUrl: 'International_Space_Station.png',
    iconSize: [30, 20],
    iconAnchor: [25, 16],
});
let visible = false
let followISS = false

document.querySelector('#check-in').addEventListener('click', () => {
    sendMyData()
})
document.querySelector('#iss-coords').addEventListener('click', () => {
    sendISSDataDB()
})
document.querySelector('#display-coords').addEventListener('click', (e) => {
    visible = !visible    
    e.target.style.background = visible ? '#5FC350' : '#EFEFEF'
    displayCoordsUI()
})
document.querySelector('#clear-all').addEventListener('click', () => {
    clearAllDataDB()
    displayCoordsUI()
})
document.querySelector('#follow').addEventListener('click', (e) => {
    changeFollowColor(e)
    return followISS = !followISS
})

//=================================== MAP ===================================
let map = L.map('map').setView([0, 0], 1);

const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const tiles = L.tileLayer (tileUrl, {attribution})
tiles.addTo(map)

const marker = L.marker([0, 0], {icon: issIcon}).addTo(map);
//=================================== MAP ===================================
//================================= COORDS ==================================
function sendMyData() {
    if('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            // DATA
            const lat = pos.coords.latitude
            const lon = pos.coords.longitude
            const temp = await getWeatherInfo(lat, lon)
            const data = {lat , lon, temp}
            
            // DISPLAY MY COORDS  ON SCREEN
            document.querySelector('#my-coords').innerHTML = `
            latitude: ${(Math.abs(lat)).toFixed(2)} ${lat > 0 ? 'N' : 'S'}<br>
            longitude: ${(Math.abs(lon)).toFixed(2)} ${lon > 0 ? 'W' : 'E'}<br>
            temp: ${((temp)-274.15).toFixed(1)}°C<br>`
            displayOnMap(lat, lon)

            // SERVER ROUTE
            const options = {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            }

            const resp = await fetch('/myCoords', options)
            const json = await resp.json()
        })
    }
}

async function sendISSDataDB() {
    // GET ISS COORDS
    const dane = await getISSCoordsAPI()
    const {lat, lon} = dane
    // GET ISS WEATHER INFO BASED ON COORDS
    const temp = await getWeatherInfo(lat, lon)
    // BACK-END
    const data = {lat, lon, temp}
    const options = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    }
    const respone = await fetch('/ISScoords', options)
    const json = await respone.json()
    // DISPLAY UI
    displayOnMap(lat, lon)
    displayCoordsUI()
}


//================================= COORDS ==================================

async function displayCoordsUI() {
    document.querySelector('#list').innerHTML = ''
    if (visible) {
        // PULLS DATA FROM DB
        const list = document.querySelector('#list')
        const resp = await fetch('/ISScoordsDB')
        const data = await resp.json()

        data.forEach(item => {
            // MAKES MARKER ON MAP
            const txt = `
            ${(Math.abs(item.lat)).toFixed(2)}${item.lat > 0 ? 'N' : 'S'} / 
            ${(Math.abs(item.lon)).toFixed(2)}${item.lon > 0 ? 'W' : 'E'}<br>
            ${((item.temp)-274.15).toFixed(1)}°C`
            displayOnMap(item.lat, item.lon, txt)

            // MAKES DISPLAY ON UI
            const element = document.createElement('li')
            element.classList.add('coord-element')
            element.innerHTML = `
            latitude: ${(Math.abs(item.lat)).toFixed(2)} ${item.lat > 0 ? 'N' : 'S'}<br>
            longitude: ${(Math.abs(item.lon)).toFixed(2)} ${item.lon > 0 ? 'W' : 'E'}<br>
            temp: ${((item.temp)-274.15).toFixed(1)}°C<br>
            `
            list.appendChild(element)
        })
    }
}
async function getISSCoordsAPI () {
    const resp = await fetch(api)
    const ISS = await resp.json()
    const lat = ISS.latitude
    const lon = ISS.longitude
    return {lat, lon}
}

async function getWeatherInfo(lat, lon) {
    const keey = await apiKey()
    const myWeatherAPI = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${keey}`
    const resp = await fetch(myWeatherAPI)
    const weather = await resp.json()
    return weather.main.temp
}

async function clearAllDataDB() {
    const resp = await fetch('/ISScoordsDBclear')
    const data = await resp.json()
}

function displayOnMap (lat, lon, txt) {
    let marker = L.marker([lat, lon]).addTo(map);
    marker.bindPopup(txt)
}

async function liveISS() {
    const dane = await getISSCoordsAPI()
    const {lat, lon} = dane
    marker.setLatLng([lat, lon])
    if (followISS) {
        map.setView([lat, lon], map.getZoom())
    } 
}
function changeFollowColor (e) {
    if (followISS) {
        e.target.style.background = '#EFEFEF'
    } else {
        e.target.style.background = '#53B650'
    }
}

liveISS()
setInterval(liveISS, 1000)

async function apiKey () {
    const resp = await fetch('/apiKey')
    const key = await resp.json()
    return key
}
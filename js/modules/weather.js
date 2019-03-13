function Weather(options) {
    let defaultOptions = {
        apiKey: 'h0YJgo2hCXfxFIq1VoBN8ousyZa0Ijf2',
        locationCode: '323903',
        baseUrl: 'http://dataservice.accuweather.com/',
        requestLink: 'forecasts/v1/daily/1day/'
    };

    this.settings = Object.assign(defaultOptions, options);
    this.data = document.querySelector('.date-value');
    this.tempMax = document.querySelector('.temperature .max');
    this.tempMin = document.querySelector('.temperature .min');
    this.icon = document.querySelector('.icon');
    this.iconPhrase = document.querySelector('.icon-phrase');


    let self = this;
    
    // let requestAddress = this.settings.baseUrl + this.settings.requestLink + this.settings.locationCode + '?apikey=' + this.settings.apiKey + '&metric=true';
    
    function sendRequest(address) {
        let request = fetch(address, {
                        method: 'GET'
                    })
                    .then((response) => {
                        if(response.ok) {
                            return response.json();
                        }
                    })
                    .then((array) => {
                        console.log(array);
                        array.DailyForecasts.forEach((elem) => {
                            let date = parseDate(elem.Date);
                            let month = monthText(date.month);
                            self.data.innerHTML = `${date.day} ${month} ${date.year} года`;
                            self.tempMax.innerHTML = convertToCelsius(elem.Temperature.Maximum.UnitType, elem.Temperature.Maximum.Value);
                            self.tempMin.innerHTML = convertToCelsius(elem.Temperature.Minimum.UnitType, elem.Temperature.Minimum.Value);
                            
                            deleteChildren(self.icon);
                            self.icon.appendChild(createIcon(elem.Day.Icon));
                            self.iconPhrase.innerHTML = elem.Day.IconPhrase;
                        });
                        return array;
                    })
    }

    sendRequest(getAddress());


}

function getAddress() {
  let address = self.settings.baseUrl + self.settings.requestLink + self.settings.locationCode + '?apikey=' + self.settings.apiKey + '&metric=true';
  return address;
}

function monthText (number) {
    let month;
    switch (number) {
        case '01': 
            month = 'января';
            break;
        case '02': 
            month = 'февраля';
            break;
        case '03': 
            month = 'марта';
            break;
        case '04': 
            month = 'апреля';
            break;
        case '05': 
            month = 'мая';
            break;
        case '06': 
            month = 'июня';
            break;
        case '07': 
            month = 'июля';
            break;
        case '08': 
            month = 'августа';
            break;
        case '09': 
            month = 'сентября';
            break;
        case '10': 
            month = 'октября';
            break;
        case '11': 
            month = 'ноября';
            break;
        case '12': 
            month = 'декабря';
            break;
    }

    return month;
}

function parseDate (date) {
    let fullDate = date.slice(0, date.indexOf('T'));
    let fullTime;
    if(date.indexOf('+') !== -1) {
        fullTime = date.slice(date.indexOf('T') + 1, date.indexOf('+'));
    } else {
        fullTime = date.slice(date.indexOf('T') + 1);
    }
    let dateObj = {
        year: fullDate.slice(0, fullDate.indexOf('-')),
        month: fullDate.substr(fullDate.indexOf('-') + 1, 2),
        day: fullDate.slice(-2),
        time: fullTime
    };
    return dateObj;
}

function convertFahrenheitToCelsius (fahrenheit) {
    return ((fahrenheit - 32) * 5 / 9).toFixed(1);
}

function convertKelvinToCelsius (kelvin) {
    return (kelvin + 273.15).toFixed(1);
}

function convertToCelsius (type, value) {
    switch (type) {
        case 18: value = convertFahrenheitToCelsius(value);
                break;
        case 19: value = convertKelvinToCelsius(value);
                break;
    }
    return value;
}

function setWeatherIcon (icon) {
  let iconClass;
  switch (icon) {
    case 1:
    case 2: iconClass = 'fa-sun';
            break;
    case 3:
    case 4:
    case 21:
    case 5: iconClass = 'fa-cloud-sun';
            break;
    case 6:
    case 7:
    case 8:
    case 11:
    case 19:
    case 20:
    case 43:
    case 44: iconClass = 'fa-cloud';
            break;
    case 12:
    case 13:
    case 29:
    case 40: iconClass = 'fa-cloud-rain';
            break;
    case 14: iconClass = 'fa-cloud-sun-rain';
            break;
    case 15:
    case 16:
    case 17:
    case 41:
    case 42: iconClass = 'fa-bolt';
            break;
    case 18: iconClass = 'fa-cloud-showers-heavy';
            break;
    case 22:
    case 23:
    case 24:
    case 25: iconClass = 'fa-snowflake';
            break;
    case 30: iconClass = 'fa-thermometer-full';
            break;
    case 31: iconClass = 'fa-thermometer-empty';
            break;
    case 32: iconClass = 'fa-wind';
            break;
    case 33:
    case 34:
    case 35: iconClass = 'fa-moon';
            break;
    case 36:
    case 37:
    case 38: iconClass = 'fa-cloud-moon';
            break;
    case 39: iconClass = 'fa-cloud-moon-rain';
            break;
  }
  return iconClass;
}

function deleteChildren(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  };
  return parent;
}

function createIcon (iconCode) {
  let icon = document.createElement('i');
  let iconClass = setWeatherIcon(iconCode);
  icon.classList.add('fas', iconClass);
  return icon;
}

export default Weather;
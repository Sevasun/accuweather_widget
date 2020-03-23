function Weather(options) {
    let defaultOptions = {
        apiKey: 'h0YJgo2hCXfxFIq1VoBN8ousyZa0Ijf2',
        baseUrl: 'http://dataservice.accuweather.com/forecasts/v1/',
        targetWidget: '.weather-widget',
        settingsForm: '.settings-form'
    };

    this.settings = Object.assign(defaultOptions, options);

    let { apiKey, baseUrl, targetWidget, settingsForm } = this.settings;

    let widget = document.querySelector(targetWidget);
    this.form = widget.querySelector(settingsForm);
    this.defaultCity = this.form.querySelector('[name="city"]');
    this.defaultType = this.form.querySelector('[name="type"]');
    this.detailsButton = this.form.querySelector('[name="details"]');
    this.detailsHolder = widget.querySelector('.primary-frame');
    this.reloadButton = widget.querySelector('.reload-btn');
    this.maxTempField = widget.querySelector('.temperature .max');
    this.minTempField = widget.querySelector('.temperature .min');
    this.dayIcon = widget.querySelector('.day-icon .icon i');
    this.nightIcon = widget.querySelector('.night-icon .icon i');
    this.dayIconText = widget.querySelector('.day-icon .icon-phrase');
    this.nightIconText = widget.querySelector('.night-icon .icon-phrase');
    this.dateField = widget.querySelector('.date-value');
    this.weatherStatus = widget.querySelector('.weather-status');

    let detailsFlag = false;

    let locationCode = function() {
        return self.defaultCity.value;
    };

    let requestLink = function() {
        return self.defaultType.value;
    };

    let requestType = function() {
        return getRequestType(self.defaultType.value);
    };

    let self = this;

    function requestUrl() {
        return getAddress(baseUrl, requestType(), requestLink(), locationCode(), apiKey, detailsFlag, true)
    }
    
    function sendRequest(url) {
        return fetch(url, {
                method: 'GET'
            })
            .then((response) => {
                if (response.ok) {
                    return response.json();
                }
            })
            .then((array) => {
                console.log(array);
                let forecast = parseForecast(array);
                let date = forecast.date;
                let forecastDate = new Date(date);
                let options = {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long'
                };
                self.dateField.innerText = forecastDate.toLocaleString('RU', options);
                self.maxTempField.innerText = forecast.maxTemp;
                self.minTempField.innerText = forecast.minTemp;
                self.dayIcon.classList.add('fa', forecast.dayIconClass);
                self.dayIconText.innerText = forecast.dayIconText;
                self.nightIcon.classList.add('fa', forecast.nightIconClass);
                self.nightIconText.innerText = forecast.nightIconText;

                detailsFlag ? createWind(self.detailsHolder, forecast.windSpeed) : deleteWind(self.detailsHolder);
            });
    }

    function detailsSwitch() {
            this.checked ? detailsFlag = true : detailsFlag = false;
            sendRequest(requestUrl());
    }

    function parseForecast(array) {
        const forecastObj = array.DailyForecasts[0];
        let forecast = {
            date: forecastObj.Date,
            minTemp: forecastObj.Temperature.Minimum.Value,
            maxTemp: forecastObj.Temperature.Maximum.Value,
            dayIconClass: setWeatherIcon(forecastObj.Day.Icon),
            dayIconText: forecastObj.Day.IconPhrase,
            nightIconClass: setWeatherIcon(forecastObj.Night.Icon),
            nightIconText: forecastObj.Night.IconPhrase,
            windSpeed: 0
        };

        if (forecastObj.Day.Wind) {
            forecast.windSpeed = forecastObj.Day.Wind.Speed.Value;
        }

        return forecast;
    }

    self.reloadButton.addEventListener('click', () => {
        sendRequest(requestUrl());
    });

    self.reloadButton.addEventListener('touchstart', () => {
        sendRequest(requestUrl());
    });

    self.detailsButton.addEventListener('change', detailsSwitch);

    self.defaultCity.addEventListener('change', () => {
        sendRequest(requestUrl());
    });

    self.defaultType.addEventListener('change', () => {
        sendRequest(requestUrl());
    });

    sendRequest(requestUrl());
}

function getRequestType(value) {
    let requestType;
    switch(value) {
        case '1day':
        case '5day':
        case '10day':
        case '15day': requestType = 'daily';
                    break;
        case '1hour':
        case '12hour': requestType = 'hourly';
                    break;
    };

    return requestType;
}

function getAddress(url, requestType, requestLink, location, key, details = false, metric = false) {
    let detailsFlag = details ? '&details=true' : '';
    let metricFlag = metric ? '&metric=true' : '';
    let address = `${url}/${requestType}/${requestLink}/${location}?apikey=${key}${detailsFlag}${metricFlag}`;
    return address;
}

function createTemp(value, iconClass, iconText, parent) {
    let row = document.createElement('div').classList.add('weather-row');
    let iconRow = document.createElement('div').classList.add('icons-row');
    let temp = document.createElement('div').classList.add('temperature');
    let icon = document.createElement('div').classList.add('icon');
    let iconEl = document.createElement('i').classList.add(iconClass);
    let iconPhrase = document.createElement('div').classList.add(iconText);

    icon.append(iconEl);
    iconRow.append(iconPhrase);
    temp.append(document.createElement('span').append(value));
    temp.append(document.createElement('span').append('&deg;C'));
    row.append(iconRow);
    row.append(temp);

    parent.append(row);
    
}

function createWind(parent, text) {
    let windBlock = document.createElement('div');
    windBlock.classList.add('wind');
    windBlock.innerText = `Ветер ${text} км/ч`;
    parent.append(windBlock);
}

function deleteWind(parent) {
    let windBlock = parent.querySelectorAll('.wind');
    windBlock.forEach((elem) => elem.remove());
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

function setTemperature(elem, temp) {
    return elem.innerText = `${temp}&deg;C`;
}

export default Weather;
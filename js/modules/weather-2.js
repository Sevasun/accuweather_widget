function Weather(options) {
    let defaultOptions = {
        // apiKey: 'h0YJgo2hCXfxFIq1VoBN8ousyZa0Ijf2',
        apiKey: 'vEtuYPnGloBUcgvmr3WAb0XAv1CVIHUO',
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
    this.dateField = widget.querySelector('.date-value');
    this.weatherStatus = widget.querySelector('.weather-status');

    let detailsFlag = false;
    
    let durationFlag = function() {
        return getDurationType(self.defaultType.value);
    };

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
        return getAddress(baseUrl, requestType(), requestLink(), locationCode(), apiKey, detailsFlag, true);
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
                clearBlock(self.weatherStatus);
                let arrayEdited = durationFlag() ? array['DailyForecasts'] : array;
                arrayEdited.forEach((elem) => {
                    let forecast = parseForecast(elem);
                    let date = forecast.date;

                    createDate(date, self.weatherStatus);

                    forecast.temp.forEach((el, i) => {
                        createForecastRow(el, forecast.iconClass[i], forecast.iconText[i], self.weatherStatus);
                    })

                    detailsFlag ? createWind(self.detailsHolder, forecast.windSpeed) : deleteWind(self.detailsHolder);
                });
            });
    }

    function detailsSwitch() {
            this.checked ? detailsFlag = true : detailsFlag = false;
            sendRequest(requestUrl());
    }

    function createDate(date, parent) {
        let dateHolder = document.createElement('div');
        let dateValue = document.createElement('span');
        let forecastDate = new Date(date);
        let options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        };
        if(!durationFlag()) {
            options.hour = 'numeric';
            options.minute = 'numeric';
        }
        dateValue.innerText = forecastDate.toLocaleString('RU', options);
    
        dateHolder.classList.add('date');
        dateValue.classList.add('date-value');
    
        dateHolder.append(dateValue);
        parent.append(dateHolder);
    }

    function parseForecast(obj) {
        const forecastObj = obj;
        let forecast = {
            date: forecastObj.Date ? forecastObj.Date : forecastObj.DateTime,
            temp: [],
            iconClass: [],
            iconText: [],
            windSpeed: 0
        };

        if (forecastObj.Temperature.Value && forecastObj.WeatherIcon) {
            forecast.temp.push(forecastObj.Temperature.Value);
            forecast.iconClass.push(setWeatherIcon(forecastObj.WeatherIcon));
            forecast.iconText.push(forecastObj.IconPhrase);
        } else if (forecastObj.Temperature.Maximum && forecastObj.Temperature.Minimum && forecastObj.Day.Icon) {
            forecast.temp.push(forecastObj.Temperature.Maximum.Value);
            forecast.temp.push(forecastObj.Temperature.Minimum.Value);
            forecast.iconClass.push(setWeatherIcon(forecastObj.Day.Icon));
            forecast.iconText.push(forecastObj.Day.IconPhrase);
            forecast.iconClass.push(setWeatherIcon(forecastObj.Night.Icon));
            forecast.iconText.push(forecastObj.Night.IconPhrase);
        } else {
            forecast.temp = [0];
            forecast.iconClass = [setWeatherIcon('0')];
            forecast.iconText = ['no status'];
        }

        if (forecastObj.Day && forecastObj.Day.Wind) {
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
        case '15day':   requestType = 'daily';
                        break;
        case '1hour':
        case '12hour':  requestType = 'hourly';
                        break;
    };

    return requestType;
}

function getDurationType(value) {
    let durationType;
    switch(value) {
        case '1day':
        case '5day':
        case '10day':
        case '15day':   durationType = true;
                        break;
        case '1hour':
        case '12hour':  durationType = false;
                        break;
    };

    return durationType;
}

function getAddress(url, requestType, requestLink, location, key, details = false, metric = false) {
    let detailsFlag = details ? '&details=true' : '';
    let metricFlag = metric ? '&metric=true' : '';
    let address = `${url}/${requestType}/${requestLink}/${location}?apikey=${key}${detailsFlag}${metricFlag}`;
    return address;
}

function clearBlock(block) {
    while (block.firstChild) {
        block.removeChild(block.lastChild);
    }
    return block;
}

function createForecastRow(value, iconClass, iconText, parent) {
    let row = document.createElement('div');
    let iconRow = document.createElement('div');
    let temp = document.createElement('div');
    let icon = document.createElement('div');
    let iconEl = document.createElement('i');
    let iconPhrase = document.createElement('div');
    let degrees = document.createElement('span');
    let tempValue = document.createElement('span');

    iconPhrase.innerText = iconText;
    row.classList.add('weather-row');
    iconRow.classList.add('icons-row');
    temp.classList.add('temperature');
    icon.classList.add('icon');
    iconEl.classList.add('fa', iconClass);
    degrees.innerHTML = '&deg;C';
    tempValue.innerText = value;
    
    icon.append(iconEl);
    iconRow.append(icon);
    iconRow.append(iconPhrase);
    temp.append(tempValue);
    temp.append(degrees);
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

export default Weather;
function Weather(options) {
    let defaultOptions = {
        apiKey: 'h0YJgo2hCXfxFIq1VoBN8ousyZa0Ijf2',
        locationCode: '323903',
        baseUrl: 'http://dataservice.accuweather.com/',
        requestLink: 'forecasts/v1/daily/1day/'
    };

    let widget = document.querySelector('.weather-widget');
    this.settings = Object.assign(defaultOptions, options);
    this.data = widget.querySelector('.date-value');
    this.tempMax = widget.querySelector('.temperature .max');
    this.tempMin = widget.querySelector('.temperature .min');
    this.iconDay = widget.querySelector('.day-icon .icon');
    this.iconPhraseDay = widget.querySelector('.day-icon .icon-phrase');
    this.iconNight = widget.querySelector('.night-icon .icon');
    this.iconPhraseNight = widget.querySelector('.night-icon .icon-phrase');
    // Скорее всего заменить на this внутри forEach
    let settingsForm = widget.querySelector('.settings-form');
    let selectCity = settingsForm.querySelector('[name="city"]');
    let selectType = settingsForm.querySelector('[name="type"]');
    let detailsCheckbox = settingsForm.querySelector('[name="details"]');
    
    let reloadBtn = widget.querySelector('.weather-widget .reload-btn');

    let self = this;

    function getAddress() {
        let address = self.settings.baseUrl + forecastTypeOptions(selectType).forecastLink + getInputValue(selectCity) + '?apikey=' + self.settings.apiKey + '&metric=true' + setDetails(detailsCheckbox.checked);
        return address;
    }
    
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
                            
                            deleteChildren(self.iconDay);
                            self.iconDay.appendChild(createIcon(elem.Day.Icon));
                            self.iconPhraseDay.innerHTML = elem.Day.IconPhrase;
                            deleteChildren(self.iconNight);
                            self.iconNight.appendChild(createIcon(elem.Night.Icon));
                            self.iconPhraseNight.innerHTML = elem.Night.IconPhrase;

                            if(detailsCheckbox.checked) {
                                widget.querySelector('.primary-frame').appendChild(createMoonPhase(elem.Moon.Phase));
                            }
                        });
                        return array;
                    })
    }

    sendRequest(getAddress());

    reloadBtn.addEventListener('click', (e) => {
        sendRequest(getAddress());
    });
}

function getInputValue(elem) {
    return elem.value;
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

function parseDate(date) {
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

function forecastTypeOptions(elem) {
    let forecastLink;
    let wayToDate;
    switch (elem.value) {
        case 'today': forecastLink = 'forecasts/v1/daily/1day/';
                    wayToDate = 'Date';
                    break;
        case 'hour1': forecastLink = 'forecasts/v1/hourly/1hour/';
                    break;
        case 'days10': forecastLink = 'forecasts/v1/daily/10day/';
                    break;
        default: forecastLink = 'forecasts/v1/daily/1day/';
    }
    console.log(forecastLink);
    return {
        'forecastLink': forecastLink,
        'wayToDate': wayToDate
    };
}

function setDetails(value) {
    if(value) {
        return '&details=true';
    } else {
        return '';
    }
}

function createMoonPhase(phase) {
    let holder = document.createElement('div');
    let text = document.createElement('span');
    text.innerHTML = "Moon phase is: ";
    let moonPhase = document.createElement('strong');
    moonPhase.classList.add('phase');
    moonPhase.innerHTML = phase;
    holder.classList.add('moon');
    holder.appendChild(text);
    holder.appendChild(moonPhase);
    return holder;
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
function Weather(options) {
    let defaultOptions = {
        apiKey: 'h0YJgo2hCXfxFIq1VoBN8ousyZa0Ijf2',
        locationCode: '329309',
        baseUrl: 'http://dataservice.accuweather.com/',
        requestLink: 'forecasts/v1/hourly/1hour/'
    };

    this.settings = Object.assign(defaultOptions, options);
    this.data = document.querySelector('.date-value');
    this.temp = document.querySelector('.temperature');


    let self = this;
    
    // let requestAddress = this.settings.baseUrl + this.settings.requestLink + this.settings.locationCode + '?apikey=' + this.settings.apiKey;
    let requestAddress = 'http://dataservice.accuweather.com/forecasts/v1/hourly/1hour/323903?apikey=h0YJgo2hCXfxFIq1VoBN8ousyZa0Ijf2';
    
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
                        array.forEach((elem) => {
                            let date = parseDate(elem.DateTime);
                            let month = monthText(date.month);
                            self.data.innerHTML = `${date.day} ${month} ${date.year} года`;
                            
                            if(elem.Temperature.UnitType === 18) {
                                self.temp.innerHTML = `${((elem.Temperature.Value - 32) * 5 / 9).toFixed(1)}`
                            } else {
                                self.temp.innerHTML = `${elem.Temperature.Value}`
                            }
                        });
                        return array;
                    })
    }

    sendRequest(requestAddress);
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

export default Weather;
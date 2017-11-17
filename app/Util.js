function nowMillis() {
  var d = new Date()
  return +d
}

function todayStartMillis() {
  var d = new Date()
  d.setHours(0,0,0,0)
  return +d
}

const ONE_DAY_MILLIS = 24*60*60*1000
function tomorrowStartMillis() {
  return todayStartMillis() + ONE_DAY_MILLIS
}

function todayElapsedMillis() {
  return nowMillis() - todayStartMillis()
}

function isWeekday() {
  var day = new Date().getDay()
  //0 is Sunday, up to 6 is Saturday
  return day != 0 && day != 6
}

function isFriday() {
  return new Date().getDay() == 5
}

function isSunday() {
  return new Date().getDay() == 0
}

function clockTimeToMillis(clockTime) {
  var hours = clockTime.split(':')[0]
  var minutes = clockTime.split(':')[1]
  return parseFloat(hours)*3600*1000 + parseFloat(minutes)*60*1000
}

function getNextTrainDetails(rail) {
  var clockTimes = isWeekday() ? rail['weekdayClockTimes'] : rail['weekendClockTimes']
  var now = nowMillis()

  var nextTrainDigital = null
  var countdownMillis = -1
  var countdownDigital = null

  for(clockTime of clockTimes) {
    var trainMillis = todayStartMillis() + clockTimeToMillis(clockTime)
    var dMillis = trainMillis - now
    if(dMillis > 0) {
      nextTrainDigital = clockTime
      countdownMillis = dMillis
      break
    }
  }

  if(!nextTrainDigital) {
    //if not found, we have to get the first train of the next day
    if(isFriday())
      nextTrainDigital = rail['weekendClockTimes'][0]
    else if(isSunday())
      nextTrainDigital = rail['weekdayClockTimes'][0]
    else
      nextTrainDigital = clockTimes[0] //just use current list

    const oneDayMillis = 24*60*60*1000
    countdownMillis = tomorrowStartMillis() + clockTimeToMillis(nextTrainDigital) - now
  }

  countdownDigital = toDigMinuteFormat(countdownMillis)
  return {nextTrainDigital, countdownMillis, countdownDigital}
}

function toDigMinuteFormat(millis) {
  function padZeros(data, n) {
    data = data + ''
    while(data.length < n)
      data = '0' + data
    return data
  }

  let seconds = millis / 1000
  let mins = parseInt(seconds / 60)
  let secs = parseInt(seconds % 60)
  return padZeros(mins, 2) + ':' + padZeros(secs, 2)
}

function distanceBetweenLocs(l0,l1) {

  function deg2rad(deg) {
    return deg * (Math.PI/180)
  }

  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(l1.lat-l0.lat);  // deg2rad below
  var dLng = deg2rad(l1.lng-l0.lng); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(l0.lat)) * Math.cos(deg2rad(l1.lat)) * 
    Math.sin(dLng/2) * Math.sin(dLng/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d*1000; // Distance in m
}

module.exports = {getNextTrainDetails, distanceBetweenLocs}
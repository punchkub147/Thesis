import moment from 'moment'
import 'moment/locale/th'

const format = 'HH:mm'

export const timeToSec = (time) => { //convert time to sec
  const sec = moment(time, format).diff(moment().startOf('day'), 'seconds')
  if(sec){return sec}
  else{return 0}
}

export const secToTime = (sec) => {
  if(sec/60/60 <= 24)
    return moment().startOf('day').second(sec).format('H:mm:ss')
  else if (sec/60/60 > 24)
    return '~'+parseInt(sec/60/60)+'hour'
}

export const secToText = (sec) => {
  let text = ''
  if(sec >= 60*60){
    text = '' + Math.floor(sec/60/60) + ' ชั่วโมง'
  }else if(sec >= 60){
    text = '' + Math.floor(sec/60) + ' นาที'
  }else if(sec <= -60*60){
    text = '' + Math.floor(sec/60/60) + ' ชั่วโมง'
  }else if(sec <= -60){
    text = '' + Math.floor(sec/60) + ' นาที'
  }else{
    text = parseFloat(+sec).toFixed(0) + ' วินาที'
  }
  return text
}

export const decimal2 = (number) => {
  return parseFloat(+number).toFixed(2)
}

export const setDayHilight = (day, time) => {
  if(day === moment().locale('en').format('ddd').toLowerCase()) return 'today'
  if(time>0) return 'workday'
  return ''
}
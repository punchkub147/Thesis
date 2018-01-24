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
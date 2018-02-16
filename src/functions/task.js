import _ from 'lodash'
import moment from 'moment'
import { db, sendNoti } from '../api/firebase'
import store from 'store'

import Config from '../config'
import { PushFCM } from '../api/notification'

//let user = store.get('employee')

export const genNowWorking = (limitWorkTimeToDay, workingList, user) => {

  let limitTimeDayWork = limitWorkTimeToDay // 3 hours เวลาที่มีในวันนี้
  let totalTimeDayWork = 0 //เวลางานที่ต้องทำในวันนี้
  let overTimeDayWork = 0 //เวลางานที่เกินลิมิต

  let nowWorking = []
  _.map(workingList, async (working, key) => {
    //if(working.finished_piece >= working.total_piece)return //เอาเฉพาะงานที่ยังไม่เสร็จ
    if(working.startAt > new Date)return //เอาเฉพาะงานที่ต้องเริ่มทำแล้ว

    const toDayFinishedPiece = _.sumBy(working.do_piece, (o) => 
      o.updateAt >= moment().startOf('day')&& //ถ้าเป็นงานในวันนี้เท่านั้น 
      o.updateAt <= moment().endOf('day')&&
        o.piece
    )// งานที่ทำเสร็จในวันนี้
    
    const anotherDayFinishedPiece = _.sumBy(working.do_piece, (o) => 
      o.updateAt < moment().startOf('day')&& //ถ้าเป็นงานในวันอื่น
        o.piece
    )// งานที่ทำเสร็จในวันอื่น

    const todoWork = working.total_piece-anotherDayFinishedPiece //จำนวนงานนี้ที่เหลือ งานทั้งหมด-งานวันอื่น
    const todoTotalPiece = working.total_piece-(anotherDayFinishedPiece)
    
    const start = working.startAt>new Date?moment(working.startAt):moment(new Date);
    const end = moment(working.endAt);
    const countDay = -start.diff(end, 'days')+1


    //////////////////ALGORITHM V1////////////////////
    // const todoWorkOnDay = todoWork/countDay //จำนวนชิ้นที่ควรทำในวันนี้ = จำนวนชิ้น/จำนวนวันที่ต้องทำ 
    // let limitTodo = 0 //จำนวนงานนี้ที่ต้องทำวันนี้
    // let overPiece = 0 //จำนวนชิ้นที่เกินจากที่จะทำได้
    
    // for(let i = 1; i <= todoWorkOnDay; i++){
    //   if(limitTimeDayWork >= working.worktime){ //ถ้าเวลาที่กำหนดไว้ว่าจะทำ มากกว่าเวลาที่ต้องทำต่อชิ้น
    //     totalTimeDayWork += +working.worktime //เวลารวมที่ต้องทำเพิ่มขึ้น
    //     limitTimeDayWork -= +working.worktime //เวลาที่กำหนดไว้ลดลง
    //     limitTodo = i
    //   }else{ //เวลานอกเหนือจากที่กำหนด
    //     overPiece++
    //     overTimeDayWork += +working.worktime
    //   }
    // }

    // if(limitTodo+overPiece > 0){ //ถ้ามีจำนวนงานที่ต้องทำ
    //   nowWorking.push(Object.assign(working, {
    //     limitTodo,
    //     overPiece,
    //     timeTodo: limitTodo*working.worktime,
    //     countDay,
    //     toDayFinishedPiece,
    //     anotherDayFinishedPiece,
    //   }))
    // }
    //////////////////////////////////////


    ////////////////////////NEW ALGORITHM////////////////////////////
    //if(working.work_name == 'พับริบบิ้นพวงมาลัย'){

    const countAllDay = -moment(working.startAt).diff(end, 'days')+1

    const devidePiece = Math.floor(working.total_piece/countAllDay)
    const devideTime = devidePiece*working.worktime

    const devideModPiece = working.total_piece%countAllDay
    const devideModTime = devideModPiece*working.worktime
    
    const remindDevidePiece = Math.floor(todoTotalPiece/countDay)
    const remindDevideTime = remindDevidePiece*working.worktime

    let remindModPiece = (todoTotalPiece%countDay)
    const remindModTime = remindModPiece*working.worktime



    let limitTodo = 0
    let overPiece = 0
    let remindPiece = 0
    let total = todoTotalPiece
    
    for(let i = 0; i<countDay; i++){
      if(total > 0){
        const day = moment(start).add(i, 'days').locale('en')//วัน

        let dayWorkTime = user.data.workTime[day.format('ddd').toLowerCase()]
        if(limitTimeDayWork<dayWorkTime)dayWorkTime=limitTimeDayWork //ลิมิตเวลา
        if(user.data.holiday[day.format('DD/MM/YY')] === true)dayWorkTime = 0 //วันหยุด Holiday

        let todayTodoPiece = Math.floor(dayWorkTime/working.worktime)
        if(todayTodoPiece > remindDevidePiece) todayTodoPiece = remindDevidePiece


        //ถ้าเวลาเหลือ ทำเศษงาน
        if(dayWorkTime - todayTodoPiece*working.worktime >= working.worktime && remindModPiece>0){
          todayTodoPiece+=1
          remindModPiece-=1
        }

        
        const remindTime = dayWorkTime-(todayTodoPiece*working.worktime)

        let todayExtraPiece = Math.floor(remindTime/working.worktime)
        if(todayExtraPiece > total-todayTodoPiece)todayExtraPiece = total-todayTodoPiece>0?total-todayTodoPiece:0

        let shouldDoPiece = remindDevidePiece-todayTodoPiece>0?remindDevidePiece-todayTodoPiece:0

        let todayRemindTime = dayWorkTime-((todayTodoPiece+todayExtraPiece)*working.worktime)
        

        if(shouldDoPiece > 0) remindPiece+=shouldDoPiece
        if(shouldDoPiece < 0) remindPiece+=shouldDoPiece


        if(i === 0){ //งานวันนี้
          limitTodo = todayTodoPiece+todayExtraPiece
          

          limitTimeDayWork -= ((todayTodoPiece+todayExtraPiece+overPiece)*working.worktime)
          
          if(limitTodo+overPiece > 0){
            //วันที่ต้องทำงานนี้
            console.log(
              'ชื่องาน', working.work_name, '\n',
              'ต้องทำ', working.total_piece, 'ชิ้น', '\n',
              'ภายใน', countAllDay, 'วัน', '\n',
              'เหลือวันต้องทำ', countDay, 'วัน', '\n',

              'เวลาต่อชิ้น', working.worktime, 'วินาที', '\n',
              'เวลาที่ต้องทำทุกชิ้น', working.total_piece*working.worktime, 'วินาที', '\n',
              'ต้องทำวันละอย่างน้อย', devidePiece, 'ชิ้น', ' เศษ', devideModPiece, 'ชิ้น', '\n',
              'ทำงานวันละ', devideTime, 'วินาที', ' เศษ', devideModTime, 'วินาที', '\n',

              'จากงานที่เหลือควรทำวันละอย่างน้อย', remindDevidePiece, 'ชิ้น เศษ', remindModPiece, 'ชิ้น', '\n',
              'สรุปต้องทำงานวันละ', remindDevideTime, 'วินาที', ' เศษ',remindModTime , 'วินาที', '\n',

              'วันนี้ทำไปแล้ว', toDayFinishedPiece, 'ชิ้น', '\n',
              'วันอื่นทำไปแล้ว', anotherDayFinishedPiece, 'ชิ้น', '\n',
              'เหลือ', todoTotalPiece, 'ชิ้น', '\n',

              'วันที่เริ่มทำ', moment(working.startAt).format('DD/MM/YY'), '\n',
              'วันที่สิ้นส่ง', moment(working.endAt).format('DD/MM/YY'), '\n',
            
              'วันนี้เป็นวัน', moment().locale('th').format('dddที่DD').toLowerCase(), '\n',
              
            )
            console.log(
              day.format('DD/MM/YY'),
              'มีเวลาทำงาน', dayWorkTime, 'วินาที',
              'ต้องทำงานให้ได้', todayTodoPiece, 'ชิ้น',
              'ภายในเวลา', todayTodoPiece*working.worktime, 'วินาที',
              'วันนี้เหลือเวลาว่างทำงานนี้อีก', remindTime, 'วินาที',
              'สามารถทำได้อีก', todayExtraPiece,'ชิ้น',
              'ควรจะต้องทำงานอีก(จะนำไปบวกวันอื่น)', shouldDoPiece, 
  
              'วันนี้เหลือเวลาว่างทำงานอื่นอีก', todayRemindTime,
  
              'งานที่เหลือ', total ,'ชิ้น',
              'ถ้าทำเสร็จแล้วจะเหลืองานอีก', total-=(todayTodoPiece+todayExtraPiece) ,'ชิ้น',
            )
            console.log('ทำงานหนักกว่าตั้งไว้', total, 'ชิ้น')
            console.log('------------------สรุป-------------------')
            console.log(
              'วันนี้ต้องทำงานชิ้นนี้อย่างน้อย', limitTodo, '\n',
              'งานเกินลิมิตวันนี้', overPiece, 'ชิ้น', '\n',
            )
            console.log('limitTimeDayWork',limitTimeDayWork)
            console.log('-------------------------------------')
            overPiece = Math.floor(total/countDay)
            let timeTodo = (limitTodo+overPiece)*working.worktime
            nowWorking.push(Object.assign(working, {
              limitTodo,
              overPiece,
              timeTodo,
              countDay,
              toDayFinishedPiece,
              anotherDayFinishedPiece,
            }))
            totalTimeDayWork += timeTodo
          }
        }
      }
    }//for loop
      
    //}
    ////////////////////////////////////////////////////
  })
  
  const now = moment()
  const trigger = moment(`${moment().add(1, 'days').format('YYYY-MM-DD')}T07:00:00.000`).toString()//ส่งตอน 7 โมงเช้า
  const time = -now.diff(trigger, 'seconds')

  const title = 'งานที่ต้องทำในวันนี้'
  const message = `งานที่ต้องทำในวันนี้`
  const type = 'tasks'
  const receiver = user.uid
  const sender = 'self'
  const token = user.data.deviceToken
  const link = `${Config.host}/tasks`
  //sendNoti(title, message, type, receiver, sender, token, link, time)
  return { nowWorking, limitTimeDayWork, totalTimeDayWork, overTimeDayWork }
}




export const genAllWorking = (workingList) => {
  let allWorking = []


  _.map(workingList, working => {
    //if(working.finished_piece >= working.total_piece)return //เอาเฉพาะงานที่ยังไม่เสร็จ
    
    const start = working.startAt>new Date?moment(working.startAt):moment(new Date);
    const end = moment(working.endAt);
    const countDay = -start.diff(end, 'days')+1

    allWorking.push(Object.assign(working, {
      countDay
    }))
  })
  return allWorking
}

export const taskDoing = async (work, doing) => {
  const updateAt = new Date()
  let newPiece = +doing //จำนวนชิ้นที่ระบุ
  let piece = 0 
  let total_finished_piece = _.sumBy(work.do_piece, (o) => o.piece) //จำนวนชิ้นที่ทำเสร็จแล้ว (ของเก่า)
  
  
  if(newPiece>=((work.limitTodo+work.overPiece)-work.toDayFinishedPiece))newPiece=((work.limitTodo+work.overPiece)-work.toDayFinishedPiece) //ทำได้ไม่เกินจำกัดของวันนี้

  piece = total_finished_piece+newPiece //จำนวนชิ้นงานเดิน บวก จำนวนชิ้นงานที่ทำใหม่วันนี้

  if(total_finished_piece===NaN)total_finished_piece=0
  if(newPiece===null || newPiece===undefined)newPiece=0

  if(piece>=work.total_piece)piece=work.total_piece

  if(piece<=0)piece=0
  if(newPiece<=(work.toDayFinishedPiece*-1))newPiece=(work.toDayFinishedPiece*-1)

  if(newPiece == 0)return

  const workingRef = db.collection('working').doc(work.working_id)

  const updatePiece = {
    piece: newPiece,
    updateAt,
  }
  
  let do_piece = []
  // Has Notworking
  await workingRef.get()
  .then(data => {

    if(data.data().do_piece !== undefined){
      do_piece = _.assign(data.data().do_piece,{[data.data().do_piece.length]: updatePiece})
    }else{
      do_piece = [updatePiece]
    }
  })

  workingRef.update({
    finished_piece: piece,
    do_piece,
    updateAt,
  })
  //finished_piece : [{piece: n,updateAt: newDate()}]
}
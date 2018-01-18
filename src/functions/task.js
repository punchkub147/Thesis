import _ from 'lodash'
import moment from 'moment'
import { db } from '../api/firebase'
import store from 'store'

export const getTasks = (user_id) => {
  let workingList = []
  let totalTimeAllWork = 0 //เวลาที่ต้องทำทั้งหมดทุกงาน

  db.collection('working')
  .where('employee_id', '==', user_id)
  //.where('endAt', '>=', new Date())
  .onSnapshot(async snap => {
    await snap.forEach(doc => {
      const data = doc.data()
      if(data.endAt <= new Date())return //ถ้าวันส่งน้อยกว่าวันนี้ให้ยกเลิก = ได้งานเฉพาะที่ต้องทำปัจจุบัน

      const toDayFinishedPiece = _.sumBy(data.do_piece, (o) => 
        o.updateAt >= moment().startOf('day')&& //ถ้าเป็นงานในวันนี้เท่านั้น 
        o.updateAt <=moment().endOf('day')&&
          o.piece
      )// งานที่ทำเสร็จในวันนี้
      const anotherDayFinishedPiece = _.sumBy(data.do_piece, (o) => 
        o.updateAt < moment().startOf('day')&& //ถ้าเป็นงานในวันอื่น
          o.piece
      )// งานที่ทำเสร็จในวันอื่น

      let finished_piece = _.sumBy(data.do_piece, (o) => o.piece)
      if(finished_piece===undefined)finished_piece=0 //debug

      let worktime = 0
      if(data.worktime!==undefined)worktime=data.worktime //debug

      workingList.push(Object.assign(data,{
        working_id: doc.id,
        worktime,
        finished_piece,
        toDayFinishedPiece,
        anotherDayFinishedPiece
      }))
    })
    workingList = _.orderBy(workingList, ['endAt'], ['asc']); //เรียงวันที่

    workingList.map(working => {
      totalTimeAllWork += (working.worktime)*(working.total_piece-working.finished_piece)
    })
    store.set('tasks', workingList)
  
    return {workingList, totalTimeAllWork}
  })

  
}

export const genNowWorking = (limitWorkTimeToDay, workingList) => {
  let limitTimeDayWork = limitWorkTimeToDay // 3 hours
  let totalTimeDayWork = 0 //เวลางานที่ต้องทำในวันนี้
  let nowWorking = []
  _.map(workingList, async working => {
    if(working.finished_piece >= working.total_piece)return //เอาเฉพาะงานที่ยังไม่เสร็จ

    const todoWork = working.total_piece-working.anotherDayFinishedPiece //จำนวนงานนี้ที่เหลือ งานทั้งหมด-งานวันอื่น
    
    let limitTodo = 0 //จำนวนงานนี้ที่ต้องทำวันนี้
    for(let i = 1; i <= todoWork; i++){
      if(limitTimeDayWork >= working.worktime){
        totalTimeDayWork += +working.worktime
        limitTimeDayWork -= +working.worktime
        limitTodo = i
      }
    }
    if(limitTodo > 0){ //ถ้ามีจำนวนงานที่ต้องทำ
      nowWorking.push(Object.assign(working, {
        limitTodo,
        timeTodo: limitTodo*working.worktime
      }))
    }
  })
  return { nowWorking, limitTimeDayWork, totalTimeDayWork }
}

export const genAllWorking = (workingList) => {
  let allWorking = []
  _.map(workingList, working => {
    //if(working.finished_piece >= working.total_piece)return //เอาเฉพาะงานที่ยังไม่เสร็จ
    allWorking.push(working)
  })
  return allWorking
}

export const taskDoing = async (work, doing) => {
  const updateAt = new Date()
  let newPiece = +doing //จำนวนชิ้นที่ระบุ
  let piece = 0 
  let total_finished_piece = _.sumBy(work.do_piece, (o) => o.piece) //จำนวนชิ้นที่ทำเสร็จแล้ว (ของเก่า)
  
  if(newPiece>=(work.limitTodo-work.toDayFinishedPiece))newPiece=(work.limitTodo-work.toDayFinishedPiece) //ทำได้ไม่เกินจำกัดของวันนี้

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
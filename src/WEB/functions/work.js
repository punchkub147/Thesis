import _ from 'lodash'
import moment from 'moment'
import store from 'store'

import Config from '../../config' 

import { auth, db, sendNoti } from '../../api/firebase'
import { PushFCM } from '../../api/notification'

const user = store.get('employer')

export const sendWork = async (data) => {
  if(data.startAt < new Date){
    message.info('เลยเวลาการส่งแล้ว')
    return
  }

  db.collection('needWork').doc(data.needWork_id).delete()
  /////////////////

  db.collection('works').doc(data.work_id).get()
  .then(async snapshot => {
    const user = store.get('employer')
    const work = snapshot.data()
    let employee = {}
    await db.collection('employee').doc(data.employee_id).get()
    .then(doc => {
      employee = Object.assign(doc.data(), {employee_id: doc.id})
    })
    const employer = Object.assign(user.data, {employer_id: user.uid})

    const working = {
      employee_id: data.employee_id,
      employee,
      employer_id: data.employer_id,
      employer,
      work_id: snapshot.id,
      total_piece: work.piece*data.pack,
      finished_piece: 0,
      worktime: work.worktime,
      price: work.price,
      work_name: work.name,
      startAt: data.startAt,
      endAt: data.endAt,
      createAt: new Date,
    }
    await db.collection('working').add(_.pickBy(working, _.identity))

    db.collection('works').doc(snapshot.id).update({
      working: work.working?work.working+1:1,
      needWork: work.needWork?work.needWork-1:0,
      pack: work.pack?work.pack-1:0,
    })
    //message.info('ยันยันการส่งงานแล้ว')
  })
  db.collection('employee').doc(data.employee_id).get()
  .then(doc => {
    db.collection('employee').doc(doc.id).update({
      working: doc.data().working?doc.data().working+1:1
    }) 
  })
  /////////////////

  const title = 'บริษัทยืนยันการส่งงาน'
  const message = `บริษัทจะจัดส่ง ${data.work_name} ให้ในวันที่ ${moment(data.startAt).format('DD/MM/YY')}`
  const type = 'send'
  const receiver = data.employee_id
  const sender = user.uid
  const token = [data.deviceToken]
  const link = `/tasks`
  const time = 0
  sendNoti(title, message, type, receiver, sender, token, link, time)
}

export const cancelWork = (data) => {
  db.collection('needWork').doc(data.needWork_id).delete()

  db.collection('works').doc(data.work_id).get()
  .then(async snapshot => {
    const work = snapshot.data()
    db.collection('works').doc(snapshot.id).update({
      needWork: work.needWork?work.needWork-1:0,
    })
  })

  const title = 'บริษัทเสนองานรอบใหม่ให้กับคุณ'
  const message = `บริษัทได้เสนองาน ${data.work_name} รอบใหม่ให้กับคุณ ขออภัยในความไม่สะดวก`
  const type = 'send'
  const receiver = data.employee_id
  const sender = user.uid
  const token = [data.deviceToken]
  const link = `/work/${data.work_id}`
  const time = 0
  sendNoti(title, message, type, receiver, sender, token, link, time)
}

  
export const getedWork = async (data) => {
  // if(data.endAt > new Date){
  //   console.log('ยังไม่ถึงเวลารับงาน')
  //   return
  // }

  console.log(data)
  let status = true
  let price = data.finished_piece*data.price

  if(data.total_piece - data.finished_piece > 0){//fail
    status = false
  }

  const updateWorking = status?{success: true, fail: true}:{success: true}
  db.collection('working').doc(data.working_id).update(updateWorking)

  db.collection('works').doc(data.work_id).get()
  .then(doc => 
    db.collection('works').doc(doc.id).update({
      working: doc.data().working?doc.data().working-1:0,
      success: doc.data().success?doc.data().success+1:1,
      fail: !status&&doc.data().fail?doc.data().fail+1:1
    }) 
  )

  db.collection('employee').doc(data.employee_id).get()
  .then(doc => {
    const updateEmployee = status
      ?{workSuccess: doc.data().workSuccess?doc.data().workSuccess+1:1, working: doc.data().working?doc.data().working-1:0}
      :{workFail: doc.data().workFail?doc.data().workFail+1:1, working: doc.data().working?doc.data().working-1:0}
    db.collection('employee').doc(doc.id).update(updateEmployee) 
  })

  const title = 'บริษัทได้รับงานของคุณแล้ว'
  const message = status
    ?`บริษัทได้รับงาน ${data.work_name} คุณทำครบกำหนด จะได้รับเงิน ${price} บาท`
    :`บริษัทได้รับงาน ${data.work_name} คุณทำไม่ครบกำหนด จะได้รับเงิน ${price} บาท`
  
  const type = 'stat'
  const receiver = data.employee_id
  const sender = user.uid
  
  const link = `/dashboard`
  const time = 0

  const token = await db.collection('employee').doc(data.employee_id).get()
  .then(doc => [doc.data().deviceToken])


  sendNoti(title, message, type, receiver, sender, token, link, time)
}
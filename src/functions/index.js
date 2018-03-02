import moment from 'moment'
import { db } from '../api/firebase'
import _ from 'lodash'
import store from 'store'

export const phoneFormatter = (phone) => {
  if(phone)
    return phone.substr(0, 3) + '-' + phone.substr(3, 3) + '-' + phone.substr(6,4)
}
export const personIdFormatter = (id) => {
  if(id)
    return id.substr(0, 1) + '-' + id.substr(1, 4) + '-' + id.substr(5,5) + '-' + id.substr(10,2) + id.substr(12,1)
}


export const getAbilities = async () => {
  await db.collection('abilities')
  .onSnapshot(snap => {
    let abilities = []
    snap.forEach(doc => {
      abilities[doc.id] = doc.data()
    })
    store.set('abilities',abilities)
  })
}

export const getWorks = async (callback) => {
  let abilities = []
  await db.collection('abilities')
  .onSnapshot(snap => {
    
    snap.forEach(doc => {
      abilities[doc.id] = doc.data()
    })
    store.set('abilities',abilities)
  })
  await db.collection('works')
  //.where('startAt' ,'>', new Date())
  .onSnapshot(async snapshot => {
    let works = []
    snapshot.forEach(doc => {
      if(doc.data().pack <= 0)return
      if(!doc.data().round)return

      const nextRound = _.find(doc.data().round, function(o) { return o.startAt > new Date; })
      if(!nextRound)return
      
      works.push(_.assign(doc.data(),
        { 
          _id: doc.id,
          abilityName: _.get(abilities[doc.data().ability],'name'),

          startAt: nextRound.startAt,
          endAt: nextRound.endAt,
          workAllTime: doc.data().worktime*doc.data().piece
        }
      ))
    })

    works = _.orderBy(works, ['startAt'], ['asc']); //เรียงวันที่

    store.set('works', works)
    callback(works)
  })
}
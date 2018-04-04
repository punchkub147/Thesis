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

  const user = store.get('employee')
  await db.collection('works')
  //.where('startAt' ,'>', new Date())
  .onSnapshot(async snapshot => {
    let works = []
    snapshot.forEach(doc => {
      if(doc.data().pack <= 0)return
      if(!doc.data().round)return

      let nextRound = _.find(doc.data().round, function(o) { return o.startAt > new Date; })
      if(!nextRound)return
      //if(!nextRound)nextRound = _.find(doc.data().round, function(o) { return o.startAt < new Date; })

      let d = 0
      if(user){
        let d = distance(
          _.get(doc.data(),'employer.address.lat'),
          _.get(doc.data(),'employer.address.lng'),
          user.data.address.lat,
          user.data.address.lng,
          'K'
        )
      }
      
      works.push(_.assign(doc.data(),
        { 
          _id: doc.id,
          abilityName: _.get(abilities[doc.data().ability],'name'),
          distance: d,
          startAt: nextRound.startAt,
          endAt: nextRound.endAt,
          workAllTime: doc.data().worktime*doc.data().piece
        }
      ))
    })

    works = _.orderBy(works, ['startAt', 'asc'], ['distance', 'asc']); //เรียงวันที่

    store.set('works', works)
    callback(works)
  })
}


export const distance = (lat1, lon1, lat2, lon2, unit) => {
	var radlat1 = Math.PI * lat1/180
	var radlat2 = Math.PI * lat2/180
	var theta = lon1-lon2
	var radtheta = Math.PI * theta/180
	var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	dist = Math.acos(dist)
	dist = dist * 180/Math.PI
	dist = dist * 60 * 1.1515
	if (unit=="K") { dist = dist * 1.609344 }
	if (unit=="N") { dist = dist * 0.8684 }
	return Math.floor(dist)
}

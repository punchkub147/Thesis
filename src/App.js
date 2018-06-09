import React, { Component } from 'react';
import AppRouter from './router'
import store from 'store'

import { setUpNoti } from './api/notification'
import { db, auth } from './api/firebase'

import 'moment/locale/th'

window.onbeforeunload = function(){
  // PushSelf({
  //   title: "กลับมาเร็วๆนะ",
  //   body: 'มีงานรออยู่อีกเยอะ'
  // })
}

class App extends Component {

  async componentDidMount() {
    console.log('OPEN APP')
    console.log('LocalStorage',localStorage)

    setUpNoti()

    await auth.onAuthStateChanged(async user => {
      if(user){
        store.set('user', {user})

        const employer = await db.collection('employer').doc(user.uid)
        employer.get().then(data => 
          data.exists
            ?store.set('employer',{uid: data.id, data: data.data()})
            :store.set('employer',undefined)
        ) 

        const employee = await db.collection('employee').doc(user.uid)
        employee.get().then(data => 
          data.exists
            ?store.set('employee',{uid: data.id, data: data.data()})
            :store.set('employee',undefined)
        )

      }else{
        store.set('user',undefined)
        store.set('employee',undefined)
        store.set('employer',undefined)
      }
    })
  }

  render() {
    return (
        <AppRouter/>
    );
  }
}

export default App;

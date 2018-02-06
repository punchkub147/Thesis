import { messaging } from './firebase'

import Push from 'push.js'

const apiKey = "AAAA5VfvQEA:APA91bFQI6jm5GTiKamzXCt3PFPa0JvuTvvw13MJv-R1EpAk6bRznFrn_3EnJVxDUWBSc90Lk82Tvvnr0PuIQkls1Df1NAVjxtd3JjokJpiaxvlGhRLT8Yit4M531EGln2ya5IESH5nN"

export const PushSelf = (data) => {
  Push.create(data.title, {
    body: data.body,
    //icon: '/icon.png',
    timeout: 4000,
    onClick: function () {
        window.focus();
        this.close();
    }
  });
}

export const PushFCM = async ({to, title, body, link, time}) => {
  await fetch('https://fcm.googleapis.com/fcm/send',{
    headers: {
      'Authorization': `key=${apiKey}`,
      'Content-Type': 'application/json'
    },
    method: "POST",
    body: JSON.stringify({
      to, // "registration_ids" : ["Token1","Token2","Token3"],
      priority: "high",
      notification: {
        title,
        body,
        click_action: link
      },
    })
  })
  console.log('PUSHED MESSAGEE')
}

export const setUpNoti = () => {

  messaging.requestPermission()
  .then(function() {
    console.log('Notification permission granted.');
  })
  .catch(function(err) {
    console.log('Unable to get permission to notify.', err);
  });

  messaging.getToken()
  .then(function(currentToken) {
    if (currentToken) {
      // sendTokenToServer(currentToken);
      // updateUIForPushEnabled(currentToken);
      // console.log('TOKEN : ', currentToken);
      localStorage.setItem("currentToken", currentToken)
    } else {
      // Show permission request.
      console.log('No Instance ID token available. Request permission to generate one.');
      // Show permission UI.
      // updateUIForPushPermissionRequired();
      // setTokenSentToServer(false);
    }
  })
  .catch(function(err) {
    console.log('An error occurred while retrieving token. ', err);
    // showToken('Error retrieving Instance ID token. ', err);
    // setTokenSentToServer(false);
  });

  messaging.onMessage(function(payload){
    console.log('onMessage: ', payload )
  })

  messaging.onTokenRefresh(function() {
    messaging.getToken()
    .then(function(refreshedToken) {
      console.log('Token refreshed.');
      // Indicate that the new Instance ID token has not yet been sent to the
      // app server.
      // setTokenSentToServer(false);
      // Send Instance ID token to app server.
      // sendTokenToServer(refreshedToken);
      // ...
    })
    .catch(function(err) {
      console.log('Unable to retrieve refreshed token ', err);
      // showToken('Unable to retrieve refreshed token ', err);
    });
  });
}

export const getToken = async () => {
  const token = await messaging.getToken()
  return token
}
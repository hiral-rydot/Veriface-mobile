/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useEffect, useState } from 'react';
import { createAppContainer } from "react-navigation";
import AppNavigator from './src/navigation/navigations';
import NavigationService from './src/navigation/NavigationService'
import messaging from '@react-native-firebase/messaging'
import NetInfo, { useNetInfo } from "@react-native-community/netinfo";
import { apiCheckInOut } from './src/actions';
import { useDispatch, useSelector } from 'react-redux'
import { Alert, Platform } from 'react-native';
import Snackbar from 'react-native-snackbar';
const AppContainer = createAppContainer(AppNavigator)
const Realm = require('realm');

// Register background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});

let deleteDb = null;
let deleteArr = [];
let internetFlag = true;
const App = () => {
  const [realm, setRealm] = useState(null);
  const [deleteRealm, setDeleteRealm] = useState(null);
  const dispatch = useDispatch();
  let isInternetReachable = false;
  let resCheckInOut = useSelector(state => state.resCheckInOut);
  const offlineCheckAttendance = () => {
    Realm.open({
    }).then(realm => {
      setDeleteRealm(realm);
      const attendance = realm.objects('Attendance');
      setRealm(attendance);
      attendance.map((item) => {
        deleteDb = item.id;
        deleteArr && deleteArr.some(e => String(e) == (String(item.id))) ? null : deleteArr.push(deleteDb)
        let data = {
          isOffline: true,
          time: item.time,
          lat: item.lat,
          long: item.long,
          image_data: item.image_data,
        };
        dispatch(apiCheckInOut(data));
      })
    }).catch(err => console.log(err));
  }
  const deleteItemFromDb = (itemId) => {
    let temp = itemId;
    realm && realm.map(e => {
      e.id == temp && deleteRealm.write(() => {
        deleteRealm.delete(e)
      })
    })
  }
  useEffect(() => {
    if (resCheckInOut) {
      if (resCheckInOut && resCheckInOut.success === true) {
        deleteItemFromDb(deleteArr[0]);
        deleteArr && deleteArr.shift()
        setTimeout(() => {
          Snackbar.show({ text: 'Entry Has been Updated.' })
        }, 500);
      }
      if (resCheckInOut && resCheckInOut.success === false) {
        Platform.OS === "android" ?
          alert(resCheckInOut.errors[0].msg) :
          setTimeout(() => {
            Alert.alert(resCheckInOut.errors[0].msg)
          }, 1000);
        deleteArr && deleteArr.shift();
      }
    }
  }, [resCheckInOut])
  useEffect(() => {
    NetInfo.configure(
      {
        useNativeReachability: true
      }
    )
    NetInfo.addEventListener(async (state) => {
      if (state.isInternetReachable === true && state.isConnected == true) {
        if (internetFlag == true) {
          offlineCheckAttendance();
          setTimeout(() => {
            internetFlag = true
          }, 10000)
        }
        internetFlag = false
        isInternetReachable = true;
      }
      else {
        isInternetReachable = false;

      }
    });
  }, [])


  return (
    <>
      <AppContainer
        ref={navigatorRef => {
          NavigationService.setTopLevelNavigator(navigatorRef);
        }}
      />
    </>
  );
};


export default App;

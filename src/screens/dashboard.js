import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  ImageBackground,
  PermissionsAndroid,
  Linking
} from 'react-native';
import { logout, saveProfileState, apiDashboard, apiRegistrationStatus } from '../actions'
import { useDispatch, useSelector } from 'react-redux';
import DrawerLayout from 'react-native-gesture-handler/DrawerLayout'
import { NavigationBar } from 'navigationbar-react-native'
import { style } from '../styles/style'
import {
  whiteColor,
  grayColor,
  menuHeaderColor,
  redColor,
  greenColor,
  blueColor,
  darkGrayColor
} from '../styles/color';
import TopCurve from '../components/top-curve';
import { PieChart } from 'react-native-chart-kit'
import { getObject, setObject } from '../utils/storage'
import StorageKey, { uploadUrl, RegistrationStatus, markAsSafeUrl, apiUrl } from '../webservice/constant'
import AsyncStorage from '@react-native-community/async-storage'
import { StackActions, NavigationActions, useTheme } from 'react-navigation';
// import { AdMobBanner } from 'react-native-admob'
import { SafeAreaView } from 'react-native-safe-area-context';
import Geolocation from 'react-native-geolocation-service'
import Loader from '../components/loader'
import { utils } from '../utils/utils'
import DeviceInfo from 'react-native-device-info'
import { PERMISSIONS, request, requestMultiple, RESULTS, } from 'react-native-permissions';
import LinearGradient from 'react-native-linear-gradient';
import moment from 'moment';
import { VictoryPie, VictoryTheme } from 'victory-native';
import Snackbar from 'react-native-snackbar';
import { api } from '../webservice/api';
const Realm = require('realm');


let Dashboard = (props) => {
  const [isDemoUser, setIsDemoUser] = useState(false)
  const [isActiveWorkplace, setIsActiveWorkplace] = useState(false)
  const [isRegistered, setIsRegistered] = useState(true)
  const [showRegistrationStatus, setShowRegistrationStatus] = useState(false)
  const [isRefresing, setIsRefresing] = useState(false)
  const drawerRef = useRef(null)
  const dispatch = useDispatch();
  const [offlineAttendance, setOfflineAttendance] = useState({})
  const [realm, setRealm] = useState(null)
  const isLoading = useSelector(state => state.loading)
  const resDashboard = useSelector(state => state.dashboard)
  let resRegistrationStatus = useSelector(state => state.resRegistrationStatus)
  const profileState = useSelector(state => state.profileState)
  let locationWatchId = -1
  let isLocationWatching = false
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [chartFillColor, setChartFillColor] = useState([])
  const [empId, setEmpId] = useState()
  const [attendanceRemarkFlag, setAttendanceRemarkFlag] = useState(false);
  const [changeAttendanceFlag, setChangeAttendanceFlag] = useState(false);
  const [showMyAttendance, setShowMyAttendance] = useState(false)
  const [showTeam, setShowTeam] = useState(false)
  const [showTeamFlag, setShowTeamFlag] = useState(false)
  const [isTeamLeader, setIsTeamLeader] = useState(false)
  const [markAsSafe, setMarkAsSafe] = useState(true)
  let checkRegistrationTimer;
  let attendanceArr = [4, 5, 6, 7];
  let teamArr = [12, 13, 14];
  let menuArr = [
    { id: 1, icon: require('../assets/images/Dashboard.png'), title: 'Dashboard', style: { backgroundColor: 'blue' } },
    // { id: 3, icon: require('../assets/images/Today_s-Attendance.png'), title: 'Today\'s Attendance' },
    // { id: 4, icon: require('../assets/images/Leave-17.png'), title: 'Leave' },
    // { id: 13, icon: require('../assets/images/myteam.png'), title: 'My Team' },
    { id: 2, icon: require('../assets/images/Workplace.png'), title: 'Registration' },
    // { id: 12, icon: require('../assets/images/Team.png'), title: 'Team' },
    { id: 7, icon: require('../assets/images/Check-in-Check-out.png'), title: 'Check In/Check Out' },
    // { id: 6, icon: require('../assets/images/teamRequest.png'), title: 'Team Request' },
    // { id: 14, icon: require('../assets/images/Request.png'), title: 'Request' },

    { id: 3, icon: require('../assets/images/my_attendance.png'), title: 'My Attendance' },
    { id: 11, icon: require('../assets/images/Team.png'), title: 'Team' },
    // { id: 10, icon: require('../assets/images/Dashboard.png'), title: 'Workplace' },
    { id: 5, icon: require('../assets/images/name_icon.png'), title: 'Offline Attendance' },
    { id: 21, icon: require('../assets/images/aboutus.png'), title: 'About Turnout' },
    { id: 16, icon: require('../assets/images/visitor.png'), title: 'Visitor' },
    { id: 17, icon: require('../assets/images/holiday.png'), title: 'Holidays' },
    { id: 22, icon: require('../assets/images/Logout.png'), title: 'Logout' },
  ];

  useEffect(() => {
    async function getLogin() {
      let loginObjP = await getObject("dataLogin")
      // console.log(".......", loginObjP)
      if (loginObjP) {
        for (let i = 0; i < loginObjP.length; i++) {
          if (loginObjP[i] === "attendances.list") {
            menuArr.splice(1, 0, { id: 4, icon: require('../assets/images/Today_s-Attendance.png'), title: 'Today\'s Attendance' })
            menuArr.splice(4, 0, { id: 6, icon: require('../assets/images/Attendance-History.png'), title: 'Attendance History' })

          }
          else if (loginObjP[i] === "teamLeaves.list") {
            setIsTeamLeader(true)
            // menuArr.splice(2, 0, { id: 14, icon: require('../assets/images/Team.png'), title: 'Team Leave' })
            menuArr.splice(2, 0, { id: 12, icon: require('../assets/images/myteam.png'), title: 'My Team' })
          }
          else if (loginObjP[i] === "leaves.list") {
            menuArr.splice(2, 0, { id: 10, icon: require('../assets/images/Leave-17.png'), title: 'Leave' })
          }
          else if (loginObjP[i] === "teamrequests.list") {
            menuArr.splice(4, 0, { id: 13, icon: require('../assets/images/teamRequest.png'), title: 'Team Request' })
          }
          else if (loginObjP[i] === "requests.list") {
            menuArr.splice(5, 0, { id: 9, icon: require('../assets/images/Request.png'), title: 'Request' })
          }
          // else if (loginObjP[i] === "attendances.list") {
          // }
          else if (loginObjP[i] === "workplaces.list") {
            menuArr.splice(6, 0, { id: 18, icon: require('../assets/images/Workplace.png'), title: 'Workplace' })
          }
          // else if (loginObjP[i] === "teams.list") {
          //   setIsTeamLeader(true)
          // }

        }
        menuArr.sort((a, b) => a.id - b.id)
      }
    }
    getLogin()

  }, [menuArr])

  useEffect(() => {
    resRegistrationStatus = null
    wsDashboard(true)

    async function saveLogin() {
      let loginObj = await getObject(StorageKey.KEY_RES_LOGIN)
      console.log("login item 1111", loginObj)
      setAttendanceRemarkFlag(loginObj.item.company.isAttendanceRemark)
      setChangeAttendanceFlag(loginObj.item.company.isChangeAttendance)
      setIsDemoUser(loginObj.item.isDemoUser)
      setEmpId(loginObj?.item?._id)
      let profile = {
        profile_image: (loginObj.item.profile_image) ? loginObj.item.profile_image : '',
        name: loginObj.item.name,
        phone: loginObj.item.mobile,
        email: loginObj.item.email
      }
      dispatch(saveProfileState(profile))
    }
    saveLogin();
    if (Platform.OS === 'android') {
      requestMultiple([PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION]).then(
        (statuses) => {
          let fineLoc = statuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION]
          if (fineLoc === RESULTS.GRANTED) {
            fetchCurrentLocation()
          } else if (fineLoc === RESULTS.UNAVAILABLE) {
            utils.openPermissionSeetings()
          }
          else if (fineLoc === RESULTS.BLOCKED) {
            utils.openPermissionSeetings()
          }
        },
      );
    } else {
      request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE).then(
        (statuses) => {
          if (statuses === RESULTS.GRANTED) {
            fetchCurrentLocation()
          } else if (statuses === RESULTS.UNAVAILABLE) {
            utils.openPermissionSeetings()
          }
          else if (statuses === RESULTS.BLOCKED) {
            utils.openPermissionSeetings()
          }
        },
      );
    }
    const didFocusSubscription = props.navigation.addListener(
      'didFocus',
      payload => {
        if (!isLocationWatching) {
          Geolocation.clearWatch(locationWatchId)
          if (Platform.OS === 'android') {
            requestMultiple([PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION]).then(
              (statuses) => {
                let fineLoc = statuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION]
                if (fineLoc === RESULTS.GRANTED) {
                  fetchCurrentLocation()
                } else if (fineLoc === RESULTS.UNAVAILABLE) {
                  utils.openPermissionSeetings()
                }
                else if (fineLoc === RESULTS.BLOCKED) {
                  utils.openPermissionSeetings()
                }
              },
            );
          } else {
            request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE).then(
              (statuses) => {
                if (statuses === RESULTS.GRANTED) {
                  fetchCurrentLocation()
                } else if (statuses === RESULTS.UNAVAILABLE) {
                  utils.openPermissionSeetings()
                }
                else if (statuses === RESULTS.BLOCKED) {
                  utils.openPermissionSeetings()
                }
              },
            );
          }
        }
      }
    );

    return () => {
      Geolocation.clearWatch(locationWatchId)
      didFocusSubscription.remove();
    }
  }, [])

  useEffect(() => {
    if (resDashboard && resDashboard.success) {
      setObject(StorageKey.KEY_CLIENT_SETTING, resDashboard.item.clientSettings)
      setIsActiveWorkplace(resDashboard.item.isActiveWorkplace)
      setIsRegistered(resDashboard.item.isRegistered)
      chartcolor(resDashboard.item.monthlyAttendance)
      if (!resDashboard.item.isRegistered) {
        wsRegistrationStatus()
      }

    }
    setIsRefresing(false)
  }, [resDashboard])

  // useEffect(() => {
  //   console.log("%%%%%%%%%%%%%%%%%%%%%% => ", resRegistrationStatus)
  //   if (resRegistrationStatus && resRegistrationStatus.success) {
  //     if (resRegistrationStatus.item.registrationStatus == RegistrationStatus.PENDING) {
  //       if (!showRegistrationStatus)
  //         setShowRegistrationStatus(true)
  //       setRegistrationTimer()
  //     } else {
  //       if (resRegistrationStatus.item.registrationStatus == RegistrationStatus.SUCCESS) {
  //         alert(11111111111)
  //         if (showRegistrationStatus)
  //           setTimeout(() => {
  //             setShowRegistrationStatus(false)
  //           }, 15000)
  //       }
  //       clearRegistrationTimer()
  //     }
  //   }
  // }, [resRegistrationStatus])
  useEffect(() => {
    if (resRegistrationStatus && resRegistrationStatus.success) {
      if ((resRegistrationStatus.item.registrationStatus == RegistrationStatus.NOTSTARTED) || (resRegistrationStatus.item.registrationStatus == RegistrationStatus.ERROR)) {
        setShowRegistrationStatus(true)
      }
      else if (resRegistrationStatus.item.registrationStatus == RegistrationStatus.PENDING) {
        setShowRegistrationStatus(true)
        setRegistrationTimer()
      } else {
        if (resRegistrationStatus.item.registrationStatus == RegistrationStatus.SUCCESS) {
          setTimeout(() => {
            setShowRegistrationStatus(false)
          }, 15000)
        }
        clearRegistrationTimer()
      }
    }
  }, [resRegistrationStatus])

  const onRefresh = useCallback(() => {
    // setIsRefresing(true);
    wsDashboard(false);
    if (!showRegistrationStatus)
      wsRegistrationStatus();
  }, []);


  const wsDashboard = (showLoader) => {
    const startDate = new Date();
    startDate.setDate(1);
    startDate.setHours(0);
    startDate.setMinutes(0);
    startDate.setSeconds(0);
    startDate.setMilliseconds(0);

    const endDate = new Date(startDate.getTime());
    endDate.setMonth(startDate.getMonth() + 1);

    dispatch(apiDashboard({
      startDate: startDate,
      endDate: endDate
    }, showLoader))
  }

  const wsRegistrationStatus = () => {
    dispatch(apiRegistrationStatus({}))
  }

  const setRegistrationTimer = () => {
    clearRegistrationTimer()
    checkRegistrationTimer = setTimeout(wsRegistrationStatus, 1000 * 10)
  }
  const clearRegistrationTimer = () => {
    if (checkRegistrationTimer) {
      clearTimeout(checkRegistrationTimer)
    }
  }
  const openDrawer = () => {

    drawerRef.current.openDrawer()
  }

  const closeDrawer = () => {
    drawerRef.current.closeDrawer()
  }
  const logoutAsync = () => {

    if (Object.keys(offlineAttendance).length !== 0) {
      Realm.open({

      }).then(realm => {
        const attendance = realm.objects('Attendance')
        setOfflineAttendance(attendance)
        setRealm(realm);
      });
      Alert.alert(
        "Turnout",
        'Are you sure you want to delete your Offline Entries permanently ?',
        [
          {
            text: 'OK', onPress: async () => {
              realm.write(() => {
                // Delete all objects from the realm.
                realm.deleteAll();
              });
              dispatch(logout({}))
              await AsyncStorage.clear();
              const navigateAction = StackActions.reset({
                index: 0,
                actions: [NavigationActions.navigate({ routeName: 'Login' })],
              });
              props.navigation.dispatch(navigateAction);
            }
          },
          {
            text: 'Cancel'
          }
        ],
        { cancelable: false },
      )
    } else {
      Alert.alert(
        "Turnout",
        'Are you sure you want to logout?',
        [
          {
            text: 'OK', onPress: async () => {
              dispatch(logout({}))
              await AsyncStorage.clear();
              const navigateAction = StackActions.reset({
                index: 0,
                actions: [NavigationActions.navigate({ routeName: 'Login' })],
              });
              props.navigation.dispatch(navigateAction);
            }
          },
          {
            text: 'Cancel'
          }
        ],
        { cancelable: false },
      )
    }
  }


  const fetchCurrentLocation = () => {

    locationWatchId = Geolocation.watchPosition(
      (position) => {
        console.log('Location: ' + JSON.stringify(position));
        isLocationWatching = true
        const latitude = [StorageKey.KEY_LATITUDE, JSON.stringify(position.coords.latitude)]
        const longitude = [StorageKey.KEY_LONGITUDE, JSON.stringify(position.coords.longitude)]
        AsyncStorage.multiSet([latitude, longitude], (error) => {
          console.log(error)
        })
      },
      (error) => {
        // See error code charts below.
        console.log('Location: error: ' + error.message);
      },
      { enableHighAccuracy: true, distanceFilter: 10, timeout: 15000, maximumAge: 10000 }
    );
    console.log('Location: Id ' + JSON.stringify(locationWatchId));
  }
  const renderAppUpdate = () => (
    <TouchableOpacity onPress={() => utils.redirectToStore()}>
      <View style={style.appUpdateContainer}>
        <Image
          source={require('../assets/images/cloud.png')} />
        <View style={{ marginLeft: 20, alignItems: 'center' }}>
          <Text style={{ color: whiteColor }}>App Update Available</Text>
          <Text style={{ color: grayColor }}>Tap here to update to latest version</Text>
        </View>
      </View>
    </TouchableOpacity>
  );


  const renderRegistrationStatus = () => (
    <TouchableOpacity onPress={() => {
      if (resRegistrationStatus && resRegistrationStatus.item && resRegistrationStatus.item.registrationStatus === RegistrationStatus.NOTSTARTED || resRegistrationStatus && resRegistrationStatus.item && resRegistrationStatus.item.registrationStatus === RegistrationStatus.ERROR) {
        clearRegistrationTimer()
        props.navigation.navigate('Registration', { wsRegistrationStatus: wsRegistrationStatus })
      }
    }}>

      <View style={{
        backgroundColor:
          (resRegistrationStatus && resRegistrationStatus.item !== undefined &&
            resRegistrationStatus.item.registrationStatus === RegistrationStatus.NOTSTARTED ||
            resRegistrationStatus && resRegistrationStatus.item &&
            resRegistrationStatus.item.registrationStatus === RegistrationStatus.ERROR) ?
            redColor : (resRegistrationStatus && resRegistrationStatus.item !== undefined &&
              resRegistrationStatus.item.registrationStatus === RegistrationStatus.PENDING) ?
              blueColor : greenColor
      }}>
        <View style={{ padding: 10, alignItems: 'center' }}>
          <Text style={{
            color: whiteColor,
            fontSize: 15,
            // fontFamily: '../assets/fonts/SF-Pro-Display-Semibold.otf',
            textAlign: 'center'
          }}>{resRegistrationStatus && resRegistrationStatus.item !== undefined ? resRegistrationStatus.item.title : ""}</Text>
          <Text style={{
            color: whiteColor,
            fontSize: 15,
            // fontFamily: '../assets/fonts/SF-Pro-Display-Semibold.otf',
            textAlign: 'center'
          }}>{resRegistrationStatus && resRegistrationStatus.item !== undefined ? resRegistrationStatus.item.message : ""}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
  const checkCameraPermission = async () => {
    // We need to ask permission for Android only
    if (Platform.OS === 'android') {
      // Calling the permission function
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );
      console.log("############=> " + JSON.stringify(PermissionsAndroid.RESULTS))
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        // Permission Granted
        props.navigation.navigate('CheckInOut', { wsDashboard: wsDashboard })
      } else if (granted === PermissionsAndroid.RESULTS.DENIED) {
        // Permission Denied
        alert('Please give camera permission');
      } else {
        // Permission never_ask_again
        Alert.alert(
          'Alert',
          'Please give camera permission from app permission ',
          [
            { text: 'Cancel', onPress: () => console.log('Cancel Pressed!') },
            {
              text: 'OK', onPress: () => {
                Linking.openSettings()
              }
            },
          ],
          { cancelable: false }
        )
      }
    } else {
      request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE).then(
        (statuses) => {
          if (statuses === RESULTS.GRANTED) {
            props.navigation.navigate('CheckInOut', { wsDashboard: wsDashboard })
          } else if (statuses === RESULTS.UNAVAILABLE) {
            utils.openPermissionSeetings()
          }
          else if (statuses === RESULTS.BLOCKED) {
            utils.openPermissionSeetings()
          }
        },
      );
      // proceed();
    }
  }

  const renderEmployeeTime = () => {
    const empTime = (resDashboard && resDashboard.success && resDashboard.item.employeeTime) ? resDashboard.item.employeeTime : null
    return (
      <View style={[{ marginTop: 10 }, style.cardWhite]}>
        {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={style.dashbordLabel}> Employee Time </Text>
          <Text style={style.dashbordLabel}>{utils.formatDate(new Date())}</Text>
        </View> */}
        {/* <View style={{ marginVertical: 15, flexDirection: 'row', alignSelf: "center" }}>
          {(empTime && empTime.employeeImage) ?
            <Image source={{ uri: uploadUrl + empTime.employeeImage }}
              style={{ width: 100, height: 90, borderRadius: 10, resizeMode: 'cover' }} />
            : <Image source={require('../assets/images/Employee-Time.png')}
              style={{ width: 100, height: 90, resizeMode: 'contain' }} />}
           <View style={[style.cardWhite, {
            justifyContent: 'center',
            paddingLeft: 10,
            flex: 1,
            borderTopLeftRadius: 50,
            borderBottomLeftRadius: 50,
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            left: 10
          }]}>
            <Text style={style.blueText}>Shift Time</Text>
            <Text style={style.grayText}>{
              (empTime && empTime.shift_time) ?
                empTime.shift_time.inTime + ' to ' + empTime.shift_time.outTime
                : ''
            }</Text>
          </View> 

        </View> */}
        {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={style.blueText}>In Time</Text>
          <Text style={style.blueText}>Out Time</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={style.grayText}>{
            (empTime && empTime.in_time) ?
              utils.formatTime(empTime.in_time.time)
              : ''
          }</Text>
          <Text style={style.grayText}>{
            (empTime && empTime.out_time) ?
              utils.formatTime(empTime.out_time.time)
              : ''
          }</Text>
        </View> */}
        {/* <View style={{ }}> */}

        <View style={{ borderWidth: 0, marginHorizontal: -20, marginTop: -20, borderRadius: 20, }}>
          {/* {(profileState && profileState.profile_image) ?
            <ImageBackground source={{ uri: (utils.isDataURL(profileState.profile_image)) ? profileState.profile_image : uploadUrl + profileState.profile_image }}
              style={{ width: "100%", height: 150, borderTopRightRadius: 20, borderTopLeftRadius: 20, overflow: "hidden" }} resizeMode='stretch'  blurRadius={10}
            >
            </ImageBackground>
            : */}
          <ImageBackground source={require('../assets/images/turnout.jpg')} style={{ width: "100%", height: 150, borderTopRightRadius: 20, borderTopLeftRadius: 20, borderWidth: 0, backgroundColor: "white", overflow: 'hidden' }} resizeMode='stretch' /* blurRadius={1} */>
          </ImageBackground>
          {/* } */}
          <TouchableOpacity onPress={() => {
            // props.navigation.navigate('CheckInOut', { wsDashboard: wsDashboard })
            checkCameraPermission()
          }}>
            <View style={{ flexDirection: 'row', alignSelf: 'center', borderWidth: 0, marginTop: -50, }}>
              {(empTime && empTime.employeeImage) ?
                <Image source={{ uri: uploadUrl + empTime.employeeImage }}
                  style={{ width: 100, height: 90, borderRadius: 10, resizeMode: 'cover', }} />
                : <Image source={require('../assets/images/Employee-Time.png')}
                  style={{ width: 100, height: 90, resizeMode: 'cover', backgroundColor: "white", borderRadius: 20 }} />}
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: "row", alignSelf: "center", marginTop: 12,/*  marginTop: 40 */ }}>
          <Text style={{ ...style.blueText, color: "#0E5EF2", fontSize: 13, fontFamily: "Rubik-Regular" }}>Shift Time </Text>
          <Text style={{ ...style.grayText, fontSize: 13, fontFamily: "Rubik-Regular" }}>{
            (empTime && empTime.shift_time) ?
              empTime.shift_time.inTime + ' to ' + empTime.shift_time.outTime
              : ' '
          }</Text>
        </View>
        <View style={{ flex: 1, flexDirection: "row", width: "70%", /* justifyContent: "center", */ borderWidth: 1, alignSelf: "center", borderColor: "#D1D1D1", marginTop: 10 }}>
          <View style={{ flex: 1, alignItems: "center", borderRightWidth: 1, borderColor: "#D1D1D1", paddingVertical: 5, }}>
            <Text style={{ ...style.blueText, color: "#0E5EF2", fontSize: 13, fontFamily: "Rubik-Regular" }}>In Time</Text>
            <Text style={{ ...style.grayText, color: "black", /* fontWeight: "700", */ fontSize: 17, fontFamily: "Rubik-Medium" }}>{
              (empTime && empTime.in_time) ?
                utils.formatTime(empTime.in_time.time)
                : ' '
            }</Text>
          </View>
          <View style={{ flex: 1, alignItems: "center", paddingVertical: 5, }}>
            <Text style={{ ...style.blueText, color: "#0E5EF2", fontSize: 13, fontFamily: "Rubik-Regular" }}>Out Time</Text>
            <Text style={{ ...style.grayText, color: "black", /* fontWeight: "700", */ fontSize: 17, fontFamily: "Rubik-Medium" }}>{
              (empTime && empTime.out_time) ?
                utils.formatTime(empTime.out_time.time)
                : ' '
            }</Text>
          </View>
        </View>
      </View >
    )
  };

  const renderLeaves = () => {
    const leaves = (resDashboard && resDashboard.success && resDashboard.item.leaveData) ? resDashboard.item.leaveData : null
    return (
      <View style={[style.cardWhite, { marginTop: 10 }]}>
        <Text style={{ ...style.dashbordLabel, fontFamily: "Rubik-Medium", color: 'black' }}> Leaves </Text>
        <ScrollView horizontal={true} persistentScrollbar={true} >
          <View style={{ marginVertical: 15, height: 150, flexDirection: 'row' }}>
            {(leaves?.length > 0) ?
              leaves.map((leave) => {
                return <View key={leave.code} style={{ width: (Dimensions.get('window').width - 70) / 3, alignItems: 'center', paddingHorizontal: 5, }}>
                  <View style={{ ...style.leaveCountContainer, paddingTop: 20, }}>
                    <Image source={{ uri: uploadUrl + leave.image }}
                      // style={{ width: "60%", height: "60%" }} resizeMode='stretch'
                      style={{ width: 30, height: 30, }} resizeMode="contain"
                    />
                    <Text style={{ ...style.leaveCountText, marginTop: 10 /* color: 'black'  */ }}>{leave.usedLeave + '/' + leave.entitledLeave}</Text>
                    {/* <Text style={style.leaveCountText}>{- +leave.usedLeave + +leave.entitledLeave}</Text> */}
                    {/* <View style={{ flexDirection: 'row' }}  > */}<Text style={{ ...style.leaveTypeText, marginTop: 5, color: 'black', fontSize: 13 }} adjustsFontSizeToFit={true} numberOfLines={1}>{- (+leave.usedLeave + +leave.pendingLeave) + +leave.entitledLeave} Available</Text>{/* <Text> Available</Text> */}{/* </View> */}
                  </View>
                  <Text style={{ ...style.leaveTypeText, color: 'black', fontFamily: "Rubik-Regular" }}>{leave.name}</Text>
                </View>
              }) : <View style={{ alignItems: 'center', justifyContent: 'center', width: Dimensions.get('window').width - 70 }}>{leaves?.length <= 0 ? <Text >No data found</Text> : null}</View>
            }
          </View>
        </ScrollView>
      </View>
    )
  };

  const renderNewsFeed = (newsFeed) => (
    <View>
      <View style={[{ marginTop: 10, flexDirection: 'row', alignItems: 'center' }, style.cardWhite]}>
        <Image
          source={{ uri: uploadUrl + newsFeed.image }}
          style={{ width: 50, height: 50, resizeMode: 'contain' }} />
        <View style={{ flex: 1, margin: 10, }}>
          <Text style={style.darkGrayText}>{newsFeed.title}</Text>
          <Text style={[style.grayText, { marginTop: 5, }]}>{newsFeed.description}</Text>
        </View>
      </View>

    </View>
  );
  const chartcolor = (item) => {
    for (let i = 0; i < item.length; i++) {
      chartFillColor.push(item[i].color)
    }
  }

  const renderChart = (monthlyAttendance) => {


    monthlyAttendance.forEach(function (chart) {
      chart.legendFontColor = chart.color
    });
    return (
      <View style={[{ marginTop: 10, marginBottom: 50 }, style.cardWhite]}>
        <Text style={{ ...style.dashbordLabel, fontFamily: "Rubik-Medium", color: 'black' }}> Monthly Attendance Chart </Text>
        <View style={{/*  margin: 10, */ alignSelf: 'center' }}>
          {/* <PieChart
            data={monthlyAttendance}
            width={Dimensions.get('window').width}
            height={210}
            chartConfig={{
              backgroundGradientFrom: "#1E2923",
              backgroundGradientFromOpacity: 0,
              backgroundGradientTo: "#08130D",
              backgroundGradientToOpacity: 0.5,
              color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
              strokeWidth: 2, // optional, default 3
              barPercentage: 0.5,
              useShadowColorFromDataset: false // optional
            }}
            accessor="count"
            backgroundColor="transparent"
            paddingLeft="5"
            absolute
          /> */}

          <VictoryPie
            theme={VictoryTheme.material}
            data={/* [
              {
                "color": "#2ea44f",
                "count": 0,
                "legendFontColor": "#2ea44f",
                "name": "present"
              },
              {
                "color": "#dc4338",
                "count": 21,
                "legendFontColor": "#dc4338",
                "name": "absent"
              },
              {
                "color": "#c5b624",
                "count": 0,
                "legendFontColor": "#c5b624",
                "name": "holiday"
              },
              {
                "color": "#EC7063",
                "count": 22,
                "legendFontColor": "#EC7063",
                "name": "Attended Holidays"
              }
            ] */monthlyAttendance}
            colorScale={chartFillColor}
            // labels={({ index }) => {
            //   return index == selectedIndex ? monthlyAttendance && monthlyAttendance[index].count : null
            // }}
            x="name"
            y="count"
            labelRadius={({ innerRadius }) => innerRadius + 15}
            labels={({ datum }) => datum.count > 0 ? datum.count : null}
            radius={({ index }) => { return index == selectedIndex ? 130 + monthlyAttendance[index].count : 120 }}
            innerRadius={50}
            style={{
              labels: { fill: "white", fontSize: 20, fontFamily: 'Rubik-Regular' }
            }}
            events={[{

              target: 'data',
              eventHandlers: {
                onPressIn: () => {
                  return [
                    {
                      target: "labels", //label
                      mutation: ({ index }) => {
                        console.log("@@@@@@@@@>>>>>>>>", index)
                        setSelectedIndex(index);
                        return {};
                      }
                    },
                    // {
                    //   target: "data",
                    //   mutation: ({ style }) => {
                    //     return style.fill === "#c43a31" ? null : { style: { fill: "#c43a31" } };
                    //   }
                    // }

                  ];
                }
              }
            }]}

          />
        </View>
        <View style={{ marginTop: -30 }}></View>
        <FlatList
          data={monthlyAttendance}
          renderItem={renderLeaveType}
          keyExtractor={item => item._id}
          numColumns={3}
          columnWrapperStyle={{ justifyContent: "space-between", margin: 10 }}
        />

      </View>
    )
  };
  const renderLeaveType = ({ item }) => (
    <View style={[{ flexDirection: "row", alignItems: 'center', borderWidth: 0,/*  borderColor: '#D1D1D1' */ }]}>
      <View style={{ height: 16, width: 16, borderWidth: 0, backgroundColor: item.color, borderRadius: 16 }}></View>
      <Text style={{ fontSize: 16, textAlign: 'center', fontFamily: "Rubik-Regular", color: "#838395" }}> {item.count} {item.name}</Text>
    </View>
  )

  const renderMenuHeader = (
    <LinearGradient
      // start={{ x: 0.0, y: 0.0 }}
      // end={{ x: 0.5, y: 1.0 }}
      // colors={['#b5cefb', '#0E5EF2']}     //#266ef3

      start={{ x: 0.9, y: 0.0 }}
      end={{ x: 1.0, y: 1.0 }}
      colors={['#0E5EF2', '#b5cefb']}
      style={{
        // paddingLeft: 15,
        // paddingRight: 15,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        // marginTop: 16,
        // width: 350,
      }}
    >
      <View style={{/*  backgroundColor: menuHeaderColor, */ padding: 15, /* alignItems: 'center' */ }}>
        <TouchableOpacity style={Platform.OS === "android" ? style.backIcon : style.backIconiOS} onPress={() => closeDrawer()}>
          <Image source={require('../assets/images/close.png')} style={{ tintColor: 'white' }} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
          props.navigation.navigate('Profile')
          closeDrawer()
        }}>
          <View style={{ flexDirection: 'row', /* marginTop: 12,  borderWidth: 1,*/ alignItems: 'center', margin: 30 }}>
            <View style={{ marginRight: 10, margin: -30 }}>
              {(profileState && profileState.profile_image) ?
                <Image source={{ uri: (utils.isDataURL(profileState.profile_image)) ? profileState.profile_image : uploadUrl + profileState.profile_image }}
                  style={{ width: 70, height: 70, borderRadius: 50, }}
                />
                : <Image source={require('../assets/images/profilepic.png')}
                  style={{ width: 70, height: 70, borderRadius: 50, backgroundColor: whiteColor }} />
              }
            </View>
            <View style={{ /* justifyContent: 'center' */ }}>
              <Text style={[{ fontSize: 18, color: whiteColor, fontFamily: 'Rubik-Regular' }]}>{profileState && profileState.name}</Text>
              <Text style={{ color: whiteColor, fontFamily: 'Rubik-Regular' }}>{profileState && profileState.email}</Text>
              <Text style={[{ color: whiteColor, fontFamily: 'Rubik-Regular' }]}>+91 {profileState && profileState.phone}</Text>
            </View>
          </View>

        </TouchableOpacity>
      </View>
    </LinearGradient>

  )
  const renderMenuItem = ({ item }) => {
    return ((attendanceArr.some(e => e == item.id)) ?
      <>
        {showMyAttendance == true ?
          <TouchableOpacity style={{ marginTop: 5 }} onPress={() => {
            console.log("items", item.id)

            switch (item.id) {
              case 1:
                closeDrawer()
                break;
              case 2:
                if (isDemoUser) {
                  Snackbar.show({ text: 'This feature is not enabled for this account. To enable it, please contact to info@rydotifotech.com' })
                } else {
                  clearRegistrationTimer()
                  props.navigation.navigate('Registration', { wsRegistrationStatus: wsRegistrationStatus })
                }
                break;
              case 3:
                (showMyAttendance == true ? (setShowMyAttendance(false), openDrawer()) : setShowMyAttendance(true))
                break;
              case 4:
                props.navigation.navigate('TeamAttendance', { empid: empId, fromWhere: "dashboard", isAttendanceRemark: attendanceRemarkFlag, isChangeAttendance: changeAttendanceFlag })
                break;
              case 5:
                props.navigation.navigate('OfflineAttendance', { wsDashboard: wsDashboard })
                break;
              case 6:
                props.navigation.navigate('AttendanceHistory', { eId: empId })
                break;
              case 7:
                if (isDemoUser) {
                  Snackbar.show({ text: 'This feature is not enabled for this account. To enable it, please contact to info@rydotifotech.com' })
                } else {
                  // props.navigation.navigate('CheckInOut', { wsDashboard: wsDashboard })
                  checkCameraPermission()
                }
                // if (isActiveWorkplace) {
                //   props.navigation.navigate('CheckInOut', { wsDashboard: wsDashboard })
                // } else {
                //   alert('Workplace is not assigned to you.')
                // }
                break;
              case 9:
                props.navigation.navigate("MyRequest")
                break;
              case 10:
                props.navigation.navigate('Leave')
                break;
              case 11:
                (showTeam == true ? setShowTeam(false) : setShowTeam(true))
                break;
              case 12:
                props.navigation.navigate('MyTeam')
                break;
              case 13:
                props.navigation.navigate('TeamRequest')
                break;
              case 14:
                props.navigation.navigate('Team')
                break;
              case 16:
                props.navigation.navigate("MyVisitor")
                break;
              case 17:
                props.navigation.navigate("HolisdaysList")
                break;
              case 18:
                props.navigation.navigate('WorkplaceList')
                break;
              case 21:
                props.navigation.navigate('AboutUs')
                break;
              case 22:
                logoutAsync()
                break;
            }
            closeDrawer()
          }}>
            <View style={{ ...style.menuItem, marginLeft: 70 }}>
              <Image source={item.icon} />
              <Text style={{ ...style.menuItemText, }}> {item.title} </Text>
            </View>
          </TouchableOpacity> : null}
      </>
      :
      (teamArr.some(e => e == item.id)) ?
        <>
          {showTeam == true ?

            <TouchableOpacity style={{ marginTop: 5 }} onPress={() => {
              console.log("items", item.id)

              switch (item.id) {
                case 1:
                  closeDrawer()
                  break;
                case 2:
                  if (isDemoUser) {
                    Snackbar.show({ text: 'This feature is not enabled for this account. To enable it, please contact to info@rydotifotech.com' })
                  } else {
                    clearRegistrationTimer()
                    props.navigation.navigate('Registration', { wsRegistrationStatus: wsRegistrationStatus })
                  }
                  break;
                case 3:
                  (showMyAttendance == true ? (setShowMyAttendance(false), openDrawer()) : setShowMyAttendance(true))
                  break;
                case 4:
                  props.navigation.navigate('TeamAttendance', { empid: empId, fromWhere: "dashboard", isAttendanceRemark: attendanceRemarkFlag, isChangeAttendance: changeAttendanceFlag })
                  break;
                case 5:
                  props.navigation.navigate('OfflineAttendance', { wsDashboard: wsDashboard })
                  break;
                case 6:
                  props.navigation.navigate('AttendanceHistory', { eId: empId })
                  break;
                case 7:
                  if (isDemoUser) {
                    Snackbar.show({ text: 'This feature is not enabled for this account. To enable it, please contact to info@rydotifotech.com' })
                  } else {
                    // props.navigation.navigate('CheckInOut', { wsDashboard: wsDashboard })
                    checkCameraPermission()
                  }
                  // if (isActiveWorkplace) {
                  //   props.navigation.navigate('CheckInOut', { wsDashboard: wsDashboard })
                  // } else {
                  //   alert('Workplace is not assigned to you.')
                  // }
                  break;
                case 9:
                  props.navigation.navigate("MyRequest")
                  break;
                case 10:
                  props.navigation.navigate('Leave')
                  break;
                case 11:
                  (showTeam == true ? setShowTeam(false) : setShowTeam(true))
                  break;
                case 12:
                  props.navigation.navigate('MyTeam')
                  break;
                case 13:
                  props.navigation.navigate('TeamRequest')
                  break;
                case 14:
                  props.navigation.navigate('Team')
                  break;
                case 16:
                  props.navigation.navigate("MyVisitor")
                  break;
                case 17:
                  props.navigation.navigate("HolisdaysList")
                  break;
                case 18:
                  props.navigation.navigate('WorkplaceList')
                  break;
                case 21:
                  props.navigation.navigate('AboutUs')
                  break;
                case 22:
                  logoutAsync()
                  break;
              }
              closeDrawer()
            }}>
              <View style={{ ...style.menuItem, marginLeft: 70 }}>
                <Image source={item.icon} />
                <Text style={{ ...style.menuItemText, }}> {item.title} </Text>
              </View>
            </TouchableOpacity> : null}
        </>
        :
        <TouchableOpacity style={{ marginTop: 5 }} onPress={() => {
          console.log("items", item.id)

          switch (item.id) {
            case 1:
              closeDrawer()
              break;
            case 2:
              if (isDemoUser) {
                Snackbar.show({ text: 'This feature is not enabled for this account. To enable it, please contact to info@rydotifotech.com' })
              } else {
                clearRegistrationTimer()
                props.navigation.navigate('Registration', { wsRegistrationStatus: wsRegistrationStatus }) && closeDrawer()
              }
              break;
            case 3:
              (showMyAttendance == true ? (setShowMyAttendance(false)) : setShowMyAttendance(true))
              break;
            case 4:
              props.navigation.navigate('TeamAttendance', { empid: empId, fromWhere: "dashboard", isAttendanceRemark: attendanceRemarkFlag, isChangeAttendance: changeAttendanceFlag }) && closeDrawer()
              break;
            case 5:
              props.navigation.navigate('OfflineAttendance', { wsDashboard: wsDashboard }) && closeDrawer()
              break;
            case 6:
              props.navigation.navigate('AttendanceHistory', { eId: empId }) && closeDrawer()
              break;
            case 7:
              if (isDemoUser) {
                Snackbar.show({ text: 'This feature is not enabled for this account. To enable it, please contact to info@rydotifotech.com' })
              } else {
                // props.navigation.navigate('CheckInOut', { wsDashboard: wsDashboard }) && closeDrawer()
                checkCameraPermission()
              }
              // if (isActiveWorkplace) {
              //   props.navigation.navigate('CheckInOut', { wsDashboard: wsDashboard })
              // } else {
              //   alert('Workplace is not assigned to you.')
              // }
              break;
            case 9:
              props.navigation.navigate("MyRequest") && closeDrawer()
              break;
            case 10:
              props.navigation.navigate('Leave') && closeDrawer()
              break;
            case 11:
              (showTeam == true ? setShowTeam(false) : setShowTeam(true))
              break;
            case 12:
              props.navigation.navigate('MyTeam') && closeDrawer()
              break;
            case 13:
              props.navigation.navigate('TeamRequest') && closeDrawer()
              break;
            case 14:
              props.navigation.navigate('Team') && closeDrawer()
              break;
            case 16:
              props.navigation.navigate("MyVisitor") && closeDrawer()
              break;
            case 17:
              props.navigation.navigate("HolisdaysList") && closeDrawer()
              break;
            case 18:
              props.navigation.navigate('WorkplaceList') && closeDrawer()
              break;
            case 21:
              props.navigation.navigate('AboutUs') && closeDrawer()
              break;
            case 22:
              logoutAsync() && closeDrawer()
              break;
          }
          // closeDrawer()
        }}>

          {item.id == 3 ?
            <View style={{ ...style.menuItem, justifyContent: 'space-between',/* borderWidth: 0.7, borderColor: '#00000029', paddingRight: 5  */ }}>
              <View style={{ flexDirection: 'row', alignItems: 'center'/*, marginLeft: 25, */ }}>
                {/* <View style={{ height: 25, width: 25 }}></View> */}
                <Image source={require('../assets/images/my_attendance.png')}></Image>
                <Text style={{ color: darkGrayColor, fontSize: 15, fontFamily: 'Rubik-Regular', marginLeft: 25 }}> {item.title} </Text>
              </View>
              <Image source={showMyAttendance ? require('../assets/images/uparrow.png') : require('../assets/images/downarrow.png')} style={{ height: 10, width: 10, marginLeft: 30 }} />
            </View>
            :

            ((isTeamLeader) && (item.id == 11)) ?
              <View style={{ ...style.menuItem, justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row' }}>
                  {/* <View style={{ height: 25, width: 25 }}></View> */}
                  <Image source={require('../assets/images/Team.png')} ></Image>
                  <Text style={{ color: darkGrayColor, fontSize: 15, fontFamily: 'Rubik-Regular', marginLeft: 25 }}> {item.title} </Text>
                </View>
                <Image source={showTeam ? require('../assets/images/uparrow.png') : require('../assets/images/downarrow.png')} style={{ height: 10, width: 10, marginLeft: 30 }} />
              </View>
              :
              ((isTeamLeader == false) && (item.id == 11)) ? null
                :
                <View style={{ ...style.menuItem }}>
                  <Image source={item.icon} />
                  <Text style={{ ...style.menuItemText, }}> {item.title} </Text>
                </View>

          }
        </TouchableOpacity>


    )
  }
  const navigationView = () => {
    if (isRegistered) {
      menuArr = menuArr.filter(menu => menu.id != 2)
    } else {
      menuArr = menuArr.filter(menu => menu.id != 5)
    }
    return <View style={{ backgroundColor: whiteColor, flex: 1 }}>
      <FlatList
        data={menuArr}
        ListHeaderComponent={renderMenuHeader}
        renderItem={renderMenuItem}
        keyExtractor={item => item.id.toString()}
      />
      <View style={{ margin: 10, alignItems: 'center' }}>
        {((resDashboard && resDashboard.success && resDashboard.item && resDashboard.item.clientSettings) /* && (resDashboard.item.clientSettings.company_logo) */) ? <Image source={{ uri: uploadUrl + resDashboard.item.clientSettings.introScreen }}
          style={{ width: 126, height: 63, resizeMode: 'contain' }} /> : null}
        <Text style={style.grayText}>{'App Version: ' + DeviceInfo.getVersion()}</Text>
        {/* <View style={{ margin: 10, flexDirection: 'row' }}>
      <Text style={style.grayText}>Copyright &#169; </Text>
      <Text style={style.blueText}>RIPL</Text>
    </View> */}
      </View>
    </View>

  }
  const safeApiCall = () => {
    Alert.alert("", "Are you safe ? ", [
      { text: 'No', onPress: () => console.log('Cancel Pressed!') },
      {
        text: 'Yes', onPress: () => {
          api.postWithPayloadwithToken(
            markAsSafeUrl,
            {
              "isSafe": true
            }
          ).then(res => {
            wsDashboard(true)
            setMarkAsSafe(true)
            Snackbar.show({ text: 'Message Submitted successfully' })
            console.log("res:" + JSON.stringify(res))
          }).catch(async (error) => {
            setMarkAsSafe(false)
            console.log("mark me safe api Error Message ***", "Something went wrong!!");
          })
        }
      }
    ])
  }
  return (
    <SafeAreaView style={style.header}>
      {/* <StatusBar
        barStyle="light-content"
        backgroundColor="#0E5EF2"
      /> */}
      <DrawerLayout
        ref={drawerRef}
        drawerPosition={'right'}
        drawerWidth={Dimensions.get('window').width}
        renderNavigationView={navigationView}
      >

        <View style={{ backgroundColor: whiteColor, }}>
          {/* <TopCurve /> */}

          {/* {Platform.OS === "android" ?
            <NavigationBar
              navigationBarStyle={{ backgroundColor: 'transparent' }}
              componentLeft={() =>
                <Text style={{ ...style.headerText, color: '#0E5EF2' }}>Dashboard</Text>
              }
              componentRight={() =>
                <TouchableOpacity onPress={() => openDrawer()}>
                  <Image source={require('../assets/images/menu.png')}
                    style={{ resizeMode: 'contain', marginRight: 10, tintColor: '#0E5EF2' }} />
                </TouchableOpacity>

              } /> :
            <NavigationBar
              navigationBarStyle={{ backgroundColor: 'transparent' }}
              componentLeft={() =>
                <Text style={{ ...style.headerText, color: '#0E5EF2' }}>Dashboard</Text>
              }
              componentRight={() =>
                <TouchableOpacity onPress={() => openDrawer()} style={style.menuIcon}>
                  <Image source={require('../assets/images/menu.png')}
                    style={{ resizeMode: 'contain', marginRight: 10, marginTop: 15, tintColor: '#0E5EF2' }} />
                </TouchableOpacity>

              } />
          } */}
          <LinearGradient
            start={{ x: 0.9, y: 0.0 }}
            end={{ x: 1.0, y: 1.0 }}
            colors={['#0E5EF2', '#b5cefb']}
            style={{
              borderBottomLeftRadius: 25,
              borderBottomRightRadius: 25,
              height: 256
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10, borderWidth: 0 }}>
              {/* <Text style={{  color: 'white', fontSize: 16, fontFamily: "Rubik-Regular", marginLeft: 10, alignSelf: "center" }}>Dashboard</Text> */}
              <Text style={{ /* ...style.dashbordLabel, */ color: "white", fontSize: 16, fontFamily: 'Rubik-Medium', flex: 0.7, marginLeft: 10, alignSelf: "center" }} adjustsFontToFit={true} numberOfLines={1} >{profileState && profileState.name} </Text>
              <View style={{ flexDirection: "row", justifyContent: resDashboard && resDashboard.success && resDashboard.item.isSafe == false ? "space-between" : "flex-end", borderWidth: 0, flex: 0.3 }}>
                {
                  resDashboard && resDashboard.success && resDashboard.item.isSafe == false ?
                    <TouchableOpacity onPress={() => safeApiCall()} >
                      {/* <Image source={require('../assets/images/safe.png')}
                        style={{ resizeMode: 'contain', marginTop: 4, height: 45, width: 60 }} /> */}
                      <View style={{ flexDirection: "row", justifyContent: 'space-between', backgroundColor: 'white', marginTop: 15, borderWidth: 0, padding: 2, borderRadius: 5, marginRight: 5 }}>
                        <Text style={{ textAlignVertical: 'center', fontSize: 10, fontFamily: "Rubik-Medium", color: "black" }}>I'M SAFE</Text>
                        <Image source={require('../assets/images/safe1.png')}
                          style={{ resizeMode: 'contain', height: 18, width: 18, marginLeft: 3 }} />
                      </View>
                    </TouchableOpacity>
                    : null
                }
                <TouchableOpacity onPress={() => openDrawer()} style={{ ...style.menuIcon, width: 43, borderWidth: 0 }}>
                  <Image source={require('../assets/images/menu.png')}
                    style={{ resizeMode: 'contain', marginTop: 15, tintColor: 'white' }} />
                </TouchableOpacity>
              </View>
            </View>
            {(showRegistrationStatus) ? renderRegistrationStatus() : null}

          </LinearGradient>
          <ScrollView style={{ top: showRegistrationStatus ? -130 : -210 }}

            refreshControl={
              <RefreshControl refreshing={isRefresing} onRefresh={onRefresh} />
            }>

            {(resDashboard && resDashboard.success && resDashboard.item.newVersion) ? renderAppUpdate() : null}
            <View style={{ padding: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 1 }}>
                {/* <Text style={{  color: "white", fontSize: 14, fontFamily: 'Rubik-Regular', flex: 0.7 }} adjustsFontToFit={true} numberOfLines={1} >Hi, {profileState && profileState.name} </Text> */}
                <Text style={{ /* ...style.dashbordLabel, */ color: "white", fontSize: 14, alignSelf: "center", fontFamily: 'Rubik-Regular', opacity: 0.7 }}>{moment().format('DD MMM, YYYY')}</Text>
              </View>
              {renderEmployeeTime()}
              {renderLeaves()}

              {(resDashboard && resDashboard.success && resDashboard?.item?.clientSettings?.isNewsFeed) ? renderNewsFeed(resDashboard.item.clientSettings.newsContent) : null}
              {(resDashboard && resDashboard.success && resDashboard?.item?.monthlyAttendance) ? renderChart(resDashboard.item.monthlyAttendance) : null}

            </View>
          </ScrollView>
          <Loader visible={isLoading} />
        </View>
        {/* </LinearGradient> */}

      </DrawerLayout>
    </SafeAreaView >
  );

}


export default Dashboard

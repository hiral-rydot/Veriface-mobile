import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Alert
} from 'react-native';
import { NavigationBar } from 'navigationbar-react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList, TouchableWithoutFeedback } from 'react-native-gesture-handler'
import { style } from '../styles/style'
import { whiteColor, blueColor, iconColor } from '../styles/color'
import { apiCheckInOut } from '../actions'
import { useDispatch, useSelector } from 'react-redux'
import AsyncStorage from '@react-native-community/async-storage';
import { utils } from '../utils/utils'
import Snackbar from 'react-native-snackbar';

const Realm = require('realm');
const OfflineAttendance = (props) => {
    const [realm, setRealm] = useState(null)
    const [attendanceArr, setattendanceArr] = useState([])
    const [itemId, setItemId] = useState('')
    const dispatch = useDispatch()
    let resCheckInOut = useSelector(state => state.resCheckInOut)
    useEffect(() => {

        Realm.open({

        }).then(realm => {
            const attendance = realm.objects('Attendance')
            setattendanceArr(attendance)
            setRealm(realm);
        });

    }, []);
    useEffect(() => {
        resCheckInOut = null

    }, [])
    useEffect(() => {
        if (resCheckInOut && resCheckInOut.success === true) {
            //AsyncStorage.removeItem('checkINOUTData');
            deleteItemFromDb()
            setTimeout(() => {
                Snackbar.show({ text: 'Entry Has been Updated.' })
                //props.navigation.state.params.wsDashboard(false),
                //props.navigation.goBack(null)
            }, 500);
        }
        if (resCheckInOut && resCheckInOut.success === false) {


            AsyncStorage.removeItem('checkINOUTData');
        }
    }, [resCheckInOut])



    const deleteItemFromDb = (iId) => {
        // let itemDelete = realm.objects('Attendance').filtered('id == "' + iId + '"');

        realm.write(() => {
            realm.delete(realm.objects('Attendance').filter(usrObj => usrObj.id == iId))
        });


        if (attendanceArr.length != 0)
            setattendanceArr([])

        const attendanceArray = realm.objects('Attendance')
        let array = [...attendanceArray]
        if (array.length != 0)
            setattendanceArr(array.filter(i => i.id != iId));
        else setattendanceArr(array)

        setItemId('')
    }
    const wsCheckInOut = (item) => {
        let data = {
            isOffline: true,
            time: item.time,
            lat: item.lat,
            long: item.long,
            image_data: item.image_data,

        }
        dispatch(apiCheckInOut(data))
    }
    const renderItem = ({ item }) => (

        <View style={[{ marginHorizontal: 10, marginTop: 10 }, style.cardWhite]}>
            <View style={{ marginVertical: 15, flexDirection: 'row' }}>
                {(item?.image_data) ?
                    <Image source={{ uri: item?.image_data }}
                        style={{ width: 100, height: 90, borderRadius: 10, resizeMode: 'cover' }} />
                    : <Image source={require('../assets/images/Employee-Time.png')}
                        style={{ width: 100, height: 90, resizeMode: 'contain' }} />}
                <View style={[style.shiftTimeContainer]}>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ flexDirection: 'column', }}>
                            <Text style={{ color: blueColor, fontSize: 13 }}>Time</Text>
                            <Text style={{ color: blueColor, fontSize: 13 }}>Latitude</Text>
                            <Text style={{ color: blueColor, fontSize: 13 }}>Longtitude </Text>
                        </View>
                        <View style={{ flexDirection: 'column' }}>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={{ color: blueColor, fontSize: 13 }}>: {utils.formatDate(item?.time)}</Text>
                                <Text style={{ color: blueColor, fontSize: 13 }}> {utils.formatTime(item?.time)}</Text>
                            </View>
                            <Text style={{ color: blueColor, fontSize: 13 }}>: {item?.lat}</Text>
                            <Text style={{ color: blueColor, fontSize: 13 }}>: {item?.long}</Text>
                        </View>

                    </View>
                </View>

            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', alignContent: 'center' }}>
                <TouchableWithoutFeedback onPress={() => {
                    setItemId(item?.id)
                    wsCheckInOut(item)
                }} >
                    <Image source={require('../assets/images/approval.png')}
                        style={{ width: 50, height: 40, resizeMode: 'contain', right: 5 }} />
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPress={() => deleteItemFromDb(item?.id)} style={{ alignSelf: 'flex-end', right: 15 }}>
                    <Image style={{ width: 50, height: 38, tintColor: 'red', left: 5, }} resizeMode={'contain'} source={require('../assets/images/delete1.png')} />
                </TouchableWithoutFeedback>
            </View>
        </View>
    )
    return (
        <SafeAreaView style={style.header}>
            <NavigationBar
                navigationBarStyle={{ ...style.navigationBarStyle }}
                componentLeft={() =>
                    <View style={{ alignItems: 'flex-start', marginLeft: 5 }}>
                        <TouchableOpacity style={{ justifyContent: 'center', flexDirection: 'row' }} onPress={() => props.navigation.goBack(null)}>
                            <Image source={require('../assets/images/back.png')}
                                style={style.backIcon1} />
                            <Text style={style.headerText}>Offline Attendance</Text>
                        </TouchableOpacity>
                    </View>
                } />
            <View style={{ flex: 1, backgroundColor: whiteColor }}>
                <FlatList
                    data={attendanceArr}
                    renderItem={renderItem}
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyExtractor={item => item._id}
                    ListEmptyComponent={
                        <Text style={style.emptyComponent}>No Offline Entries available.</Text>
                    } />
            </View>
        </SafeAreaView>
    );

}
export default OfflineAttendance
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Dimensions,
    Platform,
} from 'react-native';
import { NavigationBar } from 'navigationbar-react-native'
import DrawerLayout from 'react-native-gesture-handler/DrawerLayout'
import { style } from '../styles/style'
import { menuHeaderColor, whiteColor, blueColor, grayColor, iconColor } from '../styles/color'
import { FlatList } from 'react-native-gesture-handler';
import CheckBox from '@react-native-community/checkbox'
import TopCurve from '../components/top-curve';
import BlueButton from '../components/blue-button';
import Loader from '../components/loader';
import { apiSpecificAttendanceDetails } from '../actions'
import { useDispatch, useSelector } from 'react-redux'
import { SafeAreaView } from 'react-native-safe-area-context';
import Overlay from '../components/overlay'
import { utils } from '../utils/utils';
import { uploadUrl } from '../webservice/constant';
import Moment from 'moment'

const AttendanceHistoryDetail = ({ navigation }) => {
    const imageMargin = 10
    const imageWidth = (Dimensions.get('window').width - (imageMargin * 4)) / 2
    let resSpecificAttendance = useSelector(state => state.resSpecificAttendance)
    const isLoading = useSelector(state => state.loading)
    const dispatch = useDispatch()
    const drawerRef = useRef(null)
    const [attendanceArray, setAttendanceArray] = useState([])
    const [filteredArray, setFilteredArray] = useState([])
    const [inCheckBox, setInCheckBox] = useState(false)
    const [outCheckBox, setOutCheckBox] = useState(false)

    useEffect(() => {
        resSpecificAttendance = null
        var time = Moment(navigation.state.params.date).format('YYYY-MM-DD')
        var res = time.split("-");
        var year = parseInt(res[0]);
        var month = parseInt(res[1]);
        var date = parseInt(res[2]);
        var values = {
            filter: {
                time_from: new Date(year, month - 1, date, 0, 0, 0, 0),
                time_to: new Date(year, month - 1, date, 23, 59, 59, 999),
                limit: 1000
            },
        }
        dispatch(apiSpecificAttendanceDetails(values))
    }, [])
    useEffect(() => {

        if (resSpecificAttendance && resSpecificAttendance.success) {
            console.log('coming', resSpecificAttendance.list);
            setAttendanceArray(resSpecificAttendance.list)
            setFilteredArray(resSpecificAttendance.list)
        }
    }, [resSpecificAttendance])




    const openDrawer = () => {
        drawerRef.current.openDrawer()
    }

    const closeDrawer = () => {
        drawerRef.current.closeDrawer()
    }
    const filtrList = () => {
        let tempArr = [...attendanceArray]
        if ((!inCheckBox && !outCheckBox)) {
            setFilteredArray(tempArr)
        } else if (inCheckBox) {
            let inArray = tempArr.filter(item => item.authType === 'in')
            setFilteredArray(inArray)
        } else if (outCheckBox) {
            let outArray = tempArr.filter(item => item.authType === 'out')
            setFilteredArray(outArray)
        }
    }


    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => {
            navigation.navigate('AttendanceDetail', { attendanceItem: item })
        }}>
            <View>
                {(item.image) ?
                    <Image source={{ uri: uploadUrl + item.image }}
                        style={{ width: imageWidth, height: imageWidth, margin: imageMargin, borderRadius: 10, resizeMode: 'cover' }} />
                    : <Image source={require('../assets/images/Employee-Time.png')}
                        style={{ width: imageWidth, height: imageWidth, margin: imageMargin, borderRadius: 10, resizeMode: 'contain' }} />
                }
                <Overlay style={{ margin: imageMargin }} />
                <View style={{ margin: 10, position: 'absolute', left: imageMargin, bottom: imageMargin }}>
                    <Text style={style.whiteText}>{(item.authType === 'in') ? 'In Time' : 'Out Time'}</Text>
                    <Text style={style.whiteText}>{utils.formatDateTimeWithSec(item.time)}</Text>
                </View>
            </View>
        </TouchableOpacity>
    )
    const navigationView = (
        <SafeAreaView style={style.header}>
            <View style={{ padding: 10, backgroundColor: whiteColor, flex: 1, }}>
                <TopCurve />
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ ...style.headerText, color: "#0E5EF2" }}>Filter</Text>
                    <TouchableOpacity onPress={() => closeDrawer()}>
                        <Image source={require('../assets/images/close.png')}
                            style={{ resizeMode: 'contain', marginRight: 10, tintColor: "#0E5EF2" }} />
                    </TouchableOpacity>
                </View>

                <View style={[style.cardWhite, { padding: 20, margin: 20 }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        <CheckBox
                            value={inCheckBox}
                            tintColors={{ true: blueColor, false: grayColor }}
                            onValueChange={(newValue) => {
                                setInCheckBox(newValue)
                                if (newValue) {
                                    setOutCheckBox(false)
                                }
                            }} />
                        {Platform.OS == "android" ?
                            <Text style={[style.blueText, { marginRight: 10 }]}>IN</Text> :
                            <Text style={[style.blueText, { marginRight: 10, marginLeft: 10 }]}>IN</Text>}

                        <CheckBox
                            style={{ marginLeft: 10 }}
                            tintColors={{ true: blueColor, false: grayColor }}
                            value={outCheckBox}
                            onValueChange={(newValue) => {
                                setOutCheckBox(newValue)
                                if (newValue) {
                                    setInCheckBox(false)
                                }
                            }} />
                        {Platform.OS === "android" ?
                            <Text style={[style.blueText,]}>OUT</Text> :
                            <Text style={[style.blueText, { marginRight: 10, marginLeft: 10 }]}>OUT</Text>
                        }
                    </View>
                    <BlueButton
                        containerStyle={{ marginTop: 30 }}
                        title={'APPLY'}
                        onPress={() => {
                            filtrList()
                            closeDrawer()
                        }}
                    />
                </View>
            </View>
        </SafeAreaView>
    )
    return (
        <SafeAreaView style={style.header}>
            <NavigationBar
                navigationBarStyle={{ ...style.navigationBarStyle }}
                componentLeft={() =>
                    <View style={{ alignItems: 'flex-start', marginLeft: 5 }}>
                        <TouchableOpacity style={{ justifyContent: 'center', flexDirection: 'row' }} onPress={() => navigation.goBack(null)}>
                            <Image source={require('../assets/images/back.png')}
                                style={style.backIcon1} />
                            <Text style={style.headerText}> Attendance</Text>
                        </TouchableOpacity>
                    </View>
                }
                componentRight={() =>
                    <TouchableOpacity onPress={() => { openDrawer() }}>
                        <Image source={require('../assets/images/filter.png')}
                            style={{ resizeMode: 'contain', marginRight: 10, tintColor: iconColor }} />
                    </TouchableOpacity>

                }
            />

            <DrawerLayout
                ref={drawerRef}
                drawerPosition={'right'}
                drawerWidth={Dimensions.get('window').width}
                renderNavigationView={() => navigationView}
            >
                <View style={{ backgroundColor: whiteColor, flex: 1 }}>
                    <TopCurve />
                    <FlatList
                        data={filteredArray}
                        numColumns={2}
                        renderItem={renderItem}
                        contentContainerStyle={{ flexGrow: 1 }}
                        ListEmptyComponent={
                            <Text style={style.emptyComponent}>No records available.</Text>
                        }
                        keyExtractor={item => item._id}
                    />
                    <Loader visible={isLoading} />
                </View>
            </DrawerLayout>
        </SafeAreaView>
    );

}
export default AttendanceHistoryDetail
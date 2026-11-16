import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Platform,
    Dimensions,
    FlatList,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { NavigationBar } from 'navigationbar-react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { DrawerLayout } from 'react-native-gesture-handler'
import DateTimePicker from 'react-native-date-picker';
import { style } from '../styles/style'
import { whiteColor, blueColor, iconColor } from '../styles/color'
import { apiAttendanceReport } from '../actions'
import { useDispatch, useSelector } from 'react-redux'
import { utils } from '../utils/utils';
import Loader from '../components/loader'
import moment from 'moment';
import { apiUrl } from '../webservice/constant';
import { TEAM_HISTORY } from "../webservice/constant";
import Moment from 'moment';
import { api } from '../webservice/api';
import { uploadUrl } from '../webservice/constant';


const AttendanceHistory = ({ navigation }) => {
    var empId = "";
    var yesterDay = new Date(); // today!
    var week = new Date();
    week.setDate(week.getDate() - 7);
    const drawerRef = useRef(null)

    yesterDay.setDate(yesterDay.getDate() - 1);//yesterday
    const limitRecord = 20;
    const [fromDate, setFromDate] = useState(week);
    const [toDate, setToDate] = useState(yesterDay);
    const [showFromDate, setShowFromDate] = useState(false);
    const [showToDate, setShowToDate] = useState(false);
    const [resetFilter, setResetFilter] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [skipRecord, setSkipRecord] = useState(0);

    const [attendanceArray, setAttendanceArray] = useState([]);
    let resAttendanceReport = useSelector(state => state.resAttendanceReport)
    const isLoading = useSelector(state => state.loading)
    const dispatch = useDispatch()

    const [offset, setOffset] = useState(1);
    const [isListEnd, setIsListEnd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [myHistoryData, setMyHistoryData] = useState(null);
    const [employeeId, setEmployeeId] = useState("");

    /* paging */
    const [skip, setSkip] = useState(0);
    const LIMIT = 20;
    const [hasMorePages, setHasMorePages] = useState(false);
    const loadingNextPageRef = React.useRef(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        console.log("*************UseEffect SKIP")
        empId = navigation.getParam('eId');
        if (skip > 0) {
            webCallAttendanceHistory(empId)
                .then(() => { loadingNextPageRef.current = false; })
                .catch(() => { loadingNextPageRef.current = false; })
        }
    }, [skip]);


    const renderFooter = () => {
        return hasMorePages ? <View style={{ alignItems: 'center', padding: 20 }}>
            <ActivityIndicator
                animating={true}
                color='#4386F4'
                size="large" />
        </View> : null;
    };

    const onEndReached = () => {
        //console.log("*************onEndReached SKIP", skip, loadingNextPageRef.current);
        if (!loadingNextPageRef.current && hasMorePages) {
            loadingNextPageRef.current = true;
            setSkip(skip + LIMIT);
            console.log("*************onEndReached SKIP", skip, loadingNextPageRef.current);
        }
    }

    /* useEffect(() => {
        resAttendanceReport = null
        wsAttendaceReport()
    }, [])

    useEffect(() => {
        if (skipRecord > 0) {
            wsAttendaceReport()
        }
    }, [skipRecord])

    useEffect(() => {
        if (resetFilter) {
            wsAttendaceReport()
            setResetFilter(false)
        }
    }, [resetFilter])
    useEffect(() => {
        if (resAttendanceReport && resAttendanceReport.success) {
            setTotalCount(resAttendanceReport.count)
            let array = [...attendanceArray, ...resAttendanceReport.list];
            setAttendanceArray(array)
        }
    }, [resAttendanceReport]) */

    useEffect(() => {
        empId = navigation.getParam('eId');
        setEmployeeId(empId);
        webCallAttendanceHistory(empId, true);
    }, [])

    const openDrawer = () => {
        drawerRef.current.openDrawer()
    }

    const closeDrawer = () => {
        drawerRef.current.closeDrawer()
    }

    const webCallAttendanceHistory = (empId, refresh = false) => {

        console.log("OffSet -> ", offset);
        setLoading(true);
        return new Promise((resolve, reject) => {
            let team_attendance_list = `${apiUrl}${TEAM_HISTORY}`
            api.postWithTokenNew(team_attendance_list, {
                "skip": refresh ? 0 : skip,
                "limit": LIMIT,
                "sortBy": "dateStr",
                "sort": "desc",
                "filter": {
                    "employee": empId,
                    "fromDate": Moment(fromDate).format('YYYY-MM-DD'),
                    "toDate": Moment(toDate).format('YYYY-MM-DD')
                }
            }).then(async (jsonResponse) => {

                if (jsonResponse.success) {
                    if (refresh) {
                        setSkip(0);
                    }

                    let tempArray = [];

                    if (refresh) {
                        tempArray.push(...jsonResponse.list);
                        //setMyTeamData(jsonResponse?.list);
                    }
                    else {
                        if (myHistoryData) tempArray.push(...myHistoryData);
                        tempArray.push(...jsonResponse.list);
                        //setMyTeamData(myTeamData.concat(jsonResponse?.list));
                    }

                    setMyHistoryData(tempArray);
                    setHasMorePages(jsonResponse.list.length >= LIMIT);
                    // if (jsonResponse.list.length < LIMIT)
                    console.log("MyTeam Success Message", jsonResponse);
                    resolve();
                    // if (jsonResponse?.list?.length > 0) {
                    //     setMyHistoryData(jsonResponse?.list)
                    // }

                    // let jsonData = JSON.stringify(jsonResponse)
                    // console.log("MyTeamHistory Success Message", jsonData);

                } else {
                    console.log("MyTeamHistory Error Message **", jsonResponse.message ?? "Something went wrong!!");
                    reject(jsonResponse.message ?? "Something went wrong!!");
                }
                setLoading(false);
            }).catch(async (error) => {
                setLoading(false)
                console.log("MyTeam Error Message ***", "Something went wrong!!", error);
                reject(error);
            })
        });
    };

    const onFromDateChange = (selectedDate) => {
        const currentDate = selectedDate || fromDate;
        setShowFromDate(false);
        setFromDate(currentDate);
    };

    const onToDateChange = (selectedDate) => {
        const currentDate = selectedDate || toDate;
        setShowToDate(false);
        setToDate(currentDate);
    };

    const getModeIcon = (mode) => {
        if (mode) {
            if (mode.toLowerCase() === 'mobile') {
                return require('../assets/images/Mobile.png')
            } else if (mode.toLowerCase() === 'edge') {
                return require('../assets/images/cctv.png')
            } else if (mode.toLowerCase() === 'auto') {
                return require('../assets/images/automatic.png')
            } else if (mode.toLowerCase() === 'manual') {
                return require('../assets/images/manual.png')
            } else if (mode.toLowerCase() === 'rfid') {
                return require('../assets/images/manual.png')
            } else {
                return require('../assets/images/automatic.png')
            }
        } else {
            return require('../assets/images/automatic.png')
        }

    }

    const wsAttendaceReport = () => {
        let data = {
            skip: skipRecord,
            limit: limitRecord,
            sortBy: "createdAt",
            sort: "desc",
            filter: {
                fromDate: moment(fromDate).format('YYYY-MM-DD'),
                toDate: moment(toDate).format('YYYY-MM-DD'),
            }
        }
        dispatch(apiAttendanceReport(data))
    }

    const renderFilters = () => (
        <View>
            <View style={{ flexDirection: 'row', margin: 10 }}>
                <TouchableOpacity style={{ flex: 1, marginRight: 5 }}
                    onPress={() => {
                        setShowToDate(false)
                        setShowFromDate(true)
                    }
                    }>
                    <View style={[style.inputContainer, { justifyContent: 'space-between', paddingVertical: 10 }]}>
                        <Text style={[style.inputTextDate,]}>{moment(fromDate).format('DD/MM/YYYY')}</Text>
                        <Image source={require('../assets/images/date.png')} />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={{ flex: 1, marginLeft: 5, marginRight: 5 }}
                    onPress={() => {
                        setShowFromDate(false)
                        setShowToDate(true)
                    }
                    }>
                    <View style={[style.inputContainer, { justifyContent: 'space-between', paddingVertical: 10 }]}>
                        <Text style={[style.inputTextDate,]}>{moment(toDate).format('DD/MM/YYYY')}</Text>
                        <Image source={require('../assets/images/date.png')} />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={async () => {
                    /*  await setAttendanceArray([])
                     await setSkipRecord(0)
                     await setTotalCount(0)
                     await setResetFilter(true) */
                }
                }>
                    <Image source={require('../assets/images/refresh.png')}
                        style={{ margin: 10, height: 25, width: 25, tintColor: "#0E5EF2" }} />
                </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'column' }}>
                {showFromDate && (
                    <DateTimePicker
                        modal
                        open={showFromDate}
                        maximumDate={yesterDay}
                        testID="dateTimePicker"
                        date={fromDate}
                        mode={'date'}
                        onConfirm={onFromDateChange}
                        onCancel={() => setShowFromDate(false)}
                    />)}
                {showToDate && (
                    <DateTimePicker
                        modal
                        open={showToDate}
                        minimumDate={fromDate}
                        maximumDate={yesterDay}
                        testID="dateTimePicker"
                        date={toDate}
                        mode={'date'}
                        onConfirm={onToDateChange}
                        onCancel={() => setShowToDate(false)}
                    />)}
            </View>
        </View>
    )

    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => navigation.push('TeamAttendance', { fromWhere: "AttendanceHistory", empid: navigation.getParam('eId'), historyDate: item.dateStr })}>
            <View style={[style.cardWhite, { flexDirection: 'row', margin: 10 }]}>


                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    {(item.image) ?
                        <Image source={{ uri: uploadUrl + item.image }}
                            /* style={{ width: 92, height: 106, borderRadius: 10, resizeMode: 'cover' }} */
                            style={{ width: 70, height: 70, borderRadius: 100, resizeMode: "stretch", }} />
                        : <Image source={require('../assets/images/Employee-Time.png')}
                            /* style={{ width: 92, height: 106, borderRadius: 10, resizeMode: 'stretch' }} */
                            style={{ width: 70, height: 70, borderRadius: 100, resizeMode: "stretch", }} />
                    }
                </View>
                <View style={{ marginLeft: 15, flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 14, fontFamily: 'Rubik-SemiBold', color: '#000000', }}>{item?.employeeData?.name}</Text>
                        <Text style={{ fontSize: 12, fontFamily: 'Rubik-Regular', color: '#363636' }}>{moment(item.dateStr, 'YYYY-MM-DD').format('DD/MM/YYYY')}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: "space-between" }}>
                        <View style={{ marginTop: 7.74, }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: '#9496A1' }}>In: </Text>
                                <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: "#00B164" }}>{utils.formatTimeWithSecond(item.inTime)}</Text>
                            </View>
                            <View style={{ marginTop: 10.26 }}>
                                <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: '#9496A1' }}>Spent Hours</Text>
                                <Text style={{ fontSize: 15, fontFamily: 'Rubik-Regular', color: '#0E5CF0', marginTop: 7 }}>{utils.secondsToHm(item.stayTime)}</Text>
                            </View>
                        </View>

                        <View style={{ justifyContent: 'space-between', marginTop: 10.26 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: '#9496A1' }}>Out: </Text>
                                <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: "#F74A49" }}>{utils.formatTimeWithSecond(item.outTime)}</Text>
                            </View>


                            <View style={{ marginTop: 10.26 }}>
                                <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: '#9496A1' }}>Total Hours</Text>
                                <Text style={{ fontSize: 15, fontFamily: 'Rubik-Regular', color: '#0E5CF0', marginTop: 7 }}>{utils.secondsToHm(item.totalTime)}</Text>
                            </View>
                        </View>
                    </View>
                </View>


            </View>
        </TouchableOpacity>
    )

    const navigationView = (
        <SafeAreaView style={style.header}>
            <View style={{ padding: 10, backgroundColor: whiteColor, flex: 1, }}>
                {/* <TopCurve /> */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ ...style.headerText, color: "#0E5EF2" }}>Filter</Text>
                    <TouchableOpacity onPress={() => closeDrawer()}>
                        <Image source={require('../assets/images/close.png')}
                            style={{ resizeMode: 'contain', marginRight: 10, tintColor: "#0E5EF2" }} />
                    </TouchableOpacity>
                </View>

                <View style={[style.cardWhite, { padding: 20, marginTop: 20 }]}>

                    <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                        <TouchableOpacity style={{ flex: 1, marginRight: 5 }}
                            onPress={() => {
                                setShowToDate(false)
                                setShowFromDate(true)
                            }
                            }>
                            <Text style={{ fontFamily: 'Rubik-Regular', color: '#9496A1', marginBottom: 5 }}>From Date</Text>
                            <View style={[style.inputContainer, { borderRadius: 9, justifyContent: "space-around", paddingVertical: 10, paddingHorizontal: 10 }]}>
                                <Text style={[style.inputTextDate]}>{Moment(fromDate).format('DD/MM/YYYY')}</Text>
                                <Image source={require('../assets/images/date.png')} />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1, marginLeft: 5, marginRight: 5 }}
                            onPress={() => {
                                setShowFromDate(false)
                                setShowToDate(true)
                            }
                            }>
                            <Text style={{ fontFamily: 'Rubik-Regular', color: '#9496A1', marginBottom: 5 }}>To Date</Text>
                            <View style={[style.inputContainer, { borderRadius: 9, justifyContent: "space-around", paddingVertical: 10, paddingHorizontal: 10 }]}>
                                <Text style={{ ...style.inputTextDate, }}>{Moment(toDate).format('DD/MM/YYYY')}</Text>
                                <Image source={require('../assets/images/date.png')} />
                            </View>
                        </TouchableOpacity>
                    </View>
                    {/* <View style={{ marginTop: 9 }}>
                        <Text style={{ ...style.rubikmidium, fontSize: 14, color: '#000000' }}>Name For Search</Text>
                        <TextInput style={[style.inputText, style.inputContainer, { marginTop: 10, textAlignVertical: 'top', borderWidth: 1, borderRadius: 10, borderColor: '#0E5EF2', backgroundColor: whiteColor }]}
                            multiline={true}
                            numberOfLines={3}
                            placeholder={'Write your reason for going...'}
                            placeholdergrayColor={"#D2D4DA"}
                            onChangeText={(text) => setNameForFilter(text)} />
                    </View> */}
                    <View style={[{ minWidth: 100, borderRadius: 12, alignSelf: 'center', borderWidth: 0, borderColor: '#D1D1D1', backgroundColor: "#0393FF", marginTop: 20 }]}>
                        <TouchableOpacity style={{ padding: 8, }} onPress={async () => {
                            await closeDrawer()
                            setMyHistoryData(null);
                            await webCallAttendanceHistory(employeeId, true);
                        }}>
                            <Text style={{ color: "#FFFFFF", fontSize: 16, textAlign: 'center', fontFamily: 'Rubik-Regular' }}>Save</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ flexDirection: 'column' }}>
                        {showFromDate && (
                            <DateTimePicker
                                modal
                                open={showFromDate}
                                maximumDate={yesterDay}
                                testID="dateTimePicker"
                                date={fromDate}
                                mode={'date'}
                                onConfirm={onFromDateChange}
                                onCancel={() => setShowFromDate(false)}
                            />)}
                        {showToDate && (
                            <DateTimePicker
                                modal
                                open={showToDate}
                                minimumDate={fromDate}
                                maximumDate={yesterDay}
                                testID="dateTimePicker"
                                date={toDate}
                                mode={'date'}
                                onConfirm={onToDateChange}
                                onCancel={() => setShowToDate(false)}
                            />)}
                    </View>
                </View>
            </View>
        </SafeAreaView>
    )

    return (
        <SafeAreaView style={style.header}>
            <DrawerLayout
                ref={drawerRef}
                drawerPosition={'right'}
                drawerWidth={Dimensions.get('window').width}
                renderNavigationView={() => navigationView}
            >
                <NavigationBar
                    navigationBarStyle={{ ...style.navigationBarStyle }}
                    componentLeft={() =>
                        <View style={{ alignItems: 'flex-start', marginLeft: 5, width: '48%' }}>
                            <TouchableOpacity style={{ justifyContent: 'center', flexDirection: 'row' }} onPress={() => navigation.goBack()}>
                                <Image source={require('../assets/images/back.png')}
                                    style={style.backIcon1} />
                                <Text style={style.headerText}>Attendance History</Text>
                            </TouchableOpacity>
                        </View>
                    }
                    componentRight={() =>
                        <View style={{ flexDirection: 'row', alignItems: 'center', width: '50%', justifyContent: 'flex-end' }}>
                            {fromDate == toDate ?
                                <Text style={{ fontSize: 12, fontFamily: 'Rubik-Regular', color: '#FFFFFF', marginRight: 11.7 }}>{moment(fromDate).format("DD/MM/YYYY")}</Text>

                                :
                                <Text style={{ fontSize: 12, fontFamily: 'Rubik-Regular', color: '#FFFFFF', width: "80%", marginRight: 1.7 }} adjustsFontSizeToFit={true} numberOfLines={1}>{moment(fromDate).format("DD/MM/YYYY")} to {moment(toDate).format("DD/MM/YYYY")}</Text>
                            }
                            <TouchableOpacity onPress={() => { openDrawer() }} >
                                <Image source={require('../assets/images/filter1.png')}
                                    style={{ resizeMode: 'contain', marginRight: 15, tintColor: iconColor, height: 16.39, width: 18.21 }} />
                            </TouchableOpacity>
                        </View>
                    }
                />

                <View style={{ flex: 1, backgroundColor: whiteColor }}>
                    {/* {renderFilters()} */}
                    {myHistoryData ? <FlatList
                        data={myHistoryData}
                        renderItem={renderItem}
                        contentContainerStyle={{ flexGrow: 1 }}
                        ListFooterComponent={renderFooter}
                        onEndReached={onEndReached}
                        onEndReachedThreshold={0.5}

                        refreshControl={<RefreshControl onRefresh={() => {
                            if (!loading) {
                                // setFromDate(week)
                                setRefreshing(true);

                                console.log("refreshing***************");
                                webCallAttendanceHistory(employeeId, true)
                                    .then(() => { setRefreshing(false) })
                                    .catch(() => { setRefreshing(false) });
                            }
                        }
                        }
                            refreshing={refreshing} colors={[blueColor]} tintColor={blueColor}
                        />}
                        ListEmptyComponent={
                            (isLoading) ? null : <Text style={style.emptyComponent}>No records available.</Text>
                        }
/*
                    ListFooterComponent={
                        (attendanceArray.length < totalCount) ? <TouchableOpacity style={{ margin: 10, backgroundColor: blueColor, borderRadius: 10, }}
                            onPress={() => {
                                setSkipRecord(skipRecord + limitRecord)

                            }
                            }
                        >
                            <Text style={{ color: 'white', padding: 10, alignSelf: 'center', fontFamily: 'Rubik-Regular' }}>View More</Text>
                        </TouchableOpacity> : null
                    }
                    keyExtractor={item => item._id} */ /> :
                        <View style={{ justifyContent: 'center', flex: 1 }}>
                            <ActivityIndicator
                                animating={true}
                                color='#4386F4'
                                size="large" /></View>}
                </View>
            </DrawerLayout>
        </SafeAreaView>
    );

}
export default AttendanceHistory
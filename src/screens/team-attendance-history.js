import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Platform,
    Dimensions,
    TextInput,
    StyleSheet,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { NavigationBar } from 'navigationbar-react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList } from 'react-native-gesture-handler'
import DateTimePicker from 'react-native-date-picker';
import { style } from '../styles/style'
import { whiteColor, blueColor, iconColor, inputBgColor, grayColor } from '../styles/color'
import Moment from 'moment'
import { apiAttendanceReport } from '../actions'
import { useDispatch, useSelector } from 'react-redux'
import { utils } from '../utils/utils';
import Loader from '../components/loader'
import { uploadUrl } from '../webservice/constant';
import moment from 'moment';
import { api } from '../webservice/api';
import { apiUrl } from '../webservice/constant';
import DrawerLayout from 'react-native-gesture-handler/DrawerLayout'
import BlueButton from '../components/blue-button';
import { Dropdown } from 'react-native-element-dropdown';

const TeamAttendanceHistory = ({ navigation }) => {
    var yesterDay = new Date(); // today!
    yesterDay.setDate(yesterDay.getDate() - 1);//yesterday
    var week = new Date();
    week.setDate(week.getDate() - 7);

    const drawerRef = useRef(null)

    const limitRecord = 20;
    const [fromDate, setFromDate] = useState(week);
    const [toDate, setToDate] = useState(yesterDay);
    const searchEmployeeRef = useRef(null)
    const [showFromDate, setShowFromDate] = useState(false);
    const [showToDate, setShowToDate] = useState(false);
    const [resetFilter, setResetFilter] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [skipRecord, setSkipRecord] = useState(0);
    const [searchCount, setSearchCount] = useState(0)
    const [attendanceArray, setAttendanceArray] = useState([]);
    let resAttendanceReport = useSelector(state => state.resAttendanceReport)
    const isLoading = useSelector(state => state.loading)
    const dispatch = useDispatch()
    const [apiData, setapiData] = useState();
    const [apiDate, setapiDate] = useState();
    const [flatlistDate, setFlatlistDate] = useState()
    const [nameForFilter, setNameForFilter] = useState('')

    const [employeeList, setEmployeeList] = useState([]);
    const [empIdForFilter, setEmpIdForFilter] = useState('');
    const [isFocus, setIsFocus] = useState(false);

    /* paging */
    const [skip, setSkip] = useState(0);
    const LIMIT = 20;
    const [hasMorePages, setHasMorePages] = useState(false);
    const loadingNextPageRef = React.useRef(false);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        console.log("*************UseEffect SKIP")
        empId = navigation.getParam('eId');
        if (skip > 0) {
            teamHistory(false)
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

    const teamHistory = (refresh = false) => {
        setLoading(true);
        return new Promise((resolve, reject) => {
            let payload = {
                "skip": refresh ? 0 : skip,
                "limit": 20,
                "sortBy": "name",
                "sort": "asc",
                "filter": { "fromDate": fromDate, "toDate": toDate, "employee": empIdForFilter }
            }
            let urlForTeamAttendanceHistory = `${"/api/cms/attendance-report/team/list"}`
            api.postWithPayloadwithToken(urlForTeamAttendanceHistory, payload).then((responseData) => {
                if (responseData && responseData.success) {
                    console.log('>>>>>>>>>>>????team history', (responseData))
                    setapiDate(responseData.dates)
                    // setapiData(responseData.list)

                    if (refresh) {
                        setSkip(0);
                    }

                    let tempArray = [];

                    if (refresh) {
                        tempArray.push(...responseData.list);
                        //setMyTeamData(jsonResponse?.list);
                    }
                    else {
                        if (apiData) tempArray.push(...apiData);
                        tempArray.push(...responseData.list);
                        //setMyTeamData(myTeamData.concat(jsonResponse?.list));
                    }

                    setapiData(tempArray);
                    setHasMorePages(responseData.list.length >= LIMIT);
                    // if (jsonResponse.list.length < LIMIT)
                    console.log("MyTeam Success Message", responseData);
                    resolve();
                }
                else {
                    setapiData()
                    reject(responseData.message ?? "Something went wrong!!");

                }
                setLoading(false);
            }).catch(async (error) => {
                setLoading(false)
                console.log("MyTeam Error Message ***", "Something went wrong!!", error);
                reject(error);
            })
        });
        // })
        //     .catch(function (error) {
        //         setapiData()
        //         console.log(JSON.stringify(error))
        //     });
    }
    useEffect(() => {
        teamHistory(true);
        teamMemberList(null);
    }, []);

    const openDrawer = () => {
        drawerRef.current.openDrawer()
    }

    const closeDrawer = () => {
        drawerRef.current.closeDrawer()
    }
    // useEffect(() => {
    //     resAttendanceReport = null
    //     wsAttendaceReport()
    // }, [])

    // useEffect(() => {
    //     if (skipRecord > 0) {
    //         wsAttendaceReport()
    //     }
    // }, [skipRecord])

    // useEffect(() => {
    //     if (resetFilter) {
    //         wsAttendaceReport()
    //         setResetFilter(false)
    //     }
    // }, [resetFilter])
    // useEffect(() => {
    //     if (resAttendanceReport && resAttendanceReport.success) {
    //         setTotalCount(resAttendanceReport.count)
    //         let array = [...attendanceArray, ...resAttendanceReport.list];
    //         setAttendanceArray(array)
    //     }
    // }, [resAttendanceReport])

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
    const searchEmployee = (text) => {
        (text.length > 2 && searchCount > 21) ? (
            teamMemberList(text)
        ) : null
    }

    const teamMemberList = (text) => {
        let data;
        text == null ? data = {
            "sortBy": "name",
            "sort": "asc",
            // "filter": {
            //     "employee": empId,
            //     "fromDate": Moment(fromDate).format('YYYY-MM-DD'),
            //     "toDate": Moment(toDate).format('YYYY-MM-DD')
            // }}
        } : data = {
            "sortBy": "name",
            "sort": "asc",
            "q": text
        }
        let team_attendance_list = `${apiUrl}${"/api/cms/employees/search"}`
        api.postWithTokenNew(team_attendance_list, data).then(async (jsonResponse) => {

            if (jsonResponse.success) {
                if (jsonResponse?.list?.length > 0) {
                    searchCount == 0 && setSearchCount(jsonResponse.count)
                    // if (jsonResponse.count < 20 || text != null)
                    if (jsonResponse.count < 20)
                        setEmployeeList(jsonResponse?.list)
                }

                let jsonData = JSON.stringify(jsonResponse)
                console.log("team list Success Message", jsonData);

            } else {
                console.log("team list Error Message **", jsonResponse.message ?? "Something went wrong!!");
            }
        }).catch(async (error) => {
            setLoading(false)
            console.log("team list Error Message ***", "Something went wrong!!");
        })
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
                fromDate: Moment(fromDate).format('YYYY-MM-DD'),
                toDate: Moment(toDate).format('YYYY-MM-DD'),
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
                        <Text style={[style.inputTextDate,]}>{Moment(fromDate).format('DD/MM/YYYY')}</Text>
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
                        <Text style={[style.inputTextDate,]}>{Moment(toDate).format('DD/MM/YYYY')}</Text>
                        <Image source={require('../assets/images/date.png')} />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={async () => {
                    // await setAttendanceArray([])
                    // await setSkipRecord(0)
                    // await setTotalCount(0)
                    // await setResetFilter(true)
                    await teamHistory();
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
        <TouchableOpacity onPress={() => navigation.navigate('AttendanceHistoryDetail', { date: item.dateStr })}>
            <View style={[style.cardWhite, { margin: 10, flexDirection: 'row' }]}>
                {console.log("team history list:", item)}
                {/* <View style={{ marginVertical: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={style.blueTextBold}>{Moment(item.dateStr, 'YYYY-MM-DD').format('ddd, MMM DD, YYYY')}</Text>
                    <View>
                        <Text style={[style.grayText,]}>Working Hours</Text>
                        <Text style={[style.darkGrayText,]}>{utils.secondsToHm(item.stayTime)}</Text>
                    </View>
                </View>
                <View style={{ marginVertical: 5, flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image source={getModeIcon(item.inMode)}
                            style={{ marginRight: 10, tintColor: iconColor }} />
                        <View>
                            <Text style={[style.grayText,]}>Check In</Text>
                            <View style={{ flexDirection: 'row', marginTop: 3, justifyContent: 'space-between' }}>
                                <Text style={[style.darkGrayText, { marginRight: 5 }]}>{utils.formatTime(item.inTime)}</Text>
                                <Image source={(item.isMaskIn) ? require('../assets/images/Mask.png') : require('../assets/images/unmask.png')} />
                            </View>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image source={getModeIcon(item.outMode)}
                            style={{ marginRight: 10, tintColor: iconColor }} />
                        <View>
                            <Text style={[style.grayText,]}>Check Out</Text>
                            <View style={{ flexDirection: 'row', marginTop: 3, justifyContent: 'space-between' }}>
                                <Text style={[style.darkGrayText, { marginRight: 5 }]}>{utils.formatTime(item.outTime)}</Text>
                                <Image source={(item.isMaskOut) ? require('../assets/images/Mask.png') : require('../assets/images/unmask.png')} />
                            </View>
                        </View>
                    </View>

                </View> */}

                {/* {(item.image) ?
                    <Image source={{ uri: uploadUrl + item.image }}
                        style={{ width: 92, height: 106, borderRadius: 10, resizeMode: 'cover' }} />
                    : <Image source={require('../assets/images/Employee-Time.png')}
                        style={{ width: 92, height: 106, borderRadius: 10, resizeMode: 'stretch' }} />
                } */}
                <View style={{ marginLeft: 15, flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 14, fontFamily: 'Rubik-SemiBold', color: '#000000', }}>John Smith</Text>
                        {/* <Text style={{ fontSize: 12, fontFamily: 'Rubik-Regular', color: '#363636' }}>{moment(item.inTime).format("DD/MM/YYYY")}</Text> */}
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: "space-between" }}>
                        <View style={{ marginTop: 7.74, }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: '#9496A1' }}>In: </Text>
                                {/* <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: "#00B164" }}>{utils.formatTime(item.inTime)}</Text> */}
                            </View>
                            <View style={{ marginTop: 10.26 }}>
                                <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: '#9496A1' }}>Spent Hours</Text>
                                {/* <Text style={{ fontSize: 15, fontFamily: 'Rubik-Regular', color: '#0E5CF0', marginTop: 7 }}>{utils.secondsToHm(item.stayTime)}</Text> */}
                            </View>
                        </View>

                        <View style={{ justifyContent: 'space-between', marginTop: 10.26 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: '#9496A1' }}>Out: </Text>
                                {/* <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: "#F74A49" }}>{utils.formatTime(item.outTime)}</Text> */}
                            </View>


                            <View style={{ marginTop: 10.26 }}>
                                <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: '#9496A1' }}>Total Hours</Text>
                                {/* <Text style={{ fontSize: 15, fontFamily: 'Rubik-Regular', color: '#0E5CF0', marginTop: 7 }}>{utils.secondsToHm(item.totalTime)}</Text> */}
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
                            <View style={[style.inputContainer, { borderRadius: 9, justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 10 }]}>
                                <Text style={[style.inputTextDate,]}>{Moment(fromDate).format('DD/MM/YYYY')}</Text>
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
                            <View style={[style.inputContainer, { borderRadius: 9, justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 10 }]}>
                                <Text style={[style.inputTextDate,]}>{Moment(toDate).format('DD/MM/YYYY')}</Text>
                                <Image source={require('../assets/images/date.png')} />
                            </View>
                        </TouchableOpacity>
                    </View>
                    <Dropdown
                        ref={searchEmployeeRef}
                        style={[styles.dropdown, /* isFocus && { borderColor: 'blue' } */]}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={style.inputTextDate}
                        inputSearchStyle={styles.inputSearchStyle}
                        iconStyle={styles.iconStyle}
                        data={employeeList ?? []}
                        search={searchCount > 4}
                        maxHeight={300}
                        containerStyle={styles.containerStyle}
                        statusBarIsTranslucent={true}
                        labelField='name'
                        valueField='_id'
                        placeholder={'--Select Employee--'}
                        searchPlaceholder="Search..."
                        value={employeeList}
                        onFocus={() => { setIsFocus(true); searchCount > 20 && setEmployeeList([]) }}
                        onBlur={() => setIsFocus(false)}
                        onChange={value => {
                            setEmpIdForFilter(value._id)
                        }}
                        onChangeText={searchEmployee}
                    />
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
                            setapiData(null)
                            await teamHistory(true);
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
                        <View style={{ alignItems: 'flex-start', marginLeft: 5 }}>
                            <TouchableOpacity style={{ justifyContent: 'center', flexDirection: 'row' }} onPress={() => navigation.goBack(null)}>
                                <Image source={require('../assets/images/back.png')}
                                    style={style.backIcon1} />
                                <Text style={style.headerText}>Team History</Text>
                            </TouchableOpacity>
                        </View>
                    }
                    componentRight={() =>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            {fromDate == toDate ?
                                <Text style={{ fontSize: 12, fontFamily: 'Rubik-Regular', color: '#FFFFFF', marginRight: 11.7 }}>{moment(fromDate).format("DD/MM/YYYY")}</Text>

                                :
                                <Text style={{ fontSize: 12, fontFamily: 'Rubik-Regular', color: '#FFFFFF', marginRight: 11.7 }}>{moment(fromDate).format("DD/MM/YYYY")} to {moment(toDate).format("DD/MM/YYYY")}</Text>
                            }
                            <TouchableOpacity onPress={() => { openDrawer() }} >
                                <Image source={require('../assets/images/filter1.png')}
                                    style={{ resizeMode: 'contain', marginRight: 10, tintColor: iconColor, height: 16.39, width: 18.21 }} />
                            </TouchableOpacity>
                        </View>
                    }
                />


                <View style={{ flex: 1, backgroundColor: whiteColor }}>
                    {/* {renderFilters()} */}
                    {/* <FlatList
                    data={attendanceArray}
                    renderItem={renderItem}
                    contentContainerStyle={{ flexGrow: 1 }}
                    ListEmptyComponent={
                        (isLoading) ? null : <Text style={style.emptyComponent}>No records available.</Text>
                    }

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
                    keyExtractor={item => item._id} /> */}
                    {apiData ? <FlatList
                        data={apiDate}
                        renderItem={({ item }) => {
                            let filteredData = apiData.filter((e) => e.dateStr == item);
                            return (
                                filteredData.length == 0 ? null :
                                    <View>
                                        {setFlatlistDate(item)}
                                        <Text></Text>
                                        <Text style={{ fontSize: 12, fontFamily: 'Rubik-Regular', color: '#D1D1D1', alignSelf: 'center' }}>{Moment(item, 'YYYY-MM-DD').format("DD/MM/YYYY")}</Text>
                                        {/* <Text></Text> */}
                                        {console.log(item)}

                                        {filteredData.map((e) => (
                                            <TouchableOpacity onPress={() => {
                                                navigation.navigate('TeamAttendance', { fromWhere: "AttendanceHistory", empid: e.employee, historyDate: e.dateStr })
                                            }}>
                                                <View style={[style.cardWhite, { margin: 10, flexDirection: 'row' }]}>
                                                    {console.log("teaml", e)}
                                                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                                        {(e.image) ?
                                                            <Image source={{ uri: uploadUrl + item.image }}
                                                                /*  style={{ width: 92, height: 106, borderRadius: 10, resizeMode: 'cover' }} */
                                                                style={{ width: 70, height: 70, borderRadius: 100, resizeMode: "stretch", }} />
                                                            : <Image source={require('../assets/images/Employee-Time.png')}
                                                                /* style={{ width: 92, height: 106, borderRadius: 10, resizeMode: 'stretch' }} */
                                                                style={{ width: 70, height: 70, borderRadius: 100, resizeMode: "stretch", }} />
                                                        }
                                                    </View>
                                                    <View style={{ marginLeft: 15, flex: 1 }}>
                                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                                                            <Text style={{ fontSize: 14, fontFamily: 'Rubik-SemiBold', color: '#000000', width: '68%' }} adjustsFontToFit={true} numberOfLines={1}>{e && e.employeeData && e.employeeData.name}</Text>
                                                            <Text style={{ fontSize: 12, fontFamily: 'Rubik-Regular', color: '#363636' }}>{moment(e.dateStr, 'YYYY-MM-DD').format('DD/MM/YYYY')}</Text>
                                                        </View>
                                                        <View style={{ flexDirection: 'row', justifyContent: "space-between" }}>
                                                            <View style={{ marginTop: 7.74, }}>
                                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                                    <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: '#9496A1' }}>In: </Text>
                                                                    <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: "#00B164" }}>{e.isAbsent && e.inTime == null ? null : moment(e.inTime).format("h:mm:ss A")}</Text>
                                                                </View>
                                                                <View style={{ marginTop: 10.26 }}>
                                                                    <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: '#9496A1' }}>Spent Hours</Text>
                                                                    <Text style={{ fontSize: 15, fontFamily: 'Rubik-Regular', color: '#0E5CF0', marginTop: 7 }}>{utils.secondsToHm(e.stayTime)}</Text>
                                                                </View>
                                                            </View>

                                                            <View style={{ justifyContent: 'space-between', marginTop: 10.26 }}>
                                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                                    <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: '#9496A1' }}>Out: </Text>
                                                                    <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: "#F74A49" }}>{e.isAbsent && e.outTime == null ? null : moment(e.outTime).format("h:mm:ss A")}</Text>
                                                                </View>


                                                                <View style={{ marginTop: 10.26 }}>
                                                                    <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: '#9496A1' }}>Total Hours</Text>
                                                                    <Text style={{ fontSize: 15, fontFamily: 'Rubik-Regular', color: '#0E5CF0', marginTop: 7 }}>{utils.secondsToHm(e.totalTime)}</Text>
                                                                </View>
                                                            </View>
                                                        </View>
                                                    </View>
                                                </View>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                            )
                        }}
                        ListFooterComponent={renderFooter}
                        onEndReached={onEndReached}
                        //refreshControl={<RefreshControl></RefreshControl>}
                        ListEmptyComponent={
                            <Text style={{ ...style.emptyComponent, paddingTop: '50%' }}>No records available.</Text>
                        }
                        // onEndReachedThreshold={0.5}
                        refreshControl={<RefreshControl onRefresh={() => {
                            if (!loading) {
                                // setFromDate(week)
                                setRefreshing(true);

                                console.log("refreshing***************");
                                teamHistory(true)
                                    .then(() => { setRefreshing(false) })
                                    .catch(() => { setRefreshing(false) });
                                // setTimeout(() => {
                                //     setRefreshing(false)
                                // }, 5000);
                            }
                        }
                        }
                            refreshing={refreshing} colors={[blueColor]} tintColor={blueColor}
                        />}
                        keyExtractor={(item, index) => index}
                    /> :
                        <View style={{ justifyContent: 'center', flex: 1 }}>
                            <ActivityIndicator
                                animating={true}
                                color='#4386F4'
                                size="large" /></View>}
                    {/* <Loader visible={isLoading} /> */}
                </View>
            </DrawerLayout>
        </SafeAreaView>
    );

}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        padding: 10,
        marginBottom: 70
    },
    dropdown: {
        height: 50,
        borderColor: '#D1D1D1',
        borderWidth: 1.5,
        borderRadius: 8,
        paddingHorizontal: 8,
        marginTop: 10,
        marginBottom: 7,
        backgroundColor: inputBgColor
    },
    icon: {
        marginRight: 5,
    },
    label: {
        position: 'absolute',
        backgroundColor: 'white',
        left: 22,
        top: 8,
        zIndex: 999,
        paddingHorizontal: 8,
        fontSize: 14,
    },
    placeholderStyle: {
        fontSize: 16,
        color: grayColor
    },
    selectedTextStyle: {
        fontSize: 16,
        color: 'black',
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    inputSearchStyle: {
        height: 50,
        fontSize: 16,
        borderRadius: 8,
        backgroundColor: inputBgColor
    },
    header: {
        fontSize: 20,
        color: 'blue'
    },
    containerStyle: {
        marginTop: -24,
        borderRadius: 8,
    }
});
export default TeamAttendanceHistory
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

const VisitorAttendanceHistory = ({ navigation }) => {
    var yesterDay = new Date(); // today!
    yesterDay.setDate(yesterDay.getDate() - 1);//yesterday
    var week = new Date();
    week.setDate(week.getDate() - 90);

    const drawerRef = useRef(null)
    let tempDate;
    let temp;
    const [fromDate, setFromDate] = useState(week);
    const [toDate, setToDate] = useState(yesterDay);
    const searchEmployeeRef = useRef(null)
    const [showFromDate, setShowFromDate] = useState(false);
    const [showToDate, setShowToDate] = useState(false);
    const [searchCount, setSearchCount] = useState(0)
    const [apiData, setapiData] = useState();
    const [apiDate, setapiDate] = useState();

    const [employeeList, setEmployeeList] = useState([]);
    const [empIdForFilter, setEmpIdForFilter] = useState('');

    /* paging */
    const [skip, setSkip] = useState(0);
    const LIMIT = 20;
    const [hasMorePages, setHasMorePages] = useState(false);
    const loadingNextPageRef = React.useRef(false);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        console.log("*************UseEffect SKIP")
        if (skip > 0) {
            visitorHistory(false)
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

    const visitorHistory = (refresh = false) => {
        setLoading(true);
        return new Promise((resolve, reject) => {
            let payload = {
                "skip": refresh ? 0 : skip,
                "limit": 20,
                "sortBy": "name",
                "sort": "asc",
                "filter": { "fromDate": fromDate, "toDate": toDate, "employee": empIdForFilter }
            }
            let urlForVisitorAttendanceHistory = `${"/api/cms/visitor-report/list"}`
            api.postWithPayloadwithToken(urlForVisitorAttendanceHistory, payload).then((responseData) => {
                if (responseData?.success) {
                    console.log('>>>>>>>>>>>????visitor history', (responseData))
                    setapiDate(responseData?.dateRange)
                    // setapiData(responseData.list)

                    if (refresh) {
                        setSkip(0);
                    }

                    let tempArray = [];

                    if (refresh) {
                        tempArray.push(...responseData?.list);
                        //setMyTeamData(jsonResponse?.list);
                    }
                    else {
                        if (apiData) tempArray.push(...apiData);
                        tempArray.push(...responseData?.list);
                        //setMyTeamData(myTeamData.concat(jsonResponse?.list));
                    }

                    setapiData(tempArray);
                    setHasMorePages(responseData?.list?.length >= LIMIT);
                    // if (jsonResponse.list.length < LIMIT)
                    console.log("MyVisitor Success Message", responseData);
                    resolve();
                }
                else {
                    setapiData()
                    reject(responseData.message ?? "Something went wrong!!");

                }
                setLoading(false);
            }).catch(async (error) => {
                setLoading(false)
                console.log("MyVisitor Error Message ***", "Something went wrong!!", error);
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
        visitorHistory(true);
        visitorMemberList(null);
    }, []);

    const openDrawer = () => {
        drawerRef.current.openDrawer()
    }

    const closeDrawer = () => {
        drawerRef.current.closeDrawer()
    }

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
            visitorMemberList(text)
        ) : null
    }

    const visitorMemberList = (text) => {
        let data;
        text == null ? data = {
            "sortBy": "name",
            "sort": "asc",
        } : data = {
            "sortBy": "name",
            "sort": "asc",
            "q": text
        }
        let visitor_attendance_list = `${apiUrl}${"/api/cms/visitors/search"}`
        api.postWithTokenNew(visitor_attendance_list, data).then(async (jsonResponse) => {

            if (jsonResponse.success) {
                if (jsonResponse?.list?.length > 0) {
                    searchCount == 0 && setSearchCount(jsonResponse.count)
                    // if (jsonResponse.count < 20 || text != null)
                    if (jsonResponse.count < 20)
                        setEmployeeList(jsonResponse?.list)
                }

                let jsonData = JSON.stringify(jsonResponse)
                console.log("Visitor list Success Message", jsonData);

            } else {
                console.log("Visitor list Error Message **", jsonResponse.message ?? "Something went wrong!!");
            }
        }).catch(async (error) => {
            setLoading(false)
            console.log("Visitor list Error Message ***", "Something went wrong!!");
        })
    };


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
                    await visitorHistory();
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
                        style={[styles.dropdown]}
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
                        onFocus={() => { searchCount > 20 && setEmployeeList([]) }}
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
                            await visitorHistory(true);
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
                                <Text style={style.headerText}>Visitor History</Text>
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
                    {apiData ? <FlatList
                        data={apiData}
                        renderItem={({ item }) => {

                            let filteredData = apiDate.filter((e) => e == item.dateStr);
                            tempDate != item.dateStr ? (tempDate = item.dateStr, temp = true) : (temp = false);
                            return (
                                filteredData.length == 0 ? null :
                                    <View style={{ marginTop: 10 }}>
                                        {temp && <Text style={{ fontSize: 12, fontFamily: 'Rubik-Regular', color: '#D1D1D1', alignSelf: 'center' }}>{Moment(item.dateStr, 'YYYY-MM-DD').format("DD/MM/YYYY")}</Text>
                                        }{/* <Text></Text> */}

                                        {filteredData.map((e) => (
                                            <TouchableOpacity onPress={() => {
                                                navigation.navigate('VisitorAttendance', { fromWhere: "VisitorHistory", empid: item?._id, historyDate: item?.dateStr })
                                            }}>
                                                {/* {console.log("render data list" + item)} */}
                                                <View style={[style.cardWhite, { margin: 10, flexDirection: 'row' }]}>
                                                    {/* {console.log("visitorlist", e)} */}
                                                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                                        {(item.image) ?
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
                                                            <Text style={{ fontSize: 14, fontFamily: 'Rubik-SemiBold', color: '#000000', width: '68%' }} adjustsFontToFit={true} numberOfLines={1}>{item?.employeeData?.name}</Text>
                                                            <Text style={{ fontSize: 12, fontFamily: 'Rubik-Regular', color: '#363636' }}>{moment(item.dateStr, 'YYYY-MM-DD').format('DD/MM/YYYY')}</Text>
                                                        </View>
                                                        <View style={{ flexDirection: 'row', justifyContent: "space-between" }}>
                                                            <View style={{ marginTop: 7.74, }}>
                                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                                    <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: '#9496A1' }}>In: </Text>
                                                                    <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: "#00B164" }}>{item.isAbsent && item.inTime == null ? null : moment(item.inTime).format("h:mm:ss A")}</Text>
                                                                </View>
                                                                <View style={{ marginTop: 10.26 }}>
                                                                    <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: '#9496A1' }}>Spent Hours</Text>
                                                                    <Text style={{ fontSize: 15, fontFamily: 'Rubik-Regular', color: '#0E5CF0', marginTop: 7 }}>{utils.secondsToHm(item.stayTime)}</Text>
                                                                </View>
                                                            </View>

                                                            <View style={{ justifyContent: 'space-between', marginTop: 10.26 }}>
                                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                                    <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: '#9496A1' }}>Out: </Text>
                                                                    <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: "#F74A49" }}>{item.isAbsent && item.outTime == null ? null : moment(item.outTime).format("h:mm:ss A")}</Text>
                                                                </View>


                                                                <View style={{ marginTop: 10.26 }}>
                                                                    <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: '#9496A1' }}>Total Hours</Text>
                                                                    <Text style={{ fontSize: 15, fontFamily: 'Rubik-Regular', color: '#0E5CF0', marginTop: 7 }}>{utils.secondsToHm(item.totalTime)}</Text>
                                                                </View>
                                                            </View>
                                                        </View>
                                                    </View>




                                                    {/*                                                     <View style={{ marginLeft: 15, flex: 1 }}>
                                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                                                            <Text style={{ fontSize: 14, fontFamily: 'Rubik-SemiBold', color: '#000000', width: '68%' }} adjustsFontToFit={true} numberOfLines={1}>{e?.employee?.name}</Text>
                                                            <Text style={{ fontSize: 12, fontFamily: 'Rubik-Regular', color: '#363636' }}>{moment(e.time, 'YYYY-MM-DD').format('DD/MM/YYYY')}</Text>
                                                        </View>
                                                        <View style={{ flexDirection: 'row', justifyContent: "space-between" }}>
                                                            <View style={{ marginTop: 7.74, }}>
                                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                                    <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: '#9496A1' }}>In: </Text>
                                                                    <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: "#00B164" }}>{e?.authType === "in" ? moment(e?.time).format("h:mm:ss A") : null}</Text>
                                                                </View>
                                                                <View style={{ marginTop: 10.26 }}>
                                                                    <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: '#9496A1' }}>Spent Hours</Text>
                                                                    <Text style={{ fontSize: 15, fontFamily: 'Rubik-Regular', color: '#0E5CF0', marginTop: 7 }}>{utils.secondsToHm(e.stayTime)}</Text>
                                                                </View>
                                                            </View>

                                                            <View style={{ justifyContent: 'space-between', marginTop: 10.26 }}>
                                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                                    <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: '#9496A1' }}>Out: </Text>
                                                                    <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: "#F74A49" }}>{e?.authType === "out" ? moment(e?.time).format("h:mm:ss A") : null}</Text>
                                                                </View>

                                                                <View style={{ marginTop: 10.26 }}>
                                                                    <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: '#9496A1' }}>Total Hours</Text>
                                                                    <Text style={{ fontSize: 15, fontFamily: 'Rubik-Regular', color: '#0E5CF0', marginTop: 7 }}>{utils.secondsToHm(e.totalTime)}</Text>
                                                                </View>
                                                            </View>
                                                        </View>
                                                    </View> */}
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
                                visitorHistory(true)
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
export default VisitorAttendanceHistory
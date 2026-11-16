import React, { useRef, useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Dimensions,
    StyleSheet,
    Modal,
    TextInput,
    FlatList,
    RefreshControl,
    ActivityIndicator
} from 'react-native';
import { NavigationBar } from 'navigationbar-react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
// import { FlatList } from 'react-native-gesture-handler';
import DrawerLayout from 'react-native-gesture-handler/DrawerLayout'
import { style } from '../styles/style'
import { menuHeaderColor, whiteColor, blueColor, dropdownBaseColor, iconColor, borderColor, grayColor, inputBgColor } from '../styles/color'
import TopCurve from '../components/top-curve';
import BlueButton from '../components/blue-button';
import { apiRequestList, apiTeamLeaveList } from '../actions'
import { useDispatch, useSelector } from 'react-redux'
import { utils } from '../utils/utils';
import { ResourceArray, TEAM_ATTENDANCE_LIST, apiUrl, uploadUrl } from '../webservice/constant'

import { TabView, TabBar, SceneMap } from 'react-native-tab-view'
import moment from 'moment';
import CheckBox from '@react-native-community/checkbox'
import DateTimePicker from 'react-native-date-picker';
import Loader from '../components/loader';
import { api } from '../webservice/api';
import { Dropdown } from 'react-native-element-dropdown';


const MyRequest = (props) => {

    const drawerRef = useRef(null)
    const dropdownLeave = useRef(null)
    const [requestStatus, setRequestStatus] = useState('');
    const [requestArray, setRequestArray] = useState([])
    const [filteredArray, setFilteredArray] = useState([])
    let resRequestList = useSelector(state => state.resRequestList)
    let isLoading = useSelector(state => state.loading)
    const dispatch = useDispatch()

    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());
    const [myTeamHistoryData, setMyTeamHistoryData] = useState([]);
    const [isFocus, setIsFocus] = useState(false);
    const [dropdownvalue, setdropdownvalue] = useState('')
    const [requestTypeList, setRequestTypeList] = useState([]);
    const [requestType, setRequestType] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [totalRequest, setTotalRequest] = useState(-1);
    let limit = 20;
    const [skip, setSkip] = useState(0);
    const [apiCallAvailable, setApiCallAvailable] = useState(true)
    const [loaderVisible, setLoaderVisible] = useState(false);
    const [hasMorePages, setHasMorePages] = useState(false)
    // useEffect(() => {
    //     if (resRequestList && resRequestList.success) {
    //         setRefreshing(false)
    //         setRequestArray(resRequestList.list)
    //         setFilteredArray(resRequestList.list)
    //     }
    // }, [resRequestList])

    useEffect(() => {
        resRequestList = null
        const unmount = props.navigation.addListener("didFocus", () => {
            // wsRequestList()
            RequestList()
            wcRequestTypeList()
        });

        return () => {
            unmount.remove();
        };
    }, [])
    useEffect(() => {
        console.log("*************onEndReached SKIP update asaasaas", skip, skip <= totalRequest);
        if (skip > 0 && skip <= totalRequest) {
            console.log("*************onEndReached SKIP update", skip, skip <= totalRequest);
            RequestList(false, skip, true)
        }
    }, [skip])
    const onEndReached = () => {
        console.log("*************onEndReached SKIP", skip, totalRequest);
        if (apiCallAvailable && skip <= totalRequest) {
            setSkip(skip + limit);
        } else {

        }
    }
    const renderFooter = () => {
        return (hasMorePages && filteredArray.length) ? <View style={{ alignItems: 'center', padding: 20 }}>
            <ActivityIndicator
                animating={true}
                color='#4386F4'
                size="large" />
        </View> : null;
    };
    const RequestList = (refresh = false, skipForFilter = skip, lodershow = false) => {
        if (!lodershow) {
            setLoaderVisible(true)
        }
        setApiCallAvailable(false)
        if (refresh || skipForFilter == 0) {
            setFilteredArray([])
            setRequestArray([])
        }
        let requestTypeList = "/api/cms/mobile/request-list"
        let data = { skip: refresh ? 0 : skipForFilter, limit: limit, sortBy: "createdAt", sort: "desc", filter: { requestType: refresh ? "" : requestType, requestStatus: refresh ? "" : requestStatus } }
        api.postWithPayloadwithToken(requestTypeList, data).then(async (jsonResponse) => {
            if (jsonResponse.success) {
                if (refresh || skipForFilter == 0) {
                    setSkip(0);
                }
                setHasMorePages(jsonResponse?.list?.length >= limit);
                let tempArray = [];
                let jsonData = JSON.stringify(jsonResponse)
                console.log("RequestList Success Message", jsonData);
                setTotalRequest(jsonResponse.count)
                // setFilteredArray(jsonResponse?.list)
                // setRequestArray(jsonResponse.list)
                if (refresh || skipForFilter == 0) {
                    tempArray.push(...jsonResponse?.list);
                }
                else {
                    if (filteredArray) tempArray.push(...filteredArray);
                    tempArray.push(...jsonResponse?.list);
                }
                setFilteredArray(tempArray);
                setRequestArray(tempArray);
                setRefreshing(false);
                // filteredArray.push(...jsonResponse?.list)
                // requestArray.push(...jsonResponse?.list)
                setApiCallAvailable(true)
                setLoaderVisible(false)
            } else {
                setApiCallAvailable(true)
                setRefreshing(false)
                setLoaderVisible(false)
                console.log("RequestList Error Message **", jsonResponse?.message ?? "Something went wrong!!");
            }
        }).catch(async (error) => {
            setRefreshing(false)
            setLoaderVisible(false)
            console.log("RequestList Error Message ***", "Something went wrong!!");
        })
    };


    const wcRequestTypeList = () => {

        let requestTypeList = `${apiUrl}${"/api/cms/request/type/list"}`
        api.postWithTokenNew(requestTypeList, {
        }).then(async (jsonResponse) => {

            if (jsonResponse.success) {

                let jsonData = JSON.stringify(jsonResponse)
                console.log("RequestTypeList Success Message", jsonData);
                setRequestTypeList(jsonResponse?.list)
            } else {
                console.log("RequestTypeList Error Message **", jsonResponse.message ?? "Something went wrong!!");
            }
        }).catch(async (error) => {
            console.log("RequestTypeList Error Message ***", "Something went wrong!!");
        })
    };

    // Reset Filter
    useEffect(() => {
        if (requestStatus === '') {
            filterRequest()
        }
    }, [requestStatus])



    const renderItem = ({ item }) => (
        // <TouchableOpacity onPress={() => {
        //     // navigation.navigate('AttendanceDetail', { attendanceItem: item })
        // }}>
        // {console.log("item111", item)}
        <View style={{ ...style.cardWhite, padding: 14, marginVertical: 7.5, borderRadius: 8, backgroundColor: '#FFFFFF', marginHorizontal: 18, flexDirection: 'row' }}>
            {/* {console.log("item111", item)} */}
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                {(item && item.auth && item.auth.image) ?
                    <Image source={{ uri: uploadUrl + item.auth.image }}
                        /* style={{ width: 92, height: 118, borderRadius: 10, resizeMode: 'cover'  */
                        style={{ width: 70, height: 70, borderRadius: 100, resizeMode: "stretch" }} />
                    : <Image source={require('../assets/images/Employee-Time.png')}
                        /* style={{ width: 92, height: 118, borderRadius: 10, resizeMode: 'contain' }} */
                        style={{ width: 70, height: 70, borderRadius: 100, resizeMode: "stretch" }} />
                }
            </View>
            <View style={{ marginLeft: 9, flex: 1 }}>

                <Text style={{ fontSize: 14, fontFamily: 'Rubik-SemiBold', color: '#000000', width: "70%" }} adjustsFontToFit={true} numberOfLines={1}>{item?.name?.name}</Text>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4, }}>

                    {
                        item?.requestType === 'attendancechangerequest' ?
                            <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                <Image source={require('../assets/images/watch.png')} style={{ height: 12, width: 12, marginRight: 6.67 }} />
                                <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: item?.auth?.authType === 'in' ? "#00B164" : "#FF2037" }}>{(item?.auth?.authType === 'in') ? 'In Time' : 'Out Time'}</Text>
                            </View>
                            : <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: blueColor }}>{getRequestType(item?.requestType)}</Text>
                            </View>
                    }

                    <View style={{}}>
                        {
                            item?.requestStatus == "reject" ?
                                <View style={[{ /* minWidth: 100,  paddingVertical: 5, paddingHorizontal: 11, backgroundColor: "#fabec4", borderRadius: 5, borderWidth: 0, borderColor: '#D1D1D1' */ }]}>
                                    <Text style={{ color: "#FF2037", fontSize: 14, textAlign: 'center', padding: 2, paddingBottom: 4, fontFamily: 'Rubik-Regular' }}>Rejected</Text>
                                </View> :
                                item?.requestStatus == "approve" ?
                                    <View style={{}}>
                                        <Text style={{ color: "#33B36F", fontSize: 14, textAlign: 'center', padding: 2, paddingBottom: 4, fontFamily: 'Rubik-Regular' }}>Approved</Text>
                                    </View> :

                                    <View style={[{ /* minWidth: 100, */ paddingVertical: 5, paddingHorizontal: 8, backgroundColor: "#fae7b6", borderRadius: 5, borderWidth: 0, }]}>
                                        <Text style={{ color: "#DFA100", fontSize: 14, textAlign: 'center', fontFamily: 'Rubik-Regular' }}>Pending</Text>
                                    </View>
                        }

                    </View>

                </View>

                {
                    item?.requestType === 'attendancechangerequest' ?

                        <View style={{ flexDirection: 'row', justifyContent: "space-between", marginTop: 5, }}>
                            <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: item?.requestStatus == "approve" ? "#A7A7A7" : item?.auth?.authType === 'in' ? "#00B164" : "#FF2037", marginLeft: 18.67, textDecorationLine: item?.requestStatus == "approve" ? "line-through" : "none" }}>{moment(item?.auth?.time).format("h:mm:ss A")}</Text>
                            <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: item?.requestStatus == "reject" ? "#A7A7A7" : "#0393FF", marginLeft: 18.67, textDecorationLine: item?.requestStatus == "reject" ? "line-through" : "none" }}>{moment(item?.attendanceChangeRequestTime).format("h:mm:ss A")}</Text>
                        </View>
                        : <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5, }}>
                            <Image source={require('../assets/images/watch.png')} style={{ height: 12, width: 12, marginRight: 6.67 }} />
                            {item?.requestType !== "in_between_check_out" ?
                                <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: grayColor }}>{moment(item?.fromTime).format("DD/MM/YYYY h:mm A")}</Text>
                                :
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: grayColor }}>{moment(item?.fromTime).format("DD/MM/YYYY h:mm A")}</Text>
                                    <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: grayColor }}> To: {moment(item?.toTime).format("h:mm A")}</Text>
                                </View>
                            }
                        </View>
                }

                <Text style={{ fontSize: 10, fontFamily: 'Rubik-Regular', color: '#9496A1', marginLeft: 18.67, marginTop: 8 }} adjustsFontToFit={true} numberOfLines={3}>{item?.attendanceChangeRequestReason ? item?.attendanceChangeRequestReason : item?.reason ? item?.reason : null}</Text>

            </View>
        </View>
        // </TouchableOpacity>
    )




    const wsRequestList = (refresh) => {
        let filter = {
            requestType: refresh ? "" : requestType,
            requestStatus: refresh ? "" : requestStatus
        }

        dispatch(apiRequestList({ filter }))
    }

    const getRequestType = (type) => {

        switch (type) {

            case "early_check_out": return "Early Check Out";
                break;
            case "late_check_in": return "Late Check In";
                break;
            case "missed_checkin": return "Missed Check In";
                break;
            case "missed_checkout": return "Missed Check Out";
                break;
            case "in_between_check_out": return "In Between Check Out";
                break;
            case "other": return "Other";
                break;
        }


    }

    const openDrawer = () => {
        drawerRef.current.openDrawer()
    }

    const closeDrawer = () => {
        drawerRef.current.closeDrawer()
    }
    const filterRequest = () => {
        if (requestStatus !== '') {
            const tempArr = requestArray.filter(leave => leave.attendanceChangeRequestStatus === requestStatus)
            setFilteredArray(tempArr)
        } else {
            setFilteredArray(requestArray)
        }
    }
    // const renderItem = ({ item }) => (
    //     <View style={[style.cardWhite, { margin: 10 }]}>

    //         <TouchableOpacity onPress={() => {
    //             props.navigation.navigate('RequestDetails', { requestItem: item })
    //         }}>
    //             <View>
    //                 <View style={{}}>
    //                     <Text style={[style.grayText, { alignSelf: 'flex-end' }]}>{utils.formatDateTime(item.createdAt)}</Text>
    //                     <Text style={style.blueTextBold}>{item.subject}</Text>
    //                     <View style={{ marginVertical: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
    //                         <Text style={[style.grayText, { flex: 1, marginRight: 10, alignSelf: 'flex-end' }]}
    //                             numberOfLines={2}>{item.description}</Text>
    //                         <Image source={getStatusIcon(item.isApprove)} />
    //                     </View>

    //                 </View>
    //             </View>
    //         </TouchableOpacity>
    //     </View>
    // )

    const navigationView = (
        <SafeAreaView style={style.header}>
            <View style={{ padding: 10, backgroundColor: whiteColor, flex: 1, }}>
                {/* <TopCurve /> */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ ...style.rubikmidium, fontSize: 16, color: "#0E5EF2" }}>Filter</Text>
                    <TouchableOpacity onPress={() => closeDrawer()}>
                        <Image source={require('../assets/images/close.png')}
                            style={{ resizeMode: 'contain', marginRight: 10, tintColor: "#0E5EF2" }} />
                    </TouchableOpacity>
                </View>

                <View style={{ padding: 10, }}>
                    <Text style={{ ...style.rubikmidium, fontSize: 14, color: '#000000', marginTop: 20 }}>Status </Text>

                    <Dropdown
                        style={[styles.dropdown,]}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={style.inputTextDate}
                        inputSearchStyle={styles.inputSearchStyle}
                        iconStyle={styles.iconStyle}
                        data={ResourceArray.statusArr ?? []}
                        // search
                        maxHeight={300}
                        labelField='name'
                        valueField='_id'
                        placeholder={ResourceArray.statusArr ? '--Select Status Type--' : 'Loading...'}
                        // searchPlaceholder="Search..."
                        value={requestStatus}
                        onFocus={() => setIsFocus(true)}
                        onBlur={() => setIsFocus(false)}
                        onChange={value => {
                            setRequestStatus(value._id)
                            setdropdownvalue(value.name)
                        }}
                    />

                    <Text style={{ ...style.rubikmidium, fontSize: 14, color: '#000000', marginTop: 20 }}>Request Type</Text>
                    <Dropdown
                        style={[styles.dropdown,]}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={style.inputTextDate}
                        inputSearchStyle={styles.inputSearchStyle}
                        iconStyle={styles.iconStyle}
                        data={requestTypeList ?? []}
                        // search
                        maxHeight={300}
                        labelField='name'
                        valueField='_id'
                        placeholder={requestTypeList ? '--Select Request Type--' : 'Loading...'}
                        // searchPlaceholder="Search..."
                        value={requestType}
                        onFocus={() => setIsFocus(true)}
                        onBlur={() => setIsFocus(false)}
                        onChange={value => {
                            setRequestType(value._id)
                            // setdropdownvalue(value.name)
                        }}
                    />

                    <View style={{ flexDirection: "row", justifyContent: "space-evenly", width: "100%", marginVertical: 20 }}>
                        <View style={[{ minWidth: 100, borderRadius: 10, alignSelf: 'center', borderWidth: 0, borderColor: '#33B36F',/*  marginTop: 17, *//*  flex: 1 */backgroundColor: '#0393FF' }]}>
                            <TouchableOpacity style={{ padding: 10, }} onPress={() => {
                                // filterRequest()
                                // wsRequestList()

                                RequestList(false, 0)
                                closeDrawer()
                            }}>
                                <Text style={{ color: "#FFFFFF", fontSize: 16, textAlign: 'center', fontFamily: 'Rubik-Regular' }}>APPLY</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={[{ minWidth: 100, borderRadius: 10, alignSelf: 'center', borderWidth: 1, borderColor: '#D1D1D1', /* marginTop: 17, */ backgroundColor: "#FFFFFF" }]}>
                            <TouchableOpacity style={{ padding: 10, }} onPress={() => {
                                setRequestType(""),
                                    setRequestStatus(""),
                                    RequestList(true),
                                    closeDrawer();
                                // wsRequestList(true),
                                //     setStateData(true),

                            }}>
                                <Text style={{ color: "#606060", fontSize: 16, textAlign: 'center', fontFamily: 'Rubik-Regular' }}>RESET</Text>
                            </TouchableOpacity>
                        </View>
                        {/* <View style={[{ minWidth: 100, borderRadius: 10, alignSelf: 'center', borderWidth: 1, borderColor: '#D1D1D1', marginTop: 17, backgroundColor: "#FFFFFF" }]}>
                            <TouchableOpacity style={{ padding: 10, }} onPress={() => {
                                setRequestStatus('')
                            }}>
                                <Text style={{ color: "#606060", fontSize: 16, textAlign: 'center', fontFamily: 'Rubik-Regular' }}>RESET</Text>
                            </TouchableOpacity>
                        </View> */}
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
                            <TouchableOpacity style={{ justifyContent: 'center', flexDirection: 'row' }} onPress={() => props.navigation.goBack(null)}>
                                <Image source={require('../assets/images/back.png')}
                                    style={style.backIcon1} />
                                <Text style={style.headerText}>Request</Text>
                            </TouchableOpacity>
                        </View>
                    }
                    // componentRight={() =>
                    //     <TouchableOpacity onPress={() => openDrawer()}>
                    //         <Image source={require('../assets/images/filter1.png')}
                    //             style={{ resizeMode: 'contain', marginRight: 10, tintColor: iconColor }} />
                    //     </TouchableOpacity>

                    // }
                    componentRight={() =>
                        <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity onPress={() => { props.navigation.navigate('NewRequest', { wsRequestList: wsRequestList }) }}>
                                <Image source={require('../assets/images/add.png')}
                                    style={{ resizeMode: 'contain', marginRight: 15, width: 19.02, height: 19.02 }} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => openDrawer()}>
                                <Image source={require('../assets/images/filter1.png')}
                                    style={{ resizeMode: 'contain', marginRight: 15, tintColor: iconColor, width: 19.02, height: 19.02 }} />
                            </TouchableOpacity>
                        </View>
                    }
                />
                <View style={{ flex: 1, backgroundColor: whiteColor }}>
                    {/* <TopCurve /> */}

                    {/* {renderTabs()} */}
                    {totalRequest != -1 && filteredArray != [] ?
                        <FlatList
                            data={filteredArray}
                            renderItem={renderItem}
                            // keyExtractor={item => item._id}
                            contentContainerStyle={{ flexGrow: 1 }}
                            onEndReachedThreshold={0.2}
                            ListEmptyComponent={
                                (loaderVisible || refreshing) ? null : <Text style={style.emptyComponent}>No records available.</Text>
                            }
                            onEndReached={() => onEndReached()}
                            ListFooterComponent={renderFooter}
                            refreshControl={
                                <RefreshControl refreshing={refreshing} onRefresh={() => {
                                    if (!loaderVisible) {
                                        // setFromDate(week)
                                        setRefreshing(true);
                                        setRequestType(""),
                                            setRequestStatus(""),
                                            // wsRequestList(true)
                                            RequestList(true, null, true)


                                    }
                                }} />
                            }
                        /> : null}
                </View>
                <Loader visible={loaderVisible} />
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
        height: 40,
        borderColor: '#D1D1D1',
        borderWidth: 0.5,
        borderRadius: 8,
        paddingHorizontal: 20,
        marginTop: 10,
        // marginBottom: 7,
        backgroundColor: '#FFFFFF'
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
        height: 40,
        fontSize: 16,
    },
    header: {
        fontSize: 20,
        color: 'blue'
    }
});
export default MyRequest;

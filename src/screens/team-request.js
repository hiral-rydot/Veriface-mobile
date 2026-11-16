import React, { useRef, useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Dimensions,
    StyleSheet,
    Modal,
    TextInput
} from 'react-native';
import { NavigationBar } from 'navigationbar-react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList } from 'react-native-gesture-handler';
import DrawerLayout from 'react-native-gesture-handler/DrawerLayout'
// import { Dropdown } from 'react-native-material-dropdown'
import { Dropdown } from 'react-native-element-dropdown';
import { style } from '../styles/style'
import { menuHeaderColor, whiteColor, blueColor, dropdownBaseColor, iconColor, borderColor, grayColor } from '../styles/color'
import TopCurve from '../components/top-curve';
import BlueButton from '../components/blue-button';
import { apiRequestList, apiTeamLeaveList } from '../actions'
import { useDispatch, useSelector } from 'react-redux'
import { utils } from '../utils/utils';
import { ResourceArray, TEAM_ATTENDANCE_LIST, apiUrl, updateStatusUrl, uploadUrl } from '../webservice/constant'

import { TabView, TabBar, SceneMap } from 'react-native-tab-view'
import moment from 'moment';
import CheckBox from '@react-native-community/checkbox'
import DateTimePicker from 'react-native-date-picker';
import Loader from '../components/loader';
import { api } from '../webservice/api';
import Snackbar from 'react-native-snackbar';
import Search from 'react-native-search-box';
import { Portal } from 'react-native-paper';
import { ActivityIndicator } from 'react-native';
let requestType1 = "";
let requestStatus1 = "";
let temp;
const TeamRequest = (props) => {

    const drawerRef = useRef(null)
    const dropdownLeave = useRef(null)
    const [requestStatus, setRequestStatus] = useState('');
    const [requestArray, setRequestArray] = useState([])
    const [filteredArray, setFilteredArray] = useState([])
    let resRequestList = useSelector(state => state.resRequestList)
    const isLoading = useSelector(state => state.loading)
    const dispatch = useDispatch()
    const [isFocus, setIsFocus] = useState(false);
    const [requestTypeList, setRequestTypeList] = useState([])
    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'first', title: 'Leave' },
        { key: 'second', title: 'Other Request' },
        // { key: 'third', title: 'Request' },
    ]);
    const [searchBarShow, setSearchBarShow] = useState(false)

    const [requestStatusForTeamAttendance, setRequestStatusForTeamAttendance] = useState('')
    const [requestTypeTeamAttendance, setRequestTypeTeamAttendance] = useState('')
    const [requestStatusForTeamAttendance1, setRequestStatusForTeamAttendance1] = useState('')
    const [requestTypeTeamAttendance1, setRequestTypeTeamAttendance1] = useState('')
    const [requestTypevalueForTeamAttendance, setRequestTypevalueForTeamAttendance] = useState('')
    /*  useEffect(() => {
         if (resRequestList && resRequestList.success) {
             setRequestArray(resRequestList.list)
             setFilteredArray(resRequestList.list)
         }
     }, [resRequestList])
     */
    useEffect(() => {
        /* resRequestList = null
        wsRequestList() */
        wcRequestTypeList()
    }, [])
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
    const setStateData = (value = false) => (
        value == false ?
            (setRequestStatusForTeamAttendance1(requestStatusForTeamAttendance), setRequestTypeTeamAttendance1(requestTypeTeamAttendance))
            :
            (setRequestStatusForTeamAttendance1(""), setRequestTypeTeamAttendance1(""))
    )

    const renderScene = ({ route, jumpTo }) => {
        switch (route.key) {
            case 'first':
                return <Team /* showSearch={searchBarShow}  */ />
            case 'second':
                return <TeamAttendance requestType={requestTypeTeamAttendance1} requestStatus={requestStatusForTeamAttendance1} />;
        }
    };

    const renderTabs = () => (
        <TabView
            style={{ borderWidth: 0 }}
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            initialLayout={{ width: Dimensions.get('window').width }}
            overScrollMode={'always'}
            renderTabBar={(props) =>
                <TabBar
                    {...props}
                    scrollEnabled={true}
                    tabStyle={{ width: Dimensions.get('window').width / 2 }}
                    indicatorStyle={{ backgroundColor: "#0393FF", }}
                    style={{ backgroundColor: "#F6F6F6", height: 45, shadowColor: 'white', justifyContent: 'center' }}
                    renderLabel={({ route, focused, color }) => (
                        <View style={{ paddingBottom: 10, /* alignItems: 'center',  */ }}>
                            <Text style={
                                route.key === props.navigationState.routes[index].key
                                    ? styles.blueText
                                    : styles.grayText
                            }>
                                {route.title}
                            </Text>
                        </View>
                    )}
                />
            }
        />
    )

    const wsRequestList = () => {
        dispatch(apiRequestList({}))
    }
    const getStatusIcon = (status) => {
        if (status === 'pending') {
            return require('../assets/images/pending.png')
        } else if (status === 'approve') {
            return require('../assets/images/approval.png')
        } else if (status === 'reject') {
            return require('../assets/images/reject.png')
        } else {
            return require('../assets/images/pending.png')
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
            const tempArr = requestArray.filter(leave => leave.requestStatus === requestStatus)
            setFilteredArray(tempArr)
        } else {
            setFilteredArray(requestArray)
        }
    }
    const renderItem = ({ item }) => (
        <View style={[style.cardWhite, { margin: 10 }]}>

            <TouchableOpacity onPress={() => {
                props.navigation.navigate('RequestDetails', { requestItem: item })
            }}>
                <View>
                    <View style={{}}>
                        <Text style={[style.grayText, { alignSelf: 'flex-end' }]}>{utils.formatDateTime(item.createdAt)}</Text>
                        <Text style={style.blueTextBold}>{item.subject}</Text>
                        <View style={{ marginVertical: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={[style.grayText, { flex: 1, marginRight: 10, alignSelf: 'flex-end' }]}
                                numberOfLines={2}>{item.description}</Text>
                            <Image source={getStatusIcon(item.requestStatus)} />
                        </View>

                    </View>
                </View>
            </TouchableOpacity>
        </View>
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
                {index == 0 ?
                    <View style={[style.cardWhite, { padding: 20, margin: 20 }]}>
                        <Text style={[style.blueText, { marginTop: 10 }]}>Status</Text>
                        <View style={[style.inputContainer, { marginTop: 10 }]}>
                            <Dropdown
                                ref={dropdownLeave}
                                data={ResourceArray.statusArr}
                                rippleCentered={true}
                                itemPadding={5}
                                lineWidth={0}
                                value={requestStatus}
                                valueExtractor={((v) => v._id)}
                                labelExtractor={((v) => v.name)}
                                onChangeText={(value) => { setRequestStatus(value); temp = value }}
                                dropdownOffset={{ top: 8, left: 20 }}
                                baseColor={dropdownBaseColor}
                                containerStyle={[{ flex: 1, height: 40, overflow: "visible", }]}
                            />
                        </View>
                        <View style={{ flexDirection: 'row', marginTop: 30 }}>
                            <BlueButton
                                containerStyle={{ minWidth: 0, flex: 1, marginRight: 5 }}
                                title={'APPLY'}
                                onPress={() => {
                                    filterRequest()
                                    closeDrawer()
                                }}
                            />
                            <BlueButton
                                containerStyle={{ minWidth: 0, flex: 1, marginLeft: 5 }}
                                title={'RESET'}
                                onPress={() => {
                                    setRequestStatus('')
                                    //closeDrawer()
                                }}
                            />
                        </View>
                    </View>
                    :
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
                            value={requestStatusForTeamAttendance}
                            onFocus={() => setIsFocus(true)}
                            onBlur={() => setIsFocus(false)}
                            onChange={value => {
                                setRequestStatusForTeamAttendance(value._id)
                                // requestStatus1 = requestStatusFor
                                // setdropdownvalue(value.name)
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
                            value={requestTypeTeamAttendance}
                            onFocus={() => setIsFocus(true)}
                            onBlur={() => setIsFocus(false)}
                            onChange={value => {
                                setRequestTypeTeamAttendance(value._id)
                                // requestType1 = value._id;
                                // setdropdownvalue(value.name)
                            }}
                        />

                        <View style={{ flexDirection: "row", justifyContent: "space-evenly", width: "100%", marginVertical: 20 }}>
                            <View style={[{ minWidth: 100, borderRadius: 10, alignSelf: 'center', borderWidth: 0, borderColor: '#33B36F',/*  marginTop: 17, *//*  flex: 1 */backgroundColor: '#0393FF' }]}>
                                <TouchableOpacity style={{ padding: 10, }} onPress={() => {
                                    // filterRequest()
                                    // wsRequestList()
                                    setStateData()
                                    closeDrawer()
                                }}>
                                    <Text style={{ color: "#FFFFFF", fontSize: 16, textAlign: 'center', fontFamily: 'Rubik-Regular' }}>APPLY</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={[{ minWidth: 100, borderRadius: 10, alignSelf: 'center', borderWidth: 1, borderColor: '#D1D1D1', /* marginTop: 17, */ backgroundColor: "#FFFFFF" }]}>
                                <TouchableOpacity style={{ padding: 10, }} onPress={() => {
                                    setRequestTypeTeamAttendance(""),
                                        setRequestStatusForTeamAttendance(""),
                                        setStateData(true),
                                        closeDrawer()

                                }}>
                                    <Text style={{ color: "#606060", fontSize: 16, textAlign: 'center', fontFamily: 'Rubik-Regular' }}>RESET</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                }
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
                {index == 0 ?
                    <NavigationBar
                        navigationBarStyle={{ ...style.navigationBarStyle }}
                        componentLeft={() =>
                            <View style={{ alignItems: 'flex-start', marginLeft: 5 }}>
                                <TouchableOpacity style={{ justifyContent: 'center', flexDirection: 'row' }} onPress={() => props.navigation.goBack(null)}>
                                    <Image source={require('../assets/images/back.png')}
                                        style={style.backIcon1} />
                                    <Text style={style.headerText}>Team Request</Text>
                                </TouchableOpacity>
                            </View>
                        }
                    // componentRight={() =>
                    //     <TouchableOpacity onPress={() => setSearchBarShow(true)}>
                    //         <Image source={require('../assets/images/search1.png')}
                    //             style={{ resizeMode: 'contain', marginRight: 10, tintColor: iconColor }} />
                    //     </TouchableOpacity>
                    // }
                    />
                    :
                    <NavigationBar
                        navigationBarStyle={{ ...style.navigationBarStyle }}
                        componentLeft={() =>
                            <View style={{ alignItems: 'flex-start', marginLeft: 5 }}>
                                <TouchableOpacity style={{ justifyContent: 'center', flexDirection: 'row' }} onPress={() => props.navigation.goBack(null)}>
                                    <Image source={require('../assets/images/back.png')}
                                        style={style.backIcon1} />
                                    <Text style={style.headerText}>Team Request</Text>
                                </TouchableOpacity>
                            </View>
                        }
                        componentRight={() =>
                            <TouchableOpacity onPress={() => openDrawer()}>
                                <Image source={require('../assets/images/filter1.png')}
                                    style={{ resizeMode: 'contain', marginRight: 10, tintColor: iconColor }} />
                            </TouchableOpacity>
                        }
                    />}
                <View style={{ flex: 1, backgroundColor: whiteColor }}>
                    {/* <TopCurve /> */}
                    {renderTabs()}
                    {/* <FlatList
                        data={filteredArray}
                        renderItem={renderItem}
                        keyExtractor={item => item._id}
                        contentContainerStyle={{ flexGrow: 1 }}
                        ListEmptyComponent={
                            (isLoading) ? null : <Text style={style.emptyComponent}>No records available.</Text>
                        } />
                    <TouchableOpacity style={style.floatingButton} onPress={() => {
                        props.navigation.navigate('NewRequest', { wsRequestList: wsRequestList })
                    }}>
                        <Image source={require('../assets/images/add.png')} />
                    </TouchableOpacity> */}
                </View>
            </DrawerLayout>
        </SafeAreaView>
    );

}

const Team = (props) => {
    const drawerRef = useRef(null)
    let resTeamLeaveList = useSelector(state => state.resTeamLeaveList)
    const isLoading = useSelector(state => state.loading)
    const dispatch = useDispatch()
    const [teamLeaveArray, setTeamLeaveArray] = useState([])
    const [approveModalVisible, setApproveModalVisible] = useState(false)
    const [modalVisible, setModalVisible] = useState(false);
    const [modalVisible1, setModalVisible1] = useState(false);
    const [modalData, setModalData] = useState('')
    const [plantSearchText, setPlantSearchText] = useState('');
    const [searchBarShow, setSearchBarShow] = useState(true)
    const [description, setDescription] = useState('');
    const [todayDate, setTodayDate] = useState(-2)
    const [cancelModalVisible, setCancelModalVisible] = useState(false)
    const [hasMorePages, setHasMorePages] = useState(false)
    let limit = 20;
    const [skip, setSkip] = useState(0);
    const [totalRequest, setTotalRequest] = useState(-1);
    const [apiCallAvailable, setApiCallAvailable] = useState(true)
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        resTeamLeaveList = null
        // dispatch(apiTeamLeaveList({ isActive: true }))
        wsTeamLeaveList(true)
    }, [])
    useEffect(() => {
        props.showSearch ?
            searchBox.current.focus() : null
    }, [props.showSearch])

    // const wsTeamLeaveList = (text = plantSearchText) => {
    //     let data = {
    //         skip: 0,
    //         // limit: 20,
    //         sortBy: "createdAt",
    //         sort: "desc",
    //         filter: {
    //             employeeName: text
    //         }
    //     }
    //     dispatch(apiTeamLeaveList(data))
    // }
    const renderFooter = () => {
        return (hasMorePages && teamLeaveArray.length) ? <View style={{ alignItems: 'center', padding: 20 }}>
            <ActivityIndicator
                animating={true}
                color='#4386F4'
                size="large" />
        </View> : null;
    };
    useEffect(() => {
        console.log("*************onEndReached SKIP update asaasaas", skip, skip <= totalRequest);
        if (skip > 0 && skip <= totalRequest) {
            console.log("*************onEndReached SKIP update", skip, skip <= totalRequest);
            wsTeamLeaveList()
        }
    }, [skip])
    const onEndReached = () => {
        console.log("*************onEndReached SKIP", skip, totalRequest);
        if (apiCallAvailable && skip <= totalRequest) {
            setSkip(skip + limit);
        } else {

        }
    }
    const wsTeamLeaveList = (refresh = false, loaderShow = false, text = plantSearchText) => {
        setApiCallAvailable(false)
        if (loaderShow) {
            setLoading(true)
        }
        let data = {
            skip: refresh ? 0 : skip,
            limit: limit,
            sortBy: "createdAt",
            sort: "desc",
            filter: {
                employeeName: text
            }
        }
        let team_leave_list = `${apiUrl}${'/api/cms/teamLeave/list'}`
        api.postWithTokenNew(team_leave_list, data
        ).then(async (jsonResponse) => {
            if (jsonResponse.success) {
                if (jsonResponse?.list?.length > 0) {
                    setHasMorePages(jsonResponse.list.length >= limit);
                    setTotalRequest(jsonResponse.count)
                    if (refresh) {
                        setSkip(0)
                    }
                    let tempArray = [];
                    if (refresh) {
                        tempArray.push(...jsonResponse?.list);
                    }
                    else {
                        if (teamLeaveArray) tempArray.push(...teamLeaveArray);
                        tempArray.push(...jsonResponse?.list);
                    }
                    setTeamLeaveArray(tempArray)
                    setApiCallAvailable(true)
                    // setLoading(false);
                    setLoading(false)
                } else {
                    setApiCallAvailable(true)
                    setLoading(false)
                }

            }
        }).catch((e) => {
            setLoading(false)
            setApiCallAvailable(true)
            console.log("error=> " + e)
        })
    }
    // useEffect(() => {
    //     // setLoadingTemp(false)
    //     if (resTeamLeaveList && resTeamLeaveList.success) {
    //         setTeamLeaveArray(resTeamLeaveList.list)
    //         setTodayDate(1);
    //     }
    // }, [resTeamLeaveList])

    const renderLeaveItem = ({ item }) => (
        <View style={[/* style.cardWhite, */ { margin: 6, borderRadius: 10, padding: 10, borderColor: '#D1D1D1', borderWidth: 1 }]}>
            <TouchableOpacity onPress={() => {
                setModalVisible(true)
                setModalData(item)
                // props.navigation.navigate('LeaveDetails', { leaveItem: item })
            }}>
                <View style={{ flexDirection: 'row', flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {/* <Image source={require('../assets/images/profilepic.png')}
                            style={{ width: 41, height: 42, borderRadius: 50, backgroundColor: "#00000029", marginRight: 10 }} /> */}
                        {(item && item.employee && item.employee.profile_image) ?
                            <Image source={{ uri: uploadUrl + item.employee.profile_image }}
                                style={{ width: 41, height: 42, borderRadius: 50, resizeMode: 'cover', marginRight: 10 }} />
                            : <Image source={require('../assets/images/profilepic.png')}
                                style={{ width: 41, height: 42, borderRadius: 50, backgroundColor: "#00000029", marginRight: 10 }} />
                        }

                    </View>

                    <View style={{ flex: 1 }}>

                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            <Text style={{ fontSize: 16, /* fontWeight: '700' */fontFamily: 'Rubik-Bold' }}>{item && item.employee && item.employee.name}</Text>
                            <View style={{
                                /* flex: 1,
                                alignItems: 'flex-end', */
                            }}>
                                {
                                    item?.isApprove == "reject" ?
                                        <Text style={{ color: "#FF2037", fontSize: 14, textAlign: 'center', padding: 2, paddingBottom: 4, fontFamily: 'Rubik-Regular' }}>Rejected</Text>
                                        :
                                        item?.isApprove == "approve" ?
                                            <Text style={{ color: "#33B36F", fontSize: 14, textAlign: 'center', padding: 2, paddingBottom: 4, fontFamily: 'Rubik-Regular' }}>Approved</Text>
                                            :
                                            item?.isApprove == "cancel" ?
                                                <Text style={{ color: "#4486FF", fontSize: 14, textAlign: 'center', padding: 2, paddingBottom: 4, fontFamily: 'Rubik-Regular' }}>Canceled</Text>
                                                :
                                                <View style={[{ minWidth: 100, backgroundColor: "#fae7b6", borderRadius: 5, borderWidth: 0, }]}>
                                                    <Text style={{ color: "#DFA100", fontSize: 14, textAlign: 'center', padding: 2, paddingBottom: 4, fontFamily: 'Rubik-Regular' }}>Pending</Text>
                                                </View>
                                }

                            </View>
                        </View>
                        <Text style={{ fontSize: 14, color: item && item.leaveType && item.leaveType.leaveName == "Casual leave" ? "#FFC121" : item && item.leaveType && item.leaveType.leaveName == "Medical leave" ? '#FF2037' : "#0393FF", marginTop: 3, fontFamily: 'Rubik-Regular', }} adjustsFontToFit={true} numberOfLines={2}>{item && item.leaveType && item.leaveType.leaveName} Request - {item && item.leaveDays >= 1 ? item.leaveDays : (item.halfLeaveType ? (item.halfLeaveType == "secondHalf" ? "Second Half" : item.halfLeaveType == "firstHalf" ? "First Half" : "Half Day") : "Half Day")} {item && item.leaveDays == 1 ? "Day" : item && item.leaveDays > 1 ? "Days" : ""}
                        </Text>
                        {item && item.leaveDays > 1 ?
                            <Text style={{ color: '#9496A1', fontSize: 14, marginTop: 3, fontFamily: 'Rubik-Regular' }}>{moment(item && item.fromDate).format("ddd, DD MMM")} - {moment(item.toDate).format('ddd, DD MMM YYYY')}</Text>
                            :
                            <Text style={{ color: '#9496A1', fontSize: 14, marginTop: 3, fontFamily: 'Rubik-Regular' }}>{moment(item.toDate).format('ddd, DD MMM YYYY')}</Text>
                        }
                        {/* <Text numberOfLines={2} style={style.grayText}>{item.description}</Text> */}
                    </View>

                </View>
            </TouchableOpacity>
        </View>
    )
    const searchBox = useRef(null);
    return (

        <View style={{ flex: 1, backgroundColor: whiteColor }}>

            {searchBarShow ?
                <View style={{ /* marginBottom: 12, */ marginTop: 12 }}>
                    <Search
                        ref={searchBox}
                        backgroundColor={'transparent'}
                        inputBorderRadius={17}
                        titleCancelColor={"#0E5EF2"}
                        onSearch={() => {
                            return new Promise((resolve, reject) => {
                                wsTeamLeaveList(true, true)
                                resolve();
                            });
                        }}
                        onChangeText={(searchText) => {
                            return new Promise((resolve, reject) => {
                                wsTeamLeaveList(true, true, searchText)
                                setPlantSearchText(searchText.toLowerCase());
                                console.log(searchText)
                            });
                        }}
                        onCancel={() => {
                            return new Promise((resolve, reject) => {
                                setPlantSearchText('')
                                // .then(() => {
                                wsTeamLeaveList(true, true, "")
                                // setSearchBarShow(false)
                                // })
                            }
                            )
                        }}
                    />
                </View>
                : null}
            <Modal
                transparent={true}
                visible={modalVisible}

            >
                <View style={{ ...styles.centeredView, backgroundColor: "#000000aa" }}>
                    <View style={{ ...styles.modalView, }}>
                        {/* <View style={{ width: "100%" }}> */}
                        <View style={{ width: "110%", flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, alignItems: 'center', paddingBottom: 12, borderBottomColor: '#D1D1D1', /* paddingHorizontal: 34  */ }} >
                            <Text style={{ marginLeft: 17, fontSize: 18,/*  fontWeight: "bold" */ fontFamily: 'Rubik-Regular' }}>Leave Application</Text>
                            <TouchableOpacity onPress={() => { setModalVisible(false) }}>
                                <Image source={require('../assets/images/close.png')} style={{ marginRight: 17, tintColor: '#9496A1' }} />
                            </TouchableOpacity>
                        </View>
                        {/* {console.log(">>>>>>>>>", modalData)} */}
                        <View style={{ width: "100%", flexDirection: 'row', alignItems: 'center', justifyContent: "space-between", marginTop: 12 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                {/* <Image source={require('../assets/images/profilepic.png')}
                                        style={{ width: 42, height: 39, borderRadius: 50, backgroundColor: whiteColor, marginRight: 7 }} /> */}

                                {(modalData && modalData.employee && modalData.employee.profile_image) ?
                                    <Image source={{ uri: uploadUrl + modalData.employee.profile_image }}
                                        style={{ width: 41, height: 42, borderRadius: 50, resizeMode: 'cover', }} />
                                    : <Image source={require('../assets/images/profilepic.png')}
                                        style={{ width: 41, height: 42, borderRadius: 50, backgroundColor: "#00000029", marginRight: 10 }} />
                                }
                                <View style={{}}>
                                    <Text style={[{ fontSize: 18, color: "black", /* fontWeight: '700' */fontFamily: 'Rubik-Bold' }]}>{modalData && modalData.employee && modalData.employee.name}</Text>
                                    <Text style={{ color: modalData && modalData.leaveType && modalData.leaveType.leaveName == "Casual leave" ? "#FFC121" : modalData && modalData.leaveType && modalData.leaveType.leaveName == "Medical leave" ? '#FF2037' : "#0393FF", marginTop: 3, fontFamily: 'Rubik-Regular' }}>{modalData && modalData.leaveType && modalData.leaveType.leaveName} Request</Text>
                                </View>
                            </View>

                        </View>
                        <View style={{ width: '100%', flexDirection: 'row', marginTop: 12 }}>
                            <View style={{ justifyContent: 'flex-start', flex: 1 }}>
                                <Text style={{ color: '#606060', fontFamily: 'Rubik-Regular' }}>Applied On</Text>
                                <Text style={{ color: '#606060', marginTop: 3, fontFamily: 'Rubik-Regular' }}>Date </Text>
                                {modalData && modalData.leaveDays >= 1 ?
                                    <Text style={{ color: '#606060', marginTop: 3, fontFamily: 'Rubik-Regular' }}>{modalData && modalData.leaveDays == 1 ? "Leave Day" : "Leave Days"}</Text>
                                    : <Text></Text>}
                                <Text style={{ color: '#606060', marginTop: 3, fontFamily: 'Rubik-Regular' }}>Status </Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{/*  fontWeight: '700' */fontFamily: 'Rubik-Bold' }}>: {moment(modalData.createdAt).format('DD MMM YYYY')}</Text>
                                {modalData && modalData.leaveDays > 1 ?
                                    <Text style={{ /* fontWeight: '700', */ marginTop: 3, fontFamily: 'Rubik-Bold' }}>: {moment(modalData.fromDate).format('DD MMM')}, to {moment(modalData.toDate).format("DD MMM YYYY")}</Text>
                                    : <Text style={{ /* fontWeight: '700', */ marginTop: 3, fontFamily: 'Rubik-Bold' }}>: {moment(modalData.toDate).format("DD MMM YYYY")}</Text>}
                                {modalData && modalData.leaveDays >= 1 ?
                                    <Text style={{ /* fontWeight: '700', */ marginTop: 3, fontFamily: 'Rubik-Bold' }}>: {modalData && modalData.leaveDays} {modalData.leaveDays == 1 ? "Day" : "Days"}</Text>
                                    : <Text style={{ /* fontWeight: '700', */ marginTop: 3, fontFamily: 'Rubik-Bold' }}>  ({modalData && modalData.halfLeaveType == "secondHalf" ? "Second-Half" : modalData.halfLeaveType == "firstHalf" ? "First-Half" : "Half Day"})</Text>}
                                <Text style={{ /* fontWeight: '700', */ marginTop: 3, fontFamily: 'Rubik-Bold' }}>: {modalData?.isApprove == "approve" ? "Approved" : modalData?.isApprove == "reject" ? "Rejected" : modalData?.isApprove == "cancel" ? "Canceled" : "Pending"}</Text>
                            </View>
                        </View>
                        <View style={{ marginTop: 12, /* borderWidth: 1, */ width: "100%" }}>
                            <Text style={{ color: '#606060', fontFamily: 'Rubik-Regular' }}>Reason</Text>
                            <View style={[{ /* minWidth: 100, */ padding: 12,/*  margin: 7, */ backgroundColor: "#F3F4F8", borderRadius: 7, borderWidth: 0, borderColor: '#D1D1D1', marginTop: 3 }]}>
                                <Text style={{ color: "#606060", fontSize: 16, /* textAlign: 'center', */ /* padding: 2 */ fontFamily: 'Rubik-Regular' }}>{modalData && modalData.description}</Text>
                            </View>
                        </View>
                        {modalData?.isApprove == "pending" /* || modalData.requestStatus == "reject" || */ /* moment(modalData.fromDate).isBefore(todayDate) *//* (moment(modalData.fromDate).format() < moment().format()) */ ?
                            <View style={{ flexDirection: "row", justifyContent: "space-evenly", width: "100%", marginVertical: 20 }}>
                                <View style={[{ minWidth: 100, borderRadius: 10, alignSelf: 'center', borderWidth: 1, borderColor: '#33B36F', marginTop: 17,/*  flex: 1 */backgroundColor: '#33B36F' }]}>
                                    <TouchableOpacity style={{ padding: 10, }} onPress={() => {
                                        setApproveModalVisible(true),
                                            setModalVisible(false),
                                            setTodayDate(-2)
                                    }}>
                                        <Text style={{ color: "#FFFFFF", fontSize: 16, textAlign: 'center', fontFamily: 'Rubik-Regular' }}>Approve</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={[{ minWidth: 100, borderRadius: 10, alignSelf: 'center', borderWidth: 1, borderColor: '#FF2037', marginTop: 17,/*  flex: 1 */ backgroundColor: "#FF2037" }]}>
                                    <TouchableOpacity style={{ padding: 10, }} onPress={() => { setModalVisible1(true), setModalVisible(false), setTodayDate(-2) }}>
                                        <Text style={{ color: "#FFFFFF", fontSize: 16, textAlign: 'center', fontFamily: 'Rubik-Regular' }}>Reject</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            :
                            modalData?.isApprove == "approve" ?

                                <View style={[{ minWidth: 100, borderRadius: 10, alignSelf: 'center', borderWidth: 0, borderColor: '#D1D1D1', marginVertical: 20, backgroundColor: "#0E5EF2" }]}>
                                    <TouchableOpacity style={{ padding: 10, }} onPress={() => { setCancelModalVisible(true), setModalVisible(false), setTodayDate(-2) }}>
                                        <Text style={{ color: "#FFFFFF", fontSize: 16, textAlign: 'center', fontFamily: 'Rubik-Regular' }}>Cancel Leave Request</Text>
                                    </TouchableOpacity>
                                </View>
                                :
                                <View style={[{ minWidth: 100, borderRadius: 10, alignSelf: 'center', borderWidth: 1, borderColor: '#D1D1D1', marginVertical: 20,/*  flex: 1 */ backgroundColor: "#FFFFFF" }]}>
                                    <TouchableOpacity style={{ padding: 10, }} onPress={() => { setModalVisible(false) }}>
                                        <Text style={{ color: "#606060", fontSize: 16, textAlign: 'center', fontFamily: 'Rubik-Regular' }}>Close</Text>
                                    </TouchableOpacity>
                                </View>
                        }

                        {/* </View> */}
                    </View>
                </View>
            </Modal>

            {/* reason for reject */}

            <Modal
                transparent={true}
                visible={modalVisible1}
            // visible={true}
            >
                <View style={{
                    backgroundColor: "#000000aa", flex: 1, alignItems: "center", justifyContent: "center"
                }}>
                    <View style={{
                        ...styles.modalView1, width: "90%"
                    }}>
                        <View style={{ width: "110%", flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 0, alignItems: 'center', /* paddingBottom: 12, */ borderBottomColor: '#D1D1D1', /* paddingHorizontal: 34  */ }} >
                            <Text style={{ marginLeft: 17, fontSize: 18,/*  fontWeight: "bold" */fontFamily: 'Rubik-Regular' }}>Reason for Rejection</Text>
                            <TouchableOpacity onPress={() => { setDescription(""), setModalVisible1(false) }}>
                                <Image source={require('../assets/images/close.png')} style={{ marginRight: 17, tintColor: '#9496A1' }} />
                            </TouchableOpacity>
                        </View>
                        <TextInput style={[style.inputText, style.inputContainer, { height: 100, marginTop: 10, textAlignVertical: 'top', borderWidth: 1, borderRadius: 10, borderColor: '#D1D1D1', width: '100%' }]}
                            multiline={true}
                            numberOfLines={3}
                            placeholder={'Write your reason for rejection...'}
                            placeholdergrayColor={"gray"}
                            onChangeText={(text) => setDescription(text)} />

                        <View style={{ flexDirection: "row", justifyContent: "space-evenly", width: "100%" }}>
                            <View style={[{ minWidth: 100, borderRadius: 10, alignSelf: 'center', borderWidth: 0, borderColor: '#0E5EF2', marginTop: 17,/*  flex: 1 */backgroundColor: '#0E5EF2' }]}>
                                <TouchableOpacity style={{ padding: 10, }} onPress={() => {
                                    if (description == "") {
                                        Snackbar.show({ text: "please enter reject reason" })
                                    } else {
                                        api.postWithPayloadwithToken(   /* local api call */
                                            updateStatusUrl + modalData._id,
                                            {
                                                employee: modalData.employee._id,
                                                status: "reject",
                                                reason: description,
                                                type: modalData.type
                                            }
                                        ).then(res => {

                                            setTeamLeaveArray([])
                                            wsTeamLeaveList(true, true);

                                        }),
                                            setModalVisible1(false)
                                    }
                                }}>
                                    <Text style={{ color: "#FFFFFF", fontSize: 16, textAlign: 'center', fontFamily: 'Rubik-Regular' }}>Send</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={[{ minWidth: 100, borderRadius: 10, alignSelf: 'center', borderWidth: 1, borderColor: '#D1D1D1', marginTop: 17 }]}>
                                <TouchableOpacity style={{ padding: 10, }} onPress={() => { setDescription(""), setModalVisible1(false) }}>
                                    <Text style={{ color: "#606060", fontSize: 16, textAlign: 'center', fontFamily: 'Rubik-Regular' }}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* approval note */}

            <Modal
                transparent={true}
                visible={approveModalVisible}
            // visible={true}
            >
                <View style={{
                    backgroundColor: "#000000aa", flex: 1, alignItems: "center", justifyContent: "center"
                }}>
                    <View style={{
                        ...styles.modalView1, width: "90%"
                    }}>
                        <View style={{ width: "110%", flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 0, alignItems: 'center', /* paddingBottom: 12, */ borderBottomColor: '#D1D1D1', /* paddingHorizontal: 34  */ }} >
                            <Text style={{ marginLeft: 17, fontSize: 18,/*  fontWeight: "bold" */ fontFamily: 'Rubik-Regular' }}>Approval Note</Text>
                            <TouchableOpacity onPress={() => { setDescription(""), setApproveModalVisible(false) }}>
                                <Image source={require('../assets/images/close.png')} style={{ marginRight: 17, tintColor: '#9496A1' }} />
                            </TouchableOpacity>
                        </View>
                        <TextInput style={[style.inputText, style.inputContainer, { height: 100, marginTop: 10, textAlignVertical: 'top', borderWidth: 1, borderRadius: 10, borderColor: '#D1D1D1', width: '100%' }]}
                            multiline={true}
                            numberOfLines={3}
                            placeholder={'Write your approval note...'}
                            placeholdergrayColor={"gray"}
                            onChangeText={(text) => setDescription(text)} />

                        <View style={{ flexDirection: "row", justifyContent: "space-evenly", width: "100%" }}>
                            <View style={[{ minWidth: 100, borderRadius: 10, alignSelf: 'center', borderWidth: 0, borderColor: '#0E5EF2', marginTop: 17,/*  flex: 1 */backgroundColor: '#0E5EF2' }]}>
                                <TouchableOpacity style={{ padding: 10, }} onPress={() => {
                                    if (description == "") {
                                        Snackbar.show({ text: "please enter approve reason" })
                                    } else {
                                        api.postWithPayloadwithToken(  /* local api call */
                                            updateStatusUrl + modalData._id,
                                            {
                                                employee: modalData.employee._id,
                                                status: "approve",
                                                reason: description,
                                                type: modalData.type
                                            }
                                        ).then(res => {

                                            setTeamLeaveArray([])

                                            wsTeamLeaveList(true, true);

                                        }),
                                            setApproveModalVisible(false)
                                    }
                                }}>
                                    <Text style={{ color: "#FFFFFF", fontSize: 16, textAlign: 'center', fontFamily: 'Rubik-Regular' }}>Send</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={[{ minWidth: 100, borderRadius: 10, alignSelf: 'center', borderWidth: 1, borderColor: '#D1D1D1', marginTop: 17 }]}>
                                <TouchableOpacity style={{ padding: 10, }} onPress={() => { setDescription(""), setApproveModalVisible(false) }}>
                                    <Text style={{ color: "#606060", fontSize: 16, textAlign: 'center', fontFamily: 'Rubik-Regular' }}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
            {/* Cancel Note */}
            <Modal
                transparent={true}
                visible={cancelModalVisible}
            // visible={true}
            >
                <View style={{
                    backgroundColor: "#000000aa", flex: 1, alignItems: "center", justifyContent: "center"
                }}>
                    <View style={{
                        ...styles.modalView1, width: "90%"
                    }}>
                        <View style={{ width: "110%", flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 0, alignItems: 'center', /* paddingBottom: 12, */ borderBottomColor: '#D1D1D1', /* paddingHorizontal: 34  */ }} >
                            <Text style={{ marginLeft: 17, fontSize: 18,/*  fontWeight: "bold" */fontFamily: 'Rubik-Regular' }}>Cancel Note</Text>
                            <TouchableOpacity onPress={() => { setDescription(""), setCancelModalVisible(false) }}>
                                <Image source={require('../assets/images/close.png')} style={{ marginRight: 17, tintColor: '#9496A1' }} />
                            </TouchableOpacity>
                        </View>
                        <TextInput style={[style.inputText, style.inputContainer, { height: 100, marginTop: 10, textAlignVertical: 'top', borderWidth: 1, borderRadius: 10, borderColor: '#D1D1D1', width: '100%' }]}
                            multiline={true}
                            numberOfLines={3}
                            placeholder={'Write your cancel reason...'}
                            placeholdergrayColor={"gray"}
                            onChangeText={(text) => setDescription(text)} />

                        <View style={{ flexDirection: "row", justifyContent: "space-evenly", width: "100%" }}>
                            <View style={[{ minWidth: 100, borderRadius: 10, alignSelf: 'center', borderWidth: 0, borderColor: '#0E5EF2', marginTop: 17,/*  flex: 1 */backgroundColor: '#0E5EF2' }]}>
                                <TouchableOpacity style={{ padding: 10, }} onPress={() => {
                                    if (description == "") {
                                        Snackbar.show({ text: "please enter cancel reason" })
                                    } else {
                                        api.postWithPayloadwithToken(  /* local api call */
                                            updateStatusUrl + modalData._id,
                                            {
                                                employee: modalData.employee._id,
                                                status: "cancel",
                                                reason: description,
                                                type: modalData.type
                                            }
                                        ).then(res => {

                                            setTeamLeaveArray([])
                                            wsTeamLeaveList(true, true);

                                        }),
                                            setCancelModalVisible(false)
                                    }
                                }}>
                                    <Text style={{ color: "#FFFFFF", fontSize: 16, textAlign: 'center', fontFamily: 'Rubik-Regular' }}>Send</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={[{ minWidth: 100, borderRadius: 10, alignSelf: 'center', borderWidth: 1, borderColor: '#D1D1D1', marginTop: 17 }]}>
                                <TouchableOpacity style={{ padding: 10, }} onPress={() => { setDescription(""), setCancelModalVisible(false) }}>
                                    <Text style={{ color: "#606060", fontSize: 16, textAlign: 'center', fontFamily: 'Rubik-Regular' }}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
            {todayDate == 1 && teamLeaveArray.length == 0 ?
                <Text style={style.emptyComponent}>No records available.</Text>
                :
                <FlatList
                    data={teamLeaveArray}
                    renderItem={renderLeaveItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={{ flexGrow: 1 }}
                    onEndReachedThreshold={0.2}
                    onEndReached={() => onEndReached()}
                    ListFooterComponent={renderFooter}
                />
            }
            <Loader visible={loading} />
        </View >
    )
}

const TeamAttendance = (props) => {
    console.log("props ??>>??" + JSON.stringify(props))
    var empId = "";
    var fromWhere = "";
    var historyDate = "";
    const imageMargin = 10
    const imageWidth = (Dimensions.get('window').width - (imageMargin * 4)) / 2
    let resAttendance = useSelector(state => state.resAttendance)
    const isLoading = useSelector(state => state.loading)
    const dispatch = useDispatch()
    const drawerRef = useRef(null)
    const [attendanceArray, setAttendanceArray] = useState([])
    const [filteredArray, setFilteredArray] = useState([])
    const [inCheckBox, setInCheckBox] = useState(false)
    const [outCheckBox, setOutCheckBox] = useState(false)
    const [showEdit, setShowEdit] = useState(true)

    const [offset, setOffset] = useState(1);
    const [isListEnd, setIsListEnd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [myTeamHistoryData, setMyTeamHistoryData] = useState([]);
    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());
    const [selectedRemarkId, setSelectedRemarkId] = useState("")
    const [modalVisible, setModalVisible] = useState(false)
    const [remarkData, setRemarkData] = useState([])
    const [selectedRemark, setSelectedRemark] = useState("");
    const [idForRemark, setIdForRemark] = useState("");

    const [idForTimeChangeReason, setIdForTimeChangeReason] = useState("");
    const [time, setTime] = useState(new Date())
    const [showTimePicker, setShowTimePicker] = useState(false)
    const [description, setDescription] = useState('')
    const [modalVisibleForTimeChange, setModalVisibleForTimeChange] = useState(false)
    const [modalVisibleForActionOnRequest, setModalVisibleForActionOnRequest] = useState(false)
    const [modalData, setModalData] = useState('')
    const [idForActionOnTimeChangeRequest, setIdForActionOnTimeChangeRequest] = useState("");
    const [requestType, setRequestType] = useState(props.requestType);
    const [requestStatus, setRequestStatus] = useState(props.requestStatus);
    const [hasMorePages, setHasMorePages] = useState(false)
    let limit = 20;
    const [skip, setSkip] = useState(0);
    const [totalRequest, setTotalRequest] = useState(-1);
    const [apiCallAvailable, setApiCallAvailable] = useState(true)
    useEffect(() => {

        webCallAttendanceHistory(true, true);

    }, [props.requestStatus, props.requestType])

    const onFromDateChange = (selectedDate) => {

        const currentDate = selectedDate || fromDate;
        setShowTimePicker(false);
        setTime(currentDate);

    };

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

    const renderFooter = () => {
        return (hasMorePages && myTeamHistoryData.length) ? <View style={{ alignItems: 'center', padding: 20 }}>
            <ActivityIndicator
                animating={true}
                color='#4386F4'
                size="large" />
        </View> : null;
    };
    useEffect(() => {
        console.log("*************onEndReached SKIP update asaasaas", skip, skip <= totalRequest);
        if (skip > 0 && skip <= totalRequest) {
            console.log("*************onEndReached SKIP update", skip, skip <= totalRequest);
            webCallAttendanceHistory()
        }
    }, [skip])
    const onEndReached = () => {
        console.log("*************onEndReached SKIP", skip, totalRequest);
        if (apiCallAvailable && skip <= totalRequest) {
            setSkip(skip + limit);
        } else {

        }
    }
    const webCallAttendanceHistory = (refresh = false, lodershow = false) => {
        // alert(123)
        // console.log("sdhbufbefuybefuybbef")
        // if (!loading && !isListEnd) {
        if (lodershow) {
            setLoading(true)
        }
        setApiCallAvailable(false)
        let team_attendance_list = `${apiUrl}${"/api/cms/attendenceRequestLog/team/list"}`
        api.postWithTokenNew(team_attendance_list, {
            "skip": refresh ? 0 : skip,
            "limit": limit,
            "sortBy": "createdAt",
            "sort": "desc",
            "filter": {
                "time_from": moment(fromDate).format('YYYY-MM-DD'),
                "time_to": moment(toDate).format('YYYY-MM-DD'),
                "requestType": props.requestType,
                "requestStatus": props.requestStatus
            }
        }).then(async (jsonResponse) => {

            if (jsonResponse.success) {
                if (refresh) {
                    setSkip(0);
                }

                if (jsonResponse?.list?.length > 0) {
                    setHasMorePages(jsonResponse?.list?.length >= limit);
                    setTotalRequest(jsonResponse.count)
                    setOffset(offset + 1);

                    let tempArray = [];
                    if (refresh) {
                        tempArray.push(...jsonResponse?.list);
                    }
                    else {
                        if (myTeamHistoryData) tempArray.push(...myTeamHistoryData);
                        tempArray.push(...jsonResponse?.list);
                    }
                    setMyTeamHistoryData(tempArray)
                    setApiCallAvailable(true)
                    setLoading(false);

                } else {
                    setMyTeamHistoryData([])
                    setIsListEnd(true);
                    setApiCallAvailable(true)
                    setLoading(false);
                }
                let jsonData = JSON.stringify(jsonResponse)

            } else {
                setApiCallAvailable(true)
                console.log("Attedance History team list **", jsonResponse.message ?? "Something went wrong!!");
            }
        }).catch(async (error) => {
            setLoading(false)
            setApiCallAvailable(true)
            console.log("Attedance History team list ***", "Something went wrong!!");
        })
        // }
    };

    const remarkRequest = () => {
        let remarkRequestUrl = `${apiUrl}${"/api/cms/attendance/set_remarks/"}${idForRemark}`


        api.postWithTokenNew(remarkRequestUrl, {
            "reasonId": selectedRemarkId,
            "remark": selectedRemark
        }).then(async (jsonResponse) => {

            if (jsonResponse.success) {

                let jsonData = JSON.stringify(jsonResponse)
                console.log("RemarkRequest Success Message", jsonData);

            } else {
                console.log("RemarkRequest Error Message **", jsonResponse.message ?? "Something went wrong!!");
            }
        }).catch(async (error) => {
            setLoading(false)
            console.log("RemarkRequest Error Message ***", "Something went wrong!!");
        })

    }

    const timeChangeRequest = () => {
        let remarkRequestUrl = `${apiUrl}${"/api/cms/attendance/change_request/"}${idForTimeChangeReason}`


        api.postWithTokenNew(remarkRequestUrl, {
            "time": time,
            "reason": description
        }).then(async (jsonResponse) => {

            if (jsonResponse.success) {

                let jsonData = JSON.stringify(jsonResponse)
                console.log("TimeChangeRequest Success Message", jsonData);

            } else {
                console.log("TimeChangeRequest Error Message **", jsonResponse.message ?? "Something went wrong!!");
            }
        }).catch(async (error) => {
            setLoading(false)
            console.log("TimeChangeRequest Error Message ***", "Something went wrong!!");
        })

    }

    const timeChangeApprove = () => {
        let remarkRequestUrl = `${apiUrl}${"/api/cms/attendenceRequestLog/updatestatus/"}${idForActionOnTimeChangeRequest}`


        api.postWithTokenNew(remarkRequestUrl, {
            "requestStatus": "approve"
        }).then(async (jsonResponse) => {

            if (jsonResponse.success) {

                let jsonData = JSON.stringify(jsonResponse)
                console.log("TimeChangeApprove Success Message", jsonData);

                setMyTeamHistoryData([])
                setTimeout(() => {
                    webCallAttendanceHistory(true, true)

                }, 500);
            } else {
                console.log("TimeChangeApprove Error Message **", jsonResponse.message ?? "Something went wrong!!");
            }
        }).catch(async (error) => {
            setLoading(false)
            console.log("TimeChangeApprove Error Message ***", "Something went wrong!!");
        })

    }
    const timeChangereject = () => {
        let remarkRequestUrl = `${apiUrl}${"/api/cms/attendenceRequestLog/updatestatus/"}${idForActionOnTimeChangeRequest}`


        api.postWithTokenNew(remarkRequestUrl, {
            "requestStatus": "reject"
        }).then(async (jsonResponse) => {

            if (jsonResponse.success) {

                let jsonData = JSON.stringify(jsonResponse)
                console.log("TimeChangereject Success Message", jsonData);
                setMyTeamHistoryData([])
                setTimeout(() => {
                    webCallAttendanceHistory(true, true)

                }, 500);
            } else {
                console.log("TimeChangereject Error Message **", jsonResponse.message ?? "Something went wrong!!");
            }
        }).catch(async (error) => {
            setLoading(false)
            console.log("TimeChangereject Error Message ***", "Something went wrong!!");
        })

    }
    const renderremark = ({ item }) => (
        <View style={{ alignItems: 'center', marginVertical: 10, flexDirection: 'row' }}>
            <TouchableOpacity onPress={() => { setSelectedRemark(item.name), setSelectedRemarkId(item._id) }} style={{ width: '80%', marginLeft: 20 }}>
                <Text /* style={{ width: '80%', marginLeft: 20 }} */> {item.name}</Text>
            </TouchableOpacity>
            {item && item.name == selectedRemark ?
                <Image source={require('../assets/images/save.png')} style={{ tintColor: '#0393FF', height: 9.73, width: 14.15 }}></Image>
                : null}
        </View>
    )

    const renderRequestItem = ({ item }) => (
        <TouchableOpacity onPress={() => {
            // navigation.navigate('AttendanceDetail', { attendanceItem: item })
        }}>

            <View style={{ ...style.cardWhite, padding: 14, marginBottom: 15, borderRadius: 8, backgroundColor: '#FFFFFF', marginHorizontal: 18, flexDirection: 'row' }}>
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

                    <Text style={{ fontSize: 14, fontFamily: 'Rubik-SemiBold', color: '#000000', width: "70%" }} adjustsFontToFit={true} numberOfLines={1}>{item && item.employee && item.employee.name}</Text>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4, }}>

                        {item?.requestType === 'attendancechangerequest' ?

                            <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                <Image source={require('../assets/images/watch.png')} style={{ height: 12, width: 12, marginRight: 6.67 }} />
                                <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: item && item.auth && item.auth.authType === 'in' ? "#00B164" : "#FF2037" }}>{(item && item.auth && item.auth.authType === 'in') ? 'In Time' : 'Out Time'}</Text>
                            </View>

                            : <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: blueColor }}>{getRequestType(item?.requestType)}</Text>
                            </View>
                        }

                        <View style={{}}>
                            {
                                item?.requestStatus == "reject" ?
                                    <Text style={{ color: "#FF2037", fontSize: 14, textAlign: 'center', padding: 2, paddingBottom: 4, fontFamily: 'Rubik-Regular' }}>Rejected</Text>
                                    :
                                    item?.requestStatus == "approve" ?
                                        <Text style={{ color: "#33B36F", fontSize: 14, textAlign: 'center', padding: 2, paddingBottom: 4, fontFamily: 'Rubik-Regular' }}>Approved</Text>
                                        :
                                        <TouchableOpacity onPress={async () => {
                                            await setModalData(item);
                                            await setModalVisibleForActionOnRequest(true);
                                            await setIdForActionOnTimeChangeRequest(item._id)
                                        }}>
                                            <View style={[{ /* minWidth: 100, */ paddingVertical: 5, paddingHorizontal: 11, backgroundColor: "#fae7b6", borderRadius: 5, borderWidth: 0, }]}>
                                                <Text style={{ color: "#DFA100", fontSize: 14, textAlign: 'center', fontFamily: 'Rubik-Regular' }}>Pending</Text>
                                            </View>
                                        </TouchableOpacity>
                            }

                        </View>
                    </View>

                    {
                        item?.requestType === 'attendancechangerequest' ?
                            <View style={{ flexDirection: 'row', justifyContent: "space-between", marginTop: 5, }}>
                                <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: item && item.attendanceChangeRequestStatus == "approve" ? "#A7A7A7" : item && item.auth && item.auth.authType === 'in' ? "#00B164" : "#FF2037", marginLeft: 18.67, textDecorationLine: item && item.attendanceChangeRequestStatus == "approve" ? "line-through" : "none" }}>{moment(item && item.auth && item.auth.time).format("h:mm:ss A")}</Text>
                                <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: item && item.attendanceChangeRequestStatus == "reject" ? "#A7A7A7" : "#0393FF", marginLeft: 18.67, textDecorationLine: item && item.attendanceChangeRequestStatus == "reject" ? "line-through" : "none" }}>{moment(item.attendanceChangeRequestTime).format("h:mm:ss A")}</Text>
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

                    <Text style={{ fontSize: 10, fontFamily: 'Rubik-Regular', color: '#9496A1', marginLeft: 18.67, marginTop: 8 }} adjustsFontToFit={true} numberOfLines={3}>{item?.reason ? item?.reason : item?.reason ? item?.reason : null}</Text>


                </View>
            </View>
        </TouchableOpacity>
    )



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
                            <Text style={[style.blueText, { marginRight: 10 }]}>IN  eee</Text> :
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
        <View style={{ backgroundColor: whiteColor, flex: 1 }}>

            <Modal
                transparent={true}
                visible={modalVisible}
            // visible={true}
            >
                <View style={{
                    backgroundColor: "#000000aa", flex: 1, alignItems: "center", justifyContent: "flex-end"
                }}>
                    <View style={{
                        ...styles.modalView,
                    }}>
                        <View style={{ width: "110%", flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, alignItems: 'center', alignSelf: 'center', paddingBottom: 12, borderBottomColor: '#D1D1D1', }} >
                            <Text style={{ marginLeft: 17, fontSize: 16, fontFamily: 'Rubik-Regular', color: "#000000" }}>Add Request</Text>
                            <TouchableOpacity onPress={() => { setModalVisible(false) }}>
                                <Image source={require('../assets/images/cross.png')} style={{ marginRight: 17, tintColor: '#9496A1', height: 18, width: 18 }} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={remarkData}
                            renderItem={renderremark}

                        />

                        <Text style={{ fontSize: 15, fontFamily: 'Rubik-Regular', color: "#0393FF", textAlign: 'center', borderTopWidth: 1, borderColor: "#D1D1D1", padding: 2, paddingTop: 26, width: "110%", alignSelf: 'center' }}>{selectedRemark}</Text>

                        <View style={{ flexDirection: "row", justifyContent: "space-evenly", width: "100%", marginVertical: 20 }}>
                            <View style={[{ minWidth: 100, borderRadius: 10, alignSelf: 'center', borderWidth: 0, borderColor: '#33B36F', marginTop: 17,/*  flex: 1 */backgroundColor: '#0393FF' }]}>
                                <TouchableOpacity style={{ padding: 10, }} onPress={() => {
                                    setModalVisible(false)

                                    remarkRequest();

                                }}>
                                    <Text style={{ color: "#FFFFFF", fontSize: 16, textAlign: 'center', fontFamily: 'Rubik-Regular' }}>Save</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={[{ minWidth: 100, borderRadius: 10, alignSelf: 'center', borderWidth: 1, borderColor: '#D1D1D1', marginTop: 17,/*  flex: 1 */ backgroundColor: "#FFFFFF" }]}>
                                <TouchableOpacity style={{ padding: 10, }} onPress={() => { setModalVisible(false) }}>
                                    <Text style={{ color: "#606060", fontSize: 16, textAlign: 'center', fontFamily: 'Rubik-Regular' }}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* modal for time change request */}

            <Modal
                transparent={true}
                visible={modalVisibleForTimeChange}
            // visible={true}
            >
                <View style={{
                    backgroundColor: "#000000aa", flex: 1, alignItems: "center", justifyContent: "flex-end"
                }}>
                    <View style={{
                        ...styles.modalView,
                    }}>
                        <View style={{ width: "110%", flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, alignItems: 'center', alignSelf: 'center', paddingBottom: 12, borderBottomColor: '#D1D1D1', }} >
                            <Text style={{ marginLeft: 17, fontSize: 16, fontFamily: 'Rubik-Regular', color: "#000000" }}>Attendance Changes</Text>
                            <TouchableOpacity onPress={() => { setModalVisibleForTimeChange(false) }}>
                                <Image source={require('../assets/images/cross.png')} style={{ marginRight: 17, tintColor: '#9496A1', height: 18, width: 18 }} />
                            </TouchableOpacity>
                        </View>

                        <View style={{ flexDirection: 'row', }}>
                            <View style={{ flexDirection: 'row', marginTop: 18.5, width: "50%" }}>
                                <Text style={{ ...style.rubikmidium, fontSize: 14, }}>Check In: </Text>
                                <Text style={{ ...style.rubikmidium, fontSize: 14, color: '#0393FF' }}>{moment().format("DD/MM/YYYY")}</Text>
                            </View>
                            <TouchableOpacity onPress={() => { setShowTimePicker(true) }}>
                                <View style={[style.cardWhite, { marginTop: 10, paddingVertical: 7.8, justifyContent: 'space-between', flexDirection: 'row', borderWidth: 1, /* backgroundColor: inputBgColor, */ alignItems: 'center', borderRadius: 10, paddingHorizontal: 8.54, borderColor: '#D1D1D1' }]}>
                                    <Text style={{ ...style.rubikmidium, fontSize: 14, color: '#0393FF', marginRight: 12.79 }}>{moment(time).format('h:mm:ss A')}</Text>
                                    <Image source={require('../assets/images/watch.png')} style={{ tintColor: '#555555', height: 13.66, width: 13.66 }} />
                                </View>
                            </TouchableOpacity>
                            <DateTimePicker
                                modal={true}
                                open={showTimePicker}
                                testID="toDateTimePicker"
                                date={time}
                                // minimumDate={fromDate}
                                mode={'time'}
                                onConfirm={onFromDateChange}
                                onCancel={() => setShowTimePicker(false)}
                            />

                        </View>
                        <View style={{ marginTop: 9 }}>
                            <Text style={{ ...style.rubikmidium, fontSize: 14, color: '#000000' }}>Reason</Text>
                            <TextInput style={[style.inputText, style.inputContainer, { height: 100, marginTop: 10, textAlignVertical: 'top', borderWidth: 1, borderRadius: 10, borderColor: '#0E5EF2', backgroundColor: whiteColor }]}
                                multiline={true}
                                numberOfLines={3}
                                placeholder={'Write your reason for going...'}
                                placeholdergrayColor={"#D2D4DA"}
                                onChangeText={(text) => setDescription(text)} />
                        </View>

                        <View style={[{ minWidth: 100, borderRadius: 12, alignSelf: 'center', borderWidth: 0, borderColor: '#D1D1D1', backgroundColor: "#0393FF", marginTop: 20 }]}>
                            <TouchableOpacity style={{ padding: 8, }} onPress={() => { timeChangeRequest(), setModalVisibleForTimeChange(false) }}>
                                <Text style={{ color: "#FFFFFF", fontSize: 16, textAlign: 'center', fontFamily: 'Rubik-Regular' }}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* modal for action on time change request */}
            <Modal
                transparent={true}
                visible={modalVisibleForActionOnRequest}

            >
                <View style={{
                    backgroundColor: "#000000aa", flex: 1, alignItems: "center", justifyContent: "flex-end"
                }}>

                    {console.log('ModelData', modalData)}
                    {modalData?.requestType === 'attendancechangerequest' ?
                        <View style={{
                            ...styles.modalView,
                        }}>
                            <View style={{ width: "110%", flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, alignItems: 'center', alignSelf: 'center', paddingBottom: 12, borderBottomColor: '#D1D1D1', }} >
                                <Text style={{ marginLeft: 17, fontSize: 16, fontFamily: 'Rubik-Regular', color: "#000000" }}>Change Attendance</Text>
                                <TouchableOpacity onPress={() => { setModalVisibleForActionOnRequest(false) }}>
                                    <Image source={require('../assets/images/cross.png')} style={{ marginRight: 17, tintColor: '#9496A1', height: 18, width: 18 }} />
                                </TouchableOpacity>
                            </View>
                            {(modalData && modalData.auth && modalData.auth.image) ?
                                <Image source={{ uri: uploadUrl + modalData.auth.image }}
                                    style={{ width: 70, height: 70, borderRadius: 100, resizeMode: 'cover', alignSelf: 'center', marginTop: 10 }} />

                                : <Image source={require('../assets/images/profilepic.png')}
                                    style={{ width: 70, height: 70, borderRadius: 100, backgroundColor: "#00000029", alignSelf: 'center', marginTop: 10 }} />
                            }
                            <Text style={{ ...style.rubikmidium, fontSize: 15, textAlign: 'center', marginTop: 11 }}>{modalData && modalData.employee && modalData.employee.name}</Text>
                            <Text style={{ fontFamily: 'Rubik-Regular', fontSize: 13, textAlign: 'center', marginTop: 10, color: '#555555' }}>{moment(modalData && modalData.auth && modalData.auth.time).format("DD/MM/YYYY")}</Text>
                            <Text style={{ fontFamily: 'Rubik-Regular', fontSize: 13, textAlign: 'center', marginTop: 10, color: '#555555' }}>Real Time: {moment(modalData && modalData.auth && modalData.auth.time).format("h:mm:ss A")}</Text>
                            <Text style={{ fontFamily: 'Rubik-Regular', fontSize: 13, textAlign: 'center', marginTop: 10, color: '#0393FF' }}>Request Time: {moment(modalData && modalData.attendanceChangeRequestTime).format("h:mm:ss A")}</Text>
                            {modalData?.reason ? <View style={{ flexDirection: 'row', /* alignItems: 'center', */ marginTop: 11, width: "70%", alignSelf: 'center', }}>
                                <Text style={{ /* ...style.rubikmidium */fontFamily: 'Rubik-Regular', fontSize: 12, color: '#000000' /* marginTop: 11  */ }}>Reason: </Text>
                                <Text style={{ fontFamily: 'Rubik-Regular', fontSize: 12, color: '#9496A1', flex: 1 }} adjustsFontToFit={true} numberOfLines={5}>{modalData && modalData.reason}</Text>
                            </View> : null}

                            <View style={{ flexDirection: "row", justifyContent: "space-evenly", width: "100%", marginVertical: 20, }}>
                                <View style={[{ minWidth: 100, borderRadius: 10, alignSelf: 'center', borderWidth: 0, borderColor: '#33B36F', marginTop: 17,/*  flex: 1 */backgroundColor: '#33B36F' }]}>
                                    <TouchableOpacity style={{ padding: 10, }} onPress={() => {
                                        setModalVisibleForActionOnRequest(false)
                                        timeChangeApprove();
                                        // remarkRequest();

                                    }}>
                                        <Text style={{ color: "#FFFFFF", fontSize: 16, textAlign: 'center', fontFamily: 'Rubik-Regular' }}>Approve</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={[{ minWidth: 100, borderRadius: 10, alignSelf: 'center', borderWidth: 1, borderColor: '#FF2037', marginTop: 17,/*  flex: 1 */ backgroundColor: "#FF2037" }]}>
                                    <TouchableOpacity style={{ padding: 10, }} onPress={() => { setModalVisibleForActionOnRequest(false); timeChangereject(); }}>
                                        <Text style={{ color: "#FFFFFF", fontSize: 16, textAlign: 'center', fontFamily: 'Rubik-Regular' }}>Reject</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                        : <View style={{
                            ...styles.modalView,
                        }}>
                            <View style={{ width: "110%", flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, alignItems: 'center', alignSelf: 'center', paddingBottom: 12, borderBottomColor: '#D1D1D1', }} >
                                <Text style={{ marginLeft: 17, fontSize: 16, fontFamily: 'Rubik-Regular', color: "#000000" }}>Change Request</Text>
                                <TouchableOpacity onPress={() => { setModalVisibleForActionOnRequest(false) }}>
                                    <Image source={require('../assets/images/cross.png')} style={{ marginRight: 17, tintColor: '#9496A1', height: 18, width: 18 }} />
                                </TouchableOpacity>
                            </View>
                            {(modalData && modalData.auth && modalData.auth.image) ?
                                <Image source={{ uri: uploadUrl + modalData.auth.image }}
                                    style={{ width: 70, height: 70, borderRadius: 100, resizeMode: 'cover', alignSelf: 'center', marginTop: 10 }} />

                                : <Image source={require('../assets/images/profilepic.png')}
                                    style={{ width: 70, height: 70, borderRadius: 100, backgroundColor: "#00000029", alignSelf: 'center', marginTop: 10 }} />
                            }
                            <Text style={{ ...style.rubikmidium, fontSize: 15, textAlign: 'center', marginTop: 11 }}>{modalData && modalData.employee && modalData.employee.name}</Text>
                            <Text style={{ fontFamily: 'Rubik-Regular', fontSize: 13, textAlign: 'center', marginTop: 10, color: '#555555' }}>{moment(modalData?.fromTime).format("DD/MM/YYYY")}</Text>
                            <View style={{ flexDirection: 'row' }}>

                                <Text style={{ fontFamily: 'Rubik-Regular', fontSize: 13, textAlign: 'center', marginTop: 10, color: '#000000' }}>Type: </Text>
                                <Text style={{ fontFamily: 'Rubik-Regular', fontSize: 13, textAlign: 'center', marginTop: 10, color: '#555555' }}>{getRequestType(modalData?.requestType)}</Text>
                            </View>
                            {modalData?.requestType !== 'in_between_check_out' ?
                                <Text style={{ fontFamily: 'Rubik-Regular', fontSize: 13, textAlign: 'center', marginTop: 10, color: '#0393FF' }}>Time: {moment(modalData?.fromTime).format("h:mm A")}</Text>
                                :
                                <View>
                                    <Text style={{ fontFamily: 'Rubik-Regular', fontSize: 13, textAlign: 'center', marginTop: 10, color: '#0393FF' }}>From: {moment(modalData?.fromTime).format("h:mm A")}</Text>
                                    <Text style={{ fontFamily: 'Rubik-Regular', fontSize: 13, textAlign: 'center', marginTop: 10, color: '#0393FF' }}>To: {moment(modalData?.toTime).format("h:mm A")}</Text>
                                </View>
                            }
                            {modalData?.reason ? <View style={{ flexDirection: 'row', /* alignItems: 'center', */ marginTop: 11, width: "70%", alignSelf: 'center', }}>
                                <Text style={{ /* ...style.rubikmidium */fontFamily: 'Rubik-Regular', fontSize: 12, color: '#000000' /* marginTop: 11  */ }}>Reason: </Text>
                                <Text style={{ fontFamily: 'Rubik-Regular', fontSize: 12, color: '#9496A1', flex: 1 }} adjustsFontToFit={true} numberOfLines={5}>{modalData && modalData.reason}</Text>
                            </View> : null}

                            <View style={{ flexDirection: "row", justifyContent: "space-evenly", width: "100%", marginVertical: 20, }}>
                                <View style={[{ minWidth: 100, borderRadius: 10, alignSelf: 'center', borderWidth: 0, borderColor: '#33B36F', marginTop: 17,/*  flex: 1 */backgroundColor: '#33B36F' }]}>
                                    <TouchableOpacity style={{ padding: 10, }} onPress={() => {
                                        setModalVisibleForActionOnRequest(false)
                                        timeChangeApprove();
                                        // remarkRequest();

                                    }}>
                                        <Text style={{ color: "#FFFFFF", fontSize: 16, textAlign: 'center', fontFamily: 'Rubik-Regular' }}>Approve</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={[{ minWidth: 100, borderRadius: 10, alignSelf: 'center', borderWidth: 1, borderColor: '#FF2037', marginTop: 17,/*  flex: 1 */ backgroundColor: "#FF2037" }]}>
                                    <TouchableOpacity style={{ padding: 10, }} onPress={() => { setModalVisibleForActionOnRequest(false); timeChangereject(); }}>
                                        <Text style={{ color: "#FFFFFF", fontSize: 16, textAlign: 'center', fontFamily: 'Rubik-Regular' }}>Reject</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>}
                </View>
            </Modal>
            {/* <DrawerLayout
                ref={drawerRef}
                drawerPosition={'right'}
                drawerWidth={Dimensions.get('window').width}
                renderNavigationView={() => navigationView}
            > */}
            <View style={{ backgroundColor: whiteColor, flex: 1, marginTop: 15 }}>
                <FlatList
                    data={myTeamHistoryData}
                    // numColumns={2}
                    renderItem={renderRequestItem}
                    contentContainerStyle={{ flexGrow: 1 }}
                    onEndReachedThreshold={0.2}
                    onEndReached={() => onEndReached()}
                    ListFooterComponent={renderFooter}
                    ListEmptyComponent={
                        (loading) ? null : <Text style={style.emptyComponent}>No records available.</Text>
                    }
                    keyExtractor={item => item._id}
                />
                <Loader visible={loading} />
            </View>

            {/* 
                    <TouchableOpacity style={{ ...style.floatingButton, right: 18, bottom: 43, backgroundColor: '#0393FF' }} onPress={() => {
                        navigation.navigate('AttendanceHistory', { eId: navigation.getParam('empid') })
                    }}>
                        <Image source={require('../assets/images/Attendance-History.png')} style={{ tintColor: whiteColor }} />
                    </TouchableOpacity> */}


            {/* </DrawerLayout> */}
        </View>
    );

}


const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center",
        // backgroundColor: "#707070"
        // borderWidth: 12


    },
    modalView: {
        backgroundColor: "white",
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        // padding: 15,
        paddingVertical: 15,
        paddingHorizontal: 17,
        // flex: 1,
        width: "100%",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5

    },
    modalView1: {
        backgroundColor: "white",
        borderRadius: 12,
        // padding: 15,
        paddingVertical: 15,
        paddingHorizontal: 17,
        // flex: 1,
        width: "100%",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5

    },
    blueText: {
        color: '#0393FF',
        fontSize: 14,
        fontFamily: 'Rubik-Regular',
    },
    grayText: {
        color: "#A7A7A7",
        fontSize: 14,
        fontFamily: 'Rubik-Regular'
    },
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

export default TeamRequest;

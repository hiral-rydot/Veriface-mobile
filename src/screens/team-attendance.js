import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Dimensions,
    Platform,
    StyleSheet,
    Modal,
    TextInput,
    KeyboardAvoidingView
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
import { apiTodayAttendance } from '../actions'
import { useDispatch, useSelector } from 'react-redux'
import { SafeAreaView } from 'react-native-safe-area-context';
import Overlay from '../components/overlay'
import { utils } from '../utils/utils';
import { uploadUrl } from '../webservice/constant';
import moment from 'moment';
import { api } from "../webservice/api";
import { apiUrl } from '../webservice/constant';
import { TEAM_ATTENDANCE_LIST } from "../webservice/constant";
import Moment from 'moment';
import DateTimePicker from 'react-native-date-picker';

const TeamAttendance = ({ navigation }) => {

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
    const [employeeId, setEmployeeId] = useState("")

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

    const [modalData, setModalData] = useState('')
    const [idForTimeChangeReason, setIdForTimeChangeReason] = useState("");
    const [timeChange, setTimeChange] = useState(new Date())
    const [showTimePicker, setShowTimePicker] = useState(false)
    const [description, setDescription] = useState('')
    const [modalVisibleForTimeChange, setModalVisibleForTimeChange] = useState(false)
    const [modalVisibleForActionOnRequest, setModalVisibleForActionOnRequest] = useState(false)
    const [idForActionOnTimeChangeRequest, setIdForActionOnTimeChangeRequest] = useState("");
    const [timeItem, setTimeItem] = useState("")

    useEffect(() => {
        // fromWhere
        console.log("1111", navigation.state.params.isAttendanceRemark)
        setEmployeeId(navigation.state.params.empid)
        remarkList();
        empId = navigation.getParam('empid');
        fromWhere = navigation.getParam('fromWhere');
        console.log("1234567890", fromWhere)
        if (fromWhere === "AttendanceHistory") {
            historyDate = navigation.getParam('historyDate');
            empId = navigation.getParam('empid');
            webCallAttendanceHistory(empId, historyDate);

        } else { webCallAttendanceHistory(empId, historyDate); }
        console.log("fromWhere", historyDate, empId);
    }, [])

    const onFromDateChange = (selectedDate) => {
        console.log("22222", selectedDate)
        const currentDate = selectedDate || fromDate;
        setShowTimePicker(false);
        setTimeChange(currentDate);

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
    const remarkList = () => {



        let team_attendance_list = `${apiUrl}${"/api/cms/reasons/search"}`
        api.postWithTokenNew(team_attendance_list, {
            "skip": 0,
            "limit": 20,
            // "sortBy": "time",
            // "sort": "asc",
            // "filter": {
            //     "employee": empId,
            //     "fromDate": Moment(fromDate).format('YYYY-MM-DD'),
            //     "toDate": Moment(toDate).format('YYYY-MM-DD')
            // }
        }).then(async (jsonResponse) => {

            if (jsonResponse.success) {
                if (jsonResponse?.list?.length > 0) {
                    console.log("remark", jsonResponse)
                    setRemarkData(jsonResponse?.list)
                }

                let jsonData = JSON.stringify(jsonResponse)
                console.log("MyTeamHistory Success Message", jsonData);

            } else {
                console.log("MyTeamHistory Error Message **", jsonResponse.message ?? "Something went wrong!!");
            }
        }).catch(async (error) => {
            setLoading(false)
            console.log("MyTeamHistory Error Message ***", "Something went wrong!!");
        })
    };


    const webCallAttendanceHistory = (empId, historyDate) => {

        console.log("OffSet -> ", offset);

        if (!loading && !isListEnd) {
            setLoading(true)

            let team_attendance_list = `${apiUrl}${TEAM_ATTENDANCE_LIST}`
            api.postWithTokenNew(team_attendance_list, {
                "skip": 0,
                "limit": 50,
                "sortBy": "time",
                "sort": "desc",
                "filter": {
                    "employee": empId,
                    "time_from": historyDate != "" ? historyDate : moment(fromDate).format('YYYY-MM-DD'),
                    "time_to": historyDate != "" ? historyDate : moment(toDate).format('YYYY-MM-DD')
                }
            }).then(async (jsonResponse) => {

                if (jsonResponse.success) {
                    if (jsonResponse?.list?.length > 0) {
                        setOffset(offset + 1);
                        setMyTeamHistoryData(jsonResponse?.list)
                        setLoading(false);
                    } else {
                        setIsListEnd(true);
                        setLoading(false);
                    }
                    let jsonData = JSON.stringify(jsonResponse)
                    console.log("MyTeamHistory Success Message", jsonData);

                } else {
                    console.log("MyTeamHistory Error Message **", jsonResponse.message ?? "Something went wrong!!");
                }
            }).catch(async (error) => {
                setLoading(false)
                console.log("MyTeamHistory Error Message ***", "Something went wrong!!");
            })
        }
    };

    const remarkRequest = (test) => {
        let remarkRequestUrl = `${apiUrl}${"/api/cms/attendance/set_remarks/"}${idForRemark}`
        console.log("empid in remark", remarkRequestUrl)

        api.postWithTokenNew(remarkRequestUrl, {
            "reasonId": selectedRemarkId,
            "remark": selectedRemark
        }).then(async (jsonResponse) => {

            if (jsonResponse.success) {
                if (test) {
                    webCallAttendanceHistory(employeeId, moment().format())
                }
                let jsonData = JSON.stringify(jsonResponse)
                console.log("MyTeamHistory Success Message", jsonData);

            } else {
                console.log("MyTeamHistory Error Message **", jsonResponse.message ?? "Something went wrong!!");
            }
        }).catch(async (error) => {
            setLoading(false)
            console.log("MyTeamHistory Error Message ***", "Something went wrong!!");
        })

    }

    const timeChangeRequest = (test) => {
        let remarkRequestUrl = `${apiUrl}${"/api/cms/attendance/change_request/"}${idForTimeChangeReason}`
        console.log("empid in remark", remarkRequestUrl)

        api.postWithTokenNew(remarkRequestUrl, {
            "time": timeChange,
            "reason": description
        }).then(async (jsonResponse) => {

            if (jsonResponse.success) {
                if (test) {
                    webCallAttendanceHistory(employeeId, moment().format())
                }
                let jsonData = JSON.stringify(jsonResponse)
                console.log("MyTeamHistory Success Message", jsonData);

            } else {
                console.log("MyTeamHistory Error Message **", jsonResponse.message ?? "Something went wrong!!");
            }
        }).catch(async (error) => {
            setLoading(false)
            console.log("MyTeamHistory Error Message ***", "Something went wrong!!");
        })

    }

    const timeChangeApprove = () => {
        let remarkRequestUrl = `${apiUrl}${"/api/cms/attendenceRequestLog/updatestatus/"}${idForActionOnTimeChangeRequest}`
        console.log("empid in remark", remarkRequestUrl)

        api.postWithTokenNew(remarkRequestUrl, {
            "isApprove": "approve"
        }).then(async (jsonResponse) => {

            if (jsonResponse.success) {

                let jsonData = JSON.stringify(jsonResponse)
                console.log("MyTeamHistory Success Message", jsonData);

            } else {
                console.log("MyTeamHistory Error Message **", jsonResponse.message ?? "Something went wrong!!");
            }
        }).catch(async (error) => {
            setLoading(false)
            console.log("MyTeamHistory Error Message ***", "Something went wrong!!");
        })

    }
    const timeChangereject = () => {
        let remarkRequestUrl = `${apiUrl}${"/api/cms/attendenceRequestLog/updatestatus/"}${idForActionOnTimeChangeRequest}`
        console.log("empid in remark", remarkRequestUrl)

        api.postWithTokenNew(remarkRequestUrl, {
            "isApprove": "reject"
        }).then(async (jsonResponse) => {

            if (jsonResponse.success) {

                let jsonData = JSON.stringify(jsonResponse)
                console.log("MyTeamHistory Success Message", jsonData);

            } else {
                console.log("MyTeamHistory Error Message **", jsonResponse.message ?? "Something went wrong!!");
            }
        }).catch(async (error) => {
            setLoading(false)
            console.log("MyTeamHistory Error Message ***", "Something went wrong!!");
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

    const renderItem = ({ item }) => (

        <View style={{ ...style.cardWhite, padding: 14, marginBottom: 10, borderRadius: 8, backgroundColor: '#FFFFFF', marginHorizontal: 18, flexDirection: 'row', marginTop: 5 }}>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                {(item.image) ?
                    <Image source={{ uri: uploadUrl + item.image }}
                        /* style={{ width: 92, height: 118, borderRadius: 10, resizeMode: 'cover' }} */
                        style={{ width: 70, height: 70, borderRadius: 100, resizeMode: "stretch", }} />
                    : <Image source={require('../assets/images/Employee-Time.png')}
                        /* style={{ width: 92, height: 118, borderRadius: 10, resizeMode: 'contain' }} */
                        style={{ width: 70, height: 70, borderRadius: 100, resizeMode: "stretch", }} />
                }
            </View>
            <View style={{ marginLeft: 9, flex: 1 }}>

                <Text style={{ fontSize: 14, fontFamily: 'Rubik-SemiBold', color: '#000000', width: "70%" }} adjustsFontToFit={true} numberOfLines={1}>{item && item.employee && item.employee.name}</Text>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4, }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                        <Image source={require('../assets/images/watch.png')} style={{ height: 12, width: 12, marginRight: 6.67 }} />
                        <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: item.authType === 'in' ? "#00B164" : "#FF2037" }}>{(item.authType === 'in') ? 'In Time' : 'Out Time'}</Text>
                    </View>

                    {navigation.state.params.fromWhere == "dashboard" && navigation.state.params.isChangeAttendance == true ?
                        <>
                            {item.attendanceChangeRequestStatus ?
                                <TouchableOpacity onPress={() => {
                                    // setShowEdit(true);
                                }} >
                                    <View style={{}}>
                                        {
                                            item.attendanceChangeRequestStatus == "reject" ?
                                                <View style={[{ /* minWidth: 100, */ paddingVertical: 5, paddingHorizontal: 11, backgroundColor: "#fabec4", borderRadius: 5, borderWidth: 0, borderColor: '#D1D1D1' }]}>
                                                    <Text style={{ color: "#FF2037", fontSize: 12, textAlign: 'center', padding: 2, paddingBottom: 4, fontFamily: 'Rubik-Regular' }}>Rejected</Text>
                                                </View> :
                                                item.attendanceChangeRequestStatus == "approve" ?
                                                    <View style={[{ /* minWidth: 100, */ paddingVertical: 5, paddingHorizontal: 11, backgroundColor: "#b5e6cc", borderRadius: 5, borderWidth: 0, borderColor: '#D1D1D1' }]}>
                                                        <Text style={{ color: "#33B36F", fontSize: 12, textAlign: 'center', padding: 2, paddingBottom: 4, fontFamily: 'Rubik-Regular' }}>Approved</Text>
                                                    </View> :
                                                    <View style={[{ /* minWidth: 100, */ paddingVertical: 5, paddingHorizontal: 11, backgroundColor: "#fae7b6", borderRadius: 5, borderWidth: 0, }]}>
                                                        <Text style={{ color: "#DFA100", fontSize: 12, textAlign: 'center', fontFamily: 'Rubik-Regular' }}>Pending</Text>
                                                    </View>
                                        }

                                    </View>
                                </TouchableOpacity>
                                :
                                <TouchableOpacity style={{
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 17.45,
                                    height: 17.45,
                                    backgroundColor: '#0E5EF2',
                                    borderRadius: 40,
                                }} onPress={async () => {

                                    await setModalVisibleForTimeChange(true)
                                    await setIdForTimeChangeReason(item._id)
                                    await setTimeChange(item?.time)

                                }}>
                                    <Image source={require('../assets/images/edit.png')} style={{ height: 7, width: 7 }} />
                                </TouchableOpacity>
                            }

                        </>
                        :
                        navigation.state.params.fromWhere == "myTeam" ?
                            <>
                                {item.attendanceChangeRequestStatus ?

                                    <View style={{}}>
                                        {
                                            item.attendanceChangeRequestStatus == "reject" ?
                                                <View style={[{ /* minWidth: 100, */ paddingVertical: 5, paddingHorizontal: 11, backgroundColor: "#fabec4", borderRadius: 5, borderWidth: 0, borderColor: '#D1D1D1' }]}>
                                                    <Text style={{ color: "#FF2037", fontSize: 12, textAlign: 'center', padding: 2, paddingBottom: 4, fontFamily: 'Rubik-Regular' }}>Rejected</Text>
                                                </View> :
                                                item.attendanceChangeRequestStatus == "approve" ?
                                                    <View style={[{ /* minWidth: 100, */ paddingVertical: 5, paddingHorizontal: 11, backgroundColor: "#b5e6cc", borderRadius: 5, borderWidth: 0, borderColor: '#D1D1D1' }]}>
                                                        <Text style={{ color: "#33B36F", fontSize: 12, textAlign: 'center', padding: 2, paddingBottom: 4, fontFamily: 'Rubik-Regular' }}>Approved</Text>
                                                    </View> :
                                                    <TouchableOpacity onPress={async () => {
                                                        await setModalData(item);
                                                        await setModalVisibleForActionOnRequest(true);
                                                        await setIdForActionOnTimeChangeRequest(item._id)
                                                    }}>
                                                        <View style={[{ /* minWidth: 100, */ paddingVertical: 5, paddingHorizontal: 11, backgroundColor: "#fae7b6", borderRadius: 5, borderWidth: 0, }]}>
                                                            <Text style={{ color: "#DFA100", fontSize: 12, textAlign: 'center', fontFamily: 'Rubik-Regular' }}>Pending</Text>
                                                        </View>
                                                    </TouchableOpacity>
                                        }

                                    </View>

                                    :
                                    null}
                            </>
                            :
                            null}
                </View>
                {item && item.attendanceChangeRequestStatus ?
                    <View style={{ flexDirection: 'row', justifyContent: "space-between", marginTop: 7.74, }}>
                        <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: item && item.attendanceChangeRequestStatus == "approve" ? "#A7A7A7" : item.authType === 'in' ? "#00B164" : "#FF2037", marginLeft: 18.67, textDecorationLine: item && item.attendanceChangeRequestStatus == "approve" ? "line-through" : "none" }}>{moment(item.time).format("h:mm:ss A")}</Text>
                        <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: item && item.attendanceChangeRequestStatus == "reject" ? "#A7A7A7" : "#0393FF", marginLeft: 18.67, textDecorationLine: item && item.attendanceChangeRequestStatus == "reject" ? "line-through" : "none" }}>{moment(item.attendanceChangeRequestTime).format("h:mm:ss A")}</Text>
                    </View>
                    :
                    <View style={{ flexDirection: 'row', justifyContent: "space-between", marginTop: 7.74, }}>
                        <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: item.authType === 'in' ? "#00B164" : "#FF2037", marginLeft: 18.67, }}>{moment(item.time).format("h:mm:ss A")}</Text>
                    </View>
                }
                {/* <View style={{ flexDirection: 'row', justifyContent: "space-between", marginTop: 7.74, }}>
                        <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: item.authType === 'in' ? "#00B164" : "#FF2037", marginLeft: 18.67, }}>{moment(item.time).format("h:mm:ss A")}</Text>
                    </View> */}
                {navigation.state.params.fromWhere == "myTeam" || navigation.state.params.fromWhere == "AttendanceHistory" ?
                    <Text style={{ fontSize: 8, fontFamily: 'Rubik-Regular', color: '#9496A1', marginLeft: 18.67, marginTop: 11 }} adjustsFontToFit={true} numberOfLines={3}>{item.remark ? item.remark : ''}</Text>
                    : null}

                {navigation.state.params.fromWhere == "dashboard" && navigation.state.params.isAttendanceRemark == true ?
                    <>
                        {item.remark ?
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 11 }}>
                                <View style={{ alignItems: 'center', justifyContent: 'center', width: 12.18, height: 12.18, borderWidth: 1, borderColor: '#DDDDDD', borderRadius: 34, }}>
                                    <Image source={require('../assets/images/add.png')} style={{ height: 7, width: 7, tintColor: '#DDDDDD' }} />
                                </View>
                                <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: '#DDDDDD', marginLeft: 6.49, textAlignVertical: 'center' }} adjustsFontToFit={true} numberOfLines={3}>Add Remark</Text>
                            </View>
                            :
                            <TouchableOpacity onPress={() => {
                                setIdForRemark(item._id), setModalVisible(true)
                            }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 11 }}>
                                    <View style={{ alignItems: 'center', justifyContent: 'center', width: 12.18, height: 12.18, borderWidth: 1, borderColor: '#0393FF', borderRadius: 34, }}>
                                        <Image source={require('../assets/images/add.png')} style={{ height: 7, width: 7, tintColor: '#0393FF' }} />
                                    </View>
                                    <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: '#0393FF', marginLeft: 6.49, textAlignVertical: 'center' }} adjustsFontToFit={true} numberOfLines={3}>Add Remark</Text>
                                </View>
                            </TouchableOpacity>
                        }
                    </> : null}
            </View>
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
                        <TouchableOpacity style={{ justifyContent: 'center', flexDirection: 'row' }} onPress={() => navigation.goBack()}>
                            <Image source={require('../assets/images/back.png')}
                                style={style.backIcon1} />
                            <>{navigation.getParam('fromWhere') !== "AttendanceHistory" ? <Text style={style.headerText}>Today's Attendance({moment().format("DD/MM/YYYY")}) </Text> : <Text style={style.headerText}>{moment(navigation.getParam('historyDate')).format("DD/MM/YYYY")}</Text>}</>
                        </TouchableOpacity>
                    </View>
                }

            />
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
                                        remarkRequest(true),
                                            setModalVisible(false);
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
                        <KeyboardAvoidingView style={{
                            ...styles.modalView,
                        }}
                            behavior={Platform.OS === 'ios' ? 'padding' : null}
                        >
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
                                        <Text style={{ ...style.rubikmidium, fontSize: 14, color: '#0393FF', marginRight: 12.79 }}>{moment(timeChange).format('h:mm:ss A')}</Text>
                                        <Image source={require('../assets/images/watch.png')} style={{ tintColor: '#555555', height: 13.66, width: 13.66 }} />
                                    </View>
                                </TouchableOpacity>
                                <DateTimePicker
                                    modal={true}
                                    open={showTimePicker}
                                    testID="toDateTimePicker"
                                    date={timeChange ? new Date(timeChange) : new Date()}
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

                            <View style={[{ minWidth: 100, borderRadius: 12, alignSelf: 'center', borderWidth: 0, borderColor: '#D1D1D1', backgroundColor: "#0393FF", marginTop: 20, ...Platform.select({ ios: { marginBottom: 20 } }) }]}>
                                <TouchableOpacity style={{ padding: 8, }} onPress={() => { timeChangeRequest(true), setModalVisibleForTimeChange(false); }}>
                                    <Text style={{ color: "#FFFFFF", fontSize: 16, textAlign: 'center', fontFamily: 'Rubik-Regular' }}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </KeyboardAvoidingView>
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
                        <View style={{
                            ...styles.modalView,
                        }}>
                            <View style={{ width: "110%", flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, alignItems: 'center', alignSelf: 'center', paddingBottom: 12, borderBottomColor: '#D1D1D1', }} >
                                <Text style={{ marginLeft: 17, fontSize: 16, fontFamily: 'Rubik-Regular', color: "#000000" }}>Attendance Changes</Text>
                                <TouchableOpacity onPress={() => { setModalVisibleForActionOnRequest(false) }}>
                                    <Image source={require('../assets/images/cross.png')} style={{ marginRight: 17, tintColor: '#9496A1', height: 18, width: 18 }} />
                                </TouchableOpacity>
                            </View>
                            {(modalData && modalData.image) ?

                                <Image source={{ uri: uploadUrl + modalData.image }}
                                    style={{ width: 70, height: 70, borderRadius: 100, resizeMode: 'cover', alignSelf: 'center', marginTop: 10 }} />

                                : <Image source={require('../assets/images/profilepic.png')}
                                    style={{ width: 70, height: 70, borderRadius: 100, backgroundColor: "#00000029", alignSelf: 'center', marginTop: 10 }} />
                            }
                            <Text style={{ ...style.rubikmidium, fontSize: 15, textAlign: 'center', marginTop: 11 }}>{modalData && modalData.employee && modalData.employee.name}</Text>
                            <Text style={{ fontFamily: 'Rubik-Regular', fontSize: 13, textAlign: 'center', marginTop: 10, color: '#555555' }}>{moment(modalData && modalData.time).format("DD/MM/YYYY")}</Text>
                            <Text style={{ fontFamily: 'Rubik-Regular', fontSize: 13, textAlign: 'center', marginTop: 10, color: '#555555' }}>Real Time: {moment(modalData && modalData.time).format("h:mm:ss A")}</Text>
                            <Text style={{ fontFamily: 'Rubik-Regular', fontSize: 13, textAlign: 'center', marginTop: 10, color: '#0393FF' }}>Request Time: {moment(modalData && modalData.attendanceChangeRequestTime).format("h:mm:ss A")}</Text>
                            <View style={{ flexDirection: 'row', /* alignItems: 'center', */ marginTop: 11, width: "70%", alignSelf: 'center', }}>
                                <Text style={{ /* ...style.rubikmidium */fontFamily: 'Rubik-Regular', fontSize: 12, color: '#000000' /* marginTop: 11  */ }}>Reason: </Text>
                                <Text style={{ fontFamily: 'Rubik-Regular', fontSize: 12, color: '#9496A1', flex: 1 }} adjustsFontToFit={true} numberOfLines={5}>{modalData && modalData.attendanceChangeRequestReason}</Text>
                            </View>
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
                                    <TouchableOpacity style={{ padding: 10, }} onPress={() => {
                                        setModalVisibleForActionOnRequest(false)
                                        timeChangereject()
                                        /* timeChangeRequest();  */
                                    }}>
                                        <Text style={{ color: "#FFFFFF", fontSize: 16, textAlign: 'center', fontFamily: 'Rubik-Regular' }}>Reject</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </Modal>
                <DrawerLayout
                    ref={drawerRef}
                    drawerPosition={'right'}
                    drawerWidth={Dimensions.get('window').width}
                    renderNavigationView={() => navigationView}
                >
                    <View style={{ backgroundColor: whiteColor, flex: 1, marginTop: 5 }}>
                        <FlatList
                            data={myTeamHistoryData}
                            // numColumns={2}
                            renderItem={renderItem}
                            contentContainerStyle={{ flexGrow: 1 }}
                            ListEmptyComponent={
                                (loading) ? null : <Text style={style.emptyComponent}>No records available.</Text>
                            }
                            keyExtractor={item => item._id}
                        />
                        <Loader visible={loading} />
                    </View>

                    <>{(navigation.getParam('fromWhere') === ("myTeam")) ?
                        <TouchableOpacity style={{ ...style.floatingButton, right: 18, bottom: 43, backgroundColor: '#0393FF' }} onPress={() => {
                            navigation.navigate('AttendanceHistory', { eId: navigation.getParam('empid') })
                        }}>
                            <Image source={require('../assets/images/Attendance-History.png')} style={{ tintColor: whiteColor }} />
                        </TouchableOpacity>
                        : null}</>

                </DrawerLayout>
            </View>
        </SafeAreaView>
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
        // alignItems: "center",
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
});
export default TeamAttendance
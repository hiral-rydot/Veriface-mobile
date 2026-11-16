import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Dimensions,
    Modal,
    StyleSheet,
    TextInput,
    Alert,
    ActivityIndicator
} from 'react-native';
import { NavigationBar } from 'navigationbar-react-native'
import DrawerLayout from 'react-native-gesture-handler/DrawerLayout'
import { SafeAreaView } from 'react-native-safe-area-context';
// import { Dropdown } from 'react-native-material-dropdown'
import { Dropdown } from 'react-native-element-dropdown';
import { style } from '../styles/style'
import { menuHeaderColor, whiteColor, dropdownBaseColor, iconColor, grayColor } from '../styles/color'
import { FlatList } from 'react-native-gesture-handler';
import TopCurve from '../components/top-curve';
import BlueButton from '../components/blue-button'
import { apiLeaveList, apiLeaveType } from '../actions'
import { useDispatch, useSelector } from 'react-redux'
import { utils } from '../utils/utils';
import { ResourceArray, updateStatusUrl } from '../webservice/constant'
import moment from 'moment';
import { api } from '../webservice/api';
import Snackbar from 'react-native-snackbar';

const Leave = (props) => {
    const drawerRef = useRef(null)
    const dropdownLeave = useRef(null)
    const [appliedDate, setAppliedDate] = useState(new Date(1598051730000))
    const [showApplyDate, setShowApplyDate] = useState(false);
    const [leaveType, setLeaveType] = useState('');
    const [leaveStatus, setLeaveStatus] = useState('');
    const [leaveArray, setLeaveArray] = useState([])
    const [filteredArray, setFilteredArray] = useState([])
    const [leavetypeArray, setLeavetypeArray] = useState([]);
    let resLeaveType = useSelector(state => state.resLeaveType)
    let resLeaveList = useSelector(state => state.resLeaveList)
    const isLoading = useSelector(state => state.loading)
    const dispatch = useDispatch()

    const [modalVisible, setModalVisible] = useState(false);
    const [modalData, setModalData] = useState('')
    const [todayDate, setTodayDate] = useState(-2)
    const [cancelModalVisible, setCancelModalVisible] = useState(false)
    const [description, setDescription] = useState('');
    const [isFocus, setIsFocus] = useState(false);

    useEffect(() => {
        resLeaveList = null
        dispatch(apiLeaveType({ isActive: true }))
        wsLeaveList()
    }, [])
    useEffect(() => {
        if (resLeaveList && resLeaveList.success) {
            setLeaveArray(resLeaveList.list)
            setFilteredArray(resLeaveList.list)
            setTodayDate(1)
        }
    }, [resLeaveList])

    useEffect(() => {
        if (resLeaveType && resLeaveType.success) {
            setLeavetypeArray(resLeaveType.list)
        }
    }, [resLeaveType])



    // useEffect(() => {
    //     if (props.navigation.state.params.post) {
    //       alert('Updated')
    //     }
    //   }, [props.navigation.state.params.post]);
    const wsLeaveList = () => {
        dispatch(apiLeaveList({}))
    }

    // //Reset Filter
    // useEffect(() => {
    //     if (leaveType === '' || leaveStatus === '') {
    //         filterLeave()
    //     }
    // }, [leaveType, leaveStatus])

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

    const filterLeave = () => {
        if (leaveType !== '' && leaveStatus !== '') {
            const tempArr = leaveArray.filter(leave => leave.leaveType._id === leaveType && leave.isApprove === leaveStatus)
            setFilteredArray(tempArr)
        } else if (leaveType !== '') {
            const tempArr = leaveArray.filter(leave => leave.leaveType._id === leaveType)
            setFilteredArray(tempArr)
        } else if (leaveStatus !== '') {
            const tempArr = leaveArray.filter(leave => leave.isApprove === leaveStatus)
            setFilteredArray(tempArr)
        } else {
            setFilteredArray(leaveArray)
        }
    }
    const onAppliedDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || appliedDate;
        setShowApplyDate(false);
        setAppliedDate(currentDate);
    };
    const renderItem = ({ item }) => (
        <View style={[/* style.cardWhite, */ { margin: 6, borderRadius: 10, padding: 10, borderColor: '#D1D1D1', borderWidth: 1 }]}>
            <TouchableOpacity onPress={() => {
                setModalVisible(true)
                setModalData(item)
                // props.navigation.navigate('LeaveDetails', { leaveItem: item })
            }}>
                <View style={{ flexDirection: 'row', flex: 1 }}>

                    <View>
                        {/* <Text style={[style.grayText, { alignSelf: 'flex-end' }]}>{utils.formatDateTime(item.createdAt)}</Text> */}
                        {/* {console.log("///////////////", item)} */}
                        <Text style={{ color: '#9496A1', fontSize: 12, fontFamily: 'Rubik-Regular' }}>{item.leaveDays < 1 ? (item.halfLeaveType ? (item.halfLeaveType == "secondHalf" ? "Second-Half" : item.halfLeaveType == "firstHalf" ? "First-Half" : "Half Day") + " Leave Application" : "Half Leave Application") : item.leaveDays == 1 ? "Full Leave Application" : item.leaveDays + " Day Leave Application"} </Text>
                        {item && item.leaveDays > 1 ?
                            <Text style={{ fontSize: 16, fontWeight: '700', marginTop: 3, fontFamily: 'Rubik-Regular' }}>{moment(item.fromDate).format("ddd, DD MMM")} - {moment(item.toDate).format("ddd, DD MMM YYYY")}</Text>
                            : <Text style={{ fontSize: 16, fontWeight: '700', marginTop: 3, fontFamily: 'Rubik-Regular' }}>{moment(item.toDate).format("ddd, DD MMM YYYY")}</Text>
                        }
                        <Text style={{ fontSize: 14, color: item && item.leaveType && item.leaveType.leaveName == "Casual leave" ? "#FFC121" : item && item.leaveType && item.leaveType.leaveName == "Medical leave" ? '#FF2037' : "#0393FF", marginTop: 3, fontFamily: 'Rubik-Regular' }}>{(item.leaveType) ? item.leaveType.leaveName : ''}</Text>
                        {/* <Text numberOfLines={2} style={style.grayText}>{item.description}</Text> */}
                    </View>
                    <View style={{
                        flex: 1,
                        alignItems: 'flex-end',
                    }}>
                        {
                            item.isApprove == "reject" ?
                                <View style={[{ minWidth: 100, backgroundColor: "#fabec4", borderRadius: 5, borderWidth: 0, borderColor: '#D1D1D1' }]}>
                                    <Text style={{ color: "#FF2037", fontSize: 16, textAlign: 'center', padding: 2, paddingBottom: 4, fontFamily: 'Rubik-Regular' }}>Rejected</Text>
                                </View>
                                :
                                item.isApprove == "approve" ?
                                    <View style={[{ minWidth: 100, backgroundColor: "#b5e6cc", borderRadius: 5, borderWidth: 0, borderColor: '#D1D1D1' }]}>
                                        <Text style={{ color: "#33B36F", fontSize: 16, textAlign: 'center', padding: 2, paddingBottom: 4, fontFamily: 'Rubik-Regular' }}>Approved</Text>
                                    </View> :
                                    item.isApprove == "cancel" ?
                                        <View style={[{ minWidth: 100, backgroundColor: "#b8d1ff", borderRadius: 5, borderWidth: 0, borderColor: '#D1D1D1' }]}>
                                            <Text style={{ color: "#4486FF", fontSize: 16, textAlign: 'center', padding: 2, paddingBottom: 4, fontFamily: 'Rubik-Regular' }}>Canceled</Text>
                                        </View> :
                                        <View style={[{ minWidth: 100, backgroundColor: "#fae7b6", borderRadius: 5, borderWidth: 0, borderColor: '#D1D1D1', /* padding: 12  */ }]}>
                                            <Text style={{ color: "#DFA100", fontSize: 16, textAlign: 'center', padding: 2, paddingBottom: 4, fontFamily: 'Rubik-Regular' }}>Pending</Text>
                                        </View>

                        }

                    </View>
                </View>
            </TouchableOpacity>
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

                <View style={{ padding: 10/* , margin: 20 */ }}>
                    {/* <Text style={[style.blueText, { marginTop: 10 }]}>Leave Type</Text> */}
                    {/* <View style={[style.inputContainer, { marginTop: 10 }]}>
                         <Dropdown
                            ref={dropdownLeave}
                            data={leavetypeArray}
                            rippleCentered={true}
                            itemPadding={5}
                            lineWidth={0}
                            value={leaveType}
                            valueExtractor={((v) => v._id)}
                            labelExtractor={((v) => v.name)}
                            dropdownOffset={{ top: 8, left: 20 }}
                            onChangeText={(value) => setLeaveType(value)}
                            baseColor={dropdownBaseColor}
                            containerStyle={[{ flex: 1, height: 40, overflow: "visible", }]}
                        /> 
                            </View> */}
                    <Text style={{ ...style.rubikmidium, fontSize: 14, color: '#000000', marginTop: 20 }}>Leave Type</Text>
                    <Dropdown
                        style={[styles.dropdown,]}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={style.inputTextDate}
                        inputSearchStyle={styles.inputSearchStyle}
                        iconStyle={styles.iconStyle}
                        data={leavetypeArray ?? []}
                        // search
                        maxHeight={300}
                        labelField='name'
                        valueField='_id'
                        placeholder={leavetypeArray ? '--Select Request Type--' : 'Loading...'}
                        // searchPlaceholder="Search..."
                        value={leaveType}
                        onFocus={() => setIsFocus(true)}
                        onBlur={() => setIsFocus(false)}
                        onChange={value => {
                            setLeaveType(value._id)
                            // requestType1 = value._id;
                            // setdropdownvalue(value.name)
                        }}
                    />

                    {/* <Text style={[style.blueText, { marginTop: 20 }]}>Status</Text> */}
                    {/* <View style={[style.inputContainer, { marginTop: 10 }]}>
                        <Dropdown
                            ref={dropdownLeave}
                            data={ResourceArray.statusArr}
                            rippleCentered={true}
                            itemPadding={5}
                            lineWidth={0}
                            value={leaveStatus}
                            valueExtractor={((v) => v._id)}
                            labelExtractor={((v) => v.name)}
                            dropdownOffset={{ top: 8, left: 20 }}
                            onChangeText={(value) => setLeaveStatus(value)}
                            baseColor={dropdownBaseColor}
                            containerStyle={[{ flex: 1, height: 40, overflow: "visible", }]}
                        />
                    </View> */}
                    <Text style={{ ...style.rubikmidium, fontSize: 14, color: '#000000', marginTop: 20 }}>Status</Text>
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
                        placeholder={ResourceArray.statusArr ? '--Select Request Type--' : 'Loading...'}
                        // searchPlaceholder="Search..."
                        value={leaveStatus}
                        onFocus={() => setIsFocus(true)}
                        onBlur={() => setIsFocus(false)}
                        onChange={value => {
                            setLeaveStatus(value._id)
                            // requestType1 = value._id;
                            // setdropdownvalue(value.name)
                        }}
                    />
                    {/* <View style={{ flexDirection: 'row', marginTop: 30 }}>
                        <BlueButton
                            containerStyle={{ minWidth: 0, flex: 1, marginRight: 5 }}
                            title={'APPLY'}
                            onPress={() => {
                                filterLeave()
                                closeDrawer()
                            }}
                        />
                        <BlueButton
                            containerStyle={{ minWidth: 0, flex: 1, marginLeft: 5 }}
                            title={'RESET'}
                            onPress={() => {
                                setLeaveType('')
                                setLeaveStatus('')

                            }}
                        />
                    </View> */}
                    <View style={{ flexDirection: "row", justifyContent: "space-evenly", width: "100%", marginVertical: 20 }}>
                        <View style={[{ minWidth: 100, borderRadius: 10, alignSelf: 'center', borderWidth: 0, borderColor: '#33B36F',/*  marginTop: 17, *//*  flex: 1 */backgroundColor: '#0393FF' }]}>
                            <TouchableOpacity style={{ padding: 10, }} onPress={() => {
                                filterLeave()
                                closeDrawer()
                            }}>
                                <Text style={{ color: "#FFFFFF", fontSize: 16, textAlign: 'center', fontFamily: 'Rubik-Regular' }}>APPLY</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={[{ minWidth: 100, borderRadius: 10, alignSelf: 'center', borderWidth: 1, borderColor: '#D1D1D1', /* marginTop: 17, */ backgroundColor: "#FFFFFF" }]}>
                            <TouchableOpacity style={{ padding: 10, }} onPress={() => {
                                setLeaveType('')
                                setLeaveStatus('')
                                wsLeaveList();
                                closeDrawer()
                            }}>
                                <Text style={{ color: "#606060", fontSize: 16, textAlign: 'center', fontFamily: 'Rubik-Regular' }}>RESET</Text>
                            </TouchableOpacity>
                        </View>

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
                                <Text style={style.headerText}>Leaves</Text>
                            </TouchableOpacity>
                        </View>

                    }
                    componentRight={() =>
                        <View style={{ flexDirection: 'row', justifyContent: "space-between", alignItems: "center", right: 10 }}>
                            <TouchableOpacity onPress={() => openDrawer()}>
                                <Image source={require('../assets/images/filter1.png')}
                                    style={{ resizeMode: 'contain', marginRight: 10, height: 25, width: 25, tintColor: "white" }} />
                            </TouchableOpacity>
                            <TouchableOpacity style={{
                                borderWidth: 2,
                                borderColor: /* 'rgba(0,0,0,0.2)' */"white",
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 25,
                                // position: 'absolute',
                                // bottom: 10,
                                // right: 10,
                                height: 25,
                                backgroundColor: "#0E5EF2",
                                borderRadius: 7,
                            }} onPress={() => {
                                props.navigation.navigate('NewLeave', { wsLeaveList: wsLeaveList })
                            }}>
                                <Image source={require('../assets/images/add.png')} style={{ height: 12, width: 12, tintColor: "white" }} />
                            </TouchableOpacity>
                        </View>
                    }
                />

                <View style={{ flex: 1, backgroundColor: whiteColor }}>
                    {/* <TopCurve /> */}
                    <Modal
                        transparent={true}
                        visible={modalVisible}

                    >
                        <View style={{ ...styles.centeredView, backgroundColor: "#000000aa" }}>
                            {/* {console.log("@@@@@@@@@@@@", modalData)} */}
                            <View style={{ ...styles.modalView, }}>
                                <View style={{ width: "110%", flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, alignItems: 'center', paddingBottom: 12, borderBottomColor: '#D1D1D1', }} >
                                    <Text style={{ marginLeft: 17, fontSize: 18, fontFamily: 'Rubik-Regular' }}>Basic Information</Text>
                                    <TouchableOpacity onPress={() => { setModalVisible(false) }}>
                                        <Image source={require('../assets/images/close.png')} style={{ marginRight: 17, tintColor: '#9496A1' }} />
                                    </TouchableOpacity>
                                </View>
                                <View style={{ width: "100%", flexDirection: 'row', alignItems: 'center', justifyContent: "space-between", marginTop: 12 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        {/* <Image source={require('../assets/images/profilepic.png')}
                                            style={{ width: 42, height: 39, borderRadius: 50, backgroundColor: whiteColor, marginRight: 7 }} /> */}
                                        {/* } */}
                                        {(modalData && modalData.employee && modalData.employee.profile_image) ?
                                            <Image source={{ uri: uploadUrl + modalData.employee.profile_image }}
                                                style={{ width: 41, height: 42, borderRadius: 50, resizeMode: 'cover', }} />
                                            : <Image source={require('../assets/images/profilepic.png')}
                                                style={{ width: 41, height: 42, borderRadius: 50, backgroundColor: "#00000029", marginRight: 10 }} />
                                        }
                                        <View style={{}}>
                                            <Text style={[{ fontSize: 18, color: "black",/*  fontWeight: '700', */  fontFamily: 'Rubik-Bold' }]}>{modalData && modalData.name && modalData.name.name}</Text>
                                            <Text style={{ color: modalData && modalData.leaveType && modalData.leaveType.leaveName == "Casual leave" ? "#FFC121" : modalData && modalData.leaveType && modalData.leaveType.leaveName == "Medical leave" ? '#FF2037' : "#0393FF", marginTop: 3, fontFamily: 'Rubik-Regular' }}>{modalData && modalData.leaveType && modalData.leaveType.leaveName} Request</Text>
                                        </View>
                                    </View>
                                    {/* <View style={[{ minWidth: 100, backgroundColor: "#c4d4f2", borderRadius: 7, borderWidth: 0, borderColor: '#D1D1D1', alignItems: 'flex-end' }]}>
                                        <Text style={{ color: "#4486FF", fontSize: 16, textAlign: 'center', padding: 7, fontWeight: '700' }}>Total Balance: 5</Text>
                                    </View> */}
                                </View>
                                <View style={{ width: '100%', flexDirection: 'row', marginTop: 12 }}>
                                    <View style={{ justifyContent: 'flex-start', flex: 1 }}>
                                        <Text style={{ color: '#606060', fontFamily: 'Rubik-Regular' }}>Applied On</Text>
                                        <Text style={{ color: '#606060', marginTop: 3, fontFamily: 'Rubik-Regular' }}>Date </Text>
                                        {modalData.leaveDays >= 1 ?
                                            <Text style={{ color: '#606060', marginTop: 3, fontFamily: 'Rubik-Regular' }}>{modalData && modalData.leaveDays == 1 ? "Leave day" : "Leave days"}</Text> :
                                            <Text></Text>}
                                        <Text style={{ color: '#606060', marginTop: 3, fontFamily: 'Rubik-Regular' }}>Status </Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ /* fontWeight: '700' , */fontFamily: 'Rubik-Bold' }}>: {moment(modalData.createdAt).format('DD MMM YYYY')}</Text>
                                        {modalData.leaveDays > 1 ?
                                            <Text style={{ /* fontWeight: '700', */ marginTop: 3, fontFamily: 'Rubik-Bold' }}>: {moment(modalData.fromDate).format('DD MMM')}, to {moment(modalData.toDate).format("DD MMM YYYY")}</Text>
                                            : <Text style={{ /* fontWeight: '700', */ marginTop: 3, fontFamily: 'Rubik-Bold' }}>: {moment(modalData.toDate).format("DD MMM YYYY")}</Text>}
                                        {modalData.leaveDays >= 1 ?
                                            <Text style={{ /* fontWeight: '700', */ marginTop: 3, fontFamily: 'Rubik-Bold' }}>: {modalData && modalData.leaveDays} {modalData.leaveDays == 1 ? "Day" : "Days"}</Text>
                                            :
                                            <Text style={{ /* fontWeight: '700', */ marginTop: 3, fontFamily: 'Rubik-Bold' }}>  ({modalData && modalData.halfLeaveType == "secondHalf" ? "Second-Half" : modalData.halfLeaveType == "firstHalf" ? "First-Half" : "Half Day"})</Text>}
                                        {/* {modalData.leaveDays < 1 ?
                                            <Text style={{ fontWeight: '700', marginTop: 3 }}>  {("(Half Day)")}</Text> : null} */}
                                        <Text style={{ /* fontWeight: '700', */ marginTop: 3, fontFamily: 'Rubik-Bold' }}>: {modalData && modalData.isApprove == "approve" ? "Approved" : modalData.isApprove == "reject" ? "Rejected" : modalData.isApprove == "cancel" ? "Canceled" : "Pending"}</Text>
                                    </View>
                                </View>
                                <View style={{ marginTop: 12, width: "100%" }}>
                                    <Text style={{ color: '#606060', fontFamily: 'Rubik-Regular' }}>Reason</Text>
                                    <View style={[{/* minWidth: 100, */ padding: 12,/*  margin: 7, */ backgroundColor: "#F3F4F8", borderRadius: 7, borderWidth: 0, borderColor: '#D1D1D1', marginTop: 3 }]}>
                                        <Text style={{ color: "#606060", fontSize: 16,/* textAlign: 'center', */ /* padding: 2 */ fontFamily: 'Rubik-Regular' }}>{modalData && modalData.description}</Text>
                                    </View>
                                </View>
                                {/* <View style={[{ minWidth: 100, borderRadius: 10, alignSelf: 'center', borderWidth: 1, borderColor: '#D1D1D1', marginTop: 17 }]}>
                                    <TouchableOpacity style={{ padding: 10, }} onPress={() => { setModalVisible(false) }}>
                                        <Text style={{ color: "#606060", fontSize: 16, textAlign: 'center' }}>Cancel leave request</Text>
                                    </TouchableOpacity>
                                </View> */}
                                {(((moment(modalData && modalData.toDate).startOf('day').format()) >= (moment().startOf('day').format())) /* || ((moment(modalData && modalData.toDate).format()) == (moment().format())) */) && modalData.isApprove == "pending" ?
                                    <View style={[{ minWidth: 100, borderRadius: 10, alignSelf: 'center', borderWidth: 0, borderColor: '#D1D1D1', marginVertical: 20, backgroundColor: "#0E5EF2" }]}>
                                        <TouchableOpacity style={{ padding: 10, }} onPress={() => { setCancelModalVisible(true), setModalVisible(false), setTodayDate(-2) }}>
                                            <Text style={{ color: "#FFFFFF", fontSize: 16, textAlign: 'center', fontFamily: 'Rubik-Regular' }}>Cancel</Text>
                                        </TouchableOpacity>
                                    </View> :
                                    <View style={[{ minWidth: 100, borderRadius: 10, alignSelf: 'center', borderWidth: 1, borderColor: '#D1D1D1', marginVertical: 20, backgroundColor: "#FFFFFF" }]}>
                                        <TouchableOpacity style={{ padding: 10, }} onPress={() => { setModalVisible(false) }}>
                                            <Text style={{ color: "#606060", fontSize: 16, textAlign: 'center', fontFamily: 'Rubik-Regular' }}>Close</Text>
                                        </TouchableOpacity>
                                    </View>

                                }
                            </View>
                        </View>
                    </Modal>
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
                                                Snackbar.show({ text: "Please enter cancel reason" })
                                            } else {
                                                api.postWithPayloadwithToken(  /* local api call */
                                                    updateStatusUrl + modalData._id,
                                                    {
                                                        employee: modalData.name._id,
                                                        status: "cancel",
                                                        reason: description,
                                                        type: modalData.type
                                                    }
                                                ).then(res => {
                                                    console.log("res:" + JSON.stringify(res))
                                                    /* setTodayDate(-2) */
                                                    setFilteredArray([])
                                                    wsLeaveList();
                                                    // return res
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
                    {todayDate == 1 && filteredArray.length == 0 ?
                        <Text style={style.emptyComponent}>No records available.</Text>
                        :
                        <FlatList
                            data={filteredArray}
                            renderItem={renderItem}
                            keyExtractor={item => item._id}
                            contentContainerStyle={{ flexGrow: 1 }}
                            ListEmptyComponent={() =>
                                /* (isLoading) ? null : */ <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center', flexDirection: 'row', /* marginBottom: "50%" */ }}>
                                    <ActivityIndicator
                                        animating={true}
                                        color='#4386F4'
                                        size="large" />
                                </View>/* ((filteredArray.length) ? <Text style={style.emptyComponent}>No records available.</Text> : null) */
                            }
                        />

                    }

                    {/* <TouchableOpacity style={style.floatingButton} onPress={() => {
                        props.navigation.navigate('NewLeave', { wsLeaveList: wsLeaveList })
                    }}>
                        <Image source={require('../assets/images/add.png')} />
                    </TouchableOpacity> */}
                </View>
            </DrawerLayout>
        </SafeAreaView>
    )


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
        fontSize: 12,
        fontFamily: 'Rubik-Regular',
    },
    grayText: {
        color: "#A7A7A7",
        fontSize: 12,
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
export default Leave

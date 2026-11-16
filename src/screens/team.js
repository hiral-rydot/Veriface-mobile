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
import { style } from '../styles/style'
import { menuHeaderColor, whiteColor, dropdownBaseColor, iconColor } from '../styles/color'
import { FlatList } from 'react-native-gesture-handler';
import { apiTeamLeaveList, apiLeaveType } from '../actions'
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment';
import Search from 'react-native-search-box';
import { apiUrl, updateStatusUrl, uploadUrl } from '../webservice/constant';
import { api } from '../webservice/api';
import Snackbar from 'react-native-snackbar';

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
    const [searchBarShow, setSearchBarShow] = useState(false)
    const [description, setDescription] = useState('');
    const [todayDate, setTodayDate] = useState(-2)
    const [cancelModalVisible, setCancelModalVisible] = useState(false)


    useEffect(() => {
        resTeamLeaveList = null
        // dispatch(apiTeamLeaveList({ isActive: true }))
        wsTeamLeaveList()
    }, [])
    const wsTeamLeaveList = (text = plantSearchText) => {
        let data = {
            skip: 0,
            // limit: 20,
            sortBy: "createdAt",
            sort: "desc",
            filter: {
                employeeName: text
            }
        }
        dispatch(apiTeamLeaveList(data))
    }

    useEffect(() => {
        // setLoadingTemp(false)
        if (resTeamLeaveList && resTeamLeaveList.success) {
            setTeamLeaveArray(resTeamLeaveList.list)
            setTodayDate(1);
        }
    }, [resTeamLeaveList])

    const renderItem = ({ item }) => (
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
                                    item.isApprove == "reject" ?
                                        <View style={[{ minWidth: 100, backgroundColor: "#fabec4", borderRadius: 5, borderWidth: 0, borderColor: '#D1D1D1' }]}>
                                            <Text style={{ color: "#FF2037", fontSize: 16, textAlign: 'center', padding: 2, paddingBottom: 4, fontFamily: 'Rubik-Regular' }}>Rejected</Text>
                                        </View> :
                                        item.isApprove == "approve" ?
                                            <View style={[{ minWidth: 100, backgroundColor: "#b5e6cc", borderRadius: 5, borderWidth: 0, borderColor: '#D1D1D1' }]}>
                                                <Text style={{ color: "#33B36F", fontSize: 16, textAlign: 'center', padding: 2, paddingBottom: 4, fontFamily: 'Rubik-Regular' }}>Approved</Text>
                                            </View> :
                                            item.isApprove == "cancel" ?
                                                <View style={[{ minWidth: 100, backgroundColor: "#b8d1ff", borderRadius: 5, borderWidth: 0, borderColor: '#D1D1D1' }]}>
                                                    <Text style={{ color: "#4486FF", fontSize: 16, textAlign: 'center', padding: 2, paddingBottom: 4, fontFamily: 'Rubik-Regular' }}>Canceled</Text>
                                                </View> :
                                                <View style={[{ minWidth: 100, backgroundColor: "#fae7b6", borderRadius: 5, borderWidth: 0, }]}>
                                                    <Text style={{ color: "#DFA100", fontSize: 16, textAlign: 'center', padding: 2, paddingBottom: 4, fontFamily: 'Rubik-Regular' }}>Pending</Text>
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
                    {/* <View style={{
                        flex: 1,
                        alignItems: 'flex-end',
                    }}>
                        {
                            item.isApprove == "reject" ?
                                <View style={[{ minWidth: 100, backgroundColor: "#fabec4", borderRadius: 5, borderWidth: 0, borderColor: '#D1D1D1' }]}>
                                    <Text style={{ color: "#FF2037", fontSize: 16, textAlign: 'center', padding: 2, paddingBottom: 4, fontFamily: 'Rubik-Regular' }}>Rejected</Text>
                                </View> :
                                item.isApprove == "approve" ?
                                    <View style={[{ minWidth: 100, backgroundColor: "#b5e6cc", borderRadius: 5, borderWidth: 0, borderColor: '#D1D1D1' }]}>
                                        <Text style={{ color: "#33B36F", fontSize: 16, textAlign: 'center', padding: 2, paddingBottom: 4, fontFamily: 'Rubik-Regular' }}>Approved</Text>
                                    </View> :
                                    item.isApprove == "cancel" ?
                                        <View style={[{ minWidth: 100, backgroundColor: "#b8d1ff", borderRadius: 5, borderWidth: 0, borderColor: '#D1D1D1' }]}>
                                            <Text style={{ color: "#4486FF", fontSize: 16, textAlign: 'center', padding: 2, paddingBottom: 4, fontFamily: 'Rubik-Regular' }}>Canceled</Text>
                                        </View> :
                                        <View style={[{ minWidth: 100, backgroundColor: "#fae7b6", borderRadius: 5, borderWidth: 0, }]}>
                                            <Text style={{ color: "#DFA100", fontSize: 16, textAlign: 'center', padding: 2, paddingBottom: 4, fontFamily: 'Rubik-Regular' }}>Pending</Text>
                                        </View>
                        }

                    </View> */}
                </View>
            </TouchableOpacity>
        </View>
    )
    const searchBox = useRef(null);
    return (
        <SafeAreaView style={style.header}>
            <NavigationBar
                navigationBarStyle={{ ...style.navigationBarStyle }}
                componentLeft={() =>
                    <View style={{ alignItems: 'flex-start', marginLeft: 5 }}>
                        <TouchableOpacity style={{ justifyContent: 'center', flexDirection: 'row' }} onPress={() => props.navigation.goBack(null)}>
                            <Image source={require('../assets/images/back.png')}
                                style={style.backIcon1} />
                            <Text style={style.headerText}>Team Leaves</Text>
                        </TouchableOpacity>
                    </View>

                }
                componentRight={() =>
                    <View style={{ flexDirection: 'row', justifyContent: "space-between", alignItems: "center", right: 10 }}>
                        {searchBarShow == false ?
                            <TouchableOpacity onPress={() => { setSearchBarShow(true) }}>
                                <Image source={require('../assets/images/search1.png')}
                                    style={{ resizeMode: 'contain', marginRight: 10, tintColor: iconColor }} />
                            </TouchableOpacity> : null}
                        {/* <TouchableOpacity style={{
                            borderWidth: 1,
                            borderColor: 'rgba(0,0,0,0.2)',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 30,
                            height: 30,
                            backgroundColor: "#0E5EF2",
                            borderRadius: 7,
                        }} onPress={() => {
                            props.navigation.navigate('NewLeave', { wsLeaveList: wsLeaveList })
                        }}>
                            <Image source={require('../assets/images/add.png')} />
                        </TouchableOpacity> */}
                    </View>
                }
            />
            <View style={{ flex: 1, backgroundColor: whiteColor }}>
                {/* <TopCurve /> */}
                {searchBarShow ?
                    <View style={{ marginBottom: 12, marginTop: 12 }}>
                        <Search
                            ref={searchBox}
                            backgroundColor={'transparent'}
                            inputBorderRadius={17}
                            titleCancelColor={"#0E5EF2"}
                            onSearch={() => {
                                return new Promise((resolve, reject) => {
                                    wsTeamLeaveList()
                                    resolve();
                                });
                            }}
                            onChangeText={(searchText) => {
                                return new Promise((resolve, reject) => {
                                    setPlantSearchText(searchText.toLowerCase());
                                    console.log(searchText)
                                    // wsTeamLeaveList().then(() => {

                                    // resolve();
                                    // })
                                });
                            }}
                            onCancel={() => {
                                return new Promise((resolve, reject) => {
                                    setPlantSearchText('')
                                    // .then(() => {
                                    wsTeamLeaveList("")
                                    setSearchBarShow(false)
                                    // })
                                }
                                )
                            }}
                        />
                    </View> : null}
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
                                {/* <View style={[{ minWidth: 100, backgroundColor: "#aac3f0", borderRadius: 7, borderWidth: 0, borderColor: '#D1D1D1', alignItems: 'flex-end' }]}>
                                    <Text style={{ color: "#4486FF", fontSize: 16, textAlign: 'center', padding: 7, fontWeight: "700" }}>Total Balance: 5</Text>
                                </View> */}
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
                                    <Text style={{ /* fontWeight: '700', */ marginTop: 3, fontFamily: 'Rubik-Bold' }}>: {modalData && modalData.isApprove == "approve" ? "Approved" : modalData.isApprove == "reject" ? "Rejected" : modalData.isApprove == "cancel" ? "Canceled" : "Pending"}</Text>
                                </View>
                            </View>
                            <View style={{ marginTop: 12, /* borderWidth: 1, */ width: "100%" }}>
                                <Text style={{ color: '#606060', fontFamily: 'Rubik-Regular' }}>Reason</Text>
                                <View style={[{ /* minWidth: 100, */ padding: 12,/*  margin: 7, */ backgroundColor: "#F3F4F8", borderRadius: 7, borderWidth: 0, borderColor: '#D1D1D1', marginTop: 3 }]}>
                                    <Text style={{ color: "#606060", fontSize: 16, /* textAlign: 'center', */ /* padding: 2 */ fontFamily: 'Rubik-Regular' }}>{modalData && modalData.description}</Text>
                                </View>
                            </View>
                            {modalData && modalData.isApprove == "pending" /* || modalData.isApprove == "reject" || */ /* moment(modalData.fromDate).isBefore(todayDate) *//* (moment(modalData.fromDate).format() < moment().format()) */ ?
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
                                modalData.isApprove == "approve" ?
                                    // <View style={[{ minWidth: 100, borderRadius: 10, alignSelf: 'center', borderWidth: 1, borderColor: '#D1D1D1', marginVertical: 20,/*  flex: 1 */ backgroundColor: "#FFFFFF" }]}>
                                    //     <TouchableOpacity style={{ padding: 10, }} onPress={() => { setModalVisible(false) }}>
                                    //         <Text style={{ color: "#606060", fontSize: 16, textAlign: 'center' }}>Close</Text>
                                    //     </TouchableOpacity>
                                    // </View>
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
                                                // setLoadingTemp(true)
                                                /* setTodayDate(-2) */
                                                setTeamLeaveArray([])
                                                console.log("res: " + JSON.stringify(res))
                                                wsTeamLeaveList();
                                                // return res
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
                                                // setLoadingTemp(true)
                                                // setTodayDate(-2)
                                                setTeamLeaveArray([])
                                                console.log("res:" + JSON.stringify(res))
                                                wsTeamLeaveList();
                                                // return res
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
                                                console.log("res:" + JSON.stringify(res))
                                                // setTodayDate(-2)
                                                setTeamLeaveArray([])
                                                wsTeamLeaveList();
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
                {todayDate == 1 && teamLeaveArray.length == 0 ?
                    <Text style={style.emptyComponent}>No records available.</Text>
                    :
                    <FlatList
                        data={teamLeaveArray}
                        renderItem={renderItem}
                        keyExtractor={item => item._id}
                        contentContainerStyle={{ flexGrow: 1 }}
                    // ListEmptyComponent={
                    //     /* (isLoading) ? null : */ <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center', flexDirection: 'row', /* marginTop: 100 */ }}>
                    //         <ActivityIndicator
                    //             animating={true}
                    //             color='#4386F4'
                    //             size="large" />
                    //     </View>
                    // }
                    />
                }
            </View >
            {/* </DrawerLayout> */}
        </SafeAreaView >
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
});
export default Team;
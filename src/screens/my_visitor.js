import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    SafeAreaView,
    TouchableOpacity,
    Image,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    StyleSheet,
    TextInput,
    Keyboard,
    Modal,
    Switch
} from "react-native";
import { style } from "../styles/style";
import { NavigationBar } from "navigationbar-react-native";
import LinearGradient from "react-native-linear-gradient";
import { whiteColor, blueColor, darkGrayColor, grayColor } from "../styles/color";
import { APPROVE_REJECT_VISITOR, apiUrl, uploadUrl } from "../webservice/constant";
import { api } from "../webservice/api";
import { MY_VISITOR } from "../webservice/constant";
import moment from "moment";
import Snackbar from "react-native-snackbar";
import QRCodeGenerator from "./qrCodeGenerator";
import { Dropdown } from 'react-native-element-dropdown';
import DateTimePicker from 'react-native-date-picker'

const PRESENT = 1;
const ABSENT = 2;
const ONLEAVE = 3;

const MyVisitor = ({ navigation }) => {
    var today = new Date(); // today!

    var months = new Date();
    months.setDate(months.getDate() - 90);

    const [fromDate, setFromDate] = useState(months);
    const [toDate, setToDate] = useState(today);

    const [myVisitorData, setMyVisitorData] = useState(null);
    const [myVisitorPresentData, setMyVisitorPresentData] = useState(null);
    const [offset, setOffset] = useState(20);
    const [skip, setSkip] = useState(0);
    //const [skip, setSkip] = useState(0);
    const LIMIT = 20;
    const [hasMorePages, setHasMorePages] = useState(false);
    // const [isListEnd, setIsListEnd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const loadingNextPageRef = React.useRef(false);
    const [responseData, setResponseData] = useState();
    const [tabIndex, setTabIndex] = useState(0);
    const usersDictionaryRef = React.useRef(new Map());
    const [presentCount, setPresentCount] = useState('');
    const [absentCount, setAbsentCount] = useState('');
    const [onLeaveCount, setOnLeaveCount] = useState('');
    const [totalCount, setTotalCount] = useState('');
    const [searchByName, setSearchByName] = useState("");
    const [clicked, setClicked] = useState(false)
    const [showSearch, setShowSearch] = useState(false)
    const [modalVisible, setModalVisible] = useState(false);
    const [modalData, setModalData] = useState('')
    const [qrmodalVisible, setQRmodalVisible] = useState(false);
    const [meetingWithList, setMeetingWithList] = useState([]);
    const [modalVisibleForQrGenerate, setmodalVisibleForQrGenerate] = useState(false);

    const [meeting, setMeeting] = useState('')
    const [isFocus, setIsFocus] = useState(false);
    const [purpose, setPurpose] = useState('')

    const [fromDateForInBetweenCheckout, setFromDateForInBetweenCheckout] = useState(new Date());
    const [fromTimeForInBetweenCheckout, setFromTimeForInBetweenCheckout] = useState(new Date());
    const [toDateForInBetweenCheckout, setToDateForInBetweenCheckout] = useState(new Date());
    const [toTimeForInBetweenCheckout, setToTimeForInBetweenCheckout] = useState(new Date());
    const [showFromDateForInBetweenCheckout, setShowFromDateForInBetweenCheckout] = useState(false);
    const [showToDateForInBetweenCheckout, setShowToDateForInBetweenCheckout] = useState(false);
    const [showFromTimeForInBetweenCheckout, setShowFromTimeForInBetweenCheckout] = useState(false);
    const [showToTimeForInBetweenCheckout, setShowToTimeForInBetweenCheckout] = useState(false);
    var dateForInBetweenCheckoutFromDate = moment(fromDateForInBetweenCheckout).format('DD/MM/YYYY');
    var timeForInBetweenCheckoutFromTime = moment(fromTimeForInBetweenCheckout).format('hh:mm:ss a');
    var dateForInBetweenCheckoutToDate = moment(toDateForInBetweenCheckout).format('DD/MM/YYYY');
    var timeForInBetweenCheckoutToTime = moment(toTimeForInBetweenCheckout).format('hh:mm:ss a');

    const [isEnabled, setIsEnabled] = useState(false);
    const toggleSwitch = () => setIsEnabled(previousState => !previousState);

    useEffect(() => {
        listOfMeetingWith();
        const unmount = navigation.addListener("didFocus", () => {
            webCallMyVisitor(true);
        });

        return () => {
            unmount.remove();
        };

    }, [searchByName]);

    useEffect(() => {
        console.log("*************UseEffect SKIP")
        if (skip > 0 && tabIndex == 0)
            webCallMyVisitor()
                .then(() => { loadingNextPageRef.current = false; })
                .catch(() => { loadingNextPageRef.current = false; })
    }, [skip]);


    const renderFooter = () => {

        return (hasMorePages && tabIndex == 0) ? <View style={{ alignItems: 'center', padding: 20 }}>
            <ActivityIndicator
                animating={true}
                color='#4386F4'
                size="large" />
        </View> : null;
    };

    const onEndReached = () => {
        console.log("*************onEndReached SKIP", skip, loadingNextPageRef.current);
        if (!loadingNextPageRef.current && hasMorePages && tabIndex == 0) {
            loadingNextPageRef.current = true;
            console.log("*************onEndReached SKIP", skip, loadingNextPageRef.current);
            setSkip(skip + LIMIT);
        } else {
            setRefreshing(false);
            setLoading(false);
        }

    }

    const webCallMyVisitor = (refresh = false) => {
        console.log("webCallMyVisitor********", refresh);
        setLoading(true);
        return new Promise((resolve, reject) => {
            let timeSlot = `${apiUrl}${MY_VISITOR}`
            let payload = { skip: refresh ? 0 : skip, limit: LIMIT, sortBy: "createdAt", sort: 'desc', name: searchByName, "filter": { fromDate: fromDate, toDate: toDate } };
            api.postWithTokenNew(timeSlot, payload).then(async (jsonResponse) => {
                console.log("1111******jsonResponse.list.length123********");
                if (jsonResponse.success) {
                    console.log("22222******jsonResponse.list.length123********");
                    if (refresh) {
                        setSkip(0);
                    }

                    let tempArray = [];
                    let tempPresentArray = [];


                    if (refresh) {
                        tempArray.push(...jsonResponse?.list);
                        tempPresentArray.push(...jsonResponse?.presentVisitors)
                    }
                    else {
                        if (myVisitorData) tempArray.push(...myVisitorData);
                        tempArray.push(...jsonResponse?.list);

                        if (myVisitorPresentData) tempPresentArray.push(...myVisitorPresentData);
                        tempPresentArray.push(...jsonResponse?.presentVisitors)
                    }

                    //const map = new Map();
                    for (let val of jsonResponse?.list) {
                        usersDictionaryRef.current.set(val._id, val);
                    }

                    for (let val of jsonResponse?.presentVisitors) {
                        let listItem = usersDictionaryRef.current.get(val._id);
                        if (listItem) {
                            listItem.attendance = { status: PRESENT, authType: val.authType, time: val.time };
                        }
                    }

                    setMyVisitorData(tempArray);
                    setMyVisitorPresentData(tempPresentArray)
                    setTotalCount(jsonResponse?.count);
                    setPresentCount(tempPresentArray?.length);

                    setHasMorePages(jsonResponse?.list?.length >= LIMIT);
                    console.log("******jsonResponse.list.length********", jsonResponse.list.length);

                    if (jsonResponse?.list?.length < LIMIT)
                        console.log("MyVisitor Success Message", jsonResponse);
                    resolve();
                } else {
                    console.log("MyVisitor Error Message **", jsonResponse.message ?? "Something went wrong!!");
                    reject(jsonResponse.message ?? "Something went wrong!!");
                }
                setLoading(false);
            }).catch(async (error) => {
                setLoading(false)
                console.log("MyVisitor Error Message ***", "Something went wrong!!", error);
                reject(error);
            })
        });
    };

    const approveRejectVisitorQR = (status) => {
        console.log("Approve-Reject Visitor QR********", status);
        setLoading(true);
        return new Promise((resolve, reject) => {
            let url = `${apiUrl}${APPROVE_REJECT_VISITOR}${modalData?.qrCodeId}`
            let payload;
            if (status === "isApproved") {
                payload = { isApproved: true, status: "approve" };
            } else {
                payload = { isApproved: false, status: "reject" };
            }
            api.postWithTokenNew(url, payload).then(async (jsonResponse) => {
                console.log("1111******Approve-Reject visitor QR jsonResponse.list.length123********");
                if (jsonResponse.success) {
                    webCallMyVisitor(true);
                    if (status === "isApproved") {
                        Snackbar.show({ text: 'Visitor Approved Successfully.' })
                    } else {
                        Snackbar.show({ text: 'Visitor Rejected Successfully.' })
                    }
                    console.log("22222******Approve-Reject visitor QR jsonResponse.list.length123********");
                    console.log(jsonResponse)
                    resolve();
                } else {
                    Snackbar.show({ text: jsonResponse?.errors[0]?.msg })
                    console.log("Approve-Reject visitor QR Error Message **", jsonResponse.message ?? "Something went wrong!!");
                    reject(jsonResponse.message ?? "Something went wrong!!");
                }
                setLoading(false);
            }).catch(async (error) => {
                setLoading(false)
                console.log("Approve-Reject visitor QR Error Message ***", "Something went wrong!!", error);
                reject(error);
            })
        });
    };

    const renderEmployeeType = ({ item }) => (
        tabIndex == 0 || tabIndex == item?.attendance?.status ?
            <View style={{ ...style.cardWhite, padding: 14, marginBottom: 15, borderRadius: 8, backgroundColor: '#FFFFFF', marginHorizontal: 18 }}>
                <TouchableOpacity onPress={() => {
                    setModalVisible(true)
                    setModalData(item)
                    // navigation.navigate('VisitorAttendance', { empid: item._id, fromWhere: "myVisitor" })
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity onPress={() => {
                            setModalVisible(true)
                            setModalData(item)
                        }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                                {(item?.profile_image) ?
                                    <Image source={{ uri: uploadUrl + item?.profile_image }}
                                        style={{ width: 41, height: 42, borderRadius: 50, resizeMode: 'cover', marginRight: 12 }} />
                                    : <Image source={require('../assets/images/profilepic.png')}
                                        style={{ width: 41, height: 42, borderRadius: 50, backgroundColor: "#00000029", marginRight: 12 }} />
                                }

                            </View>
                        </TouchableOpacity>
                        {/* {console.log("item data", item)} */}
                        <View style={{}}>
                            <Text style={{ fontSize: 14, fontFamily: 'Rubik-SemiBold', color: '#000000' }}>{item?.name ? item.name : '-'}</Text>
                            <Text style={{ fontSize: 14, fontFamily: 'Rubik-SemiBold', color: '#000000' }}>{item?.email ? item.email : '-'}</Text>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={{ fontSize: 12, }}>{item?.fromDate ? moment(item.fromDate).format('DD-MM-YY') : '-'} To </Text>
                                <Text style={{ fontSize: 12, }}>{item?.toDate ? moment(item.toDate).format('DD-MM-YY') : '-'}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 11 }}>
                                {item?.attendance?.status == 1 ?
                                    <Image source={require('../assets/images/watch.png')} style={{ height: 12, width: 12, marginRight: 6.67 }} />
                                    : null}
                                {item?.attendance?.status == 1 ?
                                    <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: item?.attendance?.status == 1 && item?.attendance?.authType == "in" ? "#33B36F" : "#FF2037" }}>{item?.attendance?.authType == "in" ? "In Time" : "Out Time"} {moment(item?.attendance?.time).format("hh:mm A")}</Text>
                                    : null

                                }
                            </View>
                            {item?.attendance?.status == 1 ?
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 11 }}>
                                    <Image source={require('../assets/images/calender.png')} style={{ height: 9, width: 9, marginRight: 6.97 }} />
                                    <Text style={{ fontSize: 10, fontFamily: 'Rubik-Regular', color: '#000000' }}>{moment(item?.attendance?.time).format("DD/MM/YYYY")}</Text>
                                </View>
                                : null}
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: "flex-end", flex: 1 }}>
                            {item.status == "pending" ?
                                <TouchableOpacity onPress={() => {
                                    setModalVisible(true)
                                    setModalData(item)
                                }}>
                                    <Image source={require('../assets/images/pending1.png')} style={{ height: 34, width: 34, marginRight: -5 }} />
                                </TouchableOpacity>
                                :
                                <Image source={require('../assets/images/next.png')} style={{ height: 28, width: 28 }} />
                            }
                        </View>

                    </View>
                </TouchableOpacity>
            </View> : null
    )

    const listOfMeetingWith = () => {
        let requestUrl = `${apiUrl}${"/api/cms/employees/search"}`
        console.log("company Employee list url", requestUrl)

        api.postWithTokenNew(requestUrl, {
            "isActive": true
        }).then(async (jsonResponse) => {

            if (jsonResponse.success) {
                setMeetingWithList(jsonResponse.list)
                let jsonData = JSON.stringify(jsonResponse)
                console.log("Company Employee list Success Message", jsonData);

            } else {
                console.log("Company Employee list Error Message **", jsonResponse.message ?? "Something went wrong!!");
            }
        }).catch(async (error) => {
            console.log("Company Employee list Error Message ***", "Something went wrong!!");
        })
    }

    const onToDateChangeForInBetweenCheckout = (selectedDate) => {
        const currentDate = selectedDate || toDateForInBetweenCheckout;
        setShowToDateForInBetweenCheckout(false);
        setToDateForInBetweenCheckout(currentDate);


    };
    const onFromDateChangeForInBetweenCheckout = (selectedDate) => {
        const currentDate = selectedDate || fromDateForInBetweenCheckout;
        setShowFromDateForInBetweenCheckout(false);
        setFromDateForInBetweenCheckout(currentDate);
        toDateForInBetweenCheckout < currentDate ? setToDateForInBetweenCheckout(currentDate) : null

    };

    const onToTimeChangeForInBetweenCheckout = (selectedDate) => {
        const currentDate = selectedDate || toTimeForInBetweenCheckout;
        setShowToTimeForInBetweenCheckout(false);
        setToTimeForInBetweenCheckout(currentDate);

    };
    const onFromTimeChangeForInBetweenCheckout = (selectedDate) => {
        const currentDate = selectedDate || fromTimeForInBetweenCheckout;
        setShowFromTimeForInBetweenCheckout(false);
        setFromTimeForInBetweenCheckout(currentDate);
    };

    const wsCreateVisitor = () => {
        if (meeting === "") {
            Snackbar.show({ text: 'Please select Meeting with' });
            return;
        }
        else if (purpose.trim() === '') {
            Snackbar.show({ text: 'Please enter your Purpose' });
            return;
        }
        else {
            createVisitor();
            setmodalVisibleForQrGenerate(false);
        }

    }
    const createVisitor = () => {
        let remarkRequestUrl = `${apiUrl}${"/api/cms/visitor-qr-code/create"}`
        console.log("create-Visitor list url", remarkRequestUrl)

        api.postWithTokenNew(remarkRequestUrl, {
            "fromDate": moment(dateForInBetweenCheckoutFromDate + ' ' + timeForInBetweenCheckoutFromTime, 'DD/MM/YYYY HH:mm:ss a').format(),
            "toDate": moment(dateForInBetweenCheckoutToDate + ' ' + timeForInBetweenCheckoutToTime, 'DD/MM/YYYY HH:mm:ss a').format(),
            "isApprovedRequired": true,
            "invitedEmployeeId": meeting,
            "purpose": purpose,
            "qrCodeId": modalData?.qrCodeId,
            "employee": modalData?.employee,
            "childCompanyId": modalData?.childCompanyId
        }).then(async (jsonResponse) => {

            if (jsonResponse.success) {
                let jsonData = JSON.stringify(jsonResponse)
                console.log("createVisitor Success Message", jsonData);
                webCallMyVisitor(true);
                setMeeting('');
                setPurpose('');
                setFromDateForInBetweenCheckout(new Date());
                setFromTimeForInBetweenCheckout(new Date());
                setToDateForInBetweenCheckout(new Date());
                setToTimeForInBetweenCheckout(new Date());
                Snackbar.show({ text: 'Visitor created successfully' });
            } else {
                Snackbar.show({ text: 'Something went wrong' });
                console.log("createVisitor Error Message **", jsonResponse.message ?? "Something went wrong!!");
            }
        }).catch(async (error) => {
            Snackbar.show({ text: 'Something went wrong' });
            console.log("createVisitor Error Message ***", "Something went wrong!!");
        })

    }

    return (
        <SafeAreaView style={style.header}>
            <Modal          //Visitor basic info modal
                transparent={true}
                visible={modalVisible}

            >
                <View style={{ ...styles.centeredView, backgroundColor: "#000000aa" }}>
                    {console.log("@@@@@@@@@@@@", modalData)}
                    <View style={{ ...styles.modalView, }}>
                        <View style={{ width: "110%", flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, alignItems: 'center', paddingBottom: 12, borderBottomColor: '#D1D1D1', }} >
                            <Text style={{ marginLeft: 17, fontSize: 18, fontFamily: 'Rubik-Regular' }}>Basic Information</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <TouchableOpacity onPress={() => { setModalVisible(false); setmodalVisibleForQrGenerate(true); }}>
                                    <Image source={require('../assets/images/generateQr.png')} style={{ marginRight: 17,/*  tintColor: '#9496A1' */ }} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => { setModalVisible(false) }}>
                                    <Image source={require('../assets/images/close.png')} style={{ marginRight: 17, tintColor: '#9496A1' }} />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={{ width: "100%", flexDirection: 'row', alignItems: 'center', justifyContent: "space-between", marginTop: 12 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                {(modalData && modalData.employee && modalData.employee.profile_image) ?
                                    <Image source={{ uri: uploadUrl + modalData.employee.profile_image }}
                                        style={{ width: 41, height: 42, borderRadius: 50, resizeMode: 'cover', }} />
                                    : <Image source={require('../assets/images/profilepic.png')}
                                        style={{ width: 41, height: 42, borderRadius: 50, backgroundColor: "#00000029", marginRight: 10 }} />
                                }
                                <View style={{}}>
                                    <Text style={[{ fontSize: 16, color: "black", fontFamily: 'Rubik-Bold' }]}>{modalData && modalData.name ? modalData && modalData.name : 'N/A'}</Text>
                                    <Text style={{ color: "#0393FF", marginTop: 3, fontFamily: 'Rubik-Regular' }}>{modalData && modalData.email ? modalData && modalData.email : 'N/A'}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={{ width: '100%', flexDirection: 'row', marginTop: 12 }}>
                            <View style={{ justifyContent: 'flex-start', flex: 1 }}>
                                <Text style={{ color: '#606060', fontFamily: 'Rubik-Regular' }}>Meeting With</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontFamily: 'Rubik-Bold' }}>: {modalData && modalData.invitedEmployeeId && modalData.invitedEmployeeId.name ? modalData.invitedEmployeeId.name : 'N/A'}</Text>
                            </View>
                        </View>
                        <View style={{ width: '100%', flexDirection: 'row', /* marginTop: 12 */ }}>
                            <View style={{ justifyContent: 'flex-start', flex: 1 }}>
                                {/* <Text style={{ color: '#606060', fontFamily: 'Rubik-Regular' }}>Meeting With</Text> */}
                                <Text style={{ color: '#606060', marginTop: 3, fontFamily: 'Rubik-Regular' }}>Phone</Text>
                                {/* <Text style={{ color: '#606060', marginTop: 3, fontFamily: 'Rubik-Regular' }}>Gender</Text> */}
                                <Text style={{ color: '#606060', marginTop: 3, fontFamily: 'Rubik-Regular' }}>Status</Text>
                                <Text style={{ color: '#606060', marginTop: 3, fontFamily: 'Rubik-Regular' }}>From Date</Text>
                                <Text style={{ color: '#606060', marginTop: 3, fontFamily: 'Rubik-Regular' }}>To Date</Text>
                                <Text style={{ color: '#606060', marginTop: 3, fontFamily: 'Rubik-Regular' }}>Created At</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                {/* <Text style={{ fontFamily: 'Rubik-Bold' }}>: {modalData && modalData.invitedEmployeeId && modalData.invitedEmployeeId.name ? modalData.invitedEmployeeId.name : 'N/A'}</Text> */}
                                <Text style={{ marginTop: 3, fontFamily: 'Rubik-Bold' }}>: {modalData && modalData.phone ? modalData && modalData.phone : 'N/A'}</Text>
                                {/* <Text style={{ marginTop: 3, fontFamily: 'Rubik-Bold' }}>: {modalData && modalData.gender == "m" ? "Male" : modalData && modalData.gender == "f" ? "Female" : modalData && modalData.gender == "o" ? 'Other' : 'N/A'}</Text> */}
                                <Text style={{ marginTop: 3, fontFamily: 'Rubik-Bold' }}>: {modalData && modalData.status ? (modalData.status == 'approve' ? "Approved" : modalData.status == 'reject' ? "Rejected" : modalData.status == 'approved' ? "Approved" : "Pending") : 'N/A'}</Text>
                                <Text style={{ marginTop: 3, fontFamily: 'Rubik-Bold' }}>: {modalData && modalData.fromDate ? moment(modalData && modalData.fromDate).format("DD MMM YYYY, h:mm a") : 'N/A'}</Text>
                                <Text style={{ marginTop: 3, fontFamily: 'Rubik-Bold' }}>: {modalData && modalData.toDate ? moment(modalData && modalData.toDate).format("DD MMM YYYY, h:mm a") : 'N/A'}</Text>
                                <Text style={{ marginTop: 3, fontFamily: 'Rubik-Bold' }}>: {modalData && modalData.createdAt ? moment(modalData && modalData.createdAt).format("DD MMM YYYY") : 'N/A'}</Text>
                            </View>
                        </View>

                        <View style={{ marginTop: 12, width: "100%" }}>
                            <Text style={{ color: '#606060', fontFamily: 'Rubik-Regular' }}>Purpose</Text>
                            <View style={[{ padding: 12, backgroundColor: "#F3F4F8", borderRadius: 7, borderWidth: 0, borderColor: '#D1D1D1', marginTop: 3 }]}>
                                <Text style={{ color: "#606060", fontSize: 16, fontFamily: 'Rubik-Regular' }}>{modalData && modalData.purpose ? modalData && modalData.purpose : 'N/A'}</Text>
                            </View>
                        </View>
                        {modalData?.status == "pending" ?
                            <>
                                <View style={{ flexDirection: 'row', borderWidth: 0 }}>
                                    <View style={[{ marginRight: 25, minWidth: 100, borderRadius: 10, borderWidth: 1, borderColor: '#33B36F', marginTop: 20, backgroundColor: "#33B36F" }]}>
                                        <TouchableOpacity style={{ padding: 10, }} onPress={() => { approveRejectVisitorQR("isApproved"); setModalVisible(false) }}>
                                            <Text style={{ color: "#FFFFFF", fontSize: 16, textAlign: 'center', fontFamily: 'Rubik-Regular' }}>Approve</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={[{ minWidth: 100, borderRadius: 10, borderWidth: 1, borderColor: '#FF2037', marginTop: 20, backgroundColor: "#FF2037" }]}>
                                        <TouchableOpacity style={{ padding: 10, }} onPress={() => { approveRejectVisitorQR("isReject"); setModalVisible(false) }}>
                                            <Text style={{ color: "#FFFFFF", fontSize: 16, textAlign: 'center', fontFamily: 'Rubik-Regular' }}>Reject</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={[{ minWidth: 100, borderRadius: 10, alignSelf: 'center', borderWidth: 1, borderColor: '#D1D1D1', marginTop: 20, backgroundColor: "#FFFFFF" }]}>
                                    <TouchableOpacity style={{ padding: 10, }} onPress={() => { setModalVisible(false) }}>
                                        <Text style={{ color: "#606060", fontSize: 16, textAlign: 'center', fontFamily: 'Rubik-Regular' }}>Close</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                            : (modalData?.status == "approve" || modalData?.status == "approved") ?
                                <View style={{ flexDirection: 'row' }}>
                                    <View style={[{ marginRight: 25, minWidth: 100, borderRadius: 10, alignSelf: 'center', borderWidth: 1, borderColor: '#0E5EF2', marginTop: 20, backgroundColor: "#0E5EF2" }]}>
                                        <TouchableOpacity style={{ padding: 10, }} onPress={() => { setModalVisible(false); setQRmodalVisible(true) }}>
                                            <Text style={{ color: "white", fontSize: 16, textAlign: 'center', fontFamily: 'Rubik-Regular' }}>QR Code</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={[{ minWidth: 100, borderRadius: 10, alignSelf: 'center', borderWidth: 1, borderColor: '#D1D1D1', marginTop: 20, backgroundColor: "#FFFFFF" }]}>
                                        <TouchableOpacity style={{ padding: 10, }} onPress={() => { setModalVisible(false) }}>
                                            <Text style={{ color: "#606060", fontSize: 16, textAlign: 'center', fontFamily: 'Rubik-Regular' }}>Close</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                :
                                <View style={[{ marginRight: 25, minWidth: 100, borderRadius: 10, alignSelf: 'center', borderWidth: 1, borderColor: '#D1D1D1', marginTop: 20, backgroundColor: "#FFFFFF" }]}>
                                    <TouchableOpacity style={{ padding: 10, }} onPress={() => { setModalVisible(false) }}>
                                        <Text style={{ color: "#606060", fontSize: 16, textAlign: 'center', fontFamily: 'Rubik-Regular' }}>Close</Text>
                                    </TouchableOpacity>
                                </View>}
                    </View>
                </View>
            </Modal>

            <Modal      //Qr screen modal
                transparent={true}
                visible={qrmodalVisible}

            >
                <View style={{ ...styles.centeredView, justifyContent: 'center', backgroundColor: "#000000aa" }}>
                    <View style={{ ...styles.modalViewCenter, height: 400 }}>
                        <View style={{ borderWidth: 0, width: '100%', flexDirection: 'row', justifyContent: 'flex-end' }}>
                            <TouchableOpacity onPress={() => { setQRmodalVisible(false) }}>
                                <Image style={{}} source={require('../assets/images/close.png')} />
                            </TouchableOpacity>
                        </View>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', }}>
                            <QRCodeGenerator value={modalData?.qrCodeId} size={200} name={modalData?._id} />
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal     //Generate new Qr for invited visitor
                transparent={true}
                visible={modalVisibleForQrGenerate}

            >
                <View style={{ ...styles.centeredView, backgroundColor: "#000000aa" }}>
                    <View style={{ ...styles.modalView, }}>
                        <View style={{ width: "110%", flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, alignItems: 'center', paddingBottom: 12, borderBottomColor: '#D1D1D1', }} >
                            <Text style={{ marginLeft: 17, fontSize: 18, fontFamily: 'Rubik-Regular' }}>Generate QR</Text>
                            <TouchableOpacity onPress={() => { setmodalVisibleForQrGenerate(false) }}>
                                <Image source={require('../assets/images/close.png')} style={{ marginRight: 17, tintColor: '#9496A1' }} />
                            </TouchableOpacity>
                        </View>
                        <View style={{ width: '100%' }}>
                            <View style={{ flexDirection: 'row', marginTop: 20 }}>
                                <Text style={{ ...style.rubikmidium14 }}>Meeting with</Text>
                                <Image source={require('../assets/images/Mandatoryicon.png')} style={{ height: 5, width: 5, margin: 3 }} />
                            </View>
                            <Dropdown
                                style={[styles.dropdown, /* isFocus && { borderColor: 'blue' } */]}
                                placeholderStyle={styles.placeholderStyle}
                                selectedTextStyle={style.inputTextDate}
                                inputSearchStyle={styles.inputSearchStyle}
                                iconStyle={styles.iconStyle}
                                itemTextStyle={{ fontFamily: 'Rubik-Regular' }}
                                data={meetingWithList}
                                // search
                                maxHeight={300}
                                labelField='name'
                                valueField='_id'
                                placeholder={meetingWithList ? '--Select Person--' : 'Loading...'}
                                searchPlaceholder="Search..."
                                // value={data}
                                value={meeting}
                                onFocus={() => setIsFocus(true)}
                                onBlur={() => setIsFocus(false)}
                                onChange={value => {
                                    setMeeting(value._id)
                                }}
                            />

                            <View style={{ flexDirection: 'row', marginTop: 20 }}>
                                <Text style={{ ...style.rubikmidium14, }}>Purpose</Text>
                                <Image source={require('../assets/images/Mandatoryicon.png')} style={{ height: 5, width: 5, margin: 3 }} />
                            </View>
                            <View style={[style.inputContainer, { marginTop: 10, borderRadius: 8, backgroundColor: whiteColor, borderWidth: 0.5, borderColor: "#CFCFCF", height: 40 }]}>
                                <TextInput style={[style.inputText, { flex: 1, }]}
                                    placeholder={'Purpose '}
                                    value={purpose}
                                    inputMode="text"
                                    onChangeText={(name) => setPurpose(name)}
                                    placeholdergrayColor={grayColor} />
                            </View>

                            <Text style={{ ...style.rubikmidium14, marginTop: 30 }}>Entry Validity Duration</Text>
                            <>
                                <View style={{ flexDirection: 'row', marginTop: 20 }}>
                                    <Text style={{ ...style.rubikmidium14, }}>From</Text>
                                    <Image source={require('../assets/images/Mandatoryicon.png')} style={{ height: 5, width: 5, margin: 3 }} />
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <View style={{ width: '48%' }}>
                                        <Text style={{ ...style.rubikmidium14, marginTop: 7 }}>Date</Text>
                                        <TouchableOpacity onPress={() => setShowFromDateForInBetweenCheckout(true)}>
                                            <View style={[{ marginTop: 10, paddingVertical: 12, justifyContent: 'space-between', flexDirection: 'row', borderWidth: 0.5, backgroundColor: whiteColor, alignItems: 'center', borderRadius: 10, paddingHorizontal: 20, borderColor: '#CFCFCF', height: 40 }]}>
                                                <View style={{/*  flexDirection: 'column' */ }}>
                                                    <Text style={{ ...style.inputTextDate, fontSize: 13 }}>{moment(fromDateForInBetweenCheckout).format('DD/MM/YYYY')}</Text>
                                                </View>
                                                <Image source={require('../assets/images/visitorCalender.png')} style={{ height: 19, width: 19 }} />
                                            </View>
                                        </TouchableOpacity>
                                        <DateTimePicker
                                            modal={true}
                                            title={"Select Date"}
                                            open={showFromDateForInBetweenCheckout}
                                            minimumDate={new Date(moment().format())}
                                            testID="fromDateTimePicker"
                                            date={fromDateForInBetweenCheckout}
                                            mode={'date'}
                                            onConfirm={onFromDateChangeForInBetweenCheckout}
                                            onCancel={() => setShowFromDateForInBetweenCheckout(false)}
                                        />
                                    </View>

                                    <View style={{ width: '48%' }} >
                                        <Text style={{ ...style.rubikmidium14, marginTop: 7 }}>Time</Text>
                                        <TouchableOpacity onPress={() => setShowFromTimeForInBetweenCheckout(true)}>
                                            <View style={[{ marginTop: 10, paddingVertical: 12, justifyContent: 'space-between', flexDirection: 'row', borderWidth: 0.5, backgroundColor: whiteColor, alignItems: 'center', borderRadius: 10, paddingHorizontal: 20, borderColor: '#CFCFCF', height: 40 }]}>
                                                <View>
                                                    <Text style={{ ...style.inputTextDate, fontSize: 13 }}>{moment(fromTimeForInBetweenCheckout).format('h:mm a')}</Text>
                                                </View>
                                                <Image source={require('../assets/images/watch.png')} style={{ height: 19, width: 19, tintColor: '#CFCFCF' }} />
                                            </View>
                                        </TouchableOpacity>
                                        <DateTimePicker
                                            modal={true}
                                            open={showFromTimeForInBetweenCheckout}
                                            testID="toDateTimePicker"
                                            date={fromTimeForInBetweenCheckout}
                                            // minimumDate={fromDate}
                                            mode={'time'}
                                            onConfirm={onFromTimeChangeForInBetweenCheckout}
                                            onCancel={() => setShowFromTimeForInBetweenCheckout(false)}
                                        />
                                    </View>
                                    {/* : null} */}
                                </View>

                                <View style={{ flexDirection: 'row', marginTop: 20 }}>
                                    <Text style={{ ...style.rubikmidium14, }}>To</Text>
                                    <Image source={require('../assets/images/Mandatoryicon.png')} style={{ height: 5, width: 5, margin: 3 }} />
                                </View>

                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <View style={{ width: '48%' }}>
                                        <Text style={{ ...style.rubikmidium14, marginTop: 7 }}>Date</Text>
                                        <TouchableOpacity onPress={() => setShowToDateForInBetweenCheckout(true)}>
                                            <View style={[{ marginTop: 10, paddingVertical: 12, justifyContent: 'space-between', flexDirection: 'row', borderWidth: 0.5, backgroundColor: whiteColor, alignItems: 'center', borderRadius: 10, paddingHorizontal: 20, borderColor: '#CFCFCF', height: 40 }]}>
                                                <View style={{/*  flexDirection: 'column' */ }}>
                                                    <Text style={{ ...style.inputTextDate, fontSize: 13 }}>{moment(toDateForInBetweenCheckout).format('DD/MM/YYYY')}</Text>
                                                </View>
                                                <Image source={require('../assets/images/visitorCalender.png')} style={{ height: 19, width: 19 }} />
                                            </View>
                                        </TouchableOpacity>
                                        <DateTimePicker
                                            modal={true}
                                            title={"Select Date"}
                                            open={showToDateForInBetweenCheckout}
                                            minimumDate={new Date(moment(fromDateForInBetweenCheckout).format())}
                                            testID="fromDateTimePicker"
                                            date={toDateForInBetweenCheckout}
                                            mode={'date'}
                                            onConfirm={onToDateChangeForInBetweenCheckout}
                                            onCancel={() => setShowToDateForInBetweenCheckout(false)}
                                        />
                                    </View>

                                    <View style={{ width: '48%' }} >
                                        <Text style={{ ...style.rubikmidium14, marginTop: 7 }}>Time</Text>
                                        <TouchableOpacity onPress={() => setShowToTimeForInBetweenCheckout(true)}>
                                            <View style={[{ marginTop: 10, paddingVertical: 12, justifyContent: 'space-between', flexDirection: 'row', borderWidth: 0.5, backgroundColor: whiteColor, alignItems: 'center', borderRadius: 10, paddingHorizontal: 20, borderColor: '#CFCFCF', height: 40 }]}>
                                                <View>
                                                    <Text style={{ ...style.inputTextDate, fontSize: 13 }}>{moment(toTimeForInBetweenCheckout).format('h:mm a')}</Text>
                                                </View>
                                                <Image source={require('../assets/images/watch.png')} style={{ height: 19, width: 19, tintColor: '#CFCFCF' }} />
                                            </View>
                                        </TouchableOpacity>
                                        <DateTimePicker
                                            modal={true}
                                            open={showToTimeForInBetweenCheckout}
                                            testID="toDateTimePicker"
                                            date={toTimeForInBetweenCheckout}
                                            minimumDate={toDateForInBetweenCheckout <= fromDateForInBetweenCheckout ? fromTimeForInBetweenCheckout : null}
                                            mode={'time'}
                                            onConfirm={onToTimeChangeForInBetweenCheckout}
                                            onCancel={() => setShowToTimeForInBetweenCheckout(false)}
                                        />
                                    </View>
                                    {/* : null} */}
                                </View>
                            </>

                            {/* <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center' }}>
                                <Switch
                                    style={{
                                        ...Platform.select({
                                            ios: {
                                                transform: [{ scaleX: .8 }, { scaleY: .8 }]
                                            }
                                        })
                                    }}
                                    trackColor={{ false: "#CFCFCF", true: "#81b0ff" }}
                                    thumbColor={isEnabled ? "blue" : "#f4f3f4"}
                                    onValueChange={toggleSwitch}
                                    value={isEnabled}
                                />
                                <Text style={{ ...style.rubikmidium14, color: '#A7A7A7', textAlignVertical: 'center' }}>Approval Required</Text>
                            </View> */}

                            <View style={{ flexDirection: "row", justifyContent: "space-evenly", width: "100%", marginVertical: 20 }}>
                                <View style={[{ minWidth: 100, borderRadius: 10, alignSelf: 'center', borderWidth: 0, borderColor: '#0393FF', marginTop: 17,/*  flex: 1 */backgroundColor: '#0393FF' }]}>
                                    <TouchableOpacity style={{ padding: 10, }} onPress={() => {
                                        wsCreateVisitor();
                                    }}>
                                        <Text style={{ color: "#FFFFFF", fontSize: 16, textAlign: 'center', fontFamily: 'Rubik-Regular' }}>Generate</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>

            <View style={{ backgroundColor: whiteColor, flex: 1 }}>
                <LinearGradient
                    start={{ x: 0.9, y: 0.0 }}
                    end={{ x: 1.0, y: 1.0 }}
                    colors={['#0E5EF2', '#b5cefb']}
                    style={{
                        borderBottomLeftRadius: 25,
                        borderBottomRightRadius: 25,
                        height: 160
                    }}
                >
                    <NavigationBar
                        navigationBarStyle={{ /* ...style.navigationBarStyle, */ backgroundColor: "transprant" }}
                        componentLeft={() =>
                            <View style={{ alignItems: 'flex-start', marginLeft: 5, width: "30%", }}>
                                <TouchableOpacity style={{ justifyContent: 'center', flexDirection: 'row' }} onPress={() => navigation.goBack()}>
                                    <Image source={require('../assets/images/back.png')}
                                        style={style.backIcon1} />
                                    <Text style={style.headerText}>My Visitor</Text>
                                </TouchableOpacity>
                            </View>

                        }
                        componentRight={() =>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', width: '70%', borderWidth: 0, paddingRight: 18 }}>


                                {/* Search Box */}
                                {showSearch ?
                                    <View style={{ ...styles.container }}>
                                        <View
                                            style={
                                                clicked
                                                    ? styles.searchBar__clicked
                                                    : styles.searchBar__unclicked
                                            }
                                        >
                                            {/* search Icon */}
                                            {clicked ? (
                                                <Image source={require('../assets/images/search1.png')} style={{ height: 14, width: 14, }} resizeMode="contain" />
                                            ) :
                                                <Image source={require('../assets/images/search1.png')} style={{ height: 14, width: 14, tintColor: 'transparent' }} resizeMode="contain" />
                                            }

                                            {/* Input field */}
                                            <TextInput
                                                style={{ ...styles.inputText, width: "90%", height: 35, marginStart: 10 }}
                                                placeholder="Search visitor..."
                                                underlineColorAndroid="transparent"
                                                value={searchByName}
                                                onChangeText={(text) => {
                                                    setSearchByName(text)
                                                    if (!loading) {
                                                        setRefreshing(true);
                                                        console.log("Filtering***************");
                                                        webCallMyVisitor(true)
                                                            .then(() => { setRefreshing(false) })
                                                            .catch(() => { setRefreshing(false) });
                                                    }
                                                }}
                                                onFocus={() => {
                                                    setClicked(true);
                                                }}
                                            />
                                            {/* cross Icon */}
                                            {clicked ? (

                                                <TouchableOpacity onPress={() => {
                                                    Keyboard.dismiss();
                                                    setClicked(false);
                                                    setSearchByName("")
                                                    if (!loading) {
                                                        setRefreshing(true);
                                                        setShowSearch(false)
                                                        console.log("Filtering***************");
                                                        webCallMyVisitor(true)
                                                            .then(() => { setRefreshing(false) })
                                                            .catch(() => { setRefreshing(false) });
                                                    }
                                                }}>
                                                    <Image source={require('../assets/images/cross.png')} style={{ height: 18, width: 18, tintColor: '#999999', margin: 5 }} resizeMode='contain' />
                                                </TouchableOpacity>

                                            ) :
                                                <TouchableOpacity onPress={() => {
                                                    setClicked(true);
                                                }}>
                                                    <Image source={require('../assets/images/search1.png')} style={{ height: 14, width: 14, margin: 5 }} resizeMode="contain" />
                                                </TouchableOpacity>
                                            }
                                        </View>

                                    </View>
                                    :
                                    <TouchableOpacity onPress={() => setShowSearch(true)}>
                                        <Image source={require('../assets/images/search1.png')} style={{ height: 18, width: 18, marginHorizontal: 12, tintColor: whiteColor }} resizeMode="contain" />
                                    </TouchableOpacity>
                                }


                                <View style={{}}>
                                    <TouchableOpacity onPress={() => {
                                        // setClicked(true);
                                        navigation.navigate('VisitorRequest')
                                    }}>
                                        <Image source={require('../assets/images/add.png')} style={{ height: 18, width: 18, marginRight: 7 }} resizeMode="contain" />
                                    </TouchableOpacity>
                                </View>

                            </View>

                        }
                    />
                </LinearGradient>

                <View style={{ marginTop: -110, padding: 18 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>

                        <TouchableOpacity style={{ width: "48%" }} onPress={() => {
                            setTabIndex(0);
                        }}>
                            <View style={{ ...style.cardWhite, borderRadius: 8, backgroundColor: tabIndex == 0 ? "#0393FF" : "#FEF2E8" }}>
                                <Image source={require('../assets/images/totalmember.png')} style={{ height: 24, width: 39, tintColor: tabIndex == 0 ? '#FFFFFF' : null }} />
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24.8, alignItems: 'center' }}>
                                    <View>
                                        <Text style={{ ...style.rubikmidium, color: tabIndex == 0 ? '#FFFFFF' : "#000000" }}>Total</Text>
                                        <Text style={{ ...style.rubikmidium, color: tabIndex == 0 ? '#FFFFFF' : "#000000" }}>Visitor</Text>
                                    </View>
                                    <Text style={{ ...style.rubikmidium, fontSize: 20, color: tabIndex == 0 ? '#FFFFFF' : "#000000" }}>{totalCount}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={{ width: "48%" }} onPress={() => {
                            setTabIndex(PRESENT);
                        }}>
                            <View style={{ ...style.cardWhite, borderRadius: 8, backgroundColor: tabIndex == PRESENT ? "#0393FF" : "#F1F8EC" }}>
                                <Image source={require('../assets/images/PresentMember.png')} style={{ height: 32, width: 41, tintColor: tabIndex == PRESENT ? '#FFFFFF' : null }} />
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20.66, alignItems: 'center' }}>
                                    <View>
                                        <Text style={{ ...style.rubikmidium, color: tabIndex == PRESENT ? '#FFFFFF' : "#000000" }}>Today's</Text>
                                        <Text style={{ ...style.rubikmidium, color: tabIndex == PRESENT ? '#FFFFFF' : "#000000" }}>Visitor</Text>
                                    </View>
                                    <Text style={{ ...style.rubikmidium, fontSize: 20, color: tabIndex == PRESENT ? '#FFFFFF' : "#000000" }}>{presentCount}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* <View style={{ paddingHorizontal: 18 }}> */}
                {myVisitorData ? <FlatList
                    data={myVisitorData}
                    // style={{ height: 30 }}
                    renderItem={renderEmployeeType}
                    ListFooterComponent={renderFooter}
                    onEndReached={onEndReached}
                    onEndReachedThreshold={0.5}
                    ListHeaderComponent={() => (parseInt(myVisitorData?.length) === 0 ?
                        <Text style={style.empText}>No data found</Text>
                        : null)}
                    ListEmptyComponent={() => (parseInt(myVisitorData?.length) === 0 ?
                        <Text style={{ ...style.empText, textAlign: 'center', marginTop: '50%', fontFamily: 'Rubik-Regular' }}>No data found</Text>
                        : null)
                    }
                    refreshControl={
                        <RefreshControl onRefresh={() => {
                            if (!loading) {
                                setRefreshing(true);
                                console.log("refreshing***************");
                                webCallMyVisitor(true)
                                    .then(() => { setRefreshing(false) })
                                    .catch(() => { setRefreshing(false) });
                            }
                        }
                        }
                            refreshing={refreshing} colors={[blueColor]} tintColor={blueColor}
                        />}
                // }

                /> : <ActivityIndicator
                    animating={true}
                    color='#4386F4'
                    size="large" />
                }
                {/* </View> */}
                <TouchableOpacity style={{ ...style.floatingButton, right: 18, bottom: 43, backgroundColor: '#0393FF' }} onPress={() => {
                    navigation.navigate('VisitorAttendanceHistory'/* , { wsRequestList: wsRequestList } */)
                }}>
                    <Image source={require('../assets/images/Attendance-History.png')} style={{ tintColor: whiteColor }} />
                </TouchableOpacity>
            </View>


        </SafeAreaView>
    )
}



const styles = StyleSheet.create({
    container: {
        marginHorizontal: 10,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        shadowOpacity: 0.32,
        shadowRadius: 15,
        elevation: 3,
        shadowColor: '#171717',
        borderColor: "transparent",
        height: 25,

        width: '80%'
    },
    searchBar__unclicked: {

        flexDirection: "row",
        width: "100%",
        backgroundColor: "#FFFFFF",
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "space-evenly",
        paddingHorizontal: 20,


    },
    searchBar__clicked: {
        paddingHorizontal: 20,
        flexDirection: "row",
        width: "100%",
        backgroundColor: "#FFFFFF",
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "space-evenly",


    },
    inputText: {
        color: darkGrayColor,
        fontSize: 14,
        fontFamily: 'Rubik-Regular',
        alignContent: "center",
        padding: 5
    },
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
    modalViewCenter: {
        backgroundColor: "white",
        borderRadius: 30,
        // borderTopRightRadius: 30,
        // padding: 15,
        paddingVertical: 15,
        paddingHorizontal: 17,
        // flex: 1,
        width: "90%",
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
    dropdown: {
        height: 40,
        borderColor: '#CFCFCF',
        borderWidth: 0.5,
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingLeft: 20,
        marginTop: 10,
        marginBottom: 7,
        backgroundColor: whiteColor
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
        fontFamily: 'Rubik-Regular',
        fontSize: 16,
        color: grayColor
    },
    selectedTextStyle: {
        fontFamily: 'Rubik-Regular',
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
    },
    blueText: {
        color: '#0393FF',
        fontSize: 14,
        fontFamily: 'Rubik-Regular'
    },
    grayText: {
        color: "#A7A7A7",
        fontSize: 14,
        fontFamily: 'Rubik-Regular'
    },
});


export default MyVisitor;

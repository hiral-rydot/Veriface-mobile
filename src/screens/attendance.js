import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Dimensions,
    Platform,
    Modal,
    StyleSheet,
    TextInput
} from 'react-native';
import { NavigationBar } from 'navigationbar-react-native'
import DrawerLayout from 'react-native-gesture-handler/DrawerLayout'
import { style } from '../styles/style'
import { menuHeaderColor, whiteColor, blueColor, grayColor, iconColor, inputBgColor } from '../styles/color'
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
import DateTimePicker from 'react-native-date-picker';

const Attendance = ({ navigation }) => {
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

    const [time, setTime] = useState(new Date())
    const [showTimePicker, setShowTimePicker] = useState(false)
    const [description, setDescription] = useState('')
    const [modalVisible, setModalVisible] = useState(false)
    const [showEdit, setShowEdit] = useState(true)
    useEffect(() => {
        if (resAttendance && resAttendance.success) {
            setAttendanceArray(resAttendance.item)
            setFilteredArray(resAttendance.item)
        }
    }, [resAttendance])
    useEffect(() => {
        resAttendance = null
        dispatch(apiTodayAttendance({}))
    }, [])

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


    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => {
            navigation.navigate('AttendanceDetail', { attendanceItem: item })
        }}>
            <View style={{ ...style.cardWhite, padding: 14, marginBottom: 15, borderRadius: 8, backgroundColor: '#FFFFFF', marginHorizontal: 18, flexDirection: 'row' }}>
                <View>
                    {(item.image) ?
                        <Image source={{ uri: uploadUrl + item.image }}
                            style={{ width: 92, height: 118, borderRadius: 10, resizeMode: 'cover' }} />
                        : <Image source={require('../assets/images/Employee-Time.png')}
                            style={{ width: 92, height: 118, borderRadius: 10, resizeMode: 'contain' }} />
                    }
                </View>
                <View style={{ marginLeft: 9, flex: 1 }}>

                    <Text style={{ fontSize: 14, fontFamily: 'Rubik-SemiBold', color: '#000000', width: "70%" }} adjustsFontToFit={true} numberOfLines={1}>{item && item.employee && item.employee.name}</Text>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 7.74 }}>
                            <Image source={require('../assets/images/watch.png')} style={{ height: 12, width: 12, marginRight: 6.67 }} />
                            <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: item.authType === 'in' ? "#00B164" : "#FF2037" }}>{(item.authType === 'in') ? 'In Time' : 'Out Time'}</Text>
                        </View>
                        {showEdit ?
                            <TouchableOpacity style={{
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 17.45,
                                height: 17.45,
                                backgroundColor: '#0E5EF2',
                                borderRadius: 40,
                            }} onPress={() => {
                                setModalVisible(true)
                                // props.navigation.navigate('NewRequest', { wsRequestList: wsRequestList })
                            }}>
                                <Image source={require('../assets/images/edit.png')} style={{ height: 7, width: 7 }} />
                            </TouchableOpacity>
                            :
                            <TouchableOpacity onPress={() => {
                                setShowEdit(true);
                            }} >
                                <View style={{}}>
                                    {
                                        item.isApprove == "reject" ?
                                            <View style={[{ /* minWidth: 100, */ paddingVertical: 5, paddingHorizontal: 11, backgroundColor: "#fabec4", borderRadius: 5, borderWidth: 0, borderColor: '#D1D1D1' }]}>
                                                <Text style={{ color: "#FF2037", fontSize: 12, textAlign: 'center', padding: 2, paddingBottom: 4, fontFamily: 'Rubik-Regular' }}>Rejected</Text>
                                            </View> :
                                            item.isApprove == "approve" ?
                                                <View style={[{ /* minWidth: 100, */ paddingVertical: 5, paddingHorizontal: 11, backgroundColor: "#b5e6cc", borderRadius: 5, borderWidth: 0, borderColor: '#D1D1D1' }]}>
                                                    <Text style={{ color: "#33B36F", fontSize: 12, textAlign: 'center', padding: 2, paddingBottom: 4, fontFamily: 'Rubik-Regular' }}>Approved</Text>
                                                </View> :
                                                <View style={[{ /* minWidth: 100, */ paddingVertical: 5, paddingHorizontal: 11, backgroundColor: "#fae7b6", borderRadius: 5, borderWidth: 0, }]}>
                                                    <Text style={{ color: "#DFA100", fontSize: 12, textAlign: 'center', fontFamily: 'Rubik-Regular' }}>Pending</Text>
                                                </View>
                                    }

                                </View>
                            </TouchableOpacity>
                        }
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: "space-between" }}>
                        <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: item.authType === 'in' ? "#00B164" : "#FF2037", marginLeft: 18.67, marginTop: 11 }}>{moment(item.time).format("h:mm:ss A")}</Text>
                        <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: "#0393FF", marginLeft: 18.67, marginTop: 11, textDecorationLine: item.isRequested ? "line-through" : "none" }}>{moment(item.time).format("h:mm:ss A")}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 11 }}>
                        <View style={{ alignItems: 'center', justifyContent: 'center', width: 12.18, height: 12.18, borderWidth: 1, borderColor: '#0393FF', borderRadius: 34, }}>
                            <Image source={require('../assets/images/add.png')} style={{ height: 7, width: 7, tintColor: '#0393FF' }} />
                        </View>
                        {/* <Text style={{ fontSize: 8, fontFamily: 'Rubik-Regular', color: '#9496A1', marginLeft: 6.49, marginTop: 11 }} adjustsFontToFit={true} numberOfLines={3}>In publishing and graphic design, Lorem ipsumIn publishing111 and graphic design, Lorem ipsum.</Text> */}
                        <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: '#0393FF', marginLeft: 6.49, textAlignVertical: 'center' }} adjustsFontToFit={true} numberOfLines={3}>Add Remark</Text>
                    </View>
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
            <View style={{ backgroundColor: whiteColor, flex: 1 }}>
                <NavigationBar
                    navigationBarStyle={{ ...style.navigationBarStyle }}
                    componentLeft={() =>
                        <View style={{ alignItems: 'flex-start', marginLeft: 5 }}>
                            <TouchableOpacity style={{ justifyContent: 'center', flexDirection: 'row' }} onPress={() => navigation.goBack(null)}>
                                <Image source={require('../assets/images/back.png')}
                                    style={style.backIcon1} />
                                <Text style={style.headerText}>Today's Attendance({moment().format("DD/MM/YYYY")})</Text>
                            </TouchableOpacity>
                        </View>
                    }
                // componentRight={() =>
                //     <TouchableOpacity onPress={() => { openDrawer() }}>
                //         <Image source={require('../assets/images/filter1.png')}
                //             style={{ resizeMode: 'contain', marginRight: 10, tintColor: iconColor }} />
                //     </TouchableOpacity>

                // }
                />
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
                                <Text style={{ marginLeft: 17, fontSize: 16, fontFamily: 'Rubik-Regular', color: "#000000" }}>Attendance Changes</Text>
                                <TouchableOpacity onPress={() => { setModalVisible(false) }}>
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
                                <TouchableOpacity style={{ padding: 8, }} onPress={() => { setModalVisible(false) }}>
                                    <Text style={{ color: "#FFFFFF", fontSize: 16, textAlign: 'center', fontFamily: 'Rubik-Regular' }}>Cancel</Text>
                                </TouchableOpacity>
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
                    <View style={{ backgroundColor: whiteColor, flex: 1, marginTop: 15 }}>
                        <FlatList
                            data={filteredArray}
                            // numColumns={2}
                            renderItem={renderItem}
                            // contentContainerStyle={{ flexGrow: 1 }}
                            ListEmptyComponent={
                                (isLoading) ? null : <Text style={style.emptyComponent}>No records available.</Text>
                            }
                            keyExtractor={item => item._id}
                        />
                        <Loader visible={isLoading} />
                    </View>
                    <TouchableOpacity style={{ ...style.floatingButton, right: 18, bottom: 43, backgroundColor: '#0393FF' }} onPress={() => {
                        // props.navigation.navigate('NewRequest', { wsRequestList: wsRequestList })
                    }}>
                        <Image source={require('../assets/images/Attendance-History.png')} style={{ tintColor: whiteColor }} />
                    </TouchableOpacity>
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
export default Attendance
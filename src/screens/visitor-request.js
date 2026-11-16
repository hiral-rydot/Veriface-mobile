import React, { useState, useRef, useEffect, useCallback } from "react";
import {
    SafeAreaView,
    StyleSheet,
    Text,
    View,
    Dimensions,
    TouchableOpacity,
    Image,
    TextInput,
    ScrollView,
    Switch,
    Platform,
    Modal,
    KeyboardAvoidingView,
    Keyboard
} from "react-native";
import { TabView, TabBar, SceneMap } from 'react-native-tab-view'
import moment from 'moment';
import { style } from "../styles/style";
import { Dropdown } from 'react-native-element-dropdown';
import DateTimePicker from 'react-native-date-picker'
import RadioButtonRN from 'radio-buttons-react-native';
import { NavigationBar } from "navigationbar-react-native";
import { apiUrl } from "../webservice/constant";
import { api } from "../webservice/api";
import Snackbar from "react-native-snackbar";
import { check, PERMISSIONS, request } from 'react-native-permissions';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Loader from '../components/loader';
import { uploadUrl } from '../webservice/constant';
import { utils } from '../utils/utils';
import { menuHeaderColor, whiteColor, borderColor, grayColor, blueColor, dropdownBaseColor, iconColor } from '../styles/color'
import { useDispatch, useSelector } from 'react-redux'
import RadioButton from "../components/radio";



const ReactNavigation = require('react-navigation');
ReactNavigation.SafeAreaView.setStatusBarHeight(0);



const VisitorRequest = (props) => {
    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'first', title: 'Invite Visitor' },
        { key: 'second', title: 'Fill the form' },
        // { key: 'third', title: 'abc' },
    ]);

    const renderScene = ({ route }) => {
        switch (route.key) {
            case 'first':
                return <InviteVisitor props={props} />
            case 'second':
                return <VisitorForm props={props} />;

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
                    style={{ backgroundColor: "#F6F6F6", height: 50, marginBottom: 23,/*  paddingTop: 15, */alignItems: 'center', shadowColor: 'white' }}
                    renderLabel={({ route, focused, color }) => (
                        <View style={{ /* paddingBottom: 10, */ alignItems: 'center', }}>
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

    return (
        <SafeAreaView style={style.header}>
            <NavigationBar
                navigationBarStyle={{ ...style.navigationBarStyle }}
                componentLeft={() =>
                    <View style={{ alignItems: 'flex-start', marginLeft: 5 }}>
                        <TouchableOpacity style={{ justifyContent: 'center', flexDirection: 'row' }} onPress={() => props.navigation.goBack(null)}>
                            <Image source={require('../assets/images/back.png')}
                                style={style.backIcon1} />
                            <Text style={style.headerText}>Visitor Request</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
            <View style={{ flex: 1, backgroundColor: whiteColor }}>
                {renderTabs()}

            </View>
        </SafeAreaView>
    )
}


export default VisitorRequest;

const InviteVisitor = ({ props }) => {
    const [emailOrMobileNmber, setEmailOrMobileNmber] = useState('')

    const generateLink = (email, phoneNum) => {
        let remarkRequestUrl = `${apiUrl}${"/api/cms/invite-visitor/generate-link"}`
        console.log("company list url", remarkRequestUrl)

        api.postWithTokenNew(remarkRequestUrl, {
            "type": email !== '' ? "email" : "mobile",
            "email": email !== '' ? email : phoneNum
        }).then(async (jsonResponse) => {

            if (jsonResponse.success) {
                let jsonData = JSON.stringify(jsonResponse)
                console.log("generateLink Success Message", jsonData);
                setTimeout(() => {
                    props.navigation.navigate('MyVisitor')
                }, 500);
            } else {
                Snackbar.show({ text: JSON.stringify(jsonResponse.errors[0].msg) })
                console.log("generateLink Error Message **", jsonResponse.message ?? "Something went wrong!!");
            }
        }).catch(async (error) => {
            console.log("generateLink Error Message ***", "Something went wrong!!");
        })

    }

    const validateEmailOrPhoneNumber = (textData) => {
        return /^\d+$/.test(textData);
    }


    const checkValidation = (input) => {

        var validRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;

        if (input.length > 0) {

            if (validateEmailOrPhoneNumber(input)) {
                if (input.length != 10) {
                    Snackbar.show({ text: 'Enter 10 digit phone number' });
                    return false;
                } else { return true; }
            } else {
                if (!validRegex.test(input)) {
                    Snackbar.show({ text: 'Enter valid email address' })
                    return false;
                } else { return true; }
            }
        } else {
            Snackbar.show({ text: 'Please Enter email id ' });
            return false;
        }
    }

    return (
        // <SafeAreaView style={{ ...style.header }}>
        <View style={{ flex: 1, backgroundColor: whiteColor, paddingHorizontal: 13 }}>
            <Text style={{ ...style.rubikmidium, fontSize: 14 }}>Enter Email ID </Text>
            <View style={[style.inputContainer, { marginTop: 10, borderRadius: 8, backgroundColor: whiteColor, borderWidth: 0.5, borderColor: "#CFCFCF" }]}>
                <TextInput style={[style.inputText, { flex: 1, marginLeft: 10 }]}
                    placeholder={'Enter here... '}
                    value={emailOrMobileNmber}
                    maxLength={30}
                    onChangeText={(emailOrMobileNmber) => setEmailOrMobileNmber(emailOrMobileNmber.trim())}
                    placeholdergrayColor={grayColor} />
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-evenly", width: "100%", marginVertical: 20 }}>
                <View style={[{ minWidth: 100, borderRadius: 10, alignSelf: 'center', borderWidth: 0, borderColor: '#33B36F', marginTop: 17,/*  flex: 1 */backgroundColor: '#0393FF' }]}>
                    <TouchableOpacity style={{ padding: 10, }} onPress={() => {

                        if (checkValidation(emailOrMobileNmber)) {
                            if (validateEmailOrPhoneNumber(emailOrMobileNmber)) {
                                generateLink("", emailOrMobileNmber)
                            } else {
                                generateLink(emailOrMobileNmber, "")
                            }
                        }
                    }}>
                        <Text style={{ color: "#FFFFFF", fontSize: 16, textAlign: 'center', fontFamily: 'Rubik-Regular' }}>Share</Text>
                    </TouchableOpacity>
                </View>
                <View style={[{ minWidth: 100, borderRadius: 10, alignSelf: 'center', borderWidth: 1, borderColor: '#D1D1D1', marginTop: 17,/*  flex: 1 */ backgroundColor: "#FFFFFF" }]}>
                    <TouchableOpacity style={{ padding: 10, }} onPress={() => { props.navigation.goBack() }}>
                        <Text style={{ color: "#606060", fontSize: 16, textAlign: 'center', fontFamily: 'Rubik-Regular' }}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>

    )
}

const VisitorForm = ({ props }) => {
    const selectedCompany = useRef('')
    const [isFocus, setIsFocus] = useState(false);
    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());
    const [showFromDate, setShowFromDate] = useState(false);
    const [showToDate, setShowToDate] = useState(false);
    const [name, setName] = useState('')
    const [vehicleType, setVehicleType] = useState('')
    const [gender, setGender] = useState('')
    const [mobile, setMobile] = useState('')
    const [from, setFrom] = useState('')
    const [personCount, setPersonCount] = useState('')
    const [purpose, setPurpose] = useState('')
    const [remark, setRemark] = useState('')
    const [vehicleNum, setVehicleNum] = useState('12345')

    const [company, setCompany] = useState('')
    const [meeting, setMeeting] = useState('')
    const [dropdownCompany, setDropdownCompany] = useState([])
    const [dropdownEmployee, setDropdownEmployee] = useState([])

    const [companyEmail, setCompanyEmail] = useState('');
    const [company1, setCompany1] = useState('')
    const [licenseNumber, setLicenseNumber] = useState('');
    //for switch in pannel cleaning
    const [isEnabled, setIsEnabled] = useState(false);
    const toggleSwitch = () => setIsEnabled(previousState => !previousState);


    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const [profilePic, setProfilePic] = useState(null)
    const [imageSelectorModal, setImageSelectorModal] = useState(false)
    const loading = useSelector(state => state.loading);

    const [showCaptureImage, setShowCaptureImage] = useState(false)

    const [fromDateForInBetweenCheckout, setFromDateForInBetweenCheckout] = useState(new Date());
    const [fromTimeForInBetweenCheckout, setFromTimeForInBetweenCheckout] = useState(new Date());
    const [toDateForInBetweenCheckout, setToDateForInBetweenCheckout] = useState(new Date());
    const [toTimeForInBetweenCheckout, setToTimeForInBetweenCheckout] = useState(new Date());
    const [showFromDateForInBetweenCheckout, setShowFromDateForInBetweenCheckout] = useState(false);
    const [showToDateForInBetweenCheckout, setShowToDateForInBetweenCheckout] = useState(false);
    const [showFromTimeForInBetweenCheckout, setShowFromTimeForInBetweenCheckout] = useState(false);
    const [showToTimeForInBetweenCheckout, setShowToTimeForInBetweenCheckout] = useState(false);
    // console.log("date 1", moment(date + ' ' + time, 'DD/MM/YYYY HH:mm:ss').format() /* && moment().format("DD/MM/YYYY HH:mm:ss") */)
    var dateForInBetweenCheckoutFromDate = moment(fromDateForInBetweenCheckout).format('DD/MM/YYYY');
    var timeForInBetweenCheckoutFromTime = moment(fromTimeForInBetweenCheckout).format('hh:mm:ss a');
    var dateForInBetweenCheckoutToDate = moment(toDateForInBetweenCheckout).format('DD/MM/YYYY');
    var timeForInBetweenCheckoutToTime = moment(toTimeForInBetweenCheckout).format('hh:mm:ss a');

    useEffect(() => {
        companyList();

    }, [])

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

    const companyList = () => {

        let remarkRequestUrl = `${apiUrl}${"/api/cms/companyMasters/search"}`
        console.log("company list url", remarkRequestUrl)

        api.postWithTokenNew(remarkRequestUrl, {
            "isActive": true
        }).then(async (jsonResponse) => {

            if (jsonResponse.success) {
                setDropdownCompany(jsonResponse.list)
                let jsonData = JSON.stringify(jsonResponse)
                console.log("Company list Success Message", jsonData);
            } else {
                Snackbar.show({ text: 'Something went wrong' });
                console.log("Company list Error Message **", jsonResponse.message ?? "Something went wrong!!");
            }
        }).catch(async (error) => {
            Snackbar.show({ text: 'Something went wrong' });
            console.log("Company list Error Message ***", "Something went wrong!!");
        })

    }


    const companyWiseEmployee = useCallback((companyId) => {
        // const companyWiseEmployee = () => {
        let remarkRequestUrl = `${apiUrl}${"/api/cms/employees/search"}`
        console.log("company Employee list url", remarkRequestUrl)

        api.postWithTokenNew(remarkRequestUrl, {
            "isActive": true,
            "childCompanyId": companyId
        }).then(async (jsonResponse) => {

            if (jsonResponse.success) {
                setDropdownEmployee(jsonResponse.list)
                let jsonData = JSON.stringify(jsonResponse)
                console.log("Company Employee list Success Message", jsonData);

            } else {
                console.log("Company Employee list Error Message **", jsonResponse.message ?? "Something went wrong!!");
            }
        }).catch(async (error) => {
            console.log("Company Employee list Error Message ***", "Something went wrong!!");
        })

    });

    const onFromDateChange = (selectedDate) => {
        const currentDate = selectedDate || fromDate;
        setShowFromDate(false);
        setFromDate(currentDate);
        if (currentDate > toDate)
            setToDate(currentDate);
    };

    const createVisitor = () => {
        let remarkRequestUrl = `${apiUrl}${"/api/cms/invite-visitor/create"}`
        console.log("create-Visitor list url", remarkRequestUrl)

        api.postWithTokenNew(remarkRequestUrl, {
            "fromDate": moment(dateForInBetweenCheckoutFromDate + ' ' + timeForInBetweenCheckoutFromTime, 'DD/MM/YYYY HH:mm:ss a').format(),
            "toDate": moment(dateForInBetweenCheckoutToDate + ' ' + timeForInBetweenCheckoutToTime, 'DD/MM/YYYY HH:mm:ss a').format(),
            "isApprovedRequired": true,
            "childCompanyId": company,
            "invitedEmployeeId": meeting,
            "name": name,
            "phone": mobile,
            "from": company1,
            "totalPerson": parseInt(personCount),
            "vehicleType": vehicleType,
            "vehicleNumber": vehicleNum,
            "email": companyEmail,
            "vehicleNumber": licenseNumber,
            // "gender": gender,
            "purpose": purpose,
            "remarks": remark,
            "imageSrc": utils.isDataURL(profilePic) ? profilePic : ''
        }).then(async (jsonResponse) => {

            if (jsonResponse.success) {
                // setDropdownCompany(jsonResponse.list)
                let jsonData = JSON.stringify(jsonResponse)
                console.log("createVisitor Success Message", jsonData);
                Snackbar.show({ text: 'Visitor created successfully' });
                setTimeout(() => {
                    props.navigation.navigate('MyVisitor')
                }, 500);
            } else {
                Snackbar.show({ text: 'Something went wrong' });
                console.log("createVisitor Error Message **", jsonResponse.message ?? "Something went wrong!!");
            }
        }).catch(async (error) => {
            Snackbar.show({ text: 'Something went wrong' });
            console.log("createVisitor Error Message ***", "Something went wrong!!");
        })

    }

    const wsCreateVisitor = () => {
        if (company === '') {
            Snackbar.show({ text: 'Please select Company (Subsidiary)' });
            return;
        }
        else if (meeting === "") {
            Snackbar.show({ text: 'Please select Meeting with' });
            return;
        }
        else if (name.trim() === '') {
            Snackbar.show({ text: 'Please enter Name' });
            return;
        }
        else if (mobile.trim() === '') {
            Snackbar.show({ text: 'Please enter Mobile no.' });
            return;
        }
        else if (mobile.trim().length != 10) {
            Snackbar.show({ text: 'Please enter valid Mobile no.' });
            return;
        }
        else if (companyEmail === '') {
            Snackbar.show({ text: 'Please enter Company Email ' });
            return;
        }
        else if (company1 === '') {
            Snackbar.show({ text: 'Please enter Company ' });
            return;
        }
        else if (personCount === '') {
            Snackbar.show({ text: 'Please enter Total no of Person' });
            return;
        }
        // else if (vehicleType === '') {
        //     Snackbar.show({ text: 'Please select Vehicle Type' });
        //     return;
        // }
        else if (isEnabled && licenseNumber === '') {
            Snackbar.show({ text: 'Please enter license Number.' })
        }
        // else if (gender.trim() === '') {
        //     Snackbar.show({ text: 'Please select Gender' });
        //     return;
        // }
        // else if (fromDate || toDate === '') {
        //     Snackbar.show("Turnout", 'Please Select  Date.')
        // }
        // else if (toDate < fromDate) {
        //     Snackbar.show({ text: 'Please enter valid date' });
        //     return;
        // }
        else if (purpose.trim() === '') {
            Snackbar.show({ text: 'Please enter your Purpose' });
            return;
        }
        /*  else if (remark.trim() === '') {
             Snackbar.show({ text: 'Please enter remark' });
             return;
         } */
        else {
            createVisitor()
        }

    }

    const onToDateChange = (selectedDate) => {
        const currentDate = selectedDate || toDate;
        setShowToDate(false);
        setToDate(currentDate);
    };


    const renderProfilePic = () => (
        showCaptureImage ?
            <View style={{ alignItems: 'center', marginTop: 20 }}>
                {/* {Platform.OS === "android" ?
                <View style={{ position: 'absolute', backgroundColor: whiteColor, height: 60, width: '100%' }}></View>
                : <View style={{ position: 'absolute', backgroundColor: whiteColor, height: 80, width: '100%' }} />
            } */}

                <View>
                    {(profilePic) ?
                        <Image source={{ uri: (utils.isDataURL(profilePic)) ? profilePic : uploadUrl + profilePic }}
                            style={{ width: 100, height: 100, borderRadius: 60 }}
                            defaultSource={require('../assets/images/profilepic.png')}
                        /> : <Image source={require('../assets/images/profilepic.png')}
                            style={{ width: 100, height: 100, borderRadius: 60 }}
                        />
                    }
                    <TouchableOpacity onPress={() => {
                        if (Platform.OS == "ios") {
                            check(PERMISSIONS.IOS.CAMERA).then((status) => {
                                if (status == "granted")
                                    setImageSelectorModal(true)
                                else
                                    request(PERMISSIONS.IOS.CAMERA).then((res) => {
                                        if (res == "granted")
                                            setImageSelectorModal(true)
                                    })
                            });

                        }
                        else {
                            check(PERMISSIONS.ANDROID.CAMERA).then((status) => {
                                if (status == "granted")
                                    setImageSelectorModal(true)
                                else
                                    request(PERMISSIONS.ANDROID.CAMERA).then((res) => {
                                        if (res == "granted")
                                            setImageSelectorModal(true)
                                    })
                            });
                        }

                    }} style={style.editProfilePic}>
                        <Image source={require('../assets/images/edit.png')} />
                    </TouchableOpacity>
                </View>
            </View> : null
    );



    return (
        <SafeAreaView style={{ ...style.header }}>
            <KeyboardAvoidingView keyboardVerticalOffset={Platform.OS === 'ios' && 40} behavior={Platform.OS === 'ios' && 'padding'} style={{ flex: 1, backgroundColor: whiteColor, paddingHorizontal: 13 }}>
                <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: -5 }}>

                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 10, paddingHorizontal: 4, borderWidth: 0 }}>
                        {/* <View style={[{ elevation: 5, paddingVertical: 12, justifyContent: 'space-evenly', flexDirection: 'row', borderWidth: 0, backgroundColor: "#d8e3ff", alignItems: 'center', borderRadius: 8, borderColor: '#D1D1D1', width: "48%", }]}>
                            <Image source={require('../assets/images/watch.png')} style={{ tintColor: '#555555', height: 17.66, width: 17.66, marginRight: 8.73, }} />
                            <Text style={{ ...style.rubikmidium, fontSize: 14, color: '#004CFF', marginRight: 15 }}>Capture Video</Text>
                        </View> */}

                        <View style={[/* style.cardWhite, */ { elevation: 5, paddingVertical: 12, borderWidth: 0, backgroundColor: "#F5F5F5", borderRadius: 8, paddingHorizontal: 8.54, borderColor: '#D1D1D1', width: "48%" }]}>

                            <TouchableOpacity onPress={() => {
                                if (Platform.OS == "ios") {
                                    check(PERMISSIONS.IOS.CAMERA).then((status) => {
                                        if (status == "granted")
                                            setImageSelectorModal(true)
                                        else if (status == "blocked") {
                                            Snackbar.show({ text: 'Please give camera permission from app setting' })
                                                .LENGTH_LONG
                                        }
                                        else
                                            request(PERMISSIONS.IOS.CAMERA).then((res) => {
                                                if (res == "granted")
                                                    setImageSelectorModal(true)
                                            })
                                    });

                                }
                                else {
                                    check(PERMISSIONS.ANDROID.CAMERA).then((status) => {
                                        console.log("status for camera permisson " + status)
                                        if (status == "granted")
                                            setImageSelectorModal(true)
                                        else if (status == "blocked") {
                                            Snackbar.show({ text: 'Please give camera permission from app setting' })
                                                .LENGTH_LONG

                                        }
                                        else
                                            request(PERMISSIONS.ANDROID.CAMERA).then((res) => {
                                                if (res == "granted")
                                                    setImageSelectorModal(true)
                                            })
                                    });
                                }

                            }}>
                                <View style={{ justifyContent: 'space-evenly', flexDirection: 'row', alignItems: 'center', }}>
                                    <Image source={require('../assets/images/watch.png')} style={{ tintColor: '#555555', height: 17.66, width: 17.66, marginRight: 8.73, /* marginLeft: 14.73 */ }} />
                                    <Text style={{ ...style.rubikmidium, fontSize: 14, color: '#000000', marginRight: 15 }}>Capture Photo</Text>
                                </View>
                            </TouchableOpacity>

                        </View>
                    </View>


                    <View behavior={Platform.OS === 'android' && 'height'}
                    >
                        <View style={{ backgroundColor: whiteColor, /* flex: 1 */ }}>



                            {!isKeyboardVisible && renderProfilePic()}


                            <View style={{ /* flex: 1 */ marginBottom: 12, marginTop: 20, borderWidth: 0 }}>
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={{ ...style.rubikmidium14 }}>Company (Subsidiary)</Text>
                                    <Image source={require('../assets/images/Mandatoryicon.png')} style={{ height: 5, width: 5 }} />
                                </View>
                                <Dropdown
                                    style={[styles.dropdown, /* isFocus && { borderColor: 'blue' } */]}
                                    placeholderStyle={styles.placeholderStyle}
                                    selectedTextStyle={style.inputTextDate}
                                    inputSearchStyle={styles.inputSearchStyle}
                                    iconStyle={styles.iconStyle}
                                    itemTextStyle={{ fontFamily: 'Rubik-Regular' }}
                                    data={dropdownCompany}
                                    // search
                                    maxHeight={300}
                                    labelField='name'
                                    valueField='_id'
                                    placeholder={dropdownCompany ? '--Select Company Type--' : 'Loading...'}
                                    searchPlaceholder="Search..."
                                    // value={data}
                                    value={company}
                                    onFocus={() => setIsFocus(true)}
                                    onBlur={() => setIsFocus(false)}
                                    onChange={value => {
                                        setCompany(value._id)
                                        selectedCompany.current = value._id
                                        companyWiseEmployee(value._id)
                                        // alert(JSON.stringify(value._id))

                                    }}
                                />
                                {/* </View> */}

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
                                    data={dropdownEmployee}
                                    // search
                                    maxHeight={300}
                                    labelField='name'
                                    valueField='_id'
                                    placeholder={dropdownEmployee ? '--Select Person--' : 'Loading...'}
                                    searchPlaceholder="Search..."
                                    // value={data}
                                    value={meeting}
                                    onFocus={() => setIsFocus(true)}
                                    onBlur={() => setIsFocus(false)}
                                    onChange={value => {
                                        setMeeting(value._id)
                                        // alert(JSON.stringify(value._id))

                                    }}
                                />
                                <View style={{ flexDirection: 'row', marginTop: 20 }}>
                                    <Text style={{ ...style.rubikmidium14 }}>Name</Text>
                                    <Image source={require('../assets/images/Mandatoryicon.png')} style={{ height: 5, width: 5, margin: 3 }} />
                                </View>
                                <View style={[style.inputContainer, { marginTop: 10, borderRadius: 8, backgroundColor: whiteColor, borderWidth: 0.5, borderColor: "#CFCFCF", height: 40 }]}>
                                    <TextInput style={[style.inputText, { flex: 1, }]}
                                        placeholder={''}
                                        value={name}
                                        inputMode="text"
                                        onChangeText={(name) => setName(name)}
                                        placeholdergrayColor={grayColor} />
                                </View>

                                <View style={{ flexDirection: 'row', marginTop: 20 }}>
                                    <Text style={{ ...style.rubikmidium14, }}>Mobile no.</Text>
                                    <Image source={require('../assets/images/Mandatoryicon.png')} style={{ height: 5, width: 5, margin: 3 }} />
                                </View>
                                <View style={[style.inputContainer, { marginTop: 10, borderRadius: 8, backgroundColor: whiteColor, borderWidth: 0.5, borderColor: "#CFCFCF", height: 40 }]}>
                                    <TextInput style={[style.inputText, { flex: 1,/*  marginLeft: 10 */ }]}
                                        placeholder={''}
                                        value={mobile}
                                        maxLength={10}
                                        inputMode="tel"
                                        onChangeText={(name) => setMobile(name)}
                                        placeholdergrayColor={grayColor} />
                                </View>

                                <View style={{ flexDirection: 'row', marginTop: 20 }}>
                                    <Text style={{ ...style.rubikmidium14, }}>Company Email Address</Text>
                                    <Image source={require('../assets/images/Mandatoryicon.png')} style={{ height: 5, width: 5, margin: 3 }} />
                                </View>
                                <View style={[style.inputContainer, { marginTop: 10, borderRadius: 8, backgroundColor: whiteColor, borderWidth: 0.5, borderColor: "#CFCFCF", height: 40 }]}>
                                    <TextInput style={[style.inputText, { flex: 1,/*  marginLeft: 10 */ }]}
                                        placeholder={''}
                                        value={companyEmail}
                                        // maxLength={10}
                                        // inputMode="tel"
                                        onChangeText={(name) => setCompanyEmail(name)}
                                        placeholdergrayColor={grayColor} />
                                </View>

                                <View style={{ flexDirection: 'row', marginTop: 20 }}>
                                    <Text style={{ ...style.rubikmidium14, }}>Company</Text>
                                    <Image source={require('../assets/images/Mandatoryicon.png')} style={{ height: 5, width: 5, margin: 3 }} />
                                </View>
                                <View style={[style.inputContainer, { marginTop: 10, borderRadius: 8, backgroundColor: whiteColor, borderWidth: 0.5, borderColor: "#CFCFCF", height: 40 }]}>
                                    <TextInput style={[style.inputText, { flex: 1,/*  marginLeft: 10 */ }]}
                                        placeholder={''}
                                        value={company1}
                                        // maxLength={10}
                                        // inputMode="tel"
                                        onChangeText={(name) => setCompany1(name)}
                                        placeholdergrayColor={grayColor} />
                                </View>

                                {/* <View style={{ flexDirection: 'row', marginTop: 20 }}>
                                    <Text style={{ ...style.rubikmidium14, }}>Address</Text>
                                    <Image source={require('../assets/images/Mandatoryicon.png')} style={{ height: 5, width: 5, margin: 3 }} />
                                </View>
                                <View style={[style.inputContainer, { marginTop: 10, borderRadius: 8, backgroundColor: whiteColor, borderWidth: 0.5, borderColor: "#CFCFCF", height: 40 }]}>
                                    <TextInput style={[style.inputText, { flex: 1, }]}
                                        placeholder={''}
                                        value={from}
                                        inputMode="text"
                                        onChangeText={(name) => setFrom(name)}
                                        placeholdergrayColor={grayColor} />
                                </View> */}

                                <View style={{ flexDirection: 'row', marginTop: 20 }}>
                                    <Text style={{ ...style.rubikmidium14, }}>Total no of Person</Text>
                                    <Image source={require('../assets/images/Mandatoryicon.png')} style={{ height: 5, width: 5, margin: 3 }} />
                                </View>
                                <View style={[style.inputContainer, { marginTop: 10, borderRadius: 8, backgroundColor: whiteColor, borderWidth: 0.5, borderColor: "#CFCFCF", height: 40 }]}>
                                    <TextInput style={[style.inputText, { flex: 1, }]}
                                        placeholder={''}
                                        value={personCount}
                                        inputMode="numeric"
                                        onChangeText={(count) => setPersonCount(count)}
                                        placeholdergrayColor={grayColor} />
                                </View>

                                <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center' }}>
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
                                    <Text style={{ ...style.rubikmidium14, color: '#A7A7A7', textAlignVertical: 'center' }}>Is Carry Vehicle</Text>
                                </View>
                                {isEnabled ?
                                    <>
                                        <View style={{ flexDirection: 'row', marginTop: 20 }}>
                                            <Text style={{ ...style.rubikmidium14, }}>License Number</Text>
                                            <Image source={require('../assets/images/Mandatoryicon.png')} style={{ height: 5, width: 5, margin: 3 }} />
                                        </View>
                                        <View style={[style.inputContainer, { marginTop: 10, borderRadius: 8, backgroundColor: whiteColor, borderWidth: 0.5, borderColor: "#CFCFCF", height: 40 }]}>
                                            <TextInput style={[style.inputText, { flex: 1,/*  marginLeft: 10 */ }]}
                                                placeholder={''}
                                                value={licenseNumber}
                                                // maxLength={10}
                                                inputMode="tel"
                                                onChangeText={(name) => setLicenseNumber(name)}
                                                placeholdergrayColor={grayColor} />
                                        </View>
                                    </>
                                    : null}

                                {/* <View style={{ flexDirection: 'row', marginTop: 20 }}>
                                    <Text style={{ ...style.rubikmidium14, }}>Vehicle Type</Text>
                                    <Image source={require('../assets/images/Mandatoryicon.png')} style={{ height: 5, width: 5, margin: 3 }} />
                                </View> */}
                                {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 1, marginTop: 10, alignItems: 'center' }}> */}
                                {/* <View style={{ marginTop: 10 }} >
                                    
                                    <RadioButton data={[{ _id: "twoWheeler", value: "TwoWheeler" }, { _id: "fourWheeler", value: "FourWheeler" }]} onSelect={(value) => setVehicleType(value)} radioStyle={{ flexDirection: 'row', justifyContent: 'space-between' }} />
                                </View> */}

                                {/* <View style={{ flexDirection: 'row', marginTop: 20 }}>
                                    <Text style={{ ...style.rubikmidium14, }}>Gender</Text>
                                    <Image source={require('../assets/images/Mandatoryicon.png')} style={{ height: 5, width: 5, margin: 3 }} />
                                </View>
                                <View style={{ marginTop: 10 }} >
                                    <RadioButton data={[{ _id: "m", value: "Male" }, { _id: "f", value: "Female" }, { _id: "o", value: "Other" }]} onSelect={(value) => setGender(value)} radioStyle={{ flexDirection: 'row', justifyContent: 'space-between' }} />
                                </View> */}
                                <Text style={{ ...style.rubikmidium14, marginTop: 30 }}>Entry Validity Duration</Text>
                                {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 1 }}>
                                    <View style={{ width: '48%' }}>
                                        <Text style={{ ...style.rubikmidium14, marginTop: 20 }}>From</Text>
                                        <TouchableOpacity onPress={() => setShowFromDate(true)}>
                                            <View style={[{ marginTop: 10, paddingVertical: 12, justifyContent: 'space-between', flexDirection: 'row', borderWidth: 0.5, backgroundColor: whiteColor, alignItems: 'center', borderRadius: 10, paddingHorizontal: 20, borderColor: '#CFCFCF', height: 40 }]}>
                                                <View style={{}}>
                                                    <Text style={{ ...style.inputTextDate, fontSize: 13 }}>{moment(fromDate).format('DD/MM/YYYY')}</Text>
                                                    <Text style={{ ...style.inputTextDate, fontSize: 13 }}>{moment(fromDate).format('h:mm a')}</Text>
                                                </View>
                                                <Image source={require('../assets/images/visitorCalender.png')} style={{ height: 19, width: 19 }} />
                                            </View>
                                        </TouchableOpacity>
                                        <DateTimePicker
                                            modal={true}
                                            title={"Select Date"}
                                            open={showFromDate}
                                            minimumDate={new Date(moment().format())}
                                            testID="fromDateTimePicker"
                                            date={fromDate}
                                            mode={'datetime'}
                                            onConfirm={onFromDateChange}
                                            onCancel={() => setShowFromDate(false)}
                                        />
                                    </View>

                                    <View style={{ width: '48%' }} >
                                        <Text style={{ ...style.rubikmidium14, marginTop: 20 }}>To</Text>
                                        <TouchableOpacity onPress={() => setShowToDate(true)}>
                                            <View style={[{ marginTop: 10, paddingVertical: 12, justifyContent: 'space-between', flexDirection: 'row', borderWidth: 0.5, backgroundColor: whiteColor, alignItems: 'center', borderRadius: 10, paddingHorizontal: 20, borderColor: '#CFCFCF', height: 40 }]}>
                                                <View>
                                                    <Text style={{ ...style.inputTextDate, fontSize: 13 }}>{moment(toDate).format('DD/MM/YYYY')}</Text>
                                                    <Text style={{ ...style.inputTextDate, fontSize: 13 }}>{moment(toDate).format('h:mm a')}</Text>
                                                </View>
                                                <Image source={require('../assets/images/visitorCalender.png')} style={{ height: 19, width: 19 }} />
                                            </View>
                                        </TouchableOpacity>
                                        <DateTimePicker
                                            modal={true}
                                            open={showToDate}
                                            testID="toDateTimePicker"
                                            date={toDate}
                                            minimumDate={fromDate}
                                            mode={'datetime'}
                                            onConfirm={onToDateChange}
                                            onCancel={() => setShowToDate(false)}
                                        />
                                    </View>
                                    
                                </View> */}
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
                                                        {/* <Text style={{ ...style.inputTextDate, fontSize: 13 }}>{moment(fromDate).format('h:mm a')}</Text> */}
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
                                                        {/* <Text style={{ ...style.inputTextDate, fontSize: 13 }}>{moment(toDate).format('DD/MM/YYYY')}</Text> */}
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
                                                        {/* <Text style={{ ...style.inputTextDate, fontSize: 13 }}>{moment(fromDate).format('h:mm a')}</Text> */}
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
                                                        {/* <Text style={{ ...style.inputTextDate, fontSize: 13 }}>{moment(toDate).format('DD/MM/YYYY')}</Text> */}
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

                                <View style={{ flexDirection: 'row', marginTop: 20 }}>
                                    <Text style={{ ...style.rubikmidium14, }}>Remarks</Text>
                                    {/* <Image source={require('../assets/images/Mandatoryicon.png')} style={{ height: 5, width: 5, margin: 3 }} /> */}
                                </View>
                                <View style={[style.inputContainer, { marginTop: 10, borderRadius: 8, backgroundColor: whiteColor, borderWidth: 0.5, borderColor: "#CFCFCF", height: 40 }]}>
                                    <TextInput style={[style.inputText, { flex: 1, }]}
                                        placeholder={'Remark '}
                                        value={remark}
                                        inputMode="text"
                                        onChangeText={(name) => setRemark(name)}
                                        placeholdergrayColor={grayColor} />
                                </View>

                                {/* <View style={{  marginTop: 20, flexDirection: 'row', alignItems: 'center' }}>
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
                                            <Text style={{ color: "#FFFFFF", fontSize: 16, textAlign: 'center', fontFamily: 'Rubik-Regular' }}>Save</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={[{ minWidth: 100, borderRadius: 10, alignSelf: 'center', borderWidth: 1, borderColor: '#D1D1D1', marginTop: 17, backgroundColor: "#FFFFFF" }]}>
                                        <TouchableOpacity style={{ padding: 10, }} onPress={() => {
                                            props.navigation.goBack()
                                            // setFromDateForInBetweenCheckout(new Date()), setToDateForInBetweenCheckout(new Date()), setVehicleType(''), setGender(''), setMobile(''), setFrom(''), setPersonCount(15), setPurpose(''), setRemark(''), setVehicleNum(''), setCompany(''), setMeeting(''), setIsEnabled(false), setName('')
                                        }}>
                                            <Text style={{ color: "#606060", fontSize: 16, textAlign: 'center', fontFamily: 'Rubik-Regular' }}>Cancel</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                            {/* {renderTabs()} */}
                            <Loader visible={loading} />
                        </View>
                    </View>
                </ScrollView >
            </KeyboardAvoidingView >
        </SafeAreaView >
    )
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
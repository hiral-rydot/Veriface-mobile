import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Keyboard
} from 'react-native';
import { put } from 'redux-saga/effects';
import { NavigationBar } from 'navigationbar-react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view'
import DateTimePicker from 'react-native-date-picker'
import { check, PERMISSIONS, request } from 'react-native-permissions';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { menuHeaderColor, whiteColor, borderColor, grayColor, blueColor, dropdownBaseColor, iconColor } from '../styles/color'
import { style } from '../styles/style'
import { ScrollView } from 'react-native-gesture-handler';
import { Dropdown } from 'react-native-material-dropdown'
import Moment from 'moment'
import { apiGetProfile, apiUpdateProfile, apiChangePwd, saveProfileState } from '../actions'
import { useDispatch, useSelector } from 'react-redux'
import Loader from '../components/loader'
import { getObject, setObject } from "../utils/storage";
import StorageKey, { uploadUrl } from '../webservice/constant'
import BlueButton from '../components/blue-button';
import { utils } from '../utils/utils';
import Snackbar from 'react-native-snackbar';
import AsyncStorage from '@react-native-async-storage/async-storage';
const ReactNavigation = require('react-navigation');
ReactNavigation.SafeAreaView.setStatusBarHeight(0);
const maritalStatusArray = [
  { value: "married", label: "Married" },
  { value: "single", label: "Single" },
  { value: "divorced", label: "Divorced" },
  { value: "widowed", label: "Widowed" },
]
const bloodGroupArray = [
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
  { value: "B+", label: "B+" },
  { value: "B-", label: "B-" },
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" },
]

const genderArray = [
  { value: "m", label: "Male" },
  { value: "f", label: "Female" },
  { value: "o", label: "Other" },
]
const PasswordTab = ({ myprofile, data }) => {
  const dispatch = useDispatch()
  let resChangepwd = useSelector(state => state.resChangepwd)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswordTab, setShowPasswordTab] = useState(true)

  useEffect(() => {
    resChangepwd = null
    AsyncStorage.getItem(StorageKey.KEY_RES_LOGIN).then((value) => {
      // console.log("!!!~~!!~!! " + value)
      let val1 = JSON.parse(value)
      console.log("@@###@@##!!!$ " + val1.item.isLDAP)
      val1.item.isLDAP == true ? setShowPasswordTab(false) : setShowPasswordTab(true)
    })
  }, [])
  useEffect(() => {
    if (resChangepwd && resChangepwd.success) {

      {
        Platform.OS === "android" ? Snackbar.show({ text: 'Your password updated successfully.' })
          :
          setTimeout(() => {
            Snackbar.show({ text: 'Your password updated successfully.' })
          }, 5000);
      }
    }
  }, [resChangepwd])

  const wsChangePassword = () => {
    if (oldPassword === '') {
      Snackbar.show({ text: 'Please enter old password.' })

    } else if (newPassword === '') {
      Snackbar.show({ text: 'Please enter new password.' })
    } else if (newPassword.length < 8) {

      Snackbar.show({ text: 'New password must be 8 character long.' })
    } else if (confirmPassword === '') {
      Snackbar.show({ text: 'Please enter confirm password.' })
    } else if (oldPassword === newPassword) {

      Snackbar.show({ text: 'Old password and new password should not be same.' })
    } else if (newPassword !== confirmPassword) {
      Snackbar.show({ text: 'Password and confirm password does not match.' })
    } else {
      let data = {
        oldPassword: oldPassword,
        newPassword: newPassword,
        confirmPassword: confirmPassword
      }
      dispatch(apiChangePwd(data))
    }
  }
  return (
    <ScrollView>
      {showPasswordTab ?
        <View style={[{ flex: 1, padding: 10 }]}>

          <View style={style.profileItem}>
            <Text style={[style.grayText, { flex: 1 }]}>Old Password</Text>
            <TextInput style={[style.blueText, { flex: 1, textAlign: 'right', }]}
              placeholder={'Old Password'}
              secureTextEntry={true}
              value={oldPassword}
              onChangeText={(oldPass) => {
                setOldPassword(oldPass.replace(/\s/g, ''))
              }} />
          </View>
          <View style={style.profileItem}>
            <Text style={[style.grayText, { flex: 1 }]}>New Password</Text>
            <TextInput style={[style.blueText, { flex: 1, textAlign: 'right', }]}
              placeholder={'New Password'}
              secureTextEntry={true}
              value={newPassword}
              onChangeText={(password) => {
                setNewPassword(password.replace(/\s/g, ''))
              }} />
          </View>
          <View style={style.profileItem}>
            <Text style={[style.grayText, { flex: 1 }]}>Confirm Password</Text>
            <TextInput style={[style.blueText, { flex: 1, textAlign: 'right', }]}
              placeholder={'Confirm Password'}
              secureTextEntry={true}
              value={confirmPassword}
              onChangeText={(confPassword) => {
                setConfirmPassword(confPassword.replace(/\s/g, ''))
              }} />
          </View>
          <BlueButton
            title={'CHANGE PASSWORD'}
            containerStyle={{ marginTop: 20 }}
            onPress={() => wsChangePassword()}
          />
        </View> :
        <View style={{ borderWidth: 0, alignSelf: 'center', marginTop: '50%' }}><Text>You can not change your password</Text></View>}
    </ScrollView>)

}
const BasicDetailsTab = ({ myprofile, data, jumpTo, profileUpdatedCall, updateProfileCall }) => {

  const [name, setName] = useState(null)
  const [phone, setPhone] = useState(null)
  const [alternatePhone, setAlternatePhone] = useState(null)
  const [gender, setGender] = useState('')
  const [bloodGroup, setBloodGroup] = useState('')
  const [address, setAddress] = useState('')
  const [addressHeight, setAddressHeight] = useState(50)
  const [maritalStatus, setMaritalStatus] = useState('')
  const [birthDate, setBirthDate] = useState(null)
  const [showBirthDate, setShowBirthDate] = useState(false);

  const dropdownGender = useRef(null)
  const dropdownBlood = useRef(null)
  const dropdownMarital = useRef(null)

  let updatedData = {
    name: name,
    phone: phone,
    alternatePhone: alternatePhone,
    gender: '',
    bloodGroup: '',
    birthdate: "",
    address: address,
    profile_image: '',
    maritalStatus: ""
  }
  useEffect(() => {
    if (myprofile && myprofile.item) {
      setName(myprofile.item.name)
      setPhone(myprofile.item.phone)
      setAlternatePhone(myprofile.item.alternatePhone)
      setGender(myprofile.item.gender)
      setBloodGroup(myprofile.item.bloodGroup)
      setMaritalStatus(myprofile.item.maritalStatus)
      setAddress(myprofile.item.address)
      setBirthDate((myprofile.item.birthdate) ? Date.parse(myprofile.item.birthdate) : null)

    }
  }, [myprofile])

  const onBirthDateChange = (selectedDate) => {
    const currentDate = selectedDate || birthDate;
    setShowBirthDate(false);
    setBirthDate(currentDate);
    data.birthdate = selectedDate
    updatedData.birthdate = selectedDate
  };
  return (
    <ScrollView>
      <View style={[{ flex: 1, padding: 10 }]}>

        <View style={style.profileItem}>
          <Text style={[style.grayText, { flex: 1 }]}>Name</Text>
          <Text style={[style.blueText]}>{name}</Text>
          {/* <TextInput style={[style.blueText, { flex: 1, textAlign: 'right', }]}
            placeholder={'Name'}
            value={name}
            onChangeText={(name) => {
              setName(name)
              data.name = name
              updatedData.name = name
            }} /> */}
        </View>
        <View style={style.profileItem}>
          <Text style={[style.grayText, { flex: 1 }]}>Mobile No.</Text>
          {/* <Text style={[style.blueText]}>{phone}</Text> */}
          <TextInput style={[style.blueText, { flex: 1, textAlign: 'right', }]}
            keyboardType={'phone-pad'}
            placeholder={'Mobile No.'}
            returnKeyType={"done"}
            value={phone}
            maxLength={10}
            onChangeText={(phone) => {
              setPhone(phone)
              data.phone = phone
              updatedData.phone = phone
            }}
          />
        </View>
        <View style={style.profileItem}>
          <Text style={[style.grayText, { flex: 1 }]}>Alternate Mobile No.</Text>
          <TextInput style={[style.blueText, { flex: 1, textAlign: 'right', }]}
            keyboardType={'phone-pad'}
            placeholder={'Alternate Mobile No.'}
            returnKeyType={"done"}
            value={alternatePhone}
            maxLength={10}
            onChangeText={(altPhone) => {
              setAlternatePhone(altPhone)
              data.alternatePhone = altPhone
              updatedData.alternatePhone = altPhone
            }}
          />
        </View>
        {/* <View style={style.profileItem}>
          <Text style={[style.grayText, { flex: 1 }]}>Gender</Text>
          <Dropdown
            ref={dropdownGender}
            data={genderArray}
            rippleCentered={true}
            itemPadding={5}
            value={gender}
            style={[style.blueText, { textAlign: 'right' }]}
            selectedItemColor={blueColor}
            lineWidth={0}
            onChangeText={(value) => {
              setGender(value)
              data.gender = value
              updatedData.gender = value
            }}
            valueExtractor={((v) => v.value)}
            dropdownOffset={{ top: 8, left: 20 }}
            baseColor={dropdownBaseColor}
            containerStyle={[{ width: 100, height: 40, overflow: "visible", }]}
          />
        </View> */}
        {/* <View style={style.profileItem}>
          <Text style={[style.grayText, { flex: 1 }]}>Blood Group</Text>
          <Dropdown
            ref={dropdownBlood}
            data={bloodGroupArray}
            rippleCentered={true}
            itemPadding={5}
            value={bloodGroup}
            style={[style.blueText, { textAlign: 'right' }]}
            selectedItemColor={blueColor}
            lineWidth={0}
            onChangeText={(value) => {
              setBloodGroup(value)
              data.bloodGroup = value
              updatedData.bloodGroup = value
            }}
            valueExtractor={((v) => v.value)}
            dropdownOffset={{ top: 8, left: 20 }}
            baseColor={dropdownBaseColor}
            containerStyle={[{ width: 100, height: 40, overflow: "visible", }]}
          />
        </View>
        <View style={style.profileItem}>
          <Text style={[style.grayText, { flex: 1 }]}>Date of Birth</Text>

          <TouchableOpacity onPress={() => setShowBirthDate(true)} >
            <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
              <Text style={[style.blueText,]}>{(birthDate) ? Moment(birthDate).format('DD/MM/YYYY') : ''}</Text>
              <Image source={require('../assets/images/date.png')} />
            </View>
          </TouchableOpacity>
        </View> */}
        {/* <DateTimePicker
          modal={true}
          title={"Select Date"}
          open={showBirthDate}
          maximumDate={new Date()}
          testID="dateTimePicker"
          date={birthDate ? new Date(birthDate) : new Date()}
          mode={'date'}
          onConfirm={onBirthDateChange}
          onCancel={() => setShowBirthDate(false)}
        /> */}
        {/* <View style={style.profileItem}>
          <Text style={[style.grayText, { flex: 1 }]}>Marital Status</Text>
          <Dropdown
            ref={dropdownMarital}
            data={maritalStatusArray}
            rippleCentered={true}
            itemPadding={5}
            value={maritalStatus}
            style={[style.blueText, { textAlign: 'right' }]}
            selectedItemColor={blueColor}
            lineWidth={0}
            onChangeText={(value) => {
              setMaritalStatus(value)
              data.maritalStatus = value
              updatedData.maritalStatus = value
            }}
            valueExtractor={((v) => v.value)}
            dropdownOffset={{ top: 8, left: 20 }}
            baseColor={dropdownBaseColor}
            containerStyle={[{ width: 100, height: 40, overflow: "visible", }]}
          />
        </View> */}
        <View style={[style.profileItem, Platform.OS === "android" ? { height: addressHeight } : { height: addressHeight + 20 }]}>
          <Text style={[style.grayText, { flex: 1 }]}>Address</Text>
          <TextInput style={[style.blueText, Platform.OS === "android" ? { flex: 1, textAlign: 'right', } : { flex: 0.5, textAlign: 'right', }]}
            placeholder={'Address'}
            value={address}
            multiline={true}
            onContentSizeChange={(event) => {
              setAddressHeight(event.nativeEvent.contentSize.height)
            }}
            onChangeText={(address) => {
              setAddress(address)
              data.address = address
              updatedData.address = address
            }} />
        </View>
        <BlueButton
          title={'SAVE'}
          containerStyle={{ marginTop: 20 }}
          onPress={() => { profileUpdatedCall(true), updateProfileCall(updatedData) }}
        />
        <View height={50} />
      </View>
    </ScrollView>)

}

const OfficeDetailsTab = ({ myprofile }) => (
  <ScrollView>
    <View style={[{ flex: 1, padding: 10 }]}>

      <View style={[style.profileItem, { paddingVertical: 10 }]}>
        <Text style={[style.grayText,]}>Employee Code</Text>
        <Text style={[style.blueText,]}>{myprofile && myprofile.item && myprofile.item.employeeCode}</Text>
      </View>

      {/* <View style={[style.profileItem, { paddingVertical: 10 }]}>
        <Text style={[style.grayText,]}>Employee Type</Text>
        <Text style={[style.blueText,]}>{myprofile && myprofile.item && myprofile.item.employeeType && myprofile.item.employeeType.name}</Text>
      </View> */}

      <View style={[style.profileItem, { paddingVertical: 10 }]}>
        <Text style={[style.grayText,]}>Email</Text>
        <Text style={[style.blueText,]}>{myprofile && myprofile.item && myprofile.item.email}</Text>
      </View>
      <View style={[style.profileItem, { paddingVertical: 10 }]}>
        <Text style={[style.grayText,]}>Joining Date</Text>
        <Text style={[style.blueText,]}>{myprofile && myprofile.item && utils.formatDate(myprofile.item.joiningDate)}</Text>
      </View>

      <View style={[style.profileItem, { paddingVertical: 10 }]}>
        <Text style={[style.grayText,]}>Role</Text>
        <Text style={[style.blueText,]}>{myprofile && myprofile.item && myprofile.item.role && myprofile.item.role.name}</Text>
      </View>

      {/* <View style={[style.profileItem, { paddingVertical: 10 }]}>
        <Text style={[style.grayText,]}>Shift</Text>
        <Text style={[style.blueText,]}>{myprofile && myprofile.item && myprofile.item.shift && myprofile.item.shift.name}</Text>
      </View> */}

      <View style={[style.profileItem, { paddingVertical: 10 }]}>
        <Text style={[style.grayText,]}>Department</Text>
        <Text style={[style.blueText,]}>{myprofile && myprofile.item && myprofile.item.department && myprofile.item.department.name}</Text>
      </View>

      <View style={[style.profileItem, { paddingVertical: 10 }]}>
        <Text style={[style.grayText,]}>Designation</Text>
        <Text style={[style.blueText,]}>{myprofile && myprofile.item && myprofile.item.designation && myprofile.item.designation.name}</Text>
      </View>

      {/* <View style={[style.profileItem, { paddingVertical: 10 }]}>
        <Text style={[style.grayText,]}>Work Place</Text>
        <Text style={[style.blueText,]}>{myprofile && myprofile.item && myprofile.item.workplaces && myprofile.item.workplaces.name}</Text>
      </View> */}
    </View>
  </ScrollView>
);
const Profile = (props) => {
  const [profileUpdated, setProfileUpdated] = useState(false)
  const loading = useSelector(state => state.loading);
  const myprofile = useSelector(state => state.myprofile);
  let updateprofile = useSelector(state => state.updateprofile);
  const profileState = useSelector(state => state.profileState)
  const [profilePic, setProfilePic] = useState(null)
  const [imageSelectorModal, setImageSelectorModal] = useState(false)
  const [index, setIndex] = useState(0);
  const [showPasswordTab, setShowPasswordTab] = useState(true)

  const [routes] = useState(showPasswordTab ? [
    { key: 'first', title: 'Basic Details' },
    { key: 'second', title: 'Office Details' },
    { key: 'third', title: 'Password' },
  ] : [
    { key: 'first', title: 'Basic Details' },
    { key: 'second', title: 'Office Details' },
  ]);
  // const [routes] = useState(showPasswordTab ? [
  //   { key: 'first', title: 'Basic Details' },
  //   { key: 'second', title: 'Office Details' },
  // ] : [
  //   { key: 'first', title: 'Basic Details' },
  //   { key: 'second', title: 'Office Details' },
  //   { key: 'third', title: 'Password' },
  // ]);

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const dispatch = useDispatch()

  let updatedData = {
    name: '',
    phone: '',
    alternatePhone: '',
    gender: '',
    bloodGroup: '',
    birthdate: '',
    address: '',
    profile_image: '',
    maritalStatus: ''
  }

  useEffect(() => {
    updateprofile = null
    AsyncStorage.getItem(StorageKey.KEY_RES_LOGIN).then((value) => {
      // console.log("!!!~~!!~!! " + value)
      let val1 = JSON.parse(value)
      console.log("@@###@@##!!!$ " + val1.item.isLDAP + " " + typeof (val1.item.isLDAP))
      val1.item.isLDAP == true ? setShowPasswordTab(false) : setShowPasswordTab(true)
    })
    dispatch(apiGetProfile({}))
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true); // or some other action
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false); // or some other action
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, [])

  useEffect(() => {
    if (myprofile && myprofile.item) {
      let imageName = ''
      if (myprofile.item.profile_image) {
        imageName = myprofile.item.profile_image
        setProfilePic(imageName)
      }
      let updatedData = {
        name: myprofile.item.name,
        profile_image: imageName,
        phone: myprofile.item.phone
      }
      updateLogin(updatedData)
      dispatch(saveProfileState(updatedData))
      if (profileUpdated == true) {
        setProfileUpdated(false)
        setTimeout(() => {
          Snackbar.show({ text: 'Your profile updated successfully.', duration: Snackbar.LENGTH_LONG })
        }, 300);
      }
    }
  }, [myprofile])

  useEffect(() => {
    if (updateprofile && updateprofile.success) {

      updateLogin(profileState);
      put({ type: 'RESPONSE_GETPROFILE', myprofile: null });
      dispatch(apiGetProfile({}))
      updateprofile = null
    }
  }, [updateprofile])

  async function updateLogin(profileData) {
    let loginObj = await getObject(StorageKey.KEY_RES_LOGIN)
    loginObj.item.name = profileData.name
    loginObj.item.profile_image = profileData.profile_image
    loginObj.item.mobile = profileData.phone
    await setObject(StorageKey.KEY_RES_LOGIN, loginObj)
  }
  // const selectProfilePic = () => {
  //   var options = {
  //     title: 'Select Image',
  //     takePhotoButtonTitle: 'Take Photo',
  //     chooseFromLibraryButtonTitle: 'Choose Image',
  //     storageOptions: {
  //       skipBackup: true,
  //       path: 'images',
  //       privateDirectory: true
  //     },
  //   };

  //   ImagePicker.showImagePicker(options, res => {
  //     //console.log('Response = ', res);

  //     if (res.didCancel) {
  //       console.log('User cancelled image picker');
  //     } else if (res.error) {
  //       console.log('ImagePicker Error: ', res.error);
  //     } else if (res.customButton) {
  //       console.log('User tapped custom button: ', res.customButton);
  //       alert(res.customButton)
  //     } else {
  //       let source = res;
  //       setProfilePic('data:image/jpeg;base64,' + source.data)

  //     }
  //   });
  // };
  const wsUpdateProfile = (data) => {
    // console.log("=======>;;;;=> " + JSON.stringify(data))
    data.profile_image = utils.isDataURL(profilePic) ? profilePic : ''
    updatedData.profile_image = utils.isDataURL(profilePic) ? profilePic : ''
    for (var k in data)
      if (!data[k] || data[k] === '')
        delete data[k];
    // console.log("=======>;;;;=====>" + JSON.stringify(data))
    dispatch(apiUpdateProfile(data))
  }


  const renderScene = ({ route, jumpTo }) => {
    switch (route.key) {
      case 'first':
        return <BasicDetailsTab myprofile={myprofile} data={updatedData} jumpTo={jumpTo} profileUpdatedCall={setProfileUpdated} updateProfileCall={(data) => wsUpdateProfile(data)} />;
      case 'second':
        return <OfficeDetailsTab myprofile={myprofile} jumpTo={jumpTo} />;
      case 'third':
        return <PasswordTab myprofile={myprofile} data={updatedData} jumpTo={jumpTo} />;
    }
  };

  const renderTabs = () => (
    showPasswordTab ?
      <TabView
        style={{ marginTop: 20 }}
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: Dimensions.get('window').width }}
        overScrollMode={'always'}
        renderTabBar={(props) =>
          <TabBar
            {...props}
            scrollEnabled={true}
            tabStyle={{ width: Dimensions.get('window').width / 3 }}
            indicatorStyle={{ backgroundColor: borderColor, }}
            style={{ backgroundColor: whiteColor, height: 40 }}
            renderLabel={({ route, focused, color }) => (
              <View style={{ paddingBottom: 10, }}>
                <Text style={
                  route.key === props.navigationState.routes[index].key
                    ? style.blueText
                    : style.grayText
                }>
                  {route.title}
                </Text>
              </View>
            )}
          />
        }
      /> :
      <TabView
        style={{ marginTop: 20 }}
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: Dimensions.get('window').width }}
        overScrollMode={'always'}
        swipeEnabled={false}
        renderTabBar={(props) =>
          <TabBar
            {...props}
            scrollEnabled={false}
            tabStyle={{ width: Dimensions.get('window').width / 2 }}
            indicatorStyle={{ backgroundColor: borderColor, }}
            style={{ backgroundColor: whiteColor, height: 40 }}
            renderLabel={({ route, focused, color }) => (
              <View style={{ paddingBottom: 10, }}>
                <Text style={
                  route.key === props.navigationState.routes[index].key
                    ? style.blueText
                    : style.grayText
                } >
                  {route.title}
                </Text>
              </View>
            )}
          />
        }
      />
  )
  const renderProfilePic = () => (
    <View style={{ alignItems: 'center', marginTop: 5 }}>
      {Platform.OS === "android" ?
        <View style={{ position: 'absolute', top: 0,/*  backgroundColor: menuHeaderColor, */ height: 60, width: '100%' }}></View>
        : <View style={{ position: 'absolute', /* backgroundColor: menuHeaderColor, */ height: 80, width: '100%' }} />
      }
      <View>
        {(profilePic) ?
          <Image source={{ uri: (utils.isDataURL(profilePic)) ? profilePic : uploadUrl + profilePic }}
            style={{ width: 120, height: 120, borderRadius: 60, resizeMode: 'cover' }}
            defaultSource={require('../assets/images/profilepic.png')}
          /> : <Image source={require('../assets/images/profilepic.png')}
            style={{ width: 120, height: 120, borderRadius: 60, resizeMode: 'stretch' }}
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
      <Text style={[style.blueText, { margin: 10, fontSize: 18 }]}>{profileState && profileState.name}</Text>
      <Text style={[style.grayText]}>{profileState && profileState.phone}</Text>
    </View>
  )
  return (
    <SafeAreaView style={style.header}>
      <NavigationBar
        navigationBarStyle={{ ...style.navigationBarStyle }}
        // componentLeft={() =>
        //   <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        //     <TouchableOpacity onPress={() => props.navigation.goBack(null)}>
        //       <Image source={require('../assets/images/back.png')}
        //         style={style.backIcon1} />
        //     </TouchableOpacity>
        //     <Text style={style.headerText}>Profile</Text>
        //   </View>
        //}

        componentLeft={() =>
          <View style={{ alignItems: 'flex-start', marginLeft: 5 }}>
            <TouchableOpacity style={{ justifyContent: 'center', flexDirection: 'row' }} onPress={() => props.navigation.goBack(null)}>
              <Image source={require('../assets/images/back.png')}
                style={style.backIcon1} />
              <Text style={style.headerText}>Profile</Text>
            </TouchableOpacity>
          </View>
        }

      //   componentRight={() =>
      //     <TouchableOpacity onPress={() => {
      //       setProfileUpdated(true)
      //       wsUpdateProfile();
      //     }}>
      //       <Image source={require('../assets/images/save.png')}
      //         style={{ resizeMode: 'contain', marginRight: 10, tintColor: iconColor }} />
      //     </TouchableOpacity>

      //   }
      />
      <KeyboardAvoidingView
        behavior={Platform.OS == "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={{ backgroundColor: whiteColor, flex: 1 }}>
          {!isKeyboardVisible && renderProfilePic()}
          {renderTabs()}
          <Loader visible={loading} />
        </View>
        <Modal
          animationType="fade"
          transparent={true}
          visible={imageSelectorModal}

        >
          <View style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', flex: 1, }}>
            <View style={{ backgroundColor: 'white', width: Dimensions.get('window').width * 0.8, paddingHorizontal: 20 }}>
              <Text style={{ fontSize: 25, fontWeight: 'bold', marginVertical: 10 }}>
                Select Image
              </Text>
              <TouchableOpacity onPress={async () => {
                const result = await launchCamera({
                  saveToPhotos: false,
                  mediaType: 'photo',
                  includeBase64: true,
                });
                if (result && !result.didCancel && result.assets && result.assets[0]?.base64) {
                  setProfilePic('data:image/jpeg;base64,' + result.assets[0].base64);
                }
                setImageSelectorModal(false);
              }}>
                <Text style={{ fontSize: 22, marginVertical: 10 }}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={async () => {
                const result = await launchImageLibrary({
                  mediaType: 'photo',
                  includeBase64: true,
                });
                if (result && !result.didCancel && result.assets && result.assets[0]?.base64) {
                  setProfilePic('data:image/jpeg;base64,' + result.assets[0].base64);
                }
                setImageSelectorModal(false);
              }}>
                <Text style={{ fontSize: 22, marginVertical: 10 }}>Choose Image</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{}} onPress={() => setImageSelectorModal(false)}>
                <Text style={{ fontSize: 18, marginVertical: 10, color: 'blue', alignSelf: 'flex-end' }}>Cancel</Text></TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

}

export default Profile

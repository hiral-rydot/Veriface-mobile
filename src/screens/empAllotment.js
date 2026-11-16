import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, FlatList, Modal, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux'
import { apiEmployeeSearch, apiCompanySearch, apiEmpWorkplaceShift, apiEmployeeAllot, apiEmployeeUpdate } from '../actions'
import BlueButton from '../components/blue-button';
import { darkGrayColor, dropdownBaseColor, iconColor, whiteColor } from '../styles/color'
import { style } from '../styles/style'
import { NavigationBar } from 'navigationbar-react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContext } from 'react-navigation';
import { Dropdown } from 'react-native-material-dropdown'
import { getObject } from '../utils/storage'


const Employeeallot = (props) => {
  const navigation = useContext(NavigationContext);
  const dropdownCompany = useRef(null)
  const dropdownEmployee = useRef(null)
  const dropdownShift = useRef(null)
  const [getCMP, setCMP] = useState("");
  const [getID, setID] = useState("");
  const [getEMP, setEMP] = useState("");
  const [getShift, setShift] = useState("");
  const [getShiftID, setShiftID] = useState("");
  const [companyArray, setCompanyArray] = useState([])
  const [employeeName, setEmployeeName] = useState([])
  const [employeeShift, setEmployeeShift] = useState([])
  const [cmpID, SetCMPID] = useState("")
  const [empID, SetEMPID] = useState("")
  const isLoading = useSelector(state => state.loading)
  const [allotments, setAllotments] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  let [workUpdate, setWorkUpdate] = useState(false)
  const dispatch = useDispatch()
  let resCompanySearch = useSelector(state => state.resCompanySearch)
  let resEmployeeSearch = useSelector(state => state.resEmployeeSearch)
  let resEmployeeUpdate = useSelector(state => state.resEmployeeUpdate)
  let resEmployeeAllot = useSelector(state => state.resEmployeeAllot)
  let resEmpWorkplaceShift = useSelector(state => state.resEmpWorkplaceShift)



  let drop_down_data = [];
  var count = Object.keys(companyArray).length;
  for (var i = 0; i < count; i++) {
    drop_down_data.push({
      value: companyArray[i].name,
      id: companyArray[i]._id
    });
  }

  let drop_down_employee_data = [];
  var counts = Object.keys(employeeName).length;
  for (var i = 0; i < counts; i++) {
    drop_down_employee_data.push({
      value: employeeName[i].name,
      id: employeeName[i]._id
    });
  }

  let drop_down_Shift_data = [];
  var counts = Object.keys(employeeShift).length;
  for (var i = 0; i < counts; i++) {
    drop_down_Shift_data.push({
      value: employeeShift[i].name,
      id: employeeShift[i]._id
    });
  }

  useEffect(() => {

    async function getLogin() {
      let loginObjP = await getObject("dataLogin")
      for (let i = 0; i < loginObjP.length; i++) {
        if (loginObjP[i] === "workplaces.update") {
          setWorkUpdate(true)
        }
      }
    }
    getLogin()
  }, [])

  useEffect(() => {
    resCompanySearch = null;
    dispatch(apiCompanySearch({}))
  }, [])

  useEffect(() => {
    resEmployeeAllot = null;
    let id = navigation.state.params.item.item._id
    dispatch(apiEmployeeAllot({}, id))
  }, [])

  useEffect(() => {
    resEmpWorkplaceShift = null;
    let id = navigation.state.params.item.item._id
    dispatch(apiEmpWorkplaceShift({ workplaceId: id }))
  }, [])

  useEffect(() => {
    if (resEmployeeSearch && resEmployeeSearch.success) {
      setEmployeeName(resEmployeeSearch.list)
    }
  }, [resEmployeeSearch])

  useEffect(() => {
    if (resEmployeeAllot && resEmployeeAllot.success) {
      if (resEmployeeAllot && resEmployeeAllot.allotments.length > 0) {
        resEmployeeAllot.allotments.map((item) => {
          let obj = {};
          obj["companyId"] = item.companyId && item.companyId._id;
          obj["employeeId"] = item.employeeId && item.employeeId._id;
          obj["companyName"] = item.companyId && item.companyId.name;
          obj["employeeName"] = item.employeeId && item.employeeId.name;
          obj["employeeShift"] = item.shiftId && item.shiftId.name;
          obj["shiftId"] = item.shiftId && item.shiftId._id;
          setAllotments(prevAllotments => [...prevAllotments, obj])
        })
      }
    }
  }, [resEmployeeAllot])

  useEffect(() => {
    if (resEmpWorkplaceShift && resEmpWorkplaceShift.success) {
      setEmployeeShift(resEmpWorkplaceShift.list)
    }
  }, [resEmpWorkplaceShift])

  useEffect(() => {
    if (resCompanySearch && resCompanySearch.success) {
      setCompanyArray(resCompanySearch.list)
    }
  }, [resCompanySearch])


  const addData = () => {
    setModalVisible(false)
    let obj = {};
    obj["companyId"] = cmpID;
    obj["employeeId"] = empID;
    obj["companyName"] = getCMP;
    obj["employeeName"] = getEMP;
    obj["employeeShift"] = getShift;
    obj["shiftId"] = getShiftID;
    setAllotments(prevAllotments => [...prevAllotments, obj])
  }

  const ondropdownChange = (value, index, data) => {
    setCMP(value)
    const cmpID = data[index].id;
    SetCMPID(cmpID)
    resEmployeeSearch = null;
    let datas = {
      isActive: true,
      childCompanyId: cmpID
    }
    dispatch(apiEmployeeSearch(datas))
  }

  const onChange = (value, index, data) => {
    setEMP(value)
    const empID = data[index].id;
    SetEMPID(empID)
  }
  const onShiftChange = (value, index, data) => {
    setShift(value)
    const shiftID = data[index].id;
    setShiftID(shiftID)
  }
  const wsUpdate = async () => {

    let id = navigation.state.params.item.item._id
    dispatch(apiEmployeeUpdate({
      allotments: allotments,
    }, id))
    await resEmployeeUpdate && resEmployeeUpdate.success === true ?
      Alert.alert(
        "Turnout",
        'Employees Workplace Updated',
        [
          {
            text: 'OK', onPress: () => {
              props.navigation.goBack(null)
            }
          },
        ],
        { cancelable: false },
      ) : Alert.alert(
        "Turnout",
        'Something went wrong',
        [
          {
            text: 'OK', onPress: () => {
              props.navigation.goBack(null)
            }
          },
        ],
        { cancelable: false },
      )
  }

  const deleteAddressDetail = (id) => {
    const renderAray = allotments.filter(item => item !== id)
    setAllotments(renderAray)
  }

  const deleteAddress = (id) => {
    Alert.alert(
      'Delete Workplace',
      'Are you sure want to delete this Workplace ?',
      [
        { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
        { text: 'OK', onPress: () => deleteAddressDetail(id) },
      ],
      { cancelable: false }
    )
  }

  const renderItem = (i) => (
    <View style={[{/*  marginTop: 10, */ /* height: 120 */ }, {
      backgroundColor: whiteColor,
      flex: 1,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.32,
      shadowRadius: 5.46,
      flexDirection: 'column',
      elevation: 9,
      borderRadius: 20,
      padding: 10,
      margin: 10
    }]}>
      <View style={{ flexDirection: 'row', maxWidth: '80%' }}>
        <Text style={{ color: darkGrayColor, fontFamily: 'Rubik-Regular' }}> Company Name - {i.item.companyName} </Text>
      </View>
      <View style={{ flexDirection: 'row', maxWidth: '80%' }}>
        <Text style={{ color: darkGrayColor, fontFamily: 'Rubik-Regular' }}> Employees - {i.item.employeeName} </Text>
      </View>
      <View style={{ flexDirection: 'row', maxWidth: '80%' }}>
        <Text style={{ color: darkGrayColor, fontFamily: 'Rubik-Regular' }}> Shift -  {i.item.employeeShift} </Text>
      </View>

      {workUpdate ? <TouchableOpacity onPress={() => deleteAddress(i.item)} style={{ alignSelf: 'flex-end', bottom: 40 }}>
        <Image style={{ height: 25, width: 25, tintColor: 'red' }} resizeMode={'contain'} source={require('../assets/images/delete.png')} />
      </TouchableOpacity> : null}
    </View>
  )

  return (
    <SafeAreaView style={style.header}>
      <NavigationBar
        navigationBarStyle={{ ...style.navigationBarStyle }}
        componentLeft={() =>
          <View style={{ alignItems: 'flex-start', marginLeft: 5 }}>
            <TouchableOpacity style={{ justifyContent: 'center', flexDirection: 'row' }} onPress={() => navigation.goBack(null)}>
              <Image source={require('../assets/images/back.png')}
                style={style.backIcon1} />
              <Text style={style.headerText}>Employee Allotment</Text>
            </TouchableOpacity>
          </View>}
        componentRight={() =>
          <View style={{ flex: 1, flexDirection: 'row-reverse', alignItems: 'flex-end' }} >
            {workUpdate ? <TouchableOpacity style={{ justifyContent: 'center', flexDirection: 'row' }} onPress={() => { setModalVisible(true) }}>
              <Image source={require('../assets/images/add.png')}
                style={{ marginHorizontal: 10, resizeMode: 'contain', width: 25, height: 25, alignSelf: 'center', tintColor: iconColor }} />
            </TouchableOpacity> : null}
          </View>
        }
      />
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}

      >
        <View style={[{ marginTop: 10 }, style.cardWhite]}>
          <View style={{ height: 180, flexDirection: 'column' }}>
            <TouchableOpacity style={{ justifyContent: 'flex-end', flexDirection: 'row' }} onPress={() => {
              setModalVisible(!modalVisible);
            }}>
              <Image source={require('../assets/images/close.png')}
                style={{ resizeMode: 'contain', width: 25, height: 25, alignSelf: 'center', tintColor: "#0E5EF2" }} />
            </TouchableOpacity>
            <Text style={style.dashbordLabel}> Company Name </Text>
            <View style={[style.inputContainer, { marginTop: 10 }]}>
              <Dropdown
                ref={dropdownCompany}
                data={drop_down_data}
                rippleCentered={true}
                itemPadding={5}
                lineWidth={0}
                dropdownOffset={{ top: 8, left: 20, width: 500 }}
                onChangeText={ondropdownChange}
                baseColor={dropdownBaseColor}
                containerStyle={[{ flex: 1, height: 40, width: 50, overflow: "visible", }]}
                itemTextStyle={[{ fontFamily: 'Rubik-Regular' }]}
              />
            </View>
            <Text style={[{ marginTop: 20 }, style.dashbordLabel]}> Employee </Text>
            <View style={[style.inputContainer, { marginTop: 10 }]}>
              <Dropdown
                ref={dropdownEmployee}
                data={drop_down_employee_data}
                rippleCentered={true}
                itemPadding={5}
                lineWidth={0}
                dropdownOffset={{ top: 8, left: 20 }}
                onChangeText={onChange}
                baseColor={dropdownBaseColor}
                containerStyle={[{ flex: 1, height: 40, width: 50, overflow: "visible", }]}
                itemTextStyle={[{ fontFamily: 'Rubik-Regular' }]}
              />
            </View>

            <View style={{ margin: 10, alignSelf: 'center' }} />
          </View>
          <Text style={[{ marginTop: 30 }, style.dashbordLabel]}> Shift </Text>
          <View style={[style.inputContainer, { marginTop: 10 }]}>
            <Dropdown
              ref={dropdownShift}
              data={drop_down_Shift_data}
              rippleCentered={true}
              itemPadding={5}
              lineWidth={0}
              dropdownOffset={{ top: 8, left: 20 }}
              onChangeText={onShiftChange}
              baseColor={dropdownBaseColor}
              containerStyle={[{ flex: 1, height: 40, width: 50, overflow: "visible", }]}
              itemTextStyle={[{ fontFamily: 'Rubik-Regular' }]}
            />
          </View>
          <View style={{ margin: 80, alignSelf: 'center' }} />
          <BlueButton
            containerStyle={{ top: 10 }}
            title={'Add'}
            onPress={addData}
          />
          <View style={{ margin: Dimensions.get("screen").height, alignSelf: 'center' }} />
        </View>

      </Modal>
      <FlatList
        data={allotments}
        renderItem={renderItem}
        extraData={allotments}
        contentContainerStyle={{ flexGrow: 1 }}
        keyExtractor={(item, index) => setID(index.toString())}
      />
      <BlueButton
        containerStyle={{ marginTop: 20, bottom: 15 }}
        title={'Save'}
        onPress={() => {
          wsUpdate()
        }}
      />

    </SafeAreaView>
  )
}
export default Employeeallot;

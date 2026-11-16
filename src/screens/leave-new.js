import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Button,
  FlatList,
  Alert,
  StyleSheet
} from 'react-native';
import { style } from '../styles/style';
import { whiteColor, blueColor, inputBgColor, grayColor, darkGrayColor, dropdownBaseColor, iconColor } from '../styles/color';
import BlueButton from '../components/blue-button';
import { ScrollView } from 'react-native-gesture-handler';
import DateTimePicker from 'react-native-date-picker'
// import { Dropdown } from 'react-native-material-dropdown'
import { Dropdown } from 'react-native-element-dropdown';
import { NavigationBar } from 'navigationbar-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Moment from 'moment'
import { apiLeaveType, apiLeaveCreate } from '../actions'
import { useDispatch, useSelector } from 'react-redux'
import CheckBox from '@react-native-community/checkbox';
import { RadioButton } from 'react-native-paper';
import RadioButtonRN from 'radio-buttons-react-native';

import moment from 'moment';
import Snackbar from 'react-native-snackbar';

const NewLeave = (props) => {
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [leaveType, setLeaveType] = useState('');
  const [leaveType1, setLeaveType1] = useState('');
  const [showFromDate, setShowFromDate] = useState(false);
  const [showToDate, setShowToDate] = useState(false);
  const [leavetypeArray, setLeavetypeArray] = useState([]);
  const dropdownLeave = useRef(null)
  let resLeaveCreate = useSelector(state => state.resLeaveCreate)
  let resLeaveType = useSelector(state => state.resLeaveType)
  const dispatch = useDispatch()

  const [halfDayLeave, setHalfDayLeave] = useState(false)
  const [paidLeaveCheck, setPaidLeaveCheck] = useState(false)
  const [checked, setChecked] = useState('');
  const [whichHalf, setWhichHalf] = useState("")

  const [isFocus, setIsFocus] = useState(false);

  useEffect(() => {
    resLeaveCreate = null
    if (!resLeaveType) {
      dispatch(apiLeaveType({ isActive: true }))
    }
    setFromDate(new Date());
    setToDate(new Date());
  }, [])

  useEffect(() => {
    if (resLeaveType && resLeaveType.success) {
      setLeavetypeArray(resLeaveType.list)
    }
  }, [resLeaveType])

  useEffect(() => {
    if (resLeaveCreate && resLeaveCreate.success) {
      Snackbar.show({ text: 'Your leave applied successfully.' })
      props.navigation.state.params.wsLeaveList()
      props.navigation.goBack(null)
    }
  }, [resLeaveCreate])

  const onFromDateChange = (selectedDate) => {
    const currentDate = selectedDate || fromDate;
    setShowFromDate(false);
    setFromDate(currentDate);
    if (currentDate > toDate)
      setToDate(currentDate);
  };

  const onToDateChange = (selectedDate) => {
    const currentDate = selectedDate || toDate;
    setShowToDate(false);
    setToDate(currentDate);
  };

  const wsLeaveCreate = () => {
    if (leaveType === '') {
      Alert.alert(
        "Turnout",
        'Please select leave type.',
        [
          {
            text: 'OK',
          },
        ])
    }
    else if (toDate < fromDate) {
      Snackbar.show({ text: 'Please enter valid date.' })
    }
    else if (halfDayLeave == true && whichHalf === "") {
      Snackbar.show({ text: 'Please Select a First Haff or Second Haff.' })
    }
    else if (description.trim() === '') {
      Snackbar.show({ text: 'Please enter reason.' })

    } else {
      let data = {
        leaveType: leaveType,
        fromDate: Moment(fromDate).format('YYYY-MM-DD'),
        toDate: halfDayLeave ? Moment(fromDate).format('YYYY-MM-DD') : Moment(toDate).format('YYYY-MM-DD'),
        // subject: subject,
        halfLeaveType: halfDayLeave == true ? whichHalf : "",
        type: halfDayLeave == true ? "halfLeave" : "fullLeave",
        description: description
      }
      dispatch(apiLeaveCreate(data))
    }

  }
  const renderLeaveType = ({ item }) => (
    <View style={[{ minWidth: 100, backgroundColor: leaveType1 == item.name ? "#0E5EF2" : "#F5F5F5", borderRadius: 10, alignSelf: 'center', borderWidth: leaveType1 == item.name ? 0 : 1, borderColor: '#D1D1D1' }]}>
      <TouchableOpacity style={{ padding: 10, }} onPress={() => { setLeaveType(item._id), setLeaveType1(item.name) }}>
        <Text style={{ color: leaveType1 == item.name ? "white" : "black", fontSize: 16, textAlign: 'center' }}>{item.code}</Text>
      </TouchableOpacity>
    </View>
  )
  const renderInput = () => (
    <View style={[/* style.cardWhite, */{ padding: 0, margin: 10 }]}>
      <Text style={{ marginTop: 10, color: "black" }}>Leave Type</Text>
      {/* <View style={[style.inputContainer, { marginTop: 10 }]}>
        <Dropdown
          ref={dropdownLeave}
          data={leavetypeArray}
          rippleCentered={true}
          itemPadding={5}
          lineWidth={0}
          valueExtractor={((v) => v._id)}
          labelExtractor={((v) => v.name)}
          dropdownOffset={{ top: 8, left: 20 }}
          onChangeText={(value) => setLeaveType(value)}
          baseColor={dropdownBaseColor}
          containerStyle={[{ flex: 1, height: 40, overflow: "visible", }]}
        />

      </View> */}
      <Dropdown
        style={[styles.dropdown, /* isFocus && { borderColor: 'blue' } */]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={style.inputTextDate}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        data={leavetypeArray ?? []}
        // search
        maxHeight={300}
        labelField='name'
        valueField='_id'
        placeholder={leavetypeArray ? '--Select Leave Type--' : 'Loading...'}
        searchPlaceholder="Search..."
        value={leavetypeArray}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={value => {
          setLeaveType(value._id)
          // alert(JSON.stringify(value._id))

        }}
      />
      {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={[{ minWidth: 100, backgroundColor: leaveType == "Casual leave" ? "#0E5EF2" : "#F5F5F5", borderRadius: 10, alignSelf: 'center', borderWidth: 0, borderColor: '#D1D1D1' }]}>
          <TouchableOpacity style={{ padding: 10, }} onPress={() => { setLeaveType("Casual leave") }}>
            <Text style={{ color: leaveType == "Casual leave" ? "white" : "black", fontSize: 16, textAlign: 'center' }}>CL</Text>
          </TouchableOpacity>
        </View>
        <View style={[{ minWidth: 100, backgroundColor: leaveType == "Medical leave" ? "#0E5EF2" : "#F5F5F5", borderRadius: 10, alignSelf: 'center', borderWidth: 0, borderColor: '#D1D1D1' }]}>
          <TouchableOpacity style={{ padding: 10, }} onPress={() => { setLeaveType("Medical leave") }}>
            <Text style={{ color: leaveType == "Medical leave" ? "white" : "black", fontSize: 16, textAlign: 'center' }}>ML</Text>
          </TouchableOpacity>
        </View>
        <View style={[{ minWidth: 100, backgroundColor: leaveType == "Paid Leave" ? "#0E5EF2" : "#F5F5F5", borderRadius: 10, alignSelf: 'center', borderWidth: 0, borderColor: '#D1D1D1' }]}>
          <TouchableOpacity style={{ padding: 10, }} onPress={() => { setLeaveType("Paid Leave") }}>
            <Text style={{ color: leaveType == "Paid Leave" ? "white" : "black", fontSize: 16, textAlign: 'center' }}>PL</Text>
          </TouchableOpacity>
        </View>

      </View> */}

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 1 }}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={[{ marginTop: 0, color: "black" }]}>From</Text>
          <TouchableOpacity onPress={() => setShowFromDate(true)}>
            <View style={[{ marginTop: 10, paddingVertical: 12, justifyContent: 'space-between', flexDirection: 'row', borderWidth: 1, backgroundColor: inputBgColor, alignItems: 'center', borderRadius: 10, paddingHorizontal: 20, borderColor: '#D1D1D1' }]}>
              <Text style={[style.inputTextDate]}>{Moment(fromDate).format('DD/MM/YYYY')}</Text>
              <Image source={require('../assets/images/date.png')} />
            </View>
          </TouchableOpacity>
          <DateTimePicker
            modal={true}
            title={"Select Date"}
            open={showFromDate}
            minimumDate={new Date(moment().add('-1', 'month'))}
            testID="fromDateTimePicker"
            date={fromDate}
            mode={'date'}
            onConfirm={onFromDateChange}
            onCancel={() => setShowFromDate(false)}
          />
        </View>
        {/* {halfDayLeave == false ? */}
        <View style={{ flex: 1, opacity: halfDayLeave ? 0.5 : 1 }} >
          <Text style={[{ marginTop: 0, color: "black" }]}>To</Text>
          <TouchableOpacity disabled={halfDayLeave ? true : false} onPress={() => setShowToDate(true)}>
            <View style={[{ marginTop: 10, paddingVertical: 12, justifyContent: 'space-between', flexDirection: 'row', borderWidth: 1, backgroundColor: inputBgColor, alignItems: 'center', borderRadius: 10, paddingHorizontal: 20, borderColor: '#D1D1D1' }]}>

              <Text style={[style.inputTextDate,]}>{Moment(toDate).format('DD/MM/YYYY')}</Text>

              <Image source={require('../assets/images/date.png')} />
            </View>
          </TouchableOpacity>
          <DateTimePicker
            modal={true}
            open={showToDate}
            testID="toDateTimePicker"
            date={toDate}
            minimumDate={fromDate}
            mode={'date'}
            onConfirm={onToDateChange}
            onCancel={() => setShowToDate(false)}
          />
        </View>
        {/* : null} */}
      </View>

      {/* <Text style={[style.blueText, { marginTop: 20 }]}>Subject</Text>
      <TextInput style={[style.inputText, style.inputContainer, { marginTop: 10 }]}
        placeholder={'Subject'}
        returnKeyType={"done"}
        placeholdergrayColor={grayColor}
        onChangeText={(text) => setSubject(text)} /> */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', flex: 1, marginTop: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <CheckBox
            style={{ height: 20, width: 20 }}
            disabled={false}
            value={halfDayLeave}
            boxType="square"
            tintColors={{ true: "#0E5EF2" }}
            onValueChange={(newValue) => { setHalfDayLeave(newValue), console.log(">>>>>>>>>>>>>", newValue), newValue == false ? setChecked("") : null, newValue == false ? setWhichHalf("") : null }}
          />
          <Text style={{ color: "#999999", paddingLeft: 5 }}>  Half Day Leave</Text>
        </View>
        {/* <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <CheckBox
            disabled={false}
            value={paidLeaveCheck}
            tintColors={{ true: "#0E5EF2" }}
            onValueChange={(newValue) => setPaidLeaveCheck(newValue)}
          />
          <Text style={{ color: "#999999" }}>Paid Leave</Text>
        </View> */}
      </View>
      {/* {halfDayLeave ? setChecked():setChecked()} */}
      {halfDayLeave ?
        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', flex: 1, marginTop: -5 }}>
          <View style={{ flex: 1 }} />
          <RadioButtonRN
            style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 9 }}
            boxStyle={{ width: '50%' }}
            box={false}
            data={[{ value: "firstHalf", label: "First Half" }, { value: "secondHalf", label: "Second Half" }]}
            selectedBtn={(item) => {
              setWhichHalf(item.value);
              console.log(item);
            }}
          />
          {/* <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <RadioButton
              value="first"
              color="#0E5EF2"
              uncheckedColor="#7E868C"
              status={halfDayLeave && checked === 'first' ? 'checked' : 'unchecked'}
              onPress={() => { setChecked('first'), setWhichHalf("firstHalf") }}
            />
            <Text style={{ color: "#999999" }}>First Half</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <RadioButton
              value="second"
              color="#0E5EF2"
              uncheckedColor="#7E868C"
              status={halfDayLeave && checked === 'second' ? 'checked' : 'unchecked'}
              onPress={() => { setChecked('second'), setWhichHalf("secondHalf") }}
            />
            <Text style={{ color: "#999999" }}>Second Half</Text>
          </View> */}
        </View>

        : null}

      <Text style={[{ marginTop: 20, color: 'black' }]}>Reason</Text>

      <TextInput style={[style.inputText, style.inputContainer, { height: 100, marginTop: 10, textAlignVertical: 'top', borderWidth: 1, borderRadius: 10, borderColor: '#D1D1D1' }]}
        multiline={true}
        numberOfLines={3}
        placeholder={'Reason'}
        placeholdergrayColor={grayColor}
        onChangeText={(text) => setDescription(text)} />

      <View style={{ flexDirection: 'row', marginTop: 30, justifyContent: 'space-evenly' }}>
        <View style={[{ minWidth: 100, backgroundColor: "#0E5EF2", borderRadius: 12, alignSelf: 'center', borderWidth: 0, borderColor: '#D1D1D1' }]}>
          <TouchableOpacity style={{ padding: 12, }} onPress={() => { wsLeaveCreate() }}>
            <Text style={{ color: whiteColor, fontSize: 16, textAlign: 'center' }}>Request</Text>
          </TouchableOpacity>
        </View>
        <View style={[{ minWidth: 100, backgroundColor: "transparent", borderRadius: 12, alignSelf: 'center', borderWidth: 1, borderColor: '#D1D1D1' }]}>
          <TouchableOpacity style={{ padding: 12, }} onPress={() => { props.navigation.goBack(null) }}>
            <Text style={{ color: "#7E868C", fontSize: 16, textAlign: 'center' }}>Cancel</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
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
              <Text style={{ ...style.headerText }}>Apply for Leave</Text>
            </TouchableOpacity>
          </View>
        }
      />
      <View style={{ /* padding: 10, */ backgroundColor: whiteColor, flex: 1, }}>
        <KeyboardAvoidingView
          behavior={Platform.OS == "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView /* keyboardShouldPersistTaps={"always"} */ >
            {/* <FlatList
              data={leavetypeArray}
              renderItem={renderLeaveType}
              keyExtractor={item => item._id}
              numColumns={3}
              columnWrapperStyle={{ justifyContent: "space-between", margin: 10 }}
            // contentContainerStyle={{ flexGrow: 1 }}
            /> */}
            {renderInput()}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
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
    height: 50,
    borderColor: '#D1D1D1',
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginTop: 10,
    marginBottom: 7,
    backgroundColor: inputBgColor
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

export default NewLeave

import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Alert,
  StyleSheet
} from 'react-native';
import { style } from '../styles/style';
import { whiteColor, blueColor, inputBgColor, grayColor, darkGrayColor, iconColor } from '../styles/color';
import BlueButton from '../components/blue-button';
import { ScrollView } from 'react-native-gesture-handler';

import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationBar } from 'navigationbar-react-native';
import { apiRequestCreate } from '../actions'
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment';
import { Dropdown } from 'react-native-element-dropdown';

import DateTimePicker from 'react-native-date-picker'
import Snackbar from 'react-native-snackbar';
import { apiUrl } from '../webservice/constant'
import { api } from '../webservice/api';



const NewRequest = (props) => {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  const [isFocus, setIsFocus] = useState(false);
  const [reasonType, setReasonType] = useState('')

  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showFromDate, setShowFromDate] = useState(false);
  const [showToDate, setShowToDate] = useState(false);
  const [reason, setReason] = useState('')

  const [reasonName, setReasonName] = useState('')
  const [fromTime, setFromTime] = useState('');

  const [fromDateForInBetweenCheckout, setFromDateForInBetweenCheckout] = useState(new Date());
  const [fromTimeForInBetweenCheckout, setFromTimeForInBetweenCheckout] = useState(new Date());
  const [toDateForInBetweenCheckout, setToDateForInBetweenCheckout] = useState(new Date());
  const [toTimeForInBetweenCheckout, setToTimeForInBetweenCheckout] = useState(new Date());
  const [showFromDateForInBetweenCheckout, setShowFromDateForInBetweenCheckout] = useState(false);
  const [showToDateForInBetweenCheckout, setShowToDateForInBetweenCheckout] = useState(false);
  const [showFromTimeForInBetweenCheckout, setShowFromTimeForInBetweenCheckout] = useState(false);
  const [showToTimeForInBetweenCheckout, setShowToTimeForInBetweenCheckout] = useState(false);
  const [requestTypeList, setRequestTypeList] = useState([]);


  var date = moment(fromDate).format('DD/MM/YYYY');
  var time = moment(fromTime).format('hh:mm:ss a');

  var dateForInBetweenCheckoutFromDate = moment(fromDateForInBetweenCheckout).format('DD/MM/YYYY');
  var timeForInBetweenCheckoutFromTime = moment(fromTimeForInBetweenCheckout).format('hh:mm:ss a');
  var dateForInBetweenCheckoutToDate = moment(toDateForInBetweenCheckout).format('DD/MM/YYYY');
  var timeForInBetweenCheckoutToTime = moment(toTimeForInBetweenCheckout).format('hh:mm:ss a');
  // console.log("date 1", moment(date + ' ' + time, 'DD/MM/YYYY HH:mm:ss').format() /* && moment().format("DD/MM/YYYY HH:mm:ss") */)


  const onToDateChange = (selectedDate) => {
    const currentDate = selectedDate || toDate;
    setShowToDate(false);
    setToDate(currentDate);
    setFromTime(currentDate);
  };
  const onFromDateChange = (selectedDate) => {
    const currentDate = selectedDate || fromDate;
    setShowFromDate(false);
    setFromDate(currentDate);
    if (currentDate > toDate)
      setToDate(currentDate);
  };

  const onToDateChangeForInBetweenCheckout = (selectedDate) => {
    const currentDate = selectedDate || toDateForInBetweenCheckout;
    setShowToDateForInBetweenCheckout(false);
    setToDateForInBetweenCheckout(currentDate);

  };
  const onFromDateChangeForInBetweenCheckout = (selectedDate) => {
    const currentDate = selectedDate || fromDateForInBetweenCheckout;
    setShowFromDateForInBetweenCheckout(false);
    setFromDateForInBetweenCheckout(currentDate);

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

  let data = [
    { "_id": 1, "name": "Early Check-Out" },
    { "_id": 2, "name": "Late Check-In" },
    { "_id": 3, "name": "Missed Check-In/Check-Out" },
    { "_id": 4, "name": "In-Between Check-Out" },
    { "_id": 5, "name": "Other" },
  ]

  const dispatch = useDispatch()
  let resRequestCreate = useSelector(state => state.resRequestCreate)

  useEffect(() => {
    wcRequestTypeList()
  }, [])



  const wsRequestCreate = () => {
    if (reasonName.trim() === '') {
      Snackbar.show({ text: 'Please enter request type' })
    } else if (description.trim() === '') {
      Snackbar.show({ text: 'Please enter description.' })
    } else {
      wcCreateRequest()
    }

  }


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


  const wcCreateRequest = () => {
    console.log("######################## ====> " + moment(dateForInBetweenCheckoutFromDate + ' ' + timeForInBetweenCheckoutFromTime, 'DD/MM/YYYY HH:mm:ss a').format() + " " + timeForInBetweenCheckoutFromTime + " " + moment(dateForInBetweenCheckoutFromDate + ' ' + timeForInBetweenCheckoutToTime, 'DD/MM/YYYY HH:mm:ss a').format())
    let holiday_list = `${apiUrl}${"/api/cms/request/create"}`
    api.postWithTokenNew(holiday_list, {
      "subject": reasonName,
      "requestType": reasonType,
      "fromTime": reasonType === 'in_between_check_out' ? moment(dateForInBetweenCheckoutFromDate + ' ' + timeForInBetweenCheckoutFromTime, 'DD/MM/YYYY HH:mm:ss a').format() : moment(date + ' ' + time, 'DD/MM/YYYY HH:mm:ss a').format(),
      "toTime": reasonType === 'in_between_check_out' ? moment(dateForInBetweenCheckoutFromDate + ' ' + timeForInBetweenCheckoutToTime, 'DD/MM/YYYY HH:mm:ss a').format() : null,
      "reason": description,
    }).then(async (jsonResponse) => {

      if (jsonResponse.success) {

        let jsonData = JSON.stringify(jsonResponse)
        console.log("CreateRequest Success Message", jsonData);
        Snackbar.show({ text: 'Your request submitted successfully' });
        setTimeout(() => {
          props.navigation.navigate('MyRequest', { fromWhere: 'NewRequest' })
        }, 500);
      } else {
        console.log("CreateRequest Error Message **", jsonResponse.message ?? "Something went wrong!!");
      }
    }).catch(async (error) => {
      console.log("CreateRequest Error Message ***", "Something went wrong!!");
    })
  };


  const renderInput = () => (
    // <SafeAreaView style={style.header}>
    <View style={{ flex: 1, backgroundColor: whiteColor }}>

      <View style={{ padding: 20 }}>
        <Text style={{ ...style.rubikmidium, fontSize: 14, color: '#000000' }}>Select Request Type</Text>
        <Dropdown
          style={[styles.dropdown, /* isFocus && { borderColor: 'blue' } */]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={style.inputTextDate}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={requestTypeList ?? []}
          // search
          maxHeight={300}
          labelField='name'
          valueField='_id'
          placeholder={requestTypeList ? 'Select here...' : 'Loading...'}
          searchPlaceholder="Search..."
          value={reasonType}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={value => {
            setReasonType(value._id)
            setReasonName(value.name)
            // alert(JSON.stringify(value._id))

          }}
        />
        {/* {reasonName == "Other" ?
          <View style={{  marginTop: 9 }}>
            <Text style={{ ...style.rubikmidium, fontSize: 14, color: '#000000' }}>Add Reason Type</Text>
            <TextInput style={[style.inputText, style.inputContainer, { height: 72, marginTop: 10, textAlignVertical: 'top', borderWidth: 0.5, borderRadius: 10, borderColor: '#CFCFCF', backgroundColor: whiteColor }]}
              multiline={true}
              numberOfLines={3}
              placeholder={'Write your Requests type ...'}
              placeholdergrayColor={"#D2D4DA"}
              onChangeText={(text) => setReason(text)} />
          </View>
          : null} */}

        {reasonType === "in_between_check_out" ?
          <>
            <Text style={{ ...style.rubikmidium14, marginTop: 20, color: '#A7A7A7' }}>From</Text>
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
                  // minimumDate={new Date(moment().format())}
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
            <Text style={{ ...style.rubikmidium14, marginTop: 20, color: '#A7A7A7' }}>To</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ width: '48%', opacity: 0.5 }}>
                <Text style={{ ...style.rubikmidium14, marginTop: 7 }}>Date</Text>
                {/* <TouchableOpacity onPress={() => setShowToDateForInBetweenCheckout(true)}> */}
                <View style={[{ marginTop: 10, paddingVertical: 12, justifyContent: 'space-between', flexDirection: 'row', borderWidth: 0.5, backgroundColor: whiteColor, alignItems: 'center', borderRadius: 10, paddingHorizontal: 20, borderColor: '#CFCFCF', height: 40 }]}>
                  <View style={{/*  flexDirection: 'column' */ }}>
                    <Text style={{ ...style.inputTextDate, fontSize: 13 }}>{moment(fromDateForInBetweenCheckout).format('DD/MM/YYYY')}</Text>
                    {/* <Text style={{ ...style.inputTextDate, fontSize: 13 }}>{moment(fromDate).format('h:mm a')}</Text> */}
                  </View>
                  <Image source={require('../assets/images/visitorCalender.png')} style={{ height: 19, width: 19 }} />
                </View>
                {/* </TouchableOpacity> */}
                <DateTimePicker
                  modal={true}
                  title={"Select Date"}
                  open={showToDateForInBetweenCheckout}
                  minimumDate={new Date(moment().format())}
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
                  minimumDate={new Date(moment(fromTimeForInBetweenCheckout).add(1, "minute"))}
                  mode={'time'}
                  onConfirm={onToTimeChangeForInBetweenCheckout}
                  onCancel={() => setShowToTimeForInBetweenCheckout(false)}
                />
              </View>
              {/* : null} */}
            </View>
          </>
          :
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ width: '48%' }}>
              <Text style={{ ...style.rubikmidium14, marginTop: 20 }}>Date</Text>
              <TouchableOpacity onPress={() => setShowFromDate(true)}>
                <View style={[{ marginTop: 10, paddingVertical: 12, justifyContent: 'space-between', flexDirection: 'row', borderWidth: 0.5, backgroundColor: whiteColor, alignItems: 'center', borderRadius: 10, paddingHorizontal: 20, borderColor: '#CFCFCF', height: 40 }]}>
                  <View style={{/*  flexDirection: 'column' */ }}>
                    <Text style={{ ...style.inputTextDate, fontSize: 13 }}>{moment(fromDate).format('DD/MM/YYYY')}</Text>
                    {/* <Text style={{ ...style.inputTextDate, fontSize: 13 }}>{moment(fromDate).format('h:mm a')}</Text> */}
                  </View>
                  <Image source={require('../assets/images/visitorCalender.png')} style={{ height: 19, width: 19 }} />
                </View>
              </TouchableOpacity>
              <DateTimePicker
                modal={true}
                title={"Select Date"}
                open={showFromDate}
                // minimumDate={new Date(moment().format())}
                testID="fromDateTimePicker"
                date={fromDate}
                mode={'date'}
                onConfirm={onFromDateChange}
                onCancel={() => setShowFromDate(false)}
              />
            </View>

            <View style={{ width: '48%' }} >
              <Text style={{ ...style.rubikmidium14, marginTop: 20 }}>Time</Text>
              <TouchableOpacity onPress={() => setShowToDate(true)}>
                <View style={[{ marginTop: 10, paddingVertical: 12, justifyContent: 'space-between', flexDirection: 'row', borderWidth: 0.5, backgroundColor: whiteColor, alignItems: 'center', borderRadius: 10, paddingHorizontal: 20, borderColor: '#CFCFCF', height: 40 }]}>
                  <View>
                    {/* <Text style={{ ...style.inputTextDate, fontSize: 13 }}>{moment(toDate).format('DD/MM/YYYY')}</Text> */}
                    <Text style={{ ...style.inputTextDate, fontSize: 13 }}>{moment(toDate).format('h:mm a')}</Text>
                  </View>
                  <Image source={require('../assets/images/watch.png')} style={{ height: 19, width: 19, tintColor: '#CFCFCF' }} />
                </View>
              </TouchableOpacity>
              <DateTimePicker
                modal={true}
                open={showToDate}
                testID="toDateTimePicker"
                date={toDate}
                // minimumDate={fromDate}
                mode={'time'}
                onConfirm={onToDateChange}
                onCancel={() => setShowToDate(false)}
              />
            </View>
            {/* : null} */}
          </View>
        }
        {fromDate && toDate ?


          console.log("date 1", moment(date + ' ' + time, 'DD/MM/YYYY HH:mm:ss').format() /* && moment().format("DD/MM/YYYY HH:mm:ss") */)
          : null
        }

        <View style={{ marginTop: 20 }}>
          <Text style={{ ...style.rubikmidium, fontSize: 14, color: '#000000' }}>Reason</Text>
          <TextInput style={[style.inputText, style.inputContainer, { height: 72, marginTop: 10, textAlignVertical: 'top', borderWidth: 0.5, borderRadius: 10, borderColor: '#CFCFCF', backgroundColor: whiteColor }]}
            multiline={true}
            numberOfLines={3}
            placeholder={'Write your reason ...'}
            placeholdergrayColor={"#D2D4DA"}
            onChangeText={(text) => setDescription(text)} />
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-evenly", width: "100%", marginVertical: 20 }}>
          <View style={[{ minWidth: 100, borderRadius: 10, alignSelf: 'center', borderWidth: 0, borderColor: '#33B36F', marginTop: 17,/*  flex: 1 */backgroundColor: '#0393FF' }]}>
            <TouchableOpacity style={{ padding: 10, }} onPress={() => {
              wsRequestCreate();
            }}>
              <Text style={{ color: "#FFFFFF", fontSize: 16, textAlign: 'center', fontFamily: 'Rubik-Regular' }}>Submit</Text>
            </TouchableOpacity>
          </View>
          <View style={[{ minWidth: 100, borderRadius: 10, alignSelf: 'center', borderWidth: 1, borderColor: '#D1D1D1', marginTop: 17,/*  flex: 1 */ backgroundColor: "#FFFFFF" }]}>
            <TouchableOpacity style={{ padding: 10, }} onPress={() => { props.navigation.goBack() }}>
              <Text style={{ color: "#606060", fontSize: 16, textAlign: 'center', fontFamily: 'Rubik-Regular' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
    // </SafeAreaView>
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
              <Text style={style.headerText}>Add Request</Text>
            </TouchableOpacity>
          </View>
        }
      />
      <KeyboardAvoidingView
        behavior={Platform.OS == "ios" ? "padding" : "height"}
        style={{ flex: 1 }}>
        <View style={{ backgroundColor: whiteColor, flex: 1, }}>
          {/* <NavigationBar
            navigationBarStyle={{ ...style.navigationBarStyle }}
            componentLeft={() =>
              <View style={{ alignItems: 'flex-start', marginLeft: 5 }}>
                <TouchableOpacity style={{ justifyContent: 'center', flexDirection: 'row' }} onPress={() => props.navigation.goBack(null)}>
                  <Image source={require('../assets/images/back.png')}
                    style={style.backIcon1} />
                  <Text style={style.headerText}>New Request</Text>
                </TouchableOpacity>
              </View>

            }

          /> */}
          <ScrollView>
            {renderInput()}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
export default NewRequest

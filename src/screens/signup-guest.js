import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { apiGuestSignup } from '../actions/index'
import { style } from '../styles/style';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationBar } from 'navigationbar-react-native'
import { whiteColor, blueColor, inputBgColor, grayColor, darkGrayColor, iconColor } from '../styles/color';
import BlueButton from '../components/blue-button';
import { ScrollView } from 'react-native-gesture-handler';
import FooterPoweredBy from '../components/footer-poweredby';
import Loader from '../components/loader'
import { utils } from '../utils/utils'
import Snackbar from 'react-native-snackbar';
let SignupGuest = (props) => {
  const dispatch = useDispatch();
  let resGuestSignup = useSelector(state => state.resGuestSignup);
  const loading = useSelector(state => state.loading);
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')


  useEffect(() => {
    resGuestSignup = null
  }, [])

  useEffect(() => {

    if (resGuestSignup && resGuestSignup.success) {
      Alert.alert("Alert", resGuestSignup.message,
        [
          { text: "OK", onPress: () => props.navigation.goBack(null) }
        ]
      )
      resGuestSignup = null
    }

  }, [resGuestSignup])


  const wsGuestSignup = () => {
    if (name === '') {
      Snackbar.show({ text: 'Please enter your name.' })
    } else if (email === '') {
      Snackbar.show({ text: 'Please enter email.' })
    } else if (!utils.isValidEmail(email)) {
      Snackbar.show({ text: 'Please enter valid email.' })
    } else {
      let data = {
        email: email,
        name: name
      }
      dispatch(apiGuestSignup(data))
    }
  }
  const renderInput = () => (
    <View style={[style.cardWhite, { padding: 20, margin: 10 }]}>
      <View style={[style.inputContainer, { marginTop: 10 }]}>
        <Image source={require('../assets/images/usericon.png')} style={{ tintColor: "#0E5EF2" }} />

        <TextInput style={[style.inputText, { flex: 1, marginLeft: 10 }]}
          placeholder={'Your Name'}
          value={name}
          onChangeText={(name) => setName(name)}
          placeholdergrayColor={grayColor} />
      </View>
      <View style={[style.inputContainer, { marginTop: 10 }]}>
        <Image source={require('../assets/images/email.png')} style={{ tintColor: "#0E5EF2" }} />

        <TextInput style={[style.inputText, { flex: 1, marginLeft: 10 }]}
          placeholder={'Email address'}
          value={email}
          onChangeText={(email) => setEmail(email.trim())}
          placeholdergrayColor={grayColor} />
      </View>

      <BlueButton
        containerStyle={{ marginTop: 25 }}
        title={'SUBMIT'}
        onPress={() => {
          wsGuestSignup()

        }}
      />
    </View>
  )
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 10, backgroundColor: whiteColor, flex: 1, }}>
        <NavigationBar
          navigationBarStyle={{ backgroundColor: 'transparent' }}
          componentLeft={() =>
            <View style={{ alignItems: 'flex-start', marginLeft: 5 }}>
              <TouchableOpacity style={{ justifyContent: 'center', flexDirection: 'row' }} onPress={() => props.navigation.goBack(null)}>
                <Image source={require('../assets/images/back.png')}
                  style={{ ...style.backIcon1, tintColor: "#0E5EF2" }} />
              </TouchableOpacity>
            </View>

          } />
        {Platform.OS === "android" ?
          <Text style={[style.headerText, { fontSize: 30, color: "#0E5EF2" }]}>Welcome</Text> :
          <Text style={{
            color: darkGrayColor,
            fontSize: 22,
            marginLeft: 10,
            fontWeight: '700',
            marginTop: 10,
            fontSize: 30
          }}>Welcome</Text>

        }
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between', }}
        >
          <Text style={[style.darkGrayText, { fontSize: 18, margin: 20, textAlign: 'center' }]}>Thanks for your interest. Please enter your valid email and we will send you login details. You can login into application and explore features.</Text>
          {renderInput()}

          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            <FooterPoweredBy />
          </View>
          <Loader visible={loading} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );

}

export default SignupGuest

import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView
} from 'react-native';
import { connect, useDispatch, useSelector } from 'react-redux';
import { apiOtp } from '../actions/index'
import BlueButton from '../components/blue-button';
import { ScrollView } from 'react-native-gesture-handler';
import { NavigationBar } from 'navigationbar-react-native'
import FooterPoweredBy from '../components/footer-poweredby';
import { style } from '../styles/style';
import { SafeAreaView } from 'react-native-safe-area-context';
import { whiteColor, blueColor, inputBgColor, grayColor, darkGrayColor, iconColor } from '../styles/color';
import { utils } from '../utils/utils'
import Loader from '../components/loader'
import Snackbar from 'react-native-snackbar';
let ForgotPwd = (props) => {
  const [email, setEmail] = useState('')
  const dispatch = useDispatch();
  const loading = useSelector(state => state.loading);
  let resOtp = useSelector(state => state.requestOtp);
  useEffect(() => {
    resOtp = null
  }, [])
  useEffect(() => {
    // skip initial render
    if (resOtp && resOtp.success) {
      props.navigation.navigate('ResetPwd', { email: email })
    }

  }, [resOtp])

  const wsOtp = () => {
    if (email === '') {
      Snackbar.show({ text: 'Please enter email.' })

    } else if (!utils.isValidEmail(email)) {
      Snackbar.show({ text: 'Please enter valid email.' })
    } else {
      let data = {
        username: email,
      }
      dispatch(apiOtp(data))
    }
  }

  const renderInput = () => (
    <View style={[style.cardWhite, { padding: 20, margin: 10 }]}>
      <Text style={{ color: grayColor, marginTop: 15, textAlign: 'center', alignSelf: 'center', fontFamily: 'Rubik-Regular' }}>{'Please enter your registered\nEmail address'}</Text>
      <View style={[style.inputContainer, { marginVertical: 25 }]}>
        <Image source={require('../assets/images/email.png')} style={{ tintColor: "#0E5EF2" }} />
        <TextInput style={[style.inputText, { flex: 1, marginLeft: 10 }]}
          placeholder={'Email ID'}
          value={email}
          placeholdergrayColor={grayColor}
          onChangeText={(email) => setEmail(email.trim())} />
      </View>
      <BlueButton
        title={'SEND'}
        onPress={() => {
          wsOtp()
        }}
      />
    </View>
  )
  return (
    <SafeAreaView style={style.header}>
      <KeyboardAvoidingView
        behavior={Platform.OS == "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >

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
          <Text style={[style.headerText, { fontSize: 30, color: "#0E5EF2", marginLeft: 10 }]}>{'Forgot\nPassword'}</Text>
          <ScrollView>
            <Image style={{ margin: 10, alignSelf: 'center' }} source={require('../assets/images/Forgot-password.png')} />
            {renderInput()}
            <Loader visible={loading} />
          </ScrollView>
          <FooterPoweredBy />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

}

export default ForgotPwd

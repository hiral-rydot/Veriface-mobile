import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Alert
} from 'react-native';
import { connect, useDispatch, useSelector } from 'react-redux';
import { apiLogin } from '../actions/index'
import { style } from '../styles/style';
import { SafeAreaView } from 'react-native-safe-area-context';
import { whiteColor, blueColor, inputBgColor, grayColor, darkGrayColor, iconColor } from '../styles/color';
import BlueButton from '../components/blue-button';
import { ScrollView } from 'react-native-gesture-handler';
import FooterPoweredBy from '../components/footer-poweredby';
import Loader from '../components/loader'
import AsyncStorage from '@react-native-community/async-storage'
import { setObject } from '../utils/storage'
import StorageKey, { apiUrl } from '../webservice/constant'
import NetInfo, { useNetInfo } from "@react-native-community/netinfo";
import { utils } from '../utils/utils'
import Snackbar from 'react-native-snackbar';
import DeviceInfo from 'react-native-device-info'

let Login = (props) => {
  const dispatch = useDispatch();
  let resLogin = useSelector(state => state.usersignin);
  const loading = useSelector(state => state.loading);
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    resLogin = null
    NetInfo.fetch();
    async function checkLogin() {
      let token = await AsyncStorage.getItem(StorageKey.KEY_TOKEN)

      if (token !== null && token !== '') {
        props.navigation.replace('Splash')
      }
    }
    checkLogin();
  }, [])

  useEffect(() => {

    if (resLogin && resLogin.success) {
      async function saveLogin() {
        await AsyncStorage.setItem(StorageKey.KEY_RES_LOGIN, JSON.stringify(resLogin))
        await AsyncStorage.setItem(StorageKey.KEY_TOKEN, resLogin.token)
        await AsyncStorage.setItem(StorageKey.KEY_CLIENT_SETTING, JSON.stringify(resLogin.item.clientSettings))
        await AsyncStorage.setItem(StorageKey.KEY_ID, resLogin.item._id)
        await AsyncStorage.setItem("dataLogin", JSON.stringify(resLogin.item.permissions));
        props.navigation.replace('Splash')
        resLogin = null
      }
      saveLogin();
    }

  }, [resLogin])


  const wsLogin = () => {
    if (email === '') {
      Snackbar.show({ text: 'Please enter email or mobile number or emp code.' })
    } //else if (!utils.isValidEmail(email) && email.length != 10) {
    // alert('Please enter valid email or mobile number.')
    // } 
    else if (password === '') {
      Snackbar.show({ text: 'Please enter password' })
    } else {
      let data = {
        username: email.trim(),
        password: password,
      }
      dispatch(apiLogin(data))
    }
  }
  const renderInput = () => (
    <View style={[style.cardWhite, { padding: 20, margin: 10 }]}>
      <View style={[style.inputContainer, { marginTop: 10 }]}>
        <Image source={require('../assets/images/email.png')} style={{ tintColor: "#0E5EF2" }} />

        <TextInput style={[style.inputText, { flex: 1, marginLeft: 10 }]}
          placeholder={'User Name'}
          value={email}
          onChangeText={(email) => setEmail(email/* .trim() */)}
          placeholdergrayColor={grayColor} />
      </View>
      <View style={[style.inputContainer, { marginTop: 15 }]}>
        <Image source={require('../assets/images/password.png')} style={{ tintColor: "#0E5EF2" }} />

        <TextInput style={[style.inputText, { flex: 1, marginLeft: 10 }]}
          secureTextEntry={!showPassword}
          placeholder={'Password'}
          onChangeText={(password) => setPassword(password)}
          placeholdergrayColor={grayColor} />
        <TouchableOpacity onPress={() => { setShowPassword(!showPassword) }}>
          <Image source={(showPassword) ? require('../assets/images/hide.png') : require('../assets/images/show.png')}
            style={{ width: 25, height: 25, resizeMode: 'contain', tintColor: "#0E5EF2" }} />
        </TouchableOpacity>
      </View>
      <Text style={{ color: grayColor, marginTop: 15, alignSelf: 'flex-end', fontFamily: 'Rubik-Regular' }}
        onPress={() => props.navigation.navigate('ForgotPwd')}>Forgot Password?</Text>
      <BlueButton
        containerStyle={{ marginTop: 25 }}
        title={'LOGIN'}
        onPress={() => {
          wsLogin()

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
          {Platform.OS === "android" ?
            <Text style={[style.headerText, { fontSize: 30, color: "#0E5EF2" }]}>Login</Text> :
            <Text style={[style.headerText, { marginTop: 10, color: "#0E5EF2" }]}>Login</Text>

          }
          <ScrollView keyboardShouldPersistTaps={'handled'}>
            {apiUrl == 'https://tavm.it-av.support' ?
              <Image style={{ margin: 10, alignSelf: 'center', width: 231, height: 210 }} source={require('../assets/images/login.png')} />
              : <Image style={{ margin: 10, alignSelf: 'center' }} source={require('../assets/images/login.png')} />
            }
            {renderInput()}
            <Loader visible={loading} />
            <View style={{ alignItems: 'center', margin: 15 }}>
              <Text style={style.grayText}>Don't have an account yet?</Text>
              <View style={[{ flexDirection: 'row' }]}>
                <Text style={style.grayText}>Please</Text>
                <TouchableOpacity onPress={() => {
                  props.navigation.navigate('SignupGuest')
                }}>
                  <Text style={style.blueText}> Sign up</Text>
                </TouchableOpacity>
                <Text style={style.grayText}> to Explore More</Text>
              </View>
            </View>

            <FooterPoweredBy />
            <View style={{ flexDirection: 'row', justifyContent: 'center', }}>
              <Text >v {DeviceInfo.getVersion()}</Text>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

}
function mapStateToProps(state) {
  return {
    usersignin: state.usersignin,
    loading: state.loading
  };
}
const mapDispatchToProps = dispatch => ({
  apiLogin: data => dispatch(apiLogin(data)),
});
Login = connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);
export default Login

import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  TextInput,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { connect, useDispatch, useSelector } from 'react-redux';
import { apiResetpwd } from '../actions/index'
import BlueButton from '../components/blue-button';
import { ScrollView } from 'react-native-gesture-handler';
import { NavigationBar } from 'navigationbar-react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import FooterPoweredBy from '../components/footer-poweredby';
import { style } from '../styles/style';
import { whiteColor, grayColor } from '../styles/color';
import { StackActions, NavigationActions } from 'react-navigation';
import Loader from '../components/loader'
import Snackbar from 'react-native-snackbar';
let ResetPwd = (props) => {
  const [newpassword, setNewpassword] = useState('')
  const [confpassword, setConfpassword] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const dispatch = useDispatch();
  let resResetPass = useSelector(state => state.resetPassword);
  const loading = useSelector(state => state.loading);
  useEffect(() => {
    resResetPass = null
  }, [])
  useEffect(() => {
    // skip initial render
    if (resResetPass && resResetPass.success) {
      {
        Platform.OS === "android" ?
          Alert.alert(
            'Congratulations!',
            'Your password reset successfully.',
            [
              {
                text: 'OK', onPress: async () => {

                  const navigateAction = StackActions.reset({
                    index: 0,
                    actions: [NavigationActions.navigate({ routeName: 'Login' })],
                  });
                  props.navigation.dispatch(navigateAction);
                }
              },
            ],
            { cancelable: false },
          )
          :
          setTimeout(() => {
            Alert.alert(
              'Congratulations!',
              'Your password reset successfully.',
              [
                {
                  text: 'OK', onPress: async () => {

                    const navigateAction = StackActions.reset({
                      index: 0,
                      actions: [NavigationActions.navigate({ routeName: 'Login' })],
                    });
                    props.navigation.dispatch(navigateAction);
                  }
                },
              ],
              { cancelable: false },
            );
          }, 5000);
      }

    }

  }, [resResetPass])

  const wsResetPwd = () => {
    if (otpCode === '') {
      Snackbar.show({ text: 'Please enter otp.' })
    } else if (newpassword === '') {
      Snackbar.show({ text: 'Please enter new password.' })
    } else if (newpassword.length < 8) {
      Snackbar.show({ text: 'Password must be 8 character long.' })
    } else if (confpassword === '') {
      Snackbar.show({ text: 'Please enter confirm password' })
    } else if (newpassword !== confpassword) {
      Snackbar.show({ text: 'Password does not match.' })
    } else {
      let data = {
        otp: otpCode,
        password: newpassword,
        confirmPassword: confpassword,
        username: props.navigation.state.params.email
      }
      dispatch(apiResetpwd(data))
    }
  }

  const renderInput = () => (
    <View style={[style.cardWhite, { padding: 20, margin: 10 }]}>
      <Text style={{ color: grayColor, marginTop: 15, textAlign: 'center', alignSelf: 'center' }}>{'Please enter otp and new password'}</Text>
      <View style={[style.inputContainer, { marginTop: 25 }]}>
        <Image source={require('../assets/images/password.png')} />
        <TextInput key={true} style={[style.inputText, { flex: 1, marginLeft: 10 }]}
          placeholder={'OTP'}
          returnKeyType={"done"}
          placeholdergrayColor={grayColor}
          value={otpCode}
          keyboardType={'numeric'}
          maxLength={6}
          onChangeText={(otp) => {
            setOtpCode(otp.replace(/\s/g, '').replace('.', '').replace(',', '').replace('-', ''))
          }} />
      </View>
      <View style={[style.inputContainer, { marginTop: 25 }]}>
        <Image source={require('../assets/images/password.png')} />
        <TextInput style={[style.inputText, { flex: 1, marginLeft: 10 }]}
          placeholder={'New Password'}
          placeholdergrayColor={grayColor}
          onChangeText={(newpassword) => setNewpassword(newpassword)} />
      </View>
      <View style={[style.inputContainer, { marginVertical: 25 }]}>
        <Image source={require('../assets/images/password.png')} />
        <TextInput style={[style.inputText, { flex: 1, marginLeft: 10 }]}
          placeholder={'Confirm Password'}
          placeholdergrayColor={grayColor}
          onChangeText={(confpassword) => setConfpassword(confpassword)} />
      </View>
      <BlueButton
        title={'CHANGE PASSWORD'}
        onPress={() => {
          wsResetPwd()
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
              <TouchableOpacity onPress={() => props.navigation.goBack(null)}>
                <Image source={require('../assets/images/back.png')}
                  style={style.backIcon1} />
              </TouchableOpacity>

            } />
          <Text style={[style.headerText, { fontSize: 30 }]}>{'New\nPassword'}</Text>
          <ScrollView style={{ flex: 1 }}>
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

export default ResetPwd

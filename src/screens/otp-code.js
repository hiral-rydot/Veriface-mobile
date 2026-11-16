import React, { useState } from 'react'
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert
} from 'react-native';
import BlueButton from '../components/blue-button';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';
import { NavigationBar } from 'navigationbar-react-native'
import FooterPoweredBy from '../components/footer-poweredby';
import { style } from '../styles/style';
import { whiteColor, blueColor, inputBgColor, grayColor, darkGrayColor } from '../styles/color';

const OtpCode = (props) => {
  const [otpCode, setOtpCode] = useState('')



  const renderInput = () => (
    <ScrollView keyboardShouldPersistTaps="always">
      <View style={[style.cardWhite, { padding: 20, margin: 10 }]}>
        <Text style={{ color: grayColor, marginTop: 15, textAlign: 'center', alignSelf: 'center' }}>{'Please enter your verificatioin\ncode'}</Text>
        <View style={[style.inputContainer, { marginVertical: 25 }]}>

          <TextInput key={true} style={[style.inputText, { flex: 1, marginLeft: 10 }]}
            placeholder={'OTP'}
            placeholdergrayColor={grayColor}
            value={otpCode}
            keyboardType={'numeric'}
            maxLength={6}
            onChangeText={(otp) => {
              setOtpCode(otp.replace(/\s/g, '').replace('.', '').replace(',', '').replace('-', ''))
            }} />
        </View>
        <BlueButton
          title={'DONE'}
          onPress={() => {
            if (otpCode === '') {
              Alert.alert("Turnout", 'Please enter otp.')
            } else {
              props.navigation.navigate('ResetPwd', { otp: otpCode, email: props.navigation.state.params.email })
            }
          }}
        />
      </View>
    </ScrollView>
  )
  return (
    <SafeAreaView style={style.header}>
      <View style={{ padding: 10, backgroundColor: whiteColor, flex: 1, }}>
        <NavigationBar
          navigationBarStyle={{ backgroundColor: 'transparent' }}

          componentLeft={() =>
            <TouchableOpacity onPress={() => props.navigation.goBack(null)}>
              <Image source={require('../assets/images/back.png')}
                style={style.backIcon1} />
            </TouchableOpacity>

          } />
        <Text style={[style.headerText, { fontSize: 30 }]}>{'OTP'}</Text>
        <ScrollView>
          <Image style={{ margin: 10, alignSelf: 'center' }} source={require('../assets/images/otp.png')} />
          {renderInput()}
        </ScrollView>
        <FooterPoweredBy />
      </View>
    </SafeAreaView>
  );

}

export default OtpCode

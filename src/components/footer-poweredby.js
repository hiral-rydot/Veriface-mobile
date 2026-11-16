import React from 'react'
import { Text, View, TouchableOpacity, Linking } from 'react-native'
import { style } from '../styles/style'
import { AppUrls, apiUrl } from '../webservice/constant'
const FooterPoweredBy = ({ containerStyle }) => (
    <View style={[{ alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }, containerStyle]}>
        <Text style={style.grayText}>Powered by</Text>
        <TouchableOpacity onPress={() => {
            Linking.openURL(AppUrls.TURNOUT)
        }}>
            <Text style={style.blueText}> {apiUrl == 'https://tavm.it-av.support' ? "Rydotinfotech.com" : "Turnout"}</Text>
        </TouchableOpacity>
    </View>
)
export default FooterPoweredBy
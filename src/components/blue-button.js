import React from 'react'
import { Text, View, TouchableOpacity } from 'react-native'
import { blueColor, whiteColor } from '../styles/color'
const BlueButton = ({ title, onPress, containerStyle }) => (
    <View style={[{ minWidth: 200, backgroundColor: /* blueColor */ '#0E5EF2', borderRadius: 25, alignSelf: 'center' }, containerStyle]}>
        <TouchableOpacity style={{ padding: 12, }} onPress={onPress}>
            <Text style={{ color: whiteColor, fontSize: 16, textAlign: 'center', fontFamily: 'Rubik-Regular' }}>{title}</Text>
        </TouchableOpacity>
    </View>
)
export default BlueButton
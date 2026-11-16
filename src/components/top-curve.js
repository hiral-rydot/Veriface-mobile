import React from 'react'
import { View } from 'react-native'
import { menuHeaderColor } from '../styles/color'
const TopCurve = () => (
    <View style={{
        position: 'absolute', right: 0, width: 70, height: 70, backgroundColor: menuHeaderColor,
        borderBottomLeftRadius: 60
    }} />
)
export default TopCurve
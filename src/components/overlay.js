import React from 'react'
import { View } from 'react-native'
import { overlayColor } from '../styles/color'
const Overlay = ({style}) => (
    <View style={[{
        position: 'absolute',
        borderRadius: 10,
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: overlayColor,
    }, style]} />
)
export default Overlay
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity
} from 'react-native';
import { NavigationBar } from 'navigationbar-react-native'
import { style } from '../styles/style'
import { whiteColor, overlayColor, iconColor } from '../styles/color'
import { SafeAreaView } from 'react-native-safe-area-context';
import { utils } from '../utils/utils';
import { uploadUrl } from '../webservice/constant';
const AttendanceDetail = ({ navigation }) => {
    const [attendanceItem, setAttendanceItem] = useState(null)
    useEffect(() => {
        let att = navigation.state.params.attendanceItem
        setAttendanceItem(att)
    }, [])
    const renderImage = () => {
        return (attendanceItem) ? <Image
            style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, resizeMode: 'contain' }}
            source={{ uri: uploadUrl + attendanceItem.image }} />
            : null
    }
    const renderDetails = () => (
        <View style={{ backgroundColor: whiteColor, padding: 10, alignItems: 'center', borderTopLeftRadius: 50, borderTopRightRadius: 50 }}>
            <Text style={[style.grayText, { alignSelf: 'flex-end', marginRight: 20 }]}>{(attendanceItem) ? utils.formatDateTimeWithSec(attendanceItem.time) : ''}</Text>
            <Text style={style.grayText}>Name</Text>
            <Text style={style.blueText}>{(attendanceItem) ? attendanceItem.employee.name : ''}</Text>
            {(attendanceItem && attendanceItem.lat.length > 0) ? <View style={{ alignItems: 'center' }}>
                <Text style={[style.grayText, { marginTop: 10 }]}>Device Location</Text>
                <Text style={style.blueText}>{'Lat: ' + attendanceItem.lat + ', Long: ' + attendanceItem.long}</Text>
            </View> : null}
            <Text style={[style.grayText, { marginTop: 10 }]}>Check In/Out</Text>
            <Text style={style.blueText}>{(attendanceItem) ? attendanceItem.authType.charAt(0).toUpperCase() + attendanceItem.authType.slice(1) : ''}</Text>
        </View>
    )
    return (
        <SafeAreaView style={style.header}>
            <NavigationBar
                navigationBarStyle={{ ...style.navigationBarStyle }}
                componentLeft={() =>
                    <View style={{ alignItems: 'flex-start', marginLeft: 5 }}>
                        <TouchableOpacity style={{ justifyContent: 'center', flexDirection: 'row' }} onPress={() => navigation.goBack(null)}>
                            <Image source={require('../assets/images/back.png')}
                                style={style.backIcon1} />
                            <Text style={style.headerText}>Attendance Detail</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
            <View style={{ flex: 1, backgroundColor: overlayColor }}>
                {renderImage()}

                <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, }}>
                    {renderDetails()}
                </View>
            </View>
        </SafeAreaView>
    );

}
export default AttendanceDetail
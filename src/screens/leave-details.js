import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    Image,
    TouchableOpacity,
} from 'react-native'
import { WebView } from 'react-native-webview'
import { NavigationBar } from 'navigationbar-react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { whiteColor } from '../styles/color'
import { style } from '../styles/style'
import { ScrollView } from 'react-native-gesture-handler';
import { utils } from '../utils/utils'
const LeaveDetails = (props) => {

    const [leaveItem, setLeaveItem] = useState(null)

    useEffect(() => {
        setLeaveItem(props.navigation.state.params.leaveItem)
    }, [])

    const getStatusIcon = (status) => {
        if (status === 'pending') {
            return require('../assets/images/pending.png')
        } else if (status === 'approve') {
            return require('../assets/images/approval.png')
        } else if (status === 'reject') {
            return require('../assets/images/reject.png')
        } else {
            return require('../assets/images/pending.png')
        }
    }

    return (
        <SafeAreaView style={style.header}>
            <View style={{ flex: 1, backgroundColor: whiteColor }}>
                <NavigationBar
                    navigationBarStyle={{ ...style.navigationBarStyle }}
                    componentLeft={() =>
                        <View style={{ alignItems: 'flex-start', marginLeft: 5 }}>
                            <TouchableOpacity style={{ justifyContent: 'center', flexDirection: 'row' }} onPress={() => props.navigation.goBack(null)}>
                                <Image source={require('../assets/images/back.png')}
                                    style={style.backIcon1} />
                                <Text style={style.headerText}>Leave Details</Text>
                            </TouchableOpacity>
                        </View>
                    }

                />
                {(leaveItem) ?
                    <ScrollView>
                        <View style={{ backgroundColor: whiteColor, flex: 1, }}>

                            <View style={{ margin: 20, alignItems: 'center', }}>
                                <Text style={[style.grayText, { alignSelf: 'flex-end', fontSize: 12 }]}>{utils.formatDateTime(leaveItem.createdAt)}</Text>

                                <View style={[style.cardWhite, { alignSelf: 'center', borderRadius: 40, padding: 15 }]}>
                                    <Image source={getStatusIcon(leaveItem.isApprove)} />
                                </View>

                                <Text style={[style.blueTextBold, { marginTop: 20 }]}>{(leaveItem.leaveType) ? leaveItem.leaveType.leaveName : ''}</Text>
                                <View style={{ marginTop: 10, flexDirection: 'row' }}>
                                    <Text style={style.blueText}>{utils.formatDate(leaveItem.fromDate)}</Text>
                                    <Text style={style.grayText}> to </Text>
                                    <Text style={style.blueText}>{utils.formatDate(leaveItem.toDate)}</Text>
                                </View>
                                <Text style={[style.darkGrayText, { alignSelf: 'flex-start', marginVertical: 20 }]}>{leaveItem.subject}</Text>

                                <Text style={[style.grayText, { alignSelf: 'flex-start', }]}>{leaveItem.description}</Text>
                            </View>
                        </View>
                    </ScrollView>
                    : null

                }
            </View>
        </SafeAreaView>

    );
}
export default LeaveDetails
import React, { useEffect } from 'react'
import {
    View,
    Text,
    Image,
    Dimensions,
    TouchableOpacity,
} from 'react-native'
import { WebView } from 'react-native-webview'
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationBar } from 'navigationbar-react-native'
import { iconColor, whiteColor } from '../styles/color'
import { style } from '../styles/style'
const AboutUs = (props) => {

    useEffect(() => {
        //dispatch(apiAboutus({}))
    }, [])
    return (
        <SafeAreaView style={style.header}>
            <NavigationBar
                navigationBarStyle={{ ...style.navigationBarStyle }}
                componentLeft={() =>
                    <View style={{ alignItems: 'flex-start', marginLeft: 5 }}>
                        <TouchableOpacity style={{ justifyContent: 'center', flexDirection: 'row' }} onPress={() => props.navigation.goBack(null)}>
                            <Image source={require('../assets/images/back.png')}
                                style={style.backIcon1} />
                            <Text style={style.headerText}>About Turnout</Text>
                        </TouchableOpacity>
                    </View>
                }

            />
            <View style={{ flex: 1, backgroundColor: whiteColor }}>
                <WebView
                    scrollEnabled={true}
                    style={{ height: Dimensions.get('window').width, width: Dimensions.get('window').width }}
                    source={{ uri: 'https://www.turnout.cloud/about-turnout' }} />

            </View>
        </SafeAreaView>

    );
}
export default AboutUs
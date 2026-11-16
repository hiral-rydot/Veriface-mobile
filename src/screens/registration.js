import { RNCamera as Camera } from 'react-native-camera';
import React, { useState, useEffect, useRef } from 'react'
import { style } from '../styles/style'
import {
    ActivityIndicator,
    TouchableOpacity,
    Image,
    Modal,
    View,
    Text,
    Dimensions,
    StyleSheet,
    TouchableHighlight,
    Platform,
    Alert
} from 'react-native'
import { whiteColor, borderColor, blueColor } from '../styles/color';

import { SafeAreaView } from 'react-native-safe-area-context';
import BlueButton from '../components/blue-button'
import Loader from '../components/loader'
import { utils } from '../utils/utils'
import { apiRegistration } from '../actions'
import { useDispatch, useSelector } from 'react-redux'
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000',
    },
    preview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        height: Dimensions.get('window').height,
        width: Dimensions.get('window').width
    },
    capture: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 5,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: '#FFF',
        margin: 15,
    },

});

const Registration = (props) => {
    const [imageData, setImageData] = useState(null)
    const [videoFile, setVideoFile] = useState(null)
    const [isRecorded, setIsRecorded] = useState(false)
    const [isRetry, setIsRetry] = useState(false)
    const [statusMsg, setStatusMsg] = useState('Uploading...')
    let camera = useRef(null)
    const dispatch = useDispatch()
    let resRegistration = useSelector(state => state.resRegistration)
    let isLoading = useSelector(state => state.loading)
    useEffect(() => {
        resRegistration = null
    }, [])
    useEffect(() => {

        if (resRegistration && resRegistration.success === true) {
            {
                Platform.OS === "android" ?
                    Alert.alert("Turnout", "Your registration process has been initiated.",
                        [
                            {
                                text: "OK", onPress: async () => {
                                    props.navigation.state.params.wsRegistrationStatus()
                                    props.navigation.goBack(null)
                                }
                            }
                        ],
                        { cancelable: false }
                    ) :
                    setTimeout(() => {
                        Alert.alert("Alert", "Your registration process has been initiated.",
                            [
                                {
                                    text: "OK", onPress: async () => {
                                        props.navigation.state.params.wsRegistrationStatus()
                                        props.navigation.goBack(null)
                                    }
                                }
                            ],
                            { cancelable: false }
                        );
                    }, 1000);
            }
            setIsRetry(false)
        }
        if (resRegistration && resRegistration.success === false) {
            setIsRetry(true)
        }
    }, [resRegistration])


    const wsCheckInOut = () => {

        let formData = new FormData();
        formData.append("file", { uri: videoFile, name: 'video.mp4', type: 'video/mp4' });
        dispatch(apiRegistration(formData))
    }

    const recordVideo = async () => {

        try {
            const options = {
                quality: Camera.Constants.VideoQuality['480p'],
                orientation: 'portrait',
                maxDuration: 3
            };
            const data = await camera.recordAsync(options);
            setImageData('data:image/jpeg;base64,' + data.base64)
            {
                Platform.OS === "ios" ?
                    setIsRecorded(true) : null
            }
            // this.props.updateImage(data.uri);
            console.log('Path to image: ' + data.uri);
            console.log('Path to image: ' + data.base64);

        } catch (err) {
            console.log('err: ', err);
        }
    };

    const renderCamera = () => {
        return (
            <Camera
                ref={ref => (camera = ref)}
                style={styles.preview}
                captureAudio={false}
                type={'front'}
                flashMode={Camera.Constants.FlashMode.off}
                onRecordingEnd={() => {
                    //alert('Record End')
                    camera.pausePreview()
                    setIsRecorded(true)
                }}
                onRecordingStart={(event) => {
                    ///alert(JSON.stringify(event.nativeEvent))
                    setVideoFile(event.nativeEvent.uri)
                }}
                androidCameraPermissionOptions={{
                    title: 'Permission to use camera',
                    message: 'We need your permission to use your camera',
                    buttonPositive: 'Ok',
                    buttonNegative: 'Cancel',
                }}
            >
                {(isRecorded) ?
                    <View style={{ margin: 15, position: 'absolute', bottom: 30, alignSelf: 'center' }}>
                        {(isLoading) ?
                            <View style={[style.cardWhite, { flexDirection: 'row', justifyContent: 'center' }]}>
                                <ActivityIndicator
                                    animating={true}
                                    color={blueColor}
                                    size='small' />
                                <Text style={[style.darkGrayText, { marginLeft: 10, }]}>{statusMsg}</Text>
                            </View>
                            : (isRetry) ? <BlueButton
                                onPress={() => {
                                    setImageData(null)
                                    setIsRetry(false)
                                }}
                                title={'Retry'}
                            /> : <BlueButton
                                onPress={() => { wsCheckInOut() }}
                                title={'Submit'}
                            />}
                        <BlueButton
                            onPress={() => { props.navigation.goBack(null) }}
                            title={'Cancel'}
                            containerStyle={{ marginTop: 15, }}
                        />
                    </View>
                    : <View style={{ flexDirection: 'row' }}>
                        <TouchableHighlight
                            style={styles.capture}
                            onPress={() => recordVideo()}
                            underlayColor="rgba(255, 255, 255, 0.5)"
                        >
                            <Image source={require('../assets/images/save.png')}
                                style={{ tintColor: whiteColor }} />
                        </TouchableHighlight>
                        <TouchableHighlight
                            style={styles.capture}
                            onPress={() => props.navigation.goBack(null)}
                            underlayColor="rgba(255, 255, 255, 0.5)"
                        >
                            <Image source={require('../assets/images/close.png')}
                                style={{ tintColor: whiteColor }} />
                        </TouchableHighlight>
                    </View>}
            </Camera>
        );
    }


    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.container}>
                {renderCamera()}
                <Loader visible={isLoading} />
            </View>
        </SafeAreaView>
    );
}
export default Registration
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
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
    const camera = useRef(null)
    const device = useCameraDevice('front')
    const { hasPermission, requestPermission } = useCameraPermission()
    const dispatch = useDispatch()
    let resRegistration = useSelector(state => state.resRegistration)
    let isLoading = useSelector(state => state.loading)
    useEffect(() => {
        if (!hasPermission) requestPermission();
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
            await camera.current.startRecording({
                onRecordingError: (error) => {
                    console.log('Recording error: ', error);
                },
            });
            setTimeout(async () => {
                try {
                    const video = await camera.current.stopRecording();
                    setVideoFile(video.path);
                    setIsRecorded(true);
                } catch (e) {
                    console.log('stopRecording err: ', e);
                }
            }, 3000);
        } catch (err) {
            console.log('err: ', err);
        }
    };

    const renderCamera = () => {
        const content = (isRecorded) ?
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
            </View>;

        if (device == null) {
            return <View style={styles.preview}>{content}</View>;
        }
        return (
            <View style={styles.preview}>
                <Camera
                    ref={camera}
                    style={StyleSheet.absoluteFill}
                    device={device}
                    isActive={!isRecorded}
                    video={true}
                    audio={false}
                />
                {content}
            </View>
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
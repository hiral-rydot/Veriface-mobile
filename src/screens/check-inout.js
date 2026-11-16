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
import Geolocation from 'react-native-geolocation-service'
import BlueButton from '../components/blue-button'
import Loader from '../components/loader'
import { PERMISSIONS, request, requestMultiple, RESULTS, } from 'react-native-permissions';
import { utils } from '../utils/utils'
import { apiCheckInOut } from '../actions'
import NetInfo, { useNetInfo } from "@react-native-community/netinfo";
import { useDispatch, useSelector } from 'react-redux'
import AsyncStorage from '@react-native-community/async-storage';
import Snackbar from 'react-native-snackbar';
const Realm = require('realm');
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

const CheckInOut = (props) => {
    const msgFetchingLoc = 'Fetching Location...'
    const msgSubmit = 'Submitting...'
    const [realm, setRealm] = useState(null)
    const [imageData, setImageData] = useState(null)
    const [showResModal, setShowResModal] = useState(false)
    const [showFetchLoc, setShowFetchLoc] = useState(false)
    const [isRetry, setIsRetry] = useState(false)
    const [isOffline] = useState(false)
    const [currentDate, setCurrentDate] = useState('')
    const [currentTime, setCurrentTime] = useState('')
    const [statusMsg, setStatusMsg] = useState(msgFetchingLoc)
    let camera = useRef(null)
    const dispatch = useDispatch()
    let resCheckInOut = useSelector(state => state.resCheckInOut)
    let isLoading = useSelector(state => state.loading)
    useEffect(() => {
        resCheckInOut = null;
        var d = new Date();
        var n = d.toISOString();
        var j = d.toTimeString();
        setCurrentDate(n)
        setCurrentTime(j)
        openDatabase()
    }, [])

    useEffect(() => {
        if (resCheckInOut && resCheckInOut.success === true) {
            setShowResModal(true)
            setIsRetry(false)
        }
        if (resCheckInOut && resCheckInOut.success === false) {
            setIsRetry(true)
        }
        setShowFetchLoc(false)
    }, [resCheckInOut])

    const openDatabase = () => {
        Realm.open({
            schema: [{
                name: 'Attendance',
                primaryKey: 'id',
                properties: {
                    id: 'string',
                    lat: 'double',
                    long: 'double',
                    image_data: 'string',
                    time: 'string',
                    timedate: 'string'
                }
            }]
        }).then(realm => {
            setRealm(realm);
        });
    }

    const requestLocationPermissions = () => {
        console.log('111111111111111111111111111111111111111')
        if (Platform.OS === 'android') {
            requestMultiple([PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION]).then(
                (statuses) => {
                    console.log('Location', statuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION]);
                    let fineLoc = statuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION]
                    if (fineLoc === RESULTS.GRANTED) {
                        fetchCurrentLocation()
                    } else if (fineLoc === RESULTS.UNAVAILABLE) {
                        utils.openPermissionSeetings()
                    }
                    else if (fineLoc === RESULTS.BLOCKED) {
                        utils.openPermissionSeetings()
                    }
                },
            );
        } else {

            request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE).then(
                (statuses) => {

                    console.log('Location', JSON.stringify(statuses));
                    // let fineLoc = statuses[PERMISSIONS.IOS.LOCATION_WHEN_IN_USE]
                    if (statuses === RESULTS.GRANTED) {
                        // console.log('fetchCurrentLocation called', fineLoc);
                        fetchCurrentLocation()

                        // console.log('fetchCurrentLocation finished', fineLoc);
                    } else if (fineLoc === RESULTS.UNAVAILABLE) {
                        utils.openPermissionSeetings()
                    } else if (statuses === RESULTS.BLOCKED) {
                        // console.log('openPermissionSeetings called', fineLoc);
                        utils.openPermissionSeetings()
                        // console.log('openPermissionSeetings finished', fineLoc);
                    }
                },
            );
        }
    }
    const fetchCurrentLocation = async () => {
        const response = await NetInfo.fetch();

        if ((response.isConnected && response.isInternetReachable)) {
            setShowFetchLoc(true)
            setStatusMsg(msgFetchingLoc)
            Geolocation.getCurrentPosition(
                (position) => {
                    console.log(position);
                    if (position.mocked) {
                        setShowFetchLoc(false)
                        Snackbar.show({ text: 'Please disable mock location in settings.' })

                    } else {
                        let latitude = position.coords.latitude
                        let longitude = position.coords.longitude
                        wsCheckInOut(latitude, longitude)
                        setStatusMsg(msgSubmit)
                    }
                },
                (error) => {
                    // See error code charts below.
                    Snackbar.show({ text: error.message })
                    console.log(error.code, error.message);
                    setShowFetchLoc(false)
                },
                { enableHighAccuracy: true, distanceFilter: 10, maximumAge: 0, timeout: 10000 }
            );
        } else {
            Geolocation.getCurrentPosition(
                (position) => {
                    console.log(position);
                    if (position.mocked) {
                        setShowFetchLoc(false)
                        Snackbar.show({ text: 'Please disable mock location in settings.' })

                    } else {
                        let latitude = position.coords.latitude
                        let longitude = position.coords.longitude
                        wsCheckInOutOffline(latitude, longitude)
                        setStatusMsg(msgSubmit)
                    }
                },
                (error) => {
                    // See error code charts below.
                    Snackbar.show({ text: error.message })
                    console.log(error.code, error.message);
                    setShowFetchLoc(false)
                },
                { enableHighAccuracy: true, distanceFilter: 10, maximumAge: 0, timeout: 10000 }
            );
        }
    }

    const wsCheckInOut = (lat, long) => {
        let data = {
            lat: lat,
            isOffline: false,
            long: long,
            image_data: imageData

        }
        dispatch(apiCheckInOut(data))
    }
    const wsCheckInOutOffline = (lat, long) => {
        let data = {
            id: new Date().getTime().toString(),
            lat: lat,
            long: long,
            image_data: imageData,
            time: currentDate,
            timedate: currentTime
        }
        try {
            realm.write(() => {
                realm.create('Attendance', data);
            });
        } catch (e) {
            console.log("Error on creation " + JSON.stringify(e));
        }
        //AsyncStorage.setItem('checkINOUTData', JSON.stringify([data]))

        Alert.alert(
            "Alert",
            "Your entry has been Stored Offline.",
            [
                { text: 'OK', onPress: () => props.navigation.goBack(null) },
            ],
            { cancelable: false },
        )
    }

    const takePicture = async () => {

        try {
            const options = {
                quality: 0.5,
                base64: true,
                forceUpOrientation: true,
                fixOrientation: true,
            };
            const data = await camera.takePictureAsync(options);
            setImageData('data:image/jpeg;base64,' + data.base64)
            // this.props.updateImage(data.uri);
            // console.log('Path to image: ' + data.uri);
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
                androidCameraPermissionOptions={{
                    title: 'Permission to use camera',
                    message: 'We need your permission to use your camera',
                    buttonPositive: 'Ok',
                    buttonNegative: 'Cancel',
                }}
            >
                <View style={styles.preview}>
                    <Image source={require('../assets/images/checkin_bg.png')}
                        style={[styles.preview, { resizeMode: 'stretch' }]} />
                    <View style={{ flexDirection: 'row' }}>
                        <TouchableHighlight
                            style={styles.capture}
                            onPress={() => takePicture()}
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
                    </View>

                </View>
            </Camera>
        );
    }

    const renderImage = () => {
        return (
            <View>
                <Image
                    source={{ uri: imageData }}
                    style={styles.preview}
                />
                {(!showResModal) ? <View style={{ margin: 15, position: 'absolute', bottom: 30, alignSelf: 'center' }}>
                    {(showFetchLoc) ?
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
                            onPress={() => requestLocationPermissions()}
                            title={'Submit'}
                        />}
                    <BlueButton
                        onPress={() => { props.navigation.goBack(null) }}
                        title={'Cancel'}
                        containerStyle={{ marginTop: 15, }}
                    />
                </View> : null}


            </View>
        );
    }


    const renderImageNew = () => {
        return (
            <View>
                <Image
                    source={{ uri: imageData }}
                    style={styles.preview}
                />
                {(!showResModal) ? <View style={{ margin: 15, position: 'absolute', bottom: 30, alignSelf: 'center' }}>
                    {(showFetchLoc) ?
                        <View style={[style.cardWhite, { flexDirection: 'row', justifyContent: 'center' }]}>
                            <ActivityIndicator
                                animating={true}
                                color={blueColor}
                                size='small' />
                            <Text style={[style.darkGrayText, { marginLeft: 10, }]}>{statusMsg}</Text>
                        </View>
                        : (isRetry) ? <View style={{ flexDirection: 'column' }}>
                            <BlueButton
                                onPress={() => {
                                    setImageData(null)
                                    setIsRetry(false)
                                }}
                                title={'Retry'}
                            />
                            <BlueButton
                                onPress={() => { props.navigation.goBack(null) }}
                                title={'Cancel'}
                                containerStyle={{ marginTop: 15, }}
                            /></View>
                            :
                            requestLocationPermissions()
                        // <BlueButton
                        //     onPress={() => requestLocationPermissions()}
                        //     title={'Submit'}
                        // />
                    }

                </View> : null}


            </View>
        );
    }



    const renderResponseModal = () => (
        <Modal visible={showResModal} transparent={true}>
            <View style={{ justifyContent: 'center', flex: 1 }}>
                <View style={{ backgroundColor: whiteColor, alignItems: 'center', alignSelf: 'center', padding: 20, borderRadius: 10 }}>
                    <View style={{ width: 120, height: 120, }}>
                        <Image source={{ uri: imageData }}
                            style={{ width: 120, height: 120, borderRadius: 60 }}
                        />
                        <View style={{
                            backgroundColor: whiteColor, width: 40, height: 40,
                            alignItems: 'center', justifyContent: 'center',
                            borderRadius: 20, borderWidth: 2,
                            borderColor: borderColor, position: 'absolute', bottom: 10, right: -5,
                        }}>
                            {(resCheckInOut && resCheckInOut.isMask) ?
                                <Image source={require('../assets/images/Mask.png')} />
                                : <Image source={require('../assets/images/unmask.png')} />
                            }
                        </View>
                    </View>
                    <Text style={[(resCheckInOut && resCheckInOut.authType === 'in') ? style.greenText : style.redText, { marginVertical: 10 }]}>{'Check ' + (resCheckInOut ? resCheckInOut.authType : '') + ' Successful!'}</Text>
                    <Text style={style.blueText}>{(resCheckInOut) ? utils.formatTime(resCheckInOut.time) : ''}</Text>
                    <TouchableOpacity style={{ position: 'absolute', top: 10, right: 10, }}
                        onPress={() => {
                            setShowResModal(false)
                            setIsRetry(true)
                            props.navigation.state.params.wsDashboard(false)
                            props.navigation.goBack(null)
                        }}>
                        <Image source={require('../assets/images/close.png')} />
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    )
    return (
        <SafeAreaView style={style.header}>
            <View style={styles.container}>
                {imageData ? renderImageNew() : renderCamera()}
                {renderResponseModal()}
                <Loader visible={isLoading} />
            </View>
        </SafeAreaView>
    );
}
export default CheckInOut
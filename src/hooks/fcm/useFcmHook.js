
import React, { useEffect } from 'react'
import { Alert, Platform, PermissionsAndroid, Linking } from 'react-native'
import messaging from '@react-native-firebase/messaging'
import AsyncStorage from '@react-native-community/async-storage'
import StorageKey from '../../webservice/constant'
import { apiSetFCMToken } from '../../actions'
import { useDispatch, useSelector } from 'react-redux'
import DeviceInfo from 'react-native-device-info'
import NavigationService from '../../navigation/NavigationService'
function useFcmHook() {
    const dispatch = useDispatch()
    const resFcmToken = useSelector(state => state.resFcmToken)
    let notificationOpenedListener
    let messageListener

    useEffect(() => {
        let systemVersion = DeviceInfo.getSystemVersion();
        systemVersion > 12 ? checkNotificationPermission() : checkPermission();
        createMessageListener();
        return messageListener
    }, []);
    const checkNotificationPermission = async () => {
        // We need to ask permission for Android only
        if (Platform.OS === 'android') {
            // Calling the permission function
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
            );
            console.log("############=> " + JSON.stringify(PermissionsAndroid.RESULTS))
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                // Permission Granted
                const token = await AsyncStorage.getItem(StorageKey.KEY_FCM_TOKEN)
                if (token === null) {
                    getFcmToken();
                } else {
                }
            } else if (granted === PermissionsAndroid.RESULTS.DENIED) {
                // Permission Denied
                alert('Please give notification permission');
            } else {
                // Permission never_ask_again
                Alert.alert(
                    'Alert',
                    'Please give notification permission from app permission ',
                    [
                        { text: 'Cancel', onPress: () => console.log('Cancel Pressed!') },
                        {
                            text: 'OK', onPress: () => {
                                Linking.openSettings()
                            }
                        },
                    ],
                    { cancelable: false }
                )
            }
        } else {
            // proceed();
        }
    }
    useEffect(() => {
        if (resFcmToken && resFcmToken.success) {
            AsyncStorage.setItem(StorageKey.KEY_FCM_TOKEN, 'true')
        }
    }, [resFcmToken])

    const checkPermission = async () => {
        const enabled = await messaging().hasPermission();
        const token = await AsyncStorage.getItem(StorageKey.KEY_FCM_TOKEN)
        if (enabled && token === null) {
            getFcmToken();
        } else {
            requestPermission();
        }
    }
    const getFcmToken = async () => {
        const fcmToken = await messaging().getToken();
        if (fcmToken) {
            console.log('fcmToken: ' + fcmToken);

            wsSetFCMToken(fcmToken)
            //showAlert('Your Firebase Token is:', fcmToken);
        } else {
            //showAlert('Failed', 'No token received');
        }
    }

    const requestPermission = async () => {
        try {
            await messaging().requestPermission();
            // User has authorised
        } catch (error) {
            // User has rejected permissions
        }
    }

    const createMessageListener = async () => {


        notificationOpenedListener = messaging().onNotificationOpenedApp((notificationOpen) => {
            const { title, body } = notificationOpen.notification;
            NavigationService.navigate('Attendance')
            //showAlert(title, body);
        });

        const notificationOpen = await messaging().getInitialNotification();
        if (notificationOpen) {
            const { title, body } = notificationOpen.notification;
            NavigationService.navigate('Attendance')
        }

        messageListener = messaging().onMessage((message) => {
            console.log('onMessage: ' + JSON.stringify(message));
            const { title, body } = message.notification;
            showAlert(title, body);
        });
    }
    const showAlert = (title, message) => {

        (Platform.OS === "android") ? Alert.alert(
            title,
            message,
            [
                { text: 'OK', onPress: () => console.log('OK Pressed') },
            ],
            { cancelable: false },
        ) : setTimeout(() => {
            Alert.alert(
                title,
                message,
                [
                    { text: 'OK', onPress: () => console.log('OK Pressed') },
                ],
                { cancelable: false },
            )
        }, 5000)

    }

    const wsSetFCMToken = (token) => {
        let data = {
            mobileDeviceInfo: {
                deviceId: DeviceInfo.getUniqueId(),
                fcmToken: token
            }
        }
        dispatch(apiSetFCMToken(data))
    }
}
export default useFcmHook;
import { Alert, Platform, Linking } from 'react-native'
import { openSettings } from 'react-native-permissions'
import Moment from 'moment'
import { AppUrls } from '../webservice/constant'

const isDataURL = (s) => {
    if (s) {
        var regex = /^\s*data:([a-z]+\/[a-z0-9-+.]+(;[a-z-]+=[a-z0-9-]+)?)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\/?%\s]*)\s*$/i;
        return !!s.match(regex);
    } else {
        return false
    }

}
const isValidEmail = (mail) => {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
        return (true)
    }
    return (false)
}
const redirectToStore = () => {

    if (Platform.OS === 'android') {
        Linking.openURL('https://play.google.com/store/apps/details?id=com.rydotinfotech.turnout')
    } else {
        Linking.openURL('itms-apps://itunes.apple.com/us/app/id1535149142')
    }
}
const openPermissionSeetings = () => {
    {
        Platform.OS === "android" ?
            Alert.alert('Enable Location', 'Allow location permission in settings to Check In/OUT', [
                {
                    text: 'Cancel',
                },
                {
                    text: 'Settings',
                    onPress: () => { openSettings().catch(() => console.warn('cannot open settings')) }
                },
            ])
            :
            setTimeout(() => {
                Alert.alert('Enable Location', 'Allow location permission in settings to Check In/OUT', [
                    {
                        text: 'Cancel',
                    },
                    {
                        text: 'Settings',
                        onPress: () => { openSettings().catch(() => console.warn('cannot open settings')) }
                    },
                ])
            }, 5000);
    }
}

const formatDate = date => {

    if (date && date !== '') {
        return Moment(date).format('DD/MM/YYYY')
    } else {
        return '-'
    }
}
const formatTime = date => {
    if (date && date !== '') {
        return Moment.utc(date).local().format('hh:mm A')
    } else {
        return '-'
    }
}

const formatTimeWithSecond = date => {
    if (date && date !== '') {
        return Moment.utc(date).local().format('hh:mm:ss A')
    } else {
        return '-'
    }
}


const formatDateTime = date => {

    if (date && date !== '') {
        return Moment.utc(date).local().format('DD/MM/YYYY hh:mm A')
    } else {
        return '-'
    }
}

const formatDateTimeWithSec = date => {

    if (date && date !== '') {
        return Moment.utc(date).local().format('DD/MM/YYYY hh:mm:ss A')
    } else {
        return '-'
    }
}

const secondsToHm = (d) => {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);
    var hDisplay = h > 9 ? h : '0' + h;
    var mDisplay = m > 9 ? m : '0' + m;
    return hDisplay + ':' + mDisplay;
}
export const utils = {
    isValidEmail,
    openPermissionSeetings,
    formatDate,
    formatTime,
    formatDateTime,
    formatDateTimeWithSec,
    redirectToStore,
    secondsToHm,
    isDataURL,
    formatTimeWithSecond
}
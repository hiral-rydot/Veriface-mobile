import React, { useRef } from 'react';
import { View, Button, Platform, PermissionsAndroid, TouchableOpacity, Text, Alert, Image } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import Snackbar from 'react-native-snackbar';
import deviceInfoModule from 'react-native-device-info';
import moment from 'moment';
const QRCodeGenerator = (props) => {
    let myQRCode = useRef();
    console.log(props.name);

    const ShareQR = () => {
        myQRCode.toDataURL((dataURL) => {
            Share.open({
                message: 'I just added a new outfit to my album.',
                url: `data:image/png;base64,${dataURL}`, //base64 image
                social: "viber"
            });
        })
    };
    const downloadQrCode = async () => {
        console.log(moment().valueOf());
        let file_path = null;
        let mili = moment().valueOf().toString()
        let name = "/" + mili + ".png"
        Platform.OS == 'ios' ?
            file_path = RNFS.DocumentDirectoryPath + name :
            file_path = RNFS.DownloadDirectoryPath + name

        if (Platform.OS === 'android') {
            if (Platform.Version <= 32) {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                        title: 'Storage Permission Required',
                        message: 'This app needs access to your storage to download the QR code',
                    }
                );
                console.log(granted)
                if (granted == PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
                    Alert.alert('', 'Please Give storage permission from setting.');
                    return;
                }
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    Alert.alert('Permission Denied', 'Storage permission is required to save the QR code.');
                    return;
                }
            }
            else {
                const permissions = [
                    PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
                    PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
                    PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
                ];

                const granted = await PermissionsAndroid.requestMultiple(permissions);

                const allGranted = permissions.every(permission => granted[permission] === PermissionsAndroid.RESULTS.GRANTED);

                if (!allGranted) {
                    Alert.alert('Permissions not granted', 'You need to grant storage permissions to proceed.');
                    return;
                }
            }
        }
        myQRCode.toDataURL((dataURL) => {
            var image_data = dataURL;

            // file download
            RNFS.writeFile(file_path, image_data, 'base64')
                .then(async (res) => {
                    console.log('Success ,your file has been successfully downloaded!')
                    Snackbar.show({
                        text: 'Success ,your file has been successfully downloaded!',
                        duration: Snackbar.LENGTH_LONG,
                    });
                })
                .catch((error) => {
                    console.log('error=> ' + error)
                });
        });
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>

            <View style={{ padding: 20, backgroundColor: 'white' }}>
                <QRCode
                    getRef={(ref) => (myQRCode = ref)}
                    value={props?.value ? props.value : 'NA'}
                    size={props.size}
                    color="#283593"
                    backgroundColor="white"
                    logoSize={30}
                    logoMargin={2}
                    logoBorderRadius={15}
                    logoBackgroundColor="yellow"
                />
            </View>
            <View style={{ flexDirection: 'row', borderWidth: 0 }}>
                <View style={[{ minWidth: 90, borderRadius: 10, alignSelf: 'center', borderWidth: 1, borderColor: '#D1D1D1', marginTop: 10, backgroundColor: "#FFFFFF", marginRight: 10 }]}>
                    <TouchableOpacity style={{ padding: 10, alignItems: 'center' }} onPress={() => { downloadQrCode() }}>
                        <Image style={{ height: 25, width: 25, resizeMode: 'cover' }} source={require('../assets/images/download1.png')} />
                        <Text style={{ color: "#606060", fontSize: 16, textAlign: 'center', fontFamily: 'Rubik-Regular' }}>Download</Text>
                    </TouchableOpacity>
                </View>
                <View style={[{ minWidth: 90, borderRadius: 10, alignSelf: 'center', borderWidth: 1, borderColor: '#D1D1D1', marginTop: 10, backgroundColor: "#FFFFFF" }]}>
                    <TouchableOpacity style={{ padding: 10, alignItems: 'center' }} onPress={() => { ShareQR() }}>
                        <Image style={{ height: 25, width: 25, resizeMode: 'cover' }} source={require('../assets/images/share.png')} />
                        <Text style={{ color: "#606060", fontSize: 16, textAlign: 'center', fontFamily: 'Rubik-Regular' }}>Share</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default QRCodeGenerator;

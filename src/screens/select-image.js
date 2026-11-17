import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Button, Image, Platform, Alert } from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import Snackbar from 'react-native-snackbar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { style } from '../styles/style';

export default class SelectImage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            resourcePath: {},
        };
    }

    selectFile = () => {
        const options = {
            mediaType: 'photo',
            includeBase64: true,
        };

        ImagePicker.launchImageLibrary(options, res => {
            if (res.didCancel) {
                console.log('User cancelled image picker');
            } else if (res.errorCode) {
                console.log('ImagePicker Error: ', res.errorMessage);
                Snackbar.show({ text: res.errorMessage || 'ImagePicker Error' });
            } else if (res.assets && res.assets.length > 0) {
                const asset = res.assets[0];
                this.setState({
                    resourcePath: { uri: asset.uri, data: asset.base64 },
                    filePath: res,
                    fileData: asset.base64,
                    fileUri: asset.uri,
                });
            }
        });
    };

    // Launch Camera
    cameraLaunch = () => {
        const options = {
            mediaType: 'photo',
            includeBase64: true,
            saveToPhotos: false,
        };
        ImagePicker.launchCamera(options, (res) => {
            if (res.didCancel) {
                console.log('User cancelled camera');
            } else if (res.errorCode) {
                console.log('ImagePicker Error: ', res.errorMessage);
                Snackbar.show({ text: res.errorMessage || 'Camera Error' });
            } else if (res.assets && res.assets.length > 0) {
                const asset = res.assets[0];
                this.setState({
                    resourcePath: { uri: asset.uri, data: asset.base64 },
                    filePath: res,
                    fileData: asset.base64,
                    fileUri: asset.uri,
                });
            }
        });
    }

    imageGalleryLaunch = () => {
        const options = {
            mediaType: 'photo',
            includeBase64: true,
        };

        ImagePicker.launchImageLibrary(options, (res) => {
            if (res.didCancel) {
                console.log('User cancelled image gallery');
            } else if (res.errorCode) {
                console.log('ImagePicker Error: ', res.errorMessage);
                Snackbar.show({ text: res.errorMessage || 'Gallery Error' });
            } else if (res.assets && res.assets.length > 0) {
                const asset = res.assets[0];
                this.setState({
                    resourcePath: { uri: asset.uri, data: asset.base64 },
                    filePath: res,
                    fileData: asset.base64,
                    fileUri: asset.uri,
                });
            }
        });
    }

    render() {
        return (
            <SafeAreaView style={style.header}>
                <View style={styles.container}>
                    <View style={styles.container}>
                        <Image
                            source={{
                                uri: 'data:image/jpeg;base64,' + this.state.resourcePath.data,
                            }}
                            style={{ width: 100, height: 100 }}
                        />
                        <Image
                            source={{ uri: this.state.resourcePath.uri }}
                            style={{ width: 200, height: 200 }}
                        />
                        <Text style={{ alignItems: 'center' }}>
                            {this.state.resourcePath.uri}
                        </Text>

                        <TouchableOpacity onPress={this.selectFile} style={styles.button}  >
                            <Text style={styles.buttonText}>Select File</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={this.cameraLaunch} style={styles.button}  >
                            <Text style={styles.buttonText}>Launch Camera Directly</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={this.imageGalleryLaunch} style={styles.button}  >
                            <Text style={styles.buttonText}>Launch Image Gallery Directly</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff'
    },
    button: {
        width: 250,
        height: 60,
        backgroundColor: '#3740ff',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
        marginBottom: 12
    },
    buttonText: {
        textAlign: 'center',
        fontSize: 15,
        color: '#fff'
    }
});
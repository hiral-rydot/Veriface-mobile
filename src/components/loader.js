import React, { Component } from 'react';
import { ActivityIndicator, Modal, View } from 'react-native';

const Loader = ({ visible }) => (
    <Modal visible={visible}
        transparent={true}>
        <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center', flexDirection: 'row', marginTop: 100 }}>
            <ActivityIndicator
                animating={true}
                color='#4386F4'
                size="large" />
        </View>
    </Modal>
)


export default Loader;
import React, { useEffect, useState } from 'react';
import { View, Image, Text, Dimensions } from 'react-native';
import StorageKey, { uploadUrl } from '../webservice/constant'
import { getObject } from '../utils/storage'
import useFcmHook from '../hooks/fcm/useFcmHook'
const Splash = ({ navigation }) => {
  const [clientSetting, setClientSetting] = useState(null)

  useFcmHook()
  useEffect(() => {
    async function getSettings() {
      let clientSetting = await getObject(StorageKey.KEY_CLIENT_SETTING)
      console.log('clientSetting.introScreen', clientSetting)
      setClientSetting(clientSetting)
      setTimeout(() => {
        navigation.replace('Dashboard');
      }, 3000);
    }
    getSettings();
  }, [])


  return (
    <View style={{ backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
      
      {(clientSetting && clientSetting.introScreen != null) ?
        <Image
          source={{ uri: uploadUrl + clientSetting.introScreen }}
          style={{ width: Dimensions.get('window').width , height: Dimensions.get('window').height, resizeMode: 'contain' }}
        /> : <Image
          source={require('../assets/images/Tlogo-white.png')}
        />

      }

    </View>
  );

}

export default Splash

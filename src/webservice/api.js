import StorageKey, { apiUrl } from '../webservice/constant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { useNetInfo } from "@react-native-community/netinfo";
import NavigationService from '../navigation/NavigationService';
import { Alert, Platform } from 'react-native'
import { StackActions, NavigationActions } from 'react-navigation';
import { utils } from '../utils/utils';
import DeviceInfo from 'react-native-device-info'

const API_TIMEOUT = 30000;

const postWithPayloadwithToken = async function (url, payload) {
  console.log('API url: ' + JSON.stringify(apiUrl + url))

  const response = await NetInfo.fetch();
  const ipAdress = response.details.ipAddress
  const asyncStoreValue = await AsyncStorage.multiGet([StorageKey.KEY_TOKEN, StorageKey.KEY_LATITUDE, StorageKey.KEY_LONGITUDE])

  console.log('API payload: ' + JSON.stringify(payload))

  const reqHeaders = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'x-access-token': asyncStoreValue[0][1],
    'lat': asyncStoreValue[1][1],
    'long': asyncStoreValue[2][1],
    'version': DeviceInfo.getBuildNumber(),
    'os-type': Platform.OS,
    'brand': DeviceInfo.getBrand(),
    //'carrier': await DeviceInfo.getCarrier(),
    //'lastupdatetime': await DeviceInfo.getLastUpdateTime(),
    //'manufacturer': await DeviceInfo.getManufacturer(),
    'device-id': DeviceInfo.getDeviceId(),
    'os-version': DeviceInfo.getSystemVersion(),
    'ip-address': ipAdress
  }
  console.log('API Headers: ' + JSON.stringify(reqHeaders))
  if ((response.isConnected && response.isInternetReachable)) {
    return await fetch(apiUrl + url, {
      method: 'post',
      headers: reqHeaders,
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then((res) => {
        console.log('API response: ' + JSON.stringify(res))
        if (!res.success && res.errors) {
          let i = res.errors.find((i) => i.msg === "Company is inactive")
          let e = res.errors.find((i) => i.param === "x-access-token")
          let versionError = res.errors.find((i) => i.param === "version")
          let isCompanyAvail = res.errors.find((a) => a.code === "middlewares.token_parser.validation.company_isDeleted")

          if (isCompanyAvail) {
            Platform.OS === "android" ?
              Alert.alert(
                "Alert",
                'Company is Deleted.',
                [
                  {
                    text: "OK", onPress: async () => {
                      let number = await AsyncStorage.getItem('number')
                      await AsyncStorage.clear();
                      AsyncStorage.setItem('number', number);
                      const navigateAction = StackActions.reset({
                        index: 0,
                        actions: [NavigationActions.navigate({ routeName: 'Login' })],
                      });
                      NavigationService.dispatch(navigateAction)
                    }
                  }
                ],
                { cancelable: false }
              ) :
              setTimeout(() => {
                Alert.alert(
                  "Alert",
                  'Company is Deleted.',
                  [
                    {
                      text: "OK", onPress: async () => {
                        let number = await AsyncStorage.getItem('number')
                        await AsyncStorage.clear();
                        AsyncStorage.setItem('number', number);
                        const navigateAction = StackActions.reset({
                          index: 0,
                          actions: [NavigationActions.navigate({ routeName: 'Login' })],
                        });
                        NavigationService.dispatch(navigateAction)
                      }
                    }
                  ],
                  { cancelable: false }
                )
              }, 1000);
          }
          else if (i) {
            Platform.OS === "android" ?
              Alert.alert(
                "Alert",
                'Your company is not active please contact administrative.',
                [
                  {
                    text: "OK", onPress: async () => {
                      let number = await AsyncStorage.getItem('number')
                      await AsyncStorage.clear();
                      AsyncStorage.setItem('number', number);
                      const navigateAction = StackActions.reset({
                        index: 0,
                        actions: [NavigationActions.navigate({ routeName: 'Login' })],
                      });
                      NavigationService.dispatch(navigateAction)
                    }
                  }
                ],
                { cancelable: false }
              ) :
              setTimeout(() => {
                Alert.alert(
                  "Alert",
                  'Your company is not active please contact administrative.',
                  [
                    {
                      text: "OK", onPress: async () => {
                        let number = await AsyncStorage.getItem('number')
                        await AsyncStorage.clear();
                        AsyncStorage.setItem('number', number);
                        const navigateAction = StackActions.reset({
                          index: 0,
                          actions: [NavigationActions.navigate({ routeName: 'Login' })],
                        });
                        NavigationService.dispatch(navigateAction)
                      }
                    }
                  ],
                  { cancelable: false }
                )
              }, 1000);
            //return undefined
          } else if (versionError) {
            {
              Platform.OS === "android" ?
                Alert.alert(
                  "Update",
                  versionError.msg,
                  [
                    {
                      text: "Update", onPress: async () => {
                        utils.redirectToStore()
                      }
                    }
                  ],
                  { cancelable: false }
                )
                :
                setTimeout(() => {
                  Alert.alert(
                    "Update",
                    versionError.msg,
                    [
                      {
                        text: "Update", onPress: async () => {
                          utils.redirectToStore()
                        }
                      }
                    ],
                    { cancelable: false }
                  )
                }, 1000);

              //return undefined
            }
          } else if (e) {
            Platform.OS === "android" ?
              Alert.alert(
                "Alert",
                'Your session expired. Please login again.',
                [
                  {
                    text: "OK", onPress: async () => {
                      let number = await AsyncStorage.getItem('number')
                      await AsyncStorage.clear();
                      AsyncStorage.setItem('number', number);
                      const navigateAction = StackActions.reset({
                        index: 0,
                        actions: [NavigationActions.navigate({ routeName: 'Login' })],
                      });
                      NavigationService.dispatch(navigateAction)
                    }
                  }
                ],
                { cancelable: false }
              ) :

              setTimeout(() => {
                Alert.alert(
                  "Alert",
                  'Your session expired. Please login again.',
                  [
                    {
                      text: "OK", onPress: async () => {
                        let number = await AsyncStorage.getItem('number')
                        await AsyncStorage.clear();
                        AsyncStorage.setItem('number', number);
                        const navigateAction = StackActions.reset({
                          index: 0,
                          actions: [NavigationActions.navigate({ routeName: 'Login' })],
                        });
                        NavigationService.dispatch(navigateAction)
                      }
                    }
                  ],
                  { cancelable: false }
                )
              }, 1000);
          } else {
            Platform.OS === "android" ?
              alert(res.errors[0].msg) :
              setTimeout(() => {
                Alert.alert(res.errors[0].msg)
              }, 1000);
          }
        }
        return res
      })
      .catch(error => {
        console.log('API Error: ' + JSON.stringify(error))
        {
          Platform.OS === "android" ?
            alert('Something went wrong. Please try again later.') :
            setTimeout(() => {
              Alert.alert('Something went wrong. Please try again later.')
            }, 1000);
        }
      });
  } else {
    {
      Platform.OS === "android" ?
        alert('Please check your internet connection.') :
        setTimeout(() => {
          Alert.alert('Please check your internet connection.')
        }, 1000);
    }

    return undefined
  }
}


const postWithPayloadwithTokennew = async (url, payload) =>
  await fetch(apiUrl + url, {
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'x-access-token': await AsyncStorage.getItem('newtoken')
    },
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(res => res)
    .catch(error => error);



const postWithMultipart = async function (url, payload) {
  console.log('API url: ' + JSON.stringify(apiUrl + url))

  const response = await NetInfo.fetch();
  const ipAdress = response.details.ipAddress
  const asyncStoreValue = await AsyncStorage.multiGet([StorageKey.KEY_TOKEN, StorageKey.KEY_LATITUDE, StorageKey.KEY_LONGITUDE])

  console.log('API payload: ' + JSON.stringify(payload))

  const reqHeaders = {
    Accept: 'application/json',
    'Content-Type': 'multipart/form-data',
    'x-access-token': asyncStoreValue[0][1],
    'lat': asyncStoreValue[1][1],
    'long': asyncStoreValue[2][1],
    'version': DeviceInfo.getBuildNumber(),
    'os-type': Platform.OS,
    'brand': DeviceInfo.getBrand(),
    //'carrier': await DeviceInfo.getCarrier(),
    //'lastupdatetime': await DeviceInfo.getLastUpdateTime(),
    //'manufacturer': await DeviceInfo.getManufacturer(),
    'device-id': DeviceInfo.getDeviceId(),
    'os-version': DeviceInfo.getSystemVersion(),
    'ip-address': ipAdress,

  }
  console.log('API Headers: ' + JSON.stringify(reqHeaders))
  if ((response.isConnected && response.isInternetReachable)) {
    return await fetch(apiUrl + url, {
      method: 'post',
      headers: reqHeaders,
      body: payload
    })
      .then(res => res.json())
      .then((res) => {
        console.log('API response: ' + JSON.stringify(res))
        if (!res.success && res.errors) {
          let e = res.errors.find((i) => i.param === "x-access-token")
          let versionError = res.errors.find((i) => i.param === "version")
          let i = res.errors.find((i) => i.msg === "Company is inactive")
          let isCompanyAvail = res.errors.find((a) => a.code === "middlewares.token_parser.validation.company_isDeleted")

          if (isCompanyAvail) {
            Platform.OS === "android" ?
              Alert.alert(
                "Alert",
                'Company is Deleted.',
                [
                  {
                    text: "OK", onPress: async () => {
                      let number = await AsyncStorage.getItem('number')
                      await AsyncStorage.clear();
                      AsyncStorage.setItem('number', number);
                      const navigateAction = StackActions.reset({
                        index: 0,
                        actions: [NavigationActions.navigate({ routeName: 'Login' })],
                      });
                      NavigationService.dispatch(navigateAction)
                    }
                  }
                ],
                { cancelable: false }
              ) :
              setTimeout(() => {
                Alert.alert(
                  "Alert",
                  'Company is Deleted.',
                  [
                    {
                      text: "OK", onPress: async () => {
                        let number = await AsyncStorage.getItem('number')
                        await AsyncStorage.clear();
                        AsyncStorage.setItem('number', number);
                        const navigateAction = StackActions.reset({
                          index: 0,
                          actions: [NavigationActions.navigate({ routeName: 'Login' })],
                        });
                        NavigationService.dispatch(navigateAction)
                      }
                    }
                  ],
                  { cancelable: false }
                )
              }, 1000);
          }
          else if (i) {
            Platform.OS === "android" ?
              Alert.alert(
                "Alert",
                'Your company is not active please contact administrative.',
                [
                  {
                    text: "OK", onPress: async () => {
                      let number = await AsyncStorage.getItem('number')
                      await AsyncStorage.clear();
                      AsyncStorage.setItem('number', number);
                      const navigateAction = StackActions.reset({
                        index: 0,
                        actions: [NavigationActions.navigate({ routeName: 'Login' })],
                      });
                      NavigationService.dispatch(navigateAction)
                    }
                  }
                ],
                { cancelable: false }
              ) :
              setTimeout(() => {
                Alert.alert(
                  "Alert",
                  'Your company is not active please contact administrative.',
                  [
                    {
                      text: "OK", onPress: async () => {
                        let number = await AsyncStorage.getItem('number')
                        await AsyncStorage.clear();
                        AsyncStorage.setItem('number', number);
                        const navigateAction = StackActions.reset({
                          index: 0,
                          actions: [NavigationActions.navigate({ routeName: 'Login' })],
                        });
                        NavigationService.dispatch(navigateAction)
                      }
                    }
                  ],
                  { cancelable: false }
                )
              }, 1000);
            //return undefined
          } else if (versionError) {
            {
              Platform.OS === "android" ?
                Alert.alert(
                  "Update",
                  versionError.msg,
                  [
                    {
                      text: "Update", onPress: async () => {
                        utils.redirectToStore()
                      }
                    }
                  ],
                  { cancelable: false }
                )
                :
                setTimeout(() => {
                  Alert.alert(
                    "Update",
                    versionError.msg,
                    [
                      {
                        text: "Update", onPress: async () => {
                          utils.redirectToStore()
                        }
                      }
                    ],
                    { cancelable: false }
                  )
                }, 1000);

              //return undefined
            }
          } else if (e) {
            {
              Platform.OS === "android" ?
                Alert.alert(
                  "Alert",
                  'Your session expired. Please login again.',
                  [
                    {
                      text: "OK", onPress: async () => {
                        let number = await AsyncStorage.getItem('number')
                        await AsyncStorage.clear();
                        AsyncStorage.setItem('number', number);
                        const navigateAction = StackActions.reset({
                          index: 0,
                          actions: [NavigationActions.navigate({ routeName: 'Login' })],
                        });
                        NavigationService.dispatch(navigateAction)
                      }
                    }
                  ],
                  { cancelable: false }
                ) :

                setTimeout(() => {
                  Alert.alert(
                    "Alert",
                    'Your session expired. Please login again.',
                    [
                      {
                        text: "OK", onPress: async () => {
                          let number = await AsyncStorage.getItem('number')
                          await AsyncStorage.clear();
                          AsyncStorage.setItem('number', number);
                          const navigateAction = StackActions.reset({
                            index: 0,
                            actions: [NavigationActions.navigate({ routeName: 'Login' })],
                          });
                          NavigationService.dispatch(navigateAction)
                        }
                      }
                    ],
                    { cancelable: false }
                  )
                }, 1000);
            }

          } else {
            Platform.OS === "android" ?
              alert(res.errors[0].msg) :
              setTimeout(() => {
                Alert.alert(res.errors[0].msg)
              }, 1000);
          }
        }
        return res
      })
      .catch(error => {
        console.log('API Error: ' + JSON.stringify(error))
        {
          Platform.OS === "android" ?
            alert('Something went wrong. Please try again later.') :
            setTimeout(() => {
              Alert.alert('Something went wrong. Please try again later.')
            }, 1000);
        }
      });
  } else {
    {
      Platform.OS === "android" ?
        alert('Please check your internet connection.') :
        setTimeout(() => {
          Alert.alert('Please check your internet connection.')
        }, 1000);
    }

    return undefined
  }
}



const postWithTokenNew = (apiUrl, data) => {

  return new Promise((resolve, reject) => {

    NetInfo.fetch().then(value => {
      const ipAdress = value.details.ipAddress
      AsyncStorage.multiGet([StorageKey.KEY_TOKEN, StorageKey.KEY_LATITUDE, StorageKey.KEY_LONGITUDE]).then(valuee => {
        var myHeaders = new Headers();
        myHeaders.append('Accept', 'application/json');
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("x-access-token", valuee[0][1]);
        myHeaders.append("lat", valuee[1][1]);
        myHeaders.append("long", valuee[2][1]);
        myHeaders.append("version", DeviceInfo.getBuildNumber());
        myHeaders.append("os-type", Platform.OS);
        myHeaders.append("brand", DeviceInfo.getBrand());
        myHeaders.append("device-id", DeviceInfo.getDeviceId());
        myHeaders.append("os-version", DeviceInfo.getSystemVersion());
        myHeaders.append("ip-address", ipAdress);

        let raw = JSON.stringify(data);

        const abortController = new AbortController();
        let requestOptions = {
          method: 'POST',
          headers: myHeaders,
          body: raw,
          redirect: 'follow',
          signal: abortController.signal,
        };


        console.log("Api Url : ", apiUrl);
        console.log("x-access-token", valuee[0][1]);
        console.log("lat", valuee[1][1]);
        console.log("long", valuee[2][1]);
        console.log("Payload : ", raw)

        let timeout = setTimeout(() => {
          abortController.abort();
        }, API_TIMEOUT);


        fetch(apiUrl, requestOptions)
          .then(response => {
            clearTimeout(timeout);
            response.text()
              .then(res => {
                console.log("Api Response : ", res);
                try {

                  if (!res.success && res.errors) {
                    let i = res.errors.find((i) => i.msg === "Company is inactive")
                    let e = res.errors.find((i) => i.param === "x-access-token")
                    let versionError = res.errors.find((i) => i.param === "version")
                    let isCompanyAvail = res.errors.find((a) => a.code === "middlewares.token_parser.validation.company_isDeleted")

                    if (isCompanyAvail) {
                      Platform.OS === "android" ?
                        Alert.alert(
                          "Alert",
                          'Company is Deleted.',
                          [
                            {
                              text: "OK", onPress: async () => {
                                let number = await AsyncStorage.getItem('number')
                                await AsyncStorage.clear();
                                AsyncStorage.setItem('number', number);
                                const navigateAction = StackActions.reset({
                                  index: 0,
                                  actions: [NavigationActions.navigate({ routeName: 'Login' })],
                                });
                                NavigationService.dispatch(navigateAction)
                              }
                            }
                          ],
                          { cancelable: false }
                        ) :
                        setTimeout(() => {
                          Alert.alert(
                            "Alert",
                            'Company is Deleted.',
                            [
                              {
                                text: "OK", onPress: async () => {
                                  let number = await AsyncStorage.getItem('number')
                                  await AsyncStorage.clear();
                                  AsyncStorage.setItem('number', number);
                                  const navigateAction = StackActions.reset({
                                    index: 0,
                                    actions: [NavigationActions.navigate({ routeName: 'Login' })],
                                  });
                                  NavigationService.dispatch(navigateAction)
                                }
                              }
                            ],
                            { cancelable: false }
                          )
                        }, 1000);
                    }
                    else if (i) {
                      Platform.OS === "android" ?
                        Alert.alert(
                          "Alert",
                          'Your company is not active please contact administrative.',
                          [
                            {
                              text: "OK", onPress: async () => {
                                let number = await AsyncStorage.getItem('number')
                                await AsyncStorage.clear();
                                AsyncStorage.setItem('number', number);
                                const navigateAction = StackActions.reset({
                                  index: 0,
                                  actions: [NavigationActions.navigate({ routeName: 'Login' })],
                                });
                                NavigationService.dispatch(navigateAction)
                              }
                            }
                          ],
                          { cancelable: false }
                        ) :
                        setTimeout(() => {
                          Alert.alert(
                            "Alert",
                            'Your company is not active please contact administrative.',
                            [
                              {
                                text: "OK", onPress: async () => {
                                  let number = await AsyncStorage.getItem('number')
                                  await AsyncStorage.clear();
                                  AsyncStorage.setItem('number', number);
                                  const navigateAction = StackActions.reset({
                                    index: 0,
                                    actions: [NavigationActions.navigate({ routeName: 'Login' })],
                                  });
                                  NavigationService.dispatch(navigateAction)
                                }
                              }
                            ],
                            { cancelable: false }
                          )
                        }, 1000);
                      //return undefined
                    } else if (versionError) {
                      {
                        Platform.OS === "android" ?
                          Alert.alert(
                            "Update",
                            versionError.msg,
                            [
                              {
                                text: "Update", onPress: async () => {
                                  utils.redirectToStore()
                                }
                              }
                            ],
                            { cancelable: false }
                          )
                          :
                          setTimeout(() => {
                            Alert.alert(
                              "Update",
                              versionError.msg,
                              [
                                {
                                  text: "Update", onPress: async () => {
                                    utils.redirectToStore()
                                  }
                                }
                              ],
                              { cancelable: false }
                            )
                          }, 1000);

                        //return undefined
                      }
                    } else if (e) {
                      Platform.OS === "android" ?
                        Alert.alert(
                          "Alert",
                          'Your session expired. Please login again.',
                          [
                            {
                              text: "OK", onPress: async () => {
                                let number = await AsyncStorage.getItem('number')
                                await AsyncStorage.clear();
                                AsyncStorage.setItem('number', number);
                                const navigateAction = StackActions.reset({
                                  index: 0,
                                  actions: [NavigationActions.navigate({ routeName: 'Login' })],
                                });
                                NavigationService.dispatch(navigateAction)
                              }
                            }
                          ],
                          { cancelable: false }
                        ) :

                        setTimeout(() => {
                          Alert.alert(
                            "Alert",
                            'Your session expired. Please login again.',
                            [
                              {
                                text: "OK", onPress: async () => {
                                  let number = await AsyncStorage.getItem('number')
                                  await AsyncStorage.clear();
                                  AsyncStorage.setItem('number', number);
                                  const navigateAction = StackActions.reset({
                                    index: 0,
                                    actions: [NavigationActions.navigate({ routeName: 'Login' })],
                                  });
                                  NavigationService.dispatch(navigateAction)
                                }
                              }
                            ],
                            { cancelable: false }
                          )
                        }, 1000);
                    } else {
                      Platform.OS === "android" ?
                        alert(res.errors[0].msg) :
                        setTimeout(() => {
                          Alert.alert(res.errors[0].msg)
                        }, 1000);
                    }
                    reject(JSON.parse(res));
                  } else {
                    resolve(JSON.parse(res));
                  }
                } catch (error) {
                  reject(error);
                }
              })
              .catch(error => {
                console.log(error)
                reject(error);
              });
          }).catch(error => {
            clearTimeout(timeout);
            console.log(error)
            reject(error);
          });
      }).catch(error => {
        reject(error);
      })
    }).catch(error => {
      reject(error);
    })

  })
}


const postWithoutTokenNew = (apiUrl, data) => {

  return new Promise((resolve, reject) => {

    NetInfo.fetch().then(value => {
      const ipAdress = value.details.ipAddress
      AsyncStorage.multiGet([StorageKey.KEY_LATITUDE, StorageKey.KEY_LONGITUDE]).then(valuee => {
        var myHeaders = new Headers();
        myHeaders.append('Accept', 'application/json');
        myHeaders.append("Content-Type", "application/json");
        //myHeaders.append("x-access-token", valuee[0][1]);
        myHeaders.append("lat", valuee[0][1]);
        myHeaders.append("long", valuee[1][1]);
        myHeaders.append("version", DeviceInfo.getBuildNumber());
        myHeaders.append("os-type", Platform.OS);
        myHeaders.append("brand", DeviceInfo.getBrand());
        myHeaders.append("device-id", DeviceInfo.getDeviceId());
        myHeaders.append("os-version", DeviceInfo.getSystemVersion());
        myHeaders.append("ip-address", ipAdress);

        let raw = JSON.stringify(data);

        const abortController = new AbortController();
        let requestOptions = {
          method: 'POST',
          headers: myHeaders,
          body: raw,
          redirect: 'follow',
          signal: abortController.signal,
        };


        console.log("Api Url : ", apiUrl);
        console.log("x-access-token", valuee[0][1]);
        console.log("lat", valuee[1][1]);
        console.log("long", valuee[2][1]);
        console.log("Payload : ", raw)

        let timeout = setTimeout(() => {
          abortController.abort();
        }, API_TIMEOUT);


        fetch(apiUrl, requestOptions)
          .then(response => {
            clearTimeout(timeout);
            response.text()
              .then(res => {
                console.log("Api Response : ", res);
                try {

                  if (!res.success && res.errors) {
                    let i = res.errors.find((i) => i.msg === "Company is inactive")
                    let e = res.errors.find((i) => i.param === "x-access-token")
                    let versionError = res.errors.find((i) => i.param === "version")
                    let isCompanyAvail = res.errors.find((a) => a.code === "middlewares.token_parser.validation.company_isDeleted")

                    if (isCompanyAvail) {
                      Platform.OS === "android" ?
                        Alert.alert(
                          "Alert",
                          'Company is Deleted.',
                          [
                            {
                              text: "OK", onPress: async () => {
                                let number = await AsyncStorage.getItem('number')
                                await AsyncStorage.clear();
                                AsyncStorage.setItem('number', number);
                                const navigateAction = StackActions.reset({
                                  index: 0,
                                  actions: [NavigationActions.navigate({ routeName: 'Login' })],
                                });
                                NavigationService.dispatch(navigateAction)
                              }
                            }
                          ],
                          { cancelable: false }
                        ) :
                        setTimeout(() => {
                          Alert.alert(
                            "Alert",
                            'Company is Deleted.',
                            [
                              {
                                text: "OK", onPress: async () => {
                                  let number = await AsyncStorage.getItem('number')
                                  await AsyncStorage.clear();
                                  AsyncStorage.setItem('number', number);
                                  const navigateAction = StackActions.reset({
                                    index: 0,
                                    actions: [NavigationActions.navigate({ routeName: 'Login' })],
                                  });
                                  NavigationService.dispatch(navigateAction)
                                }
                              }
                            ],
                            { cancelable: false }
                          )
                        }, 1000);
                    }
                    else if (i) {
                      Platform.OS === "android" ?
                        Alert.alert(
                          "Alert",
                          'Your company is not active please contact administrative.',
                          [
                            {
                              text: "OK", onPress: async () => {
                                let number = await AsyncStorage.getItem('number')
                                await AsyncStorage.clear();
                                AsyncStorage.setItem('number', number);
                                const navigateAction = StackActions.reset({
                                  index: 0,
                                  actions: [NavigationActions.navigate({ routeName: 'Login' })],
                                });
                                NavigationService.dispatch(navigateAction)
                              }
                            }
                          ],
                          { cancelable: false }
                        ) :
                        setTimeout(() => {
                          Alert.alert(
                            "Alert",
                            'Your company is not active please contact administrative.',
                            [
                              {
                                text: "OK", onPress: async () => {
                                  let number = await AsyncStorage.getItem('number')
                                  await AsyncStorage.clear();
                                  AsyncStorage.setItem('number', number);
                                  const navigateAction = StackActions.reset({
                                    index: 0,
                                    actions: [NavigationActions.navigate({ routeName: 'Login' })],
                                  });
                                  NavigationService.dispatch(navigateAction)
                                }
                              }
                            ],
                            { cancelable: false }
                          )
                        }, 1000);
                      //return undefined
                    } else if (versionError) {
                      {
                        Platform.OS === "android" ?
                          Alert.alert(
                            "Update",
                            versionError.msg,
                            [
                              {
                                text: "Update", onPress: async () => {
                                  utils.redirectToStore()
                                }
                              }
                            ],
                            { cancelable: false }
                          )
                          :
                          setTimeout(() => {
                            Alert.alert(
                              "Update",
                              versionError.msg,
                              [
                                {
                                  text: "Update", onPress: async () => {
                                    utils.redirectToStore()
                                  }
                                }
                              ],
                              { cancelable: false }
                            )
                          }, 1000);

                        //return undefined
                      }
                    } else if (e) {
                      Platform.OS === "android" ?
                        Alert.alert(
                          "Alert",
                          'Your session expired. Please login again.',
                          [
                            {
                              text: "OK", onPress: async () => {
                                let number = await AsyncStorage.getItem('number')
                                await AsyncStorage.clear();
                                AsyncStorage.setItem('number', number);
                                const navigateAction = StackActions.reset({
                                  index: 0,
                                  actions: [NavigationActions.navigate({ routeName: 'Login' })],
                                });
                                NavigationService.dispatch(navigateAction)
                              }
                            }
                          ],
                          { cancelable: false }
                        ) :

                        setTimeout(() => {
                          Alert.alert(
                            "Alert",
                            'Your session expired. Please login again.',
                            [
                              {
                                text: "OK", onPress: async () => {
                                  let number = await AsyncStorage.getItem('number')
                                  await AsyncStorage.clear();
                                  AsyncStorage.setItem('number', number);
                                  const navigateAction = StackActions.reset({
                                    index: 0,
                                    actions: [NavigationActions.navigate({ routeName: 'Login' })],
                                  });
                                  NavigationService.dispatch(navigateAction)
                                }
                              }
                            ],
                            { cancelable: false }
                          )
                        }, 1000);
                    } else {
                      Platform.OS === "android" ?
                        alert(res.errors[0].msg) :
                        setTimeout(() => {
                          Alert.alert(res.errors[0].msg)
                        }, 1000);
                    }
                    reject(JSON.parse(res));
                  } else {
                    resolve(JSON.parse(res));
                  }
                } catch (error) {
                  reject(error);
                }
              })
              .catch(error => {
                console.log(error)
                reject(error);
              });
          }).catch(error => {
            clearTimeout(timeout);
            console.log(error)
            reject(error);
          });
      }).catch(error => {
        reject(error);
      })
    }).catch(error => {
      reject(error);
    })

  })
}



export const api = {
  postWithPayloadwithToken,
  postWithPayloadwithTokennew,
  postWithMultipart,
  postWithTokenNew
};

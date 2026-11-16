import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, ActivityIndicator, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux'
import { apiWorkplaceUpdate } from '../actions'
import Geolocation from 'react-native-geolocation-service'
import { PERMISSIONS, requestMultiple, RESULTS, request } from 'react-native-permissions';
import { utils } from '../utils/utils'
import MapView, { Marker } from 'react-native-maps';
import BlueButton from '../components/blue-button';
import { iconColor, whiteColor } from '../styles/color'
import { style } from '../styles/style'
import { NavigationBar } from 'navigationbar-react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContext } from 'react-navigation';
import { ScrollView } from 'react-native-gesture-handler';
import Snackbar from 'react-native-snackbar';


const WorkPlaceTag = (props) => {
    const navigation = useContext(NavigationContext);
    let resWorkplaceUpdate = useSelector(state => state.resWorkplaceUpdate)
    let isLoading = useSelector(state => state.loading)
    const dispatch = useDispatch()
    const [marklocation, setMarklocation] = useState({
        latitude: 0,
        longitude: 0,
    });
    const [location, setLocation] = useState({
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0.04,
        longitudeDelta: 0.05
    });
    let items = navigation.state.params.item.item
    let mapView = useRef(null)

    useEffect(() => {
        resWorkplaceUpdate = null
    }, [])

    useEffect(() => {
        setTimeout(() => {
            Platform.OS === "android" ?
                requestMultiple([PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION]).then(
                    (statuses) => {
                        let fineLoc = statuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION]
                        if (fineLoc === RESULTS.GRANTED) {
                            fetchCurrentLocation()
                        } else if (fineLoc === RESULTS.BLOCKED) {
                            utils.openPermissionSeetings()
                        }
                    },
                ) :
                request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE).then(
                    (statuses) => {

                        console.log('Location', JSON.stringify(statuses));
                        // let fineLoc = statuses[PERMISSIONS.IOS.LOCATION_WHEN_IN_USE]
                        if (statuses === RESULTS.GRANTED) {
                            // console.log('fetchCurrentLocation called', fineLoc);
                            fetchCurrentLocation()

                            // console.log('fetchCurrentLocation finished', fineLoc);
                        } else if (statuses === RESULTS.BLOCKED) {
                            // console.log('openPermissionSeetings called', fineLoc);
                            utils.openPermissionSeetings()
                            // console.log('openPermissionSeetings finished', fineLoc);
                        }
                    },
                );
        }, 50);
    }, [])


    const goToInitialLocation = async () => {
        let initialRegion = Object.assign({}, location);
        initialRegion["latitudeDelta"] = 0.04;
        initialRegion["longitudeDelta"] = 0.05;
        await mapView.animateToRegion(initialRegion, 2000);
    }

    const fetchCurrentLocation = () => {
        Geolocation.getCurrentPosition(
            (position) => {
                if (position.mocked) {
                    Snackbar.show({ text: 'Please disable mock location in settings.' })
                }
                else {
                    setLocation({
                        latitude: position && position.coords && position.coords.latitude ? parseFloat(position.coords.latitude) : "",
                        longitude: position && position.coords && position.coords.longitude ? parseFloat(position.coords.longitude) : "",
                    });
                }
            },
            (error) => {
                // See error code charts below.
                console.log(error.code, error.message);
            },
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
        );
    }

    async function getResofUpdatedLocation() {
        if (marklocation["latitude"] !== 0 && marklocation["longitude"] !== 0) {

            let lat = JSON.parse(marklocation).latitude
            let lng = JSON.parse(marklocation).longitude

            let id = navigation.state.params.item.item._id
            let data = {
                lat: lat,
                lng: lng
            }
            dispatch(apiWorkplaceUpdate(data, id))
            await resWorkplaceUpdate && resWorkplaceUpdate.success === false ?
                (isLoading)
                : Alert.alert(
                    '"Turnout",',
                    'Your Workplace Updated',
                    [
                        {
                            text: 'OK', onPress: () => {
                                props.navigation.goBack(null)
                            }
                        },
                    ],
                    { cancelable: false },
                )
        } else {

            Geolocation.getCurrentPosition(
                async (position) => {
                    let id = navigation.state.params.item.item._id
                    let data = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    }
                    dispatch(apiWorkplaceUpdate(data, id))
                    await resWorkplaceUpdate && resWorkplaceUpdate.success === false ?
                        (isLoading)
                        : Alert.alert(
                            '"Turnout",',
                            'Your Workplace Updated',
                            [
                                {
                                    text: 'OK', onPress: () => {
                                        props.navigation.goBack(null)
                                    }
                                },
                            ],
                            { cancelable: false },
                        )
                },
                (error) => {
                    // See error code charts below.
                    console.log(error.code, error.message);
                },
                { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
            );
        }


    }

    const fetchLocation = () => {
        Alert.alert(
            '"Turnout",',
            'Are you sure to Update Workplace?',
            [
                {
                    text: 'OK', onPress: () => { getResofUpdatedLocation() }
                },
                {
                    text: 'Cancel'
                }
            ],
            { cancelable: false },
        )
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={{ flex: 1, backgroundColor: whiteColor }}>
                <NavigationBar
                    navigationBarStyle={{ ...style.navigationBarStyle }}
                    componentLeft={() =>
                        <View style={{ alignItems: 'flex-start', marginLeft: 5 }}>
                            <TouchableOpacity style={{ justifyContent: 'center', flexDirection: 'row' }} onPress={() => navigation.goBack(null)}>
                                <Image source={require('../assets/images/back.png')}
                                    style={style.backIcon1} />
                                <Text style={style.headerText}>Workplace Tag</Text>
                            </TouchableOpacity>
                        </View>
                    } />
                <ScrollView>
                    <View style={{ flexDirection: 'column', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, height: '70%', marginTop: 100 }}>
                        {location.latitude === 0 && location.longitude === 0 ?
                            <ActivityIndicator size="large" color="#283593" />
                            :
                            <MapView
                                style={{ position: 'absolute', justifyContent: 'flex-start', top: 0, left: 0, right: 0, bottom: 0, }}
                                mapPadding={{ top: 0, right: 0, bottom: 0, left: 0, }}
                                showsUserLocation={true}
                                followsUserLocation={true}
                                showsMyLocationButton={true}
                                showsPointsOfInterest={true}
                                showsCompass={false}
                                initialRegion={{
                                    latitude: parseFloat(location.latitude),
                                    longitude: parseFloat(location.longitude),
                                    latitudeDelta: 0.04,
                                    longitudeDelta: 0.05,
                                }}
                                onMapReady={goToInitialLocation}
                                ref={ref => (mapView = ref)}
                            // onRegionChangeComplete={location => setLocation(location)}
                            // customMapStyle={mapStyle}
                            >
                                <Marker
                                    draggable
                                    coordinate={{
                                        latitude: parseFloat(location.latitude),
                                        longitude: parseFloat(location.longitude),
                                    }}
                                    onDragEnd={(e) => setMarklocation(JSON.stringify(e.nativeEvent.coordinate))}
                                    // onDragEnd={

                                    //     (e) => alert(JSON.stringify(e.nativeEvent.coordinate))
                                    // }
                                    title={'Your Location'}
                                //   description={'This is a description of the marker'}
                                />
                            </MapView>
                        }
                    </View>
                    <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'space-between', maxHeight: 95, width: '100%' }}>
                        <Text style={{ fontSize: 18, marginLeft: 35, marginTop: 20, fontFamily: 'Rubik-Regular' }}> {items.name}</Text>

                        <TouchableOpacity onPress={() => fetchCurrentLocation()} style={{ alignSelf: 'flex-end', position: 'absolute', right: 5, top: 5 }}>
                            <Image source={require('../assets/images/refresh.png')}
                                style={{ height: 30, width: 30, tintColor: "#0E5EF2" }} />
                        </TouchableOpacity>

                    </View>

                    <View style={{ flexDirection: 'row', marginTop: 480, justifyContent: 'flex-end', marginHorizontal: 100 }}>
                        <BlueButton
                            containerStyle={{ minWidth: 0, flex: 1, marginRight: 5, bottom: 10 }}
                            title={'Update'}
                            onPress={() => fetchLocation()}
                        />
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    )
}
export default WorkPlaceTag;

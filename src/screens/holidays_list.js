import React, { useRef, useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { NavigationBar } from 'navigationbar-react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList } from 'react-native-gesture-handler';
import { style } from '../styles/style'
import { whiteColor, grayColor, inputBgColor } from '../styles/color'
import { useDispatch, useSelector } from 'react-redux'
import { apiUrl } from '../webservice/constant'
import { api } from '../webservice/api';
import Loader from '../components/loader';


const HolisdaysList = (props) => {

    const [holidayData, setHolidayData] = useState([])
    const isLoading = useSelector(state => state.loading)
    const [loader, setLoader] = useState(false);

    useEffect(() => {
        wcHolidayList()
    }, [])


    const renderItem = ({ item }) => (

        <View style={{ marginHorizontal: 10, backgroundColor: whiteColor, flexDirection: 'row', borderColor: grayColor, borderBottomWidth: 1, borderLeftWidth: 1, borderRightWidth: 1 }}>

            <Text style={[styles.itemTextStyle, { flex: 0.4, marginEnd: 1 }]}> {item?.dateStr} </Text>
            <Text style={{ width: 1, backgroundColor: grayColor }}></Text>
            <Text style={[styles.itemTextStyle, { flex: 0.6, }]}> {item?.name} </Text>

        </View>

    )

    const wcHolidayList = () => {

        setLoader(true);
        // isLoading = true;

        let holiday_list = `${apiUrl}${"/api/cms/dashboard/general_detail"}`
        api.postWithTokenNew(holiday_list, {

        }).then(async (jsonResponse) => {
            setLoader(false)
            if (jsonResponse.success) {
                if (jsonResponse?.item?.data?.holidays?.length > 0) {
                    setHolidayData(jsonResponse?.item?.data?.holidays)
                }

                let jsonData = JSON.stringify(jsonResponse)
                console.log("HolidayList Success Message", jsonData);

            } else {
                console.log("HolidayList Error Message **", jsonResponse.message ?? "Something went wrong!!");
            }
        }).catch(async (error) => {
            setLoader(false)
            console.log("HolidayList Error Message ***", "Something went wrong!!");
        })
    };


    return (
        <SafeAreaView style={style.header}>
            <NavigationBar
                navigationBarStyle={{ ...style.navigationBarStyle }}
                componentLeft={() =>
                    <View style={{ alignItems: 'flex-start', marginLeft: 5 }}>
                        <TouchableOpacity style={{ justifyContent: 'center', flexDirection: 'row' }} onPress={() => props.navigation.goBack(null)}>
                            <Image source={require('../assets/images/back.png')}
                                style={style.backIcon1} />
                            <Text style={style.headerText}>Holidays</Text>
                        </TouchableOpacity>
                    </View>
                }

            />
            <View style={{ flex: 1, backgroundColor: whiteColor, flexDirection: 'column' }}>
                <View style={{ marginTop: 10, marginLeft: 10, marginRight: 10, backgroundColor: whiteColor, flexDirection: 'row', borderColor: grayColor, borderWidth: 1 }}>

                    <Text style={[styles.textStyle, { flex: 0.4/* , marginEnd: 1 */ }]}> Date </Text>
                    <Text style={{ width: 1, backgroundColor: grayColor }}></Text>
                    <Text style={[styles.textStyle, { flex: 0.6, }]}> Name </Text>

                </View>

                <FlatList
                    data={holidayData}
                    renderItem={renderItem}
                    contentContainerStyle={{ flexGrow: 1 }}
                    ListEmptyComponent={
                        (loader) ? null : <Text style={style.emptyComponent}>No records available.</Text>
                    }
                />
                <Loader visible={loader} />
                <View style={{ padding: 20 }}></View>

            </View>
        </SafeAreaView>
    );

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        padding: 10,
        marginBottom: 70
    },
    dropdown: {
        height: 50,
        borderColor: '#D1D1D1',
        borderWidth: 1.5,
        borderRadius: 8,
        paddingHorizontal: 8,
        marginTop: 10,
        marginBottom: 7,
        backgroundColor: inputBgColor
    },
    icon: {
        marginRight: 5,
    },
    label: {
        position: 'absolute',
        backgroundColor: 'white',
        left: 22,
        top: 8,
        zIndex: 999,
        paddingHorizontal: 8,
        fontSize: 14,
    },
    placeholderStyle: {
        fontSize: 16,
        color: grayColor
    },
    selectedTextStyle: {
        fontSize: 16,
        color: 'black',
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
    },
    header: {
        fontSize: 20,
        color: 'blue'
    },
    textStyle: {
        textAlign: 'center',
        backgroundColor: '#00000029',
        padding: 14,
        fontFamily: 'Rubik-Medium',
        fontSize: 14,
        color: '#000000'
    },
    itemTextStyle: {
        textAlign: 'center',
        backgroundColor: '#FFFFFFFF',
        padding: 14,
        fontFamily: 'Rubik-Regular',
        fontSize: 14,
        color: '#000000'
    }
});
export default HolisdaysList;
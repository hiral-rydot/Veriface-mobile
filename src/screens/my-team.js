import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    SafeAreaView,
    TouchableOpacity,
    Image,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    StyleSheet,
    TextInput,
    Keyboard,
} from "react-native";
import { style } from "../styles/style";
import { NavigationBar } from "navigationbar-react-native";
import LinearGradient from "react-native-linear-gradient";
import { whiteColor, blueColor, darkGrayColor } from "../styles/color";
import { apiUrl, uploadUrl } from "../webservice/constant";
import { api } from "../webservice/api";
import { MY_TEAM } from "../webservice/constant";
import moment from "moment";

const PRESENT = 1;
const ABSENT = 2;
const ONLEAVE = 3;

const MyTeam = ({ navigation }) => {

    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());

    const [myTeamData, setMyTeamData] = useState(null);
    const [myTeamPresentData, setMyTeamPresentData] = useState(null);
    const [myTeamAbsentData, setMyTeamAbsentData] = useState(null);
    const [myTeamOnLeaveData, setMyTeamOnLeaveData] = useState(null);
    const [offset, setOffset] = useState(20);
    const [skip, setSkip] = useState(0);
    //const [skip, setSkip] = useState(0);
    const LIMIT = 20;
    const [hasMorePages, setHasMorePages] = useState(false);
    // const [isListEnd, setIsListEnd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const loadingNextPageRef = React.useRef(false);
    const [responseData, setResponseData] = useState();
    const [tabIndex, setTabIndex] = useState(0);
    const usersDictionaryRef = React.useRef(new Map());
    const [presentCount, setPresentCount] = useState('');
    const [absentCount, setAbsentCount] = useState('');
    const [onLeaveCount, setOnLeaveCount] = useState('');
    const [totalCount, setTotalCount] = useState('');
    const [searchByName, setSearchByName] = useState("");
    const [clicked, setClicked] = useState(false)
    const [showSearch, setShowSearch] = useState(false)

    useEffect(() => {
        webCallMyTeam(true);
    }, [searchByName]);

    useEffect(() => {
        console.log("*************UseEffect SKIP")
        if (skip > 0 && tabIndex == 0)
            webCallMyTeam()
                .then(() => { loadingNextPageRef.current = false; })
                .catch(() => { loadingNextPageRef.current = false; })
    }, [skip]);

    const viewPresentData = (jsonResponse) => {
        const result = jsonResponse?.list?.filter(col => {
            return jsonResponse?.presentTimeMembers?.find(id => id._id === col._id)
        })

        setMyTeamPresentData(result);
        //console.log("Present_Data", result);
    }

    const viewAbsentData = (jsonResponse) => {
        const result = jsonResponse?.list?.filter(col => {
            return jsonResponse?.onLeaves?.find(id => id._id === col._id)
        })

        //console.log("Absent_Data", result);
    }

    const renderFooter = () => {
        return (hasMorePages && tabIndex == 0) ? <View style={{ alignItems: 'center', padding: 20 }}>
            <ActivityIndicator
                animating={true}
                color='#4386F4'
                size="large" />
        </View> : null;
    };

    const onEndReached = () => {
        console.log("*************onEndReached SKIP", skip, loadingNextPageRef.current);
        if (!loadingNextPageRef.current && hasMorePages && tabIndex == 0) {
            loadingNextPageRef.current = true;
            console.log("*************onEndReached SKIP", skip, loadingNextPageRef.current);
            setSkip(skip + LIMIT);
        }
    }

    const webCallMyTeam = (refresh = false) => {
        console.log("webCallMyTeam********", refresh);
        setLoading(true);
        return new Promise((resolve, reject) => {
            let timeSlot = `${apiUrl}${MY_TEAM}`
            let payload = { skip: refresh ? 0 : skip, limit: LIMIT, sortBy: "name", sort: 'asc', name: searchByName, "filter": { fromDate: fromDate, toDate: toDate } };
            api.postWithTokenNew(timeSlot, payload).then(async (jsonResponse) => {
                console.log("1111******jsonResponse.list.length123********");
                if (jsonResponse.success) {
                    console.log("22222******jsonResponse.list.length123********");
                    if (refresh) {
                        setSkip(0);
                    }

                    let tempArray = [];
                    let tempPresentArray = [];
                    let tempAbsentArray = [];
                    let tempOnLeaveArray = [];


                    if (refresh) {
                        tempArray.push(...jsonResponse?.list);
                        tempPresentArray.push(...jsonResponse?.presentTimeMembers);
                        tempAbsentArray.push(...jsonResponse?.absentMembers);
                        tempOnLeaveArray.push(...jsonResponse?.onLeaves)
                    } else {
                        if (myTeamData) tempArray.push(...myTeamData);
                        tempArray.push(...jsonResponse?.list);

                        if (myTeamPresentData) tempPresentArray.push(...myTeamPresentData);
                        tempPresentArray.push(...jsonResponse?.presentTimeMembers);

                        if (myTeamAbsentData) tempAbsentArray.push(...myTeamAbsentData);
                        tempAbsentArray.push(...jsonResponse?.absentMembers)

                        if (myTeamOnLeaveData) tempOnLeaveArray.push(...myTeamOnLeaveData);
                        tempOnLeaveArray.push(...jsonResponse?.onLeaves)
                    }

                    //const map = new Map();
                    for (let val of jsonResponse?.list) {
                        usersDictionaryRef.current.set(val?._id, val);
                    }

                    for (let val of jsonResponse?.presentTimeMembers) {
                        //alert(val._id);
                        let listItem = usersDictionaryRef.current.get(val?._id);
                        //alert(JSON.stringify(listItem));
                        if (listItem) {
                            listItem.attendance = { status: PRESENT, authType: val?.authType, time: val?.time };
                        }
                    }

                    for (let val of jsonResponse?.onLeaves) {
                        let listItem = usersDictionaryRef.current.get(val?._id);
                        if (listItem) {
                            listItem.attendance = { status: ONLEAVE };
                        }
                    }

                    for (let val of jsonResponse?.absentMembers) {
                        let listItem = usersDictionaryRef.current.get(val?._id);
                        if (listItem) {
                            listItem.attendance = { status: ABSENT };
                        }
                    }

                    setMyTeamData(tempArray);
                    setTotalCount(jsonResponse?.count);
                    setPresentCount(tempPresentArray?.length);
                    setAbsentCount(tempAbsentArray?.length);
                    setOnLeaveCount(tempOnLeaveArray?.length);

                    setHasMorePages(jsonResponse?.list?.length >= LIMIT);
                    console.log("******jsonResponse.list.length********", jsonResponse?.list?.length);

                    // if (jsonResponse?.list?.length > 0) {
                    //     console.log("411111111", myTeamData)
                    //     setOffset(offset);
                    //     setSkip(skip + offset);
                    //     setResponseData(jsonResponse)
                    //     setMyTeamData([...(myTeamData ?? []), ...jsonResponse?.list])
                    //     setLoading(false);
                    // } else {
                    //     console.log("311111111")
                    //     setIsListEnd(true);
                    //     setLoading(false);
                    // }
                    // let jsonData = JSON.stringify(jsonResponse)

                    if (jsonResponse?.list?.length < LIMIT)
                        console.log("MyTeam Success Message", jsonResponse);
                    resolve();
                } else {
                    console.log("MyTeam Error Message **", jsonResponse?.message ?? "Something went wrong!!");
                    reject(jsonResponse?.message ?? "Something went wrong!!");
                }
                setLoading(false);
            }).catch(async (error) => {
                setLoading(false)
                console.log("MyTeam Error Message ***", "Something went wrong!!", error);
                reject(error);
            })
        });
    };


    const renderEmployeeType = ({ item }) => (
        tabIndex == 0 || tabIndex == item?.attendance?.status ?
            <View style={{ ...style.cardWhite, padding: 14, marginBottom: 15, borderRadius: 8, backgroundColor: '#FFFFFF', marginHorizontal: 18 }}>
                <TouchableOpacity onPress={() => {
                    navigation.navigate('TeamAttendance', { empid: item?._id, fromWhere: "myTeam" })
                }}>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            {/* <Image source={require('../assets/images/profilepic.png')}
                                style={{ width: 41, height: 42, borderRadius: 50, backgroundColor: "#00000029", marginRight: 12 }} /> */}
                            {(item?.profile_image) ?
                                <Image source={{ uri: uploadUrl + item?.profile_image }}
                                    style={{ width: 41, height: 42, borderRadius: 50, resizeMode: 'cover', marginRight: 12 }} />
                                : <Image source={require('../assets/images/profilepic.png')}
                                    style={{ width: 41, height: 42, borderRadius: 50, backgroundColor: "#00000029", marginRight: 12 }} />
                            }

                        </View>
                        {console.log("item data", item)}
                        <View style={{}}>
                            <Text style={{ fontSize: 14, fontFamily: 'Rubik-SemiBold', color: '#000000' }}>{item?.name}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 11 }}>
                                {item?.attendance?.status == 1 ?
                                    <Image source={require('../assets/images/watch.png')} style={{ height: 12, width: 12, marginRight: 6.67 }} />
                                    : null}
                                {item?.attendance?.status == 1 ?
                                    <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: item?.attendance?.status == 1 && item?.attendance?.authType == "in" ? "#33B36F" : "#FF2037" }}>{item?.attendance?.authType == "in" ? "In Time" : "Out Time"} {moment(item?.attendance?.time).format("hh:mm A")}</Text>
                                    :
                                    item?.attendance?.status == 2 ?
                                        <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: '#F74A49' }}>On Absent</Text>
                                        :
                                        <Text style={{ fontSize: 13, fontFamily: 'Rubik-Regular', color: '#F74A49' }}>On Leave</Text>

                                }
                            </View>
                            {item?.attendance?.status == 1 ?
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 11 }}>
                                    <Image source={require('../assets/images/calender.png')} style={{ height: 9, width: 9, marginRight: 6.97 }} />
                                    <Text style={{ fontSize: 10, fontFamily: 'Rubik-Regular', color: '#000000' }}>{moment(item?.attendance?.time).format("DD/MM/YYYY")}</Text>
                                </View>
                                : null}
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: "flex-end", flex: 1 }}>
                            <Image source={require('../assets/images/next.png')} style={{ height: 28, width: 28 }} />
                        </View>

                    </View>
                </TouchableOpacity>
            </View> : null
    )

    return (
        <SafeAreaView style={style.header}>
            <View style={{ backgroundColor: whiteColor, flex: 1 }}>
                <LinearGradient
                    start={{ x: 0.9, y: 0.0 }}
                    end={{ x: 1.0, y: 1.0 }}
                    colors={['#0E5EF2', '#b5cefb']}
                    style={{
                        paddingTop:15,
                        borderBottomLeftRadius: 25,
                        borderBottomRightRadius: 25,
                        height: 170
                    }}
                >
                    <NavigationBar
                        navigationBarStyle={{ /* ...style.navigationBarStyle, */ backgroundColor: "transprant" }}
                        componentLeft={() =>
                            <View style={{ alignItems: 'flex-start', marginLeft: 5 }}>
                                <TouchableOpacity style={{ justifyContent: 'center', flexDirection: 'row' }} onPress={() => navigation.goBack()}>
                                    <Image source={require('../assets/images/back.png')}
                                        style={style.backIcon1} />
                                    <Text style={style.headerText}>My Team</Text>
                                </TouchableOpacity>
                            </View>

                        }
                        componentRight={() =>
                            <View style={{ flexDirection: 'row', justifyContent: "space-between", alignItems: "center", right: 10 }}>


                                {/* Search Box */}
                                {showSearch ?
                                    <View style={{ ...styles.container }}>
                                        <View
                                            style={
                                                clicked
                                                    ? styles.searchBar__clicked
                                                    : styles.searchBar__unclicked
                                            }
                                        >
                                            {/* search Icon */}
                                            {clicked ? (
                                                <Image source={require('../assets/images/search1.png')} style={{ height: 14, width: 14, }} resizeMode="contain" />
                                            ) :
                                                <Image source={require('../assets/images/search1.png')} style={{ height: 14, width: 14, tintColor: 'transparent' }} resizeMode="contain" />
                                            }

                                            {/* Input field */}
                                            <TextInput
                                                style={{ ...styles.inputText, width: "90%", height: 35, marginStart: 10 }}
                                                placeholder="Search employee..."
                                                underlineColorAndroid="transparent"
                                                value={searchByName}
                                                onChangeText={(text) => {
                                                    setSearchByName(text)
                                                    if (!loading) {
                                                        setRefreshing(true);
                                                        console.log("Filtering***************");
                                                        webCallMyTeam(true)
                                                            .then(() => { setRefreshing(false) })
                                                            .catch(() => { setRefreshing(false) });
                                                    }
                                                }}
                                                onFocus={() => {
                                                    setClicked(true);
                                                }}
                                            />
                                            {/* cross Icon */}
                                            {clicked ? (

                                                <TouchableOpacity onPress={() => {
                                                    Keyboard.dismiss();
                                                    setClicked(false);
                                                    setSearchByName("")
                                                    if (!loading) {
                                                        setRefreshing(true);
                                                        setShowSearch(false)
                                                        console.log("Filtering***************");
                                                        webCallMyTeam(true)
                                                            .then(() => { setRefreshing(false) })
                                                            .catch(() => { setRefreshing(false) });
                                                    }
                                                }}>
                                                    <Image source={require('../assets/images/cross.png')} style={{ height: 18, width: 18, tintColor: '#999999', margin: 8 }} resizeMode='contain' />
                                                </TouchableOpacity>

                                            ) :
                                                <TouchableOpacity onPress={() => {
                                                    setClicked(true);
                                                }}>
                                                    <Image source={require('../assets/images/search1.png')} style={{ height: 14, width: 14, margin: 8}} resizeMode="contain" />
                                                </TouchableOpacity>
                                            }
                                        </View>

                                    </View> :
                                    <TouchableOpacity onPress={() => setShowSearch(true)}>
                                        <Image source={require('../assets/images/search1.png')} style={{ height: 18, width: 18, marginHorizontal: 12, tintColor: whiteColor }} resizeMode="contain" />
                                    </TouchableOpacity>}

                            </View>

                        }
                    />
                </LinearGradient>

                <View style={{ marginTop: -100, padding: 18 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <TouchableOpacity style={{ width: "48%" }} onPress={() => {
                            setTabIndex(0);
                        }}>
                            <View style={{ ...style.cardWhite, borderRadius: 8, backgroundColor: tabIndex == 0 ? "#0393FF" : "#FEF2E8" }}>
                                <Image source={require('../assets/images/totalmember.png')} style={{ height: 24, width: 39, tintColor: tabIndex == 0 ? '#FFFFFF' : null }} />
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24.8, alignItems: 'center' }}>
                                    <View>
                                        <Text style={{ ...style.rubikmidium, color: tabIndex == 0 ? '#FFFFFF' : "#000000" }}>Total</Text>
                                        <Text style={{ ...style.rubikmidium, color: tabIndex == 0 ? '#FFFFFF' : "#000000" }}>Member</Text>
                                    </View>
                                    <Text style={{ ...style.rubikmidium, fontSize: 20, color: tabIndex == 0 ? '#FFFFFF' : "#000000" }}>{totalCount}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ width: "48%" }} onPress={() => {
                            setTabIndex(PRESENT);
                        }}>
                            <View style={{ ...style.cardWhite, borderRadius: 8, backgroundColor: tabIndex == PRESENT ? "#0393FF" : "#F1F8EC" }}>
                                <Image source={require('../assets/images/PresentMember.png')} style={{ height: 32, width: 41, tintColor: tabIndex == PRESENT ? '#FFFFFF' : null }} />
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20.66, alignItems: 'center' }}>
                                    <View>
                                        <Text style={{ ...style.rubikmidium, color: tabIndex == PRESENT ? '#FFFFFF' : "#000000" }}>Present</Text>
                                        <Text style={{ ...style.rubikmidium, color: tabIndex == PRESENT ? '#FFFFFF' : "#000000" }}>Member</Text>
                                    </View>
                                    <Text style={{ ...style.rubikmidium, fontSize: 20, color: tabIndex == PRESENT ? '#FFFFFF' : "#000000" }}>{presentCount}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
                        <TouchableOpacity style={{ width: "48%" }} onPress={() => {
                            setTabIndex(ABSENT);
                        }}>
                            <View style={{ ...style.cardWhite, borderRadius: 8, backgroundColor: tabIndex == ABSENT ? "#0393FF" : "#F2F0FF" }}>
                                <Image source={require('../assets/images/AbsentMember.png')} style={{ height: 30, width: 39, tintColor: tabIndex == ABSENT ? '#FFFFFF' : null }} />
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 18.32, alignItems: 'center' }}>
                                    <View>
                                        <Text style={{ ...style.rubikmidium, color: tabIndex == ABSENT ? '#FFFFFF' : "#000000" }}>Absent</Text>
                                        <Text style={{ ...style.rubikmidium, color: tabIndex == ABSENT ? '#FFFFFF' : "#000000" }}>Member</Text>
                                    </View>
                                    <Text style={{ ...style.rubikmidium, fontSize: 20, color: tabIndex == ABSENT ? '#FFFFFF' : "#000000" }}>{absentCount}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ width: "48%" }} onPress={() => {
                            setTabIndex(ONLEAVE);
                        }}>
                            <View style={{ ...style.cardWhite, borderRadius: 8, backgroundColor: tabIndex == ONLEAVE ? "#0393FF" : "#EAEDF5" }}>
                                <Image source={require('../assets/images/MemberOnLeave.png')} style={{ height: 31, width: 41, tintColor: tabIndex == ONLEAVE ? '#FFFFFF' : null }} />
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 21.65, alignItems: 'center' }}>
                                    <View>
                                        <Text style={{ ...style.rubikmidium, color: tabIndex == ONLEAVE ? '#FFFFFF' : "#000000" }}>Member</Text>
                                        <Text style={{ ...style.rubikmidium, color: tabIndex == ONLEAVE ? '#FFFFFF' : "#000000" }}>On Leave</Text>
                                    </View>
                                    <Text style={{ ...style.rubikmidium, fontSize: 20, color: tabIndex == ONLEAVE ? '#FFFFFF' : "#000000" }}>{onLeaveCount}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* <View style={{ paddingHorizontal: 18 }}> */}
                {myTeamData ? <FlatList
                    data={myTeamData}
                    // style={{ height: 30 }}
                    renderItem={renderEmployeeType}
                    ListFooterComponent={renderFooter}
                    onEndReached={onEndReached}
                    onEndReachedThreshold={0.5}
                    ListHeaderComponent={() => (parseInt(myTeamData?.length) === 0 ?
                        <Text style={style.empText}>No data found</Text>
                        : null)}
                    ListEmptyComponent={() => (parseInt(myTeamData?.length) === 0 ?
                        <Text style={{ ...style.empText, textAlign: 'center', marginTop: '50%', fontFamily: 'Rubik-Regular' }}>No data found</Text>
                        : null)
                    }
                    refreshControl={<RefreshControl onRefresh={() => {
                        if (!loading) {
                            setRefreshing(true);
                            console.log("refreshing***************");
                            webCallMyTeam(true)
                                .then(() => { setRefreshing(false) })
                                .catch(() => { setRefreshing(false) });
                        }
                    }
                    }
                        refreshing={refreshing} colors={[blueColor]} tintColor={blueColor}
                    />}
                // }

                /> : <ActivityIndicator
                    animating={true}
                    color='#4386F4'
                    size="large" />}
                {/* </View> */}
                <TouchableOpacity style={{ ...style.floatingButton, right: 18, bottom: 43, backgroundColor: '#0393FF' }} onPress={() => {
                    navigation.navigate('TeamAttendanceHistory'/* , { wsRequestList: wsRequestList } */)
                }}>
                    <Image source={require('../assets/images/Attendance-History.png')} style={{ tintColor: whiteColor }} />
                </TouchableOpacity>
            </View>


        </SafeAreaView>
    )
}



const styles = StyleSheet.create({
    container: {
        marginHorizontal: 10,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.32,
        shadowRadius: 15,
        elevation: 3,
        shadowColor: '#171717',
        borderColor: "transparent",
        height: 25,
        marginStart: '10%',
        width: '73%'
    },
    searchBar__unclicked: {

        flexDirection: "row",
        width: "100%",
        backgroundColor: "#FFFFFF",
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "space-evenly",
        paddingHorizontal: 20
    },
    searchBar__clicked: {
        paddingHorizontal: 20,
        flexDirection: "row",
        width: "100%",
        backgroundColor: "#FFFFFF",
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "space-evenly",
    },
    inputText: {
        color: darkGrayColor,
        fontSize: 14,
        fontFamily: 'Rubik-Regular',
        alignContent: "center",
        padding: 5
    },
});


export default MyTeam;


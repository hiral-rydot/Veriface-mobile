import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    TextInput
} from 'react-native';
import { style } from '../styles/style'
import { NavigationBar } from 'navigationbar-react-native'
import { getObject, setObject } from '../utils/storage'
import { iconColor, whiteColor } from '../styles/color'
import { useDispatch, useSelector } from 'react-redux'
import { apiWorkplaceList } from '../actions'
const WorkplaceList = ({ navigation }) => {
    const limit = 20
    const [skip, setSkip] = useState(0)
    const [totalWorkplace, setTotalWorkplace] = useState(0)
    let [checkValue, setCheckValue] = useState(false)
    const [searchText, setSearchText] = useState('')
    const [applySearch, setApplySearch] = useState(false)
    const [workplaceArray, setworkplaceArray] = useState([]);
    let resWorkplaceList = useSelector(state => state.resWorkplaceList)
    let isLoading = useSelector(state => state.loading)
    const dispatch = useDispatch()

    useEffect(() => {
        resWorkplaceList = null;
        wsWorkplaceList()
        async function getLogin() {
            let loginObjP = await getObject("dataLogin")
            for (let i = 0; i < loginObjP.length; i++) {
                if (loginObjP[i] === "workplaces.update") {
                    setCheckValue(true)
                }
            }
        }
        getLogin()
    }, [])

    useEffect(() => {
        if (resWorkplaceList && resWorkplaceList.success) {
            setTotalWorkplace(resWorkplaceList.count)
            setworkplaceArray([...workplaceArray, ...resWorkplaceList.list])
        }
    }, [resWorkplaceList])

    useEffect(() => {
        if (!isLoading && skip > 0 && skip <= totalWorkplace) {
            wsWorkplaceList()
        }
    }, [skip])

    useEffect(() => {
        if (applySearch) {
            wsWorkplaceList()
            setApplySearch(false)
        }
    }, [applySearch])

    const wsWorkplaceList = () => {
        let data = {
            skip: skip,
            limit: limit,
            sortBy: "createdAt",
            sort: "desc",
            q: searchText
        }
        dispatch(apiWorkplaceList(data))
    }

    const RenderItem = React.memo(({ item }) => (
        <View style={[style.cardWhite, { margin: 10 }]}>
            <View style={{ flexDirection: 'column', flex: 1 }}>
                <Text style={style.blueTextBold}>{item.item.name}</Text>
                <View style={{ flexDirection: 'row', alignSelf: 'flex-end' }}>
                    <TouchableOpacity onPress={() => navigation.navigate('Employeeallot', { item: item })} style={{ width: 50, }}>
                        <Image source={require('../assets/images/AboutTurnout.png')} style={{ alignSelf: 'flex-end', height: 25, width: 25, tintColor: "#0E5EF2" }} />
                    </TouchableOpacity>
                    {checkValue ?
                        <TouchableOpacity onPress={() => navigation.navigate('WorkPlaceTag', { item: item })} style={{ width: 50, alignItems: 'flex-end' }}>
                            <Image source={require('../assets/images/pin-2.png')} style={{ height: 20, width: 20, tintColor: "#0E5EF2" }} />
                        </TouchableOpacity> : null}
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 0 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View>
                        <Text style={[style.grayText,]}>Address</Text>
                        <View style={{ flexDirection: 'row', marginTop: 3, justifyContent: 'space-between', marginVertical: 0, maxWidth: 200 }}>
                            <Text style={[style.darkGrayText, { marginRight: 10 }]}>{item.item.address}</Text>
                        </View>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View>
                        <Text style={[style.grayText,]}>ZipCode</Text>
                        <View style={{ flexDirection: 'row', marginTop: 3, justifyContent: 'space-between' }}>
                            <Text style={[style.darkGrayText, { marginRight: 5, }]}>{item.item.zipcode}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>

    ))
    const renderListFooter = () => {
        return (skip > 0 && skip <= totalWorkplace) ? <View style={{ alignItems: 'center', padding: 20 }}>
            <ActivityIndicator
                animating={true}
                color='#4386F4'
                size="large" />
        </View> : null
    }
    return (
        <SafeAreaView style={style.header}>
            <View style={{ flex: 1, backgroundColor: whiteColor }}>
                <NavigationBar
                    navigationBarStyle={{ ...style.navigationBarStyle }}
                    componentLeft={() =>
                        <View style={{ alignItems: 'flex-start', marginLeft: 5 }}>
                            <TouchableOpacity style={{ justifyContent: 'center', flexDirection: 'row' }} onPress={() => navigation.goBack(null)}>
                                <Image source={require('../assets/images/back.png')}
                                    style={style.backIcon1} />
                                <Text style={style.headerText}>Workplace</Text>
                            </TouchableOpacity>
                        </View>

                    } />
                <View style={[style.inputContainer, { margin: 10, paddingVertical: 5 }]}>
                    <Image source={require('../assets/images/search.png')}
                        style={{ width: 25, height: 25 }} />

                    <TextInput style={[style.inputText, { flex: 1, marginLeft: 10 }]}
                        placeholder={'Search'}
                        onChangeText={(text) => setSearchText(text)}
                        returnKeyType={'search'}
                        onSubmitEditing={() => {
                            setworkplaceArray([])
                            setSkip(0)
                            setTotalWorkplace(0)
                            setApplySearch(true)
                        }} />
                </View>
                <FlatList
                    data={workplaceArray}
                    renderItem={(item) => <RenderItem item={item} />}
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyExtractor={item => item._id}
                    onEndReachedThreshold={0.2}
                    onEndReached={() => setSkip(skip + limit)}
                    ListFooterComponent={renderListFooter}
                />
            </View>
        </SafeAreaView>
    )
}
export default WorkplaceList;
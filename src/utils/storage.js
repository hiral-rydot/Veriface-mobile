import AsyncStorage from '@react-native-async-storage/async-storage'
const setString = async (key, value) => {
    try {
        await AsyncStorage.setItem(key, value)
    } catch (e) {
        // saving error
    }
}

const getString = async (key) => {
    try {
        const value = await AsyncStorage.getItem(key)
        return value
    } catch (e) {
        ''
    }
}

const setObject = async (key, value) => {
    try {
        const jsonValue = JSON.stringify(value)
        await AsyncStorage.setItem(key, jsonValue)
    } catch (e) {
        // saving error
    }
}
const getObject = async (key) => {
    try {
        const jsonValue = await AsyncStorage.getItem(key)
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
        return null
    }
}

const clearAll = async () => {
    try {
        await AsyncStorage.clear()
    } catch (e) {
        // clear error
    }
}

export  { setString, getString, setObject, getObject, clearAll }
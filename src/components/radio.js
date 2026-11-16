import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, Dimensions } from "react-native";


{/* <RadioButton data={data} onSelect={(value) => setOption(value)} radioStyle={{ flexDirection: 'row', }} /> */ }
// const data = [
//     { _id: 1, value: 'Apple' },
//     { _id: 2, value: 'Samsung' },
//     { _id: 3, value: 'Blackberry' },
// ];

const RadioButton = ({ data, onSelect, radioStyle, label }) => {
    const [userOption, setUserOption] = useState(null);
    const selectHandler = (value) => {
        onSelect(value);
        setUserOption(value);
    };
    return (
        <View style={radioStyle}>
            {data.map((item) => {
                return (
                    <Pressable
                        style={
                            item.value === userOption ? styles.selected : styles.unselected
                        }
                        onPress={() => selectHandler(item._id
                        )}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', width: data.length == 2 ? Dimensions.get('window').width / 2 : null, }}>
                            <View style={{ borderWidth: 1, borderRadius: 20, height: 20, width: 20, alignItems: 'center', justifyContent: 'center', borderColor: item._id === userOption ? "#0393FF" : '#9496A1' }}>
                                <View style={{ borderRadius: 15, height: 15, width: 15, backgroundColor: item._id === userOption ? "#0393FF" : "transparent" }}></View>
                            </View>
                            <Text style={{ fontSize: 14, fontFamily: 'Rubik-Regular', color: "#555555", marginLeft: 5 }}>{item.value}</Text>
                        </View>
                    </Pressable>
                );
            })}
        </View>
    );
}


const styles = StyleSheet.create({
    option: {
        fontSize: 20,
        color: '#000000',

    },
    unselected: {

        margin: 5,
    },
    selected: {
        // backgroundColor: 'blue',
        margin: 5,
        // padding: 10,
        // borderRadius: 10,
    },
});
export default RadioButton;
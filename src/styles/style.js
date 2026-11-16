import { StyleSheet, Dimensions } from 'react-native';
import { blueColor, borderColor, darkGrayColor, grayColor, inputBgColor, whiteColor, greenColor, redColor, iconColor } from './color';
import { getStatusBarHeight, ifIphoneX } from 'react-native-iphone-x-helper'
import { isIphoneX } from 'react-native-iphone-x-helper'

export const style = StyleSheet.create({

  header: {
    flex: 1,

    ...ifIphoneX({
      backgroundColor: '#0E5EF2',
      paddingTop: 0
    },
      {
        backgroundColor: '#0E5EF2',
        paddingTop: 0
      }
    )
  },

  menuIcon: {
    height: 50, width: 50
  },
  backIcon1: {
    marginHorizontal: 10,
    resizeMode: 'contain',
    width: 15,
    height: 15,
    alignSelf: 'center',
    tintColor: "white"

  },
  backIcon: {
    alignSelf: 'flex-start'
  },
  backIconiOS: {
    alignSelf: 'flex-start',
    height: 40,
    width: 40,
  },
  navigationBarStyle: {
    backgroundColor: '#0E5EF2'
  },
  headerText: {
    color: darkGrayColor,
    fontSize: 16,
    // marginLeft: 10,
    fontFamily: 'Rubik-Medium',
    color: 'white'
  },

  dashbordLabel: {
    color: darkGrayColor,
    fontSize: 18,
    // fontWeight: 'bold',
    fontFamily: "Rubik-Bold"
  },
  blueText: {
    // color: blueColor,
    color: '#0E5EF2',
    fontSize: 15,
    fontFamily: 'Rubik-Regular'
  },
  blueTextBold: {
    // color: blueColor,
    color: '#0E5EF2',
    fontSize: 16,
    // fontWeight: 'bold',
    fontFamily: 'Rubik-Bold'
  },
  grayText: {
    color: grayColor,
    fontSize: 15,
    fontFamily: 'Rubik-Regular'
    // fontFamily: '../assets/fonts/SF-Pro-Display-Semibold.otf'
  },
  rubikmidium: {
    fontFamily: 'Rubik-Medium', fontSize: 16, color: '#000000'
  },
  rubikmidium14: {
    fontFamily: 'Rubik-Medium', fontSize: 14, color: '#000000'
  },
  darkGrayText: {
    color: darkGrayColor,
    fontSize: 15,
    fontFamily: 'Rubik-Regular'
    // fontFamily: '../assets/fonts/SF-Pro-Display-Semibold.otf'
  },
  redText: {
    color: redColor,
    fontSize: 15,
    fontFamily: 'Rubik-Regular'
    // fontFamily: '../assets/fonts/SF-Pro-Display-Semibold.otf'
  },
  greenText: {
    color: greenColor,
    fontSize: 15,
    fontFamily: 'Rubik-Regular'
    // fontFamily: '../assets/fonts/SF-Pro-Display-Semibold.otf'
  },
  whiteText: {
    color: whiteColor,
    fontSize: 15,
    fontFamily: 'Rubik-Regular'
    // fontFamily: '../assets/fonts/SF-Pro-Display-Semibold.otf'
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomColor: borderColor,
    borderBottomWidth: 1,
    height: 50
  },
  leaveCountText: {
    // color: blueColor,
    color: '#0E5EF2',
    fontSize: 18,
    // fontWeight: '700',
    fontFamily: "Rubik-SemiBold"
    // marginTop: 10
  },
  leaveTypeText: {
    color: darkGrayColor,
    fontSize: 15,
    textAlign: 'center',
    fontFamily: "Rubik-SemiBold"
  },
  leaveCountContainer:
  {
    marginBottom: 10,
    alignSelf: 'stretch',
    borderColor: borderColor,
    borderWidth: 1,
    borderRadius: 10,
    // padding: 15,
    paddingVertical: 10,
    // paddingBottom: 10,
    alignItems: 'center'
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 10
  },
  menuItemText: {
    color: darkGrayColor,
    fontSize: 15,
    marginLeft: 25,
    fontFamily: 'Rubik-Regular'
  },
  emptyComponent: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    fontSize: 15,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontFamily: 'Rubik-Regular'
  },
  cardWhite: {
    backgroundColor: whiteColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.32,
    shadowRadius: 5.46,
    elevation: 9,
    borderRadius: 20,
    padding: 20
  },
  appUpdateContainer:
  {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    backgroundColor: blueColor
  },
  shiftTimeContainer:
  {
    justifyContent: 'center',
    paddingLeft: 10,
    flex: 1,
    borderTopLeftRadius: 50,
    borderBottomLeftRadius: 50,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: inputBgColor,
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 20
  },
  inputText: {
    color: darkGrayColor,
    fontSize: 15,
    height: 40,
    fontFamily: 'Rubik-Regular'
  },
  inputTextIOS: {
    color: darkGrayColor,
    fontSize: 15,
    height: 40,
    fontFamily: 'Rubik-Regular'
  },
  inputTextDate: {
    color: darkGrayColor,
    fontSize: 15,
    fontFamily: 'Rubik-Regular'
  },
  floatingButton: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    position: 'absolute',
    bottom: 10,
    right: 10,
    height: 60,
    // backgroundColor: blueColor,
    backgroundColor: '#0E5EF2',
    borderRadius: 100,
  },
  downloadArrow: {
    borderWidth: 1,
    borderColor: borderColor,
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    backgroundColor: redColor,
    borderRadius: 20,
  },
  editProfilePic: {
    position: 'absolute',
    bottom: 10,
    right: 0,
    // backgroundColor: blueColor,
    backgroundColor: '#0E5EF2',
    borderRadius: 25,
    padding: 7
  },
  empText: {
    color: "#444444",
    bottom: 30,
    textAlign: 'right',
    fontSize: 18,
    // fontWeight: 'bold',
    fontFamily: 'Rubik-Bold'
  },
  footer: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
});
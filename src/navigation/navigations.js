import { Animated, Easing } from 'react-native';
import { createAppContainer } from "react-navigation";
import { createStackNavigator } from 'react-navigation-stack';
import Splash from '../screens/splash';
import Login from '../screens/login';
import ForgotPwd from '../screens/forgotpwd';
import OtpCode from '../screens/otp-code';
import ResetPwd from '../screens/resetpwd';
import Dashboard from '../screens/dashboard';
import Profile from '../screens/profile';
import Attendance from '../screens/attendance';
import AttendanceHistory from '../screens/attendance-history';
import AttendanceDetail from '../screens/attendance-detail';
import Leave from '../screens/leave';
import NewLeave from '../screens/leave-new';
import LeaveDetails from '../screens/leave-details';
import TeamRequest from '../screens/team-request';
import NewRequest from '../screens/request-new';
import RequestDetails from '../screens/request-details';
import CheckInOut from '../screens/check-inout'
import SelectImage from '../screens/select-image'
import AboutUs from '../screens/about-us'
import Registration from '../screens/registration'
import SignupGuest from '../screens/signup-guest'
import AttendanceHistoryDetail from '../screens/attendance-history-details'
import WorkplaceList from '../screens/workplace'
import WorkPlaceTag from '../screens/workplace-tag'
import Employeeallot from '../screens/empAllotment'
import OfflineAttendance from '../screens/offlineAttendance'
import Team from '../screens/team';
import MyTeam from '../screens/my-team';
import TeamAttendance from '../screens/team-attendance';
import TeamAttendanceHistory from '../screens/team-attendance-history';
import MyRequest from '../screens/my-request';
import VisitorRequest from '../screens/visitor-request';
import MyVisitor from '../screens/my_visitor';
import VisitorAttendanceHistory from '../screens/visitor-attendance-history';
import VisitorAttendance from '../screens/visitor-attendance';
import VisitorHistory from '../screens/visitor-history'
import AddMyRequest from '../screens/add-request';
import HolisdaysList from '../screens/holidays_list';


export const AppNavigator = createStackNavigator({
    Splash: Splash,
    Login: Login,
    Dashboard: Dashboard,
    ForgotPwd: ForgotPwd,
    OtpCode: OtpCode,
    ResetPwd: ResetPwd,
    Profile: Profile,
    Attendance: Attendance,
    AttendanceHistory: AttendanceHistory,
    Leave: Leave,
    NewLeave: NewLeave,
    LeaveDetails: LeaveDetails,
    TeamRequest: TeamRequest,
    AttendanceDetail: AttendanceDetail,
    NewRequest: NewRequest,
    RequestDetails: RequestDetails,
    CheckInOut: CheckInOut,
    SelectImage: SelectImage,
    AboutUs: AboutUs,
    Registration: Registration,
    SignupGuest: SignupGuest,
    AttendanceHistoryDetail: AttendanceHistoryDetail,
    WorkplaceList: WorkplaceList,
    WorkPlaceTag: WorkPlaceTag,
    Employeeallot: Employeeallot,
    OfflineAttendance: OfflineAttendance,
    Team: Team,
    MyTeam: MyTeam,
    TeamAttendance: TeamAttendance,
    TeamAttendanceHistory: TeamAttendanceHistory,
    MyRequest: MyRequest,
    VisitorRequest, VisitorRequest,
    MyVisitor: MyVisitor,
    VisitorAttendanceHistory: VisitorAttendanceHistory,
    VisitorAttendance: VisitorAttendance,
    VisitorHistory: VisitorHistory,
    AddMyRequest: AddMyRequest,
    HolisdaysList: HolisdaysList,
},
    {
        initialRouteName: "Login",
        defaultNavigationOptions: {
            headerShown: false
        },
        // transitionConfig: () => ({
        //     transitionSpec: {
        //         duration: 300,
        //         easing: Easing.out(Easing.poly(4)),
        //         timing: Animated.timing,
        //     },
        //     screenInterpolator: sceneProps => {
        //         const { layout, position, scene } = sceneProps;
        //         const { index } = scene;
        //         const width = layout.initWidth;
        //         const translateX = position.interpolate({
        //             inputRange: [index - 1, index, index + 1],
        //             outputRange: [width, 0, 0],
        //         });

        //         const opacity = position.interpolate({
        //             inputRange: [index - 1, index - 0.99, index],
        //             outputRange: [0, 1, 1],
        //         });

        //         return { opacity, transform: [{ translateX: translateX }] };
        //     },
        // })
    },

);
export default createAppContainer(AppNavigator);
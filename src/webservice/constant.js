export const gradientColors = ['#0a80f5', '#0097fb', '#00abfa', '#00bcf3', '#0bcceb']
export const borderColor = '#d4d4d4'
export const labelTextColor = '#616569'
export const valueTextColor = '#75787b'

// const apiUrl = 'http://turnout.cloud:9128';
// const apiUrl = 'http://api.turnout.cloud';

// const apiUrl = 'http://dev.turnout.cloud'
// const apiUrl = 'https://demo.turnout.cloud'
// const apiUrl = 'https://api.turnout.cloud'     //live url
//const apiUrl = 'https://tavm.it-av.support'   //serco url hiral old
const apiUrl = 'http://139.59.94.164:9128'
//const apiUrl = 'http://10.104.92.92:9128'


// const apiUrl = 'http://104.237.4.152:9128';
// const apiUrl = 'http://192.168.2.26:9128';      //Jitesh's system
// const apiUrl = 'http://192.168.2.17:9128';          //sandeep sir system



const uploadUrl = apiUrl + "/uploads/";
const updateStatusUrl = "/api/cms/leave-management/update-status/";
export class AppUrls {
    static ANDROID_STORE = 'https://play.google.com/store/apps/details?id=com.rydotinfotech.turnout'
    static IOS_STORE = 'itms-apps://itunes.apple.com/us/app/1535149142'
    static TURNOUT = 'https://www.turnout.cloud/'
}

export default class StorageKey {
    static KEY_RES_LOGIN = '@login'
    static KEY_CLIENT_SETTING = '@client_setting'
    static KEY_PROFILE = '@profile'
    static KEY_TOKEN = '@token'
    static KEY_FCM_TOKEN = '@fcm_token'
    static KEY_LATITUDE = '@latitude'
    static KEY_LONGITUDE = '@longitude'
    static KEY_ID = '@login_id'

}

export class RegistrationStatus {
    static NOTSTARTED = 'notstarted'
    static PENDING = 'pending'
    static SUCCESS = 'success'
    static ERROR = 'error'
}
export class ResourceArray {
    static statusArr = [
        { _id: 'pending', name: 'Pending' },
        { _id: 'approve', name: 'Approve' },
        { _id: 'reject', name: 'Reject' }
    ]
}


export const MY_TEAM = "/api/cms/dashboard/team/metastate";
export const TEAM_ATTENDANCE_LIST = "/api/cms/attendance/team/list";
export const TEAM_HISTORY = "/api/cms/attendance-report/team/list";


export const MY_VISITOR = "/api/cms/dashboard/visitor/metastate";
export const VISITOR_ATTENDANCE_LIST = "/api/cms/attendance/visitor/list";
export const VISITOR_HISTORY = "/api/cms/visitor-report/list";
export const markAsSafeUrl = "/api/cms/emergency-evacuation/mark-me-safe";
export const APPROVE_REJECT_VISITOR = "/api/cms/visitor-qr-code/update/";


export { apiUrl, uploadUrl, updateStatusUrl };
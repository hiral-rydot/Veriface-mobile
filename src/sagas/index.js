import { put, all, call, take, actionChannel } from 'redux-saga/effects';
import { api } from '../webservice/api';

//login
function* fetchsignin(data) {
  const usersignin = yield api.postWithPayloadwithToken(
    '/api/cms/auth/signin',
    data
  );
  yield put({ type: 'SIGNIN_RESPONSE', usersignin });
}
function* actionWatcher() {
  const requestlogin = yield actionChannel('login');
  while (true) {
    const { data } = yield take(requestlogin);
    yield call(fetchsignin, data);
  }
}

//otp

function* generateOtp(data) {
  const requestOtp = yield api.postWithPayloadwithToken(
    '/api/cms/auth/otp-request',
    data
  );
  yield put({ type: 'RESPONSE_OTP', requestOtp });
}
function* actionWatcherOtp() {
  const requestOtp = yield actionChannel('otp');
  while (true) {
    const { data } = yield take(requestOtp);
    yield call(generateOtp, data);
  }
}

//reset-password
function* resetPwd(data) {
  const resetPassword = yield api.postWithPayloadwithToken(
    '/api/cms/auth/reset-password',
    data
  );
  yield put({ type: 'RESPONSE_RESETPWD', resetPassword });
}
function* actionWatcherResetpwd() {
  const requestOtp = yield actionChannel('resetpwd');
  while (true) {
    const { data } = yield take(requestOtp);
    yield call(resetPwd, data);
  }
}

//get profile
function* getProfile(data) {
  const myprofile = yield api.postWithPayloadwithToken(
    '/api/cms/profile/get/my-profile',
    data
  );
  yield put({ type: 'RESPONSE_GETPROFILE', myprofile });
}
function* actionWatcherGetProfile() {
  const profile = yield actionChannel('getprofile');
  while (true) {
    const { data } = yield take(profile);
    yield call(getProfile, data);
  }
}

//update profile
function* updateProfile(data) {
  const updateprofile = yield api.postWithPayloadwithToken(
    '/api/cms/profile/update/my-profile',
    data
  );
  yield put({ type: 'RESPONSE_UPDATEPROFILE', updateprofile, data: data });
}
function* actionWatcherUpdateProfile() {
  const profile = yield actionChannel('updateprofile');
  while (true) {
    const { data } = yield take(profile);
    yield call(updateProfile, data);
  }
}

//dashboard
function* getDashboard(data) {
  const dashboard = yield api.postWithPayloadwithToken(
    '/api/cms/dashboard/mobile_dashboard',
    data
  );
  yield put({ type: 'RESPONSE_DASHBOARD', dashboard });
}
function* actionWatcherDashboard() {
  const dashboard = yield actionChannel('dashboard');
  while (true) {
    const { data } = yield take(dashboard);
    yield call(getDashboard, data);
  }
}

//Today Attendance
function* attendance(data) {
  const resAttendance = yield api.postWithPayloadwithToken(
    '/api/cms/dashboard/monthly_attendence_list',
    data
  );
  yield put({ type: 'response_attendance', resAttendance });
}
function* actionWatcherAttendance() {
  const attendancenChannel = yield actionChannel('attendance');
  while (true) {
    const { data } = yield take(attendancenChannel);
    yield call(attendance, data);
  }
}

//attendanceReport
function* attendanceReport(data) {
  const resAttendanceReport = yield api.postWithPayloadwithToken(
    '/api/cms/mobile/attendenceReports',
    data
  );
  yield put({ type: 'response_attendanceReport', resAttendanceReport });
}
function* actionWatcherAttendanceReport() {
  const attendanceReportChannel = yield actionChannel('attendanceReport');
  while (true) {
    const { data } = yield take(attendanceReportChannel);
    yield call(attendanceReport, data);
  }
}
//Check In
function* checkInOut(data) {
  const resCheckInOut = yield api.postWithPayloadwithToken(
    '/api/cms/attendance/employee_attendence_mobile_in_out_multiple_wp',
    // '/api/cms/attendance/employee_attendence_mobile_in_out',
    data
  );
  yield put({ type: 'response_checkinout', resCheckInOut });
}
function* actionWatcherCheckIn() {
  const checkInOutChannel = yield actionChannel('checkinout');
  while (true) {
    const { data } = yield take(checkInOutChannel);
    yield call(checkInOut, data);
  }
}

//Leave Create
function* leaveCreate(data) {
  const resLeaveCreate = yield api.postWithPayloadwithToken(
    '/api/cms/leave-management/create',
    data
  );
  yield put({ type: 'response_leaveCreate', resLeaveCreate });
}
function* actionWatcherLeaveCreate() {
  const leaveCreateChannel = yield actionChannel('leaveCreate');
  while (true) {
    const { data } = yield take(leaveCreateChannel);
    yield call(leaveCreate, data);
  }
}

//Leave List
function* leaveList(data) {
  const resLeaveList = yield api.postWithPayloadwithToken(
    '/api/cms/mobile/leave-list',
    data
  );
  yield put({ type: 'response_leaveList', resLeaveList });
}

function* actionWatcherLeaveList() {
  const leaveListChannel = yield actionChannel('leaveList');
  while (true) {
    const { data } = yield take(leaveListChannel);
    yield call(leaveList, data);
  }
}

//team leave list
function* teamLeaveList(data) {
  const resTeamLeaveList = yield api.postWithPayloadwithToken(
    // '/api/cms/mobile/leave-list',
    '/api/cms/teamLeave/list',     //team leave list
    data
  );
  yield put({ type: 'response_teamLeaveList', resTeamLeaveList });
}

function* actionWatcherTeamLeaveList() {
  const teamLeaveListChannel = yield actionChannel('teamLeaveList');
  while (true) {
    const { data } = yield take(teamLeaveListChannel);
    yield call(teamLeaveList, data);
  }
}

//Leave Type
function* leaveType(data) {
  const resLeaveType = yield api.postWithPayloadwithToken(
    '/api/cms/EmployeeLeaveMaster/search',
    data
  );
  yield put({ type: 'response_leaveType', resLeaveType });
}
function* actionWatcherLeaveType() {
  const leaveTypeChannel = yield actionChannel('leaveType');
  while (true) {
    const { data } = yield take(leaveTypeChannel);
    yield call(leaveType, data);
  }
}

//Request Create
function* requestCreate(data) {
  const resRequestCreate = yield api.postWithPayloadwithToken(
    '/api/cms/request/create',
    data
  );
  yield put({ type: 'response_requestCreate', resRequestCreate });
}
function* actionWatcherRequestCreate() {
  const requestCreateChannel = yield actionChannel('requestCreate');
  while (true) {
    const { data } = yield take(requestCreateChannel);
    yield call(requestCreate, data);
  }
}

//Request List
function* requestList(data) {
  const resRequestList = yield api.postWithPayloadwithToken(
    '/api/cms/mobile/request-list',
    data
  );
  yield put({ type: 'response_requestList', resRequestList });
}
function* actionWatcherRequestList() {
  const requestListChannel = yield actionChannel('requestList');
  while (true) {
    const { data } = yield take(requestListChannel);
    yield call(requestList, data);
  }
}

//setFcmToken
function* setFcmToken(data) {
  const resFcmToken = yield api.postWithPayloadwithToken(
    '/api/cms/profile/updateDeviceInfo',
    data
  );
  yield put({ type: 'response_fcmToken', resFcmToken });
}
function* actionWatcherSetFcmToken() {
  const setFcmTokenChannel = yield actionChannel('setFcmToken');
  while (true) {
    const { data } = yield take(setFcmTokenChannel);
    yield call(setFcmToken, data);
  }
}

//logout
function* logout(data) {
  // const logout_recieve = yield api.postWithPayloadwithToken(
  //   '/api/auth/signout',
  //   data
  // );
  yield put({ type: 'receive_logout', undefined });
}
function* actionWatcherlogout() {
  const requestlogout = yield actionChannel('logout');
  while (true) {
    const { data } = yield take(requestlogout);
    yield call(logout, data);
  }
}


//change password
function* changePassword(data) {
  const resChangepwd = yield api.postWithPayloadwithToken(
    '/api/cms/employees/change_password',
    data
  );
  yield put({ type: 'response_changepwd', resChangepwd });
}
function* actionWatcherChangepassword() {
  const changepwdChannel = yield actionChannel('changepwd');
  while (true) {
    const { data } = yield take(changepwdChannel);
    yield call(changePassword, data);
  }
}


//guest signup
function* guestSignup(data) {
  const resGuestSignup = yield api.postWithPayloadwithToken(
    '/api/cms/auth/request-demo',
    data
  );
  yield put({ type: 'response_guestSignup', resGuestSignup });
}
function* actionWatcherGuestSignup() {
  const guestSignupChannel = yield actionChannel('guestSignup');
  while (true) {
    const { data } = yield take(guestSignupChannel);
    yield call(guestSignup, data);
  }
}

//registration
function* registration(data) {
  const resRegistration = yield api.postWithMultipart(
    '/api/cms/account/mobile-registration',
    data
  );
  yield put({ type: 'response_registration', resRegistration });
}
function* actionWatcherRegistration() {
  const registrationChannel = yield actionChannel('registration');
  while (true) {
    const { data } = yield take(registrationChannel);
    yield call(registration, data);
  }
}

//attendanceHistory
function* atendanceHistory(data) {
  const resAttendanceHistory = yield api.postWithPayloadwithToken(
    '/api/cms/attendance/list',
    data
  );
  yield put({ type: 'response_attendanceHistory', resAttendanceHistory });
}
function* actionWatcherAttendanceHistory() {
  const reqAttendanceHistory = yield actionChannel('attendancehistory');
  while (true) {
    const { data } = yield take(reqAttendanceHistory);
    yield call(atendanceHistory, data);
  }
}
//workplaceList
function* atendanceList(data) {
  const resWorkplaceList = yield api.postWithPayloadwithToken(
    '/api/cms/mobile/workplace_list',
    data
  );
  yield put({ type: 'response_workplaceList', resWorkplaceList });
}
function* actionWatcherWorkplaceList() {
  const reqWorkplaceList = yield actionChannel('workplaceList');
  while (true) {
    const { data } = yield take(reqWorkplaceList);
    yield call(atendanceList, data);
  }
}
//workplaceUpdate
function* atendanceUpdate(data, id) {

  const resWorkplaceUpdate = yield api.postWithPayloadwithToken(
    '/api/cms/mobile/workplace_update/' + id,
    data
  );
  yield put({ type: 'response_workplaceUpdate', resWorkplaceUpdate });
}
function* actionWatcherWorkplaceUpdate() {
  const reqWorkplaceUpdate = yield actionChannel('workplaceUpdate');
  while (true) {
    const { data, id } = yield take(reqWorkplaceUpdate);
    yield call(atendanceUpdate, data, id);
  }
}
//employeeAllotment
function* employeeAllot(data, id) {
  const resEmployeeAllot = yield api.postWithPayloadwithToken(
    '/api/cms/mobile/get-allotment/' + id,
    data
  );
  yield put({ type: 'response_employeeAllot', resEmployeeAllot });
}
function* actionWatcherEmployeeAllot() {
  const reqEmployeeAllot = yield actionChannel('employeeAllot');
  while (true) {
    const { data, id } = yield take(reqEmployeeAllot);
    yield call(employeeAllot, data, id);
  }
}
//employeeUpdate
function* employeeUpdate(data, id) {
  const resEmployeeUpdate = yield api.postWithPayloadwithToken(
    '/api/cms/mobile/update-allotment/' + id,
    data
  );
  yield put({ type: 'response_employeeUpdate', resEmployeeUpdate });
}
function* actionWatcherEmployeeUpdate() {
  const reqEmployeeUpdate = yield actionChannel('employeeUpdate');
  while (true) {
    const { data, id } = yield take(reqEmployeeUpdate);
    yield call(employeeUpdate, data, id);
  }
}
//companySearch
function* companySearch(data) {
  const resCompanySearch = yield api.postWithPayloadwithToken(
    '/api/cms/companyMasters/search/',
    data
  );
  yield put({ type: 'response_companySearch', resCompanySearch });
}
function* actionWatcherCompanySearch() {
  const reqCompanySearch = yield actionChannel('companySearch');
  while (true) {
    const { data } = yield take(reqCompanySearch);
    yield call(companySearch, data);
  }
}
//employeeSearch
function* employeeSearch(data) {
  const resEmployeeSearch = yield api.postWithPayloadwithToken(
    '/api/cms/employees/search/',
    data
  );
  yield put({ type: 'response_employeeSearch', resEmployeeSearch });
}
function* actionWatcherEmployeeSearch() {
  const reqEmployeeSearch = yield actionChannel('employeeSearch');
  while (true) {
    const { data } = yield take(reqEmployeeSearch);
    yield call(employeeSearch, data);
  }
}
//empWorkplaceUpdate
function* empWorkplaceUpdate(data, id) {
  const resEmpWorkplaceUpdate = yield api.postWithPayloadwithToken(
    '/api/cms/workplaces/update/' + id,
    data
  );
  yield put({ type: 'response_empWorkplaceUpdate', resEmpWorkplaceUpdate });
}
function* actionWatcherEmpWorkplaceUpdate() {
  const reqEmpWorkplaceUpdate = yield actionChannel('empWorkplaceUpdate');
  while (true) {
    const { data, id } = yield take(reqEmpWorkplaceUpdate);
    yield call(empWorkplaceUpdate, data, id);
  }
}
//empWorkplaceUpdate
function* empWorkplaceShift(data) {
  const resEmpWorkplaceShift = yield api.postWithPayloadwithToken(
    '/api/cms/workplaces/workplace_shift_search/',
    data
  );
  yield put({ type: 'response_empWorkplaceShift', resEmpWorkplaceShift });
}
function* actionWatcherWorkplaceShift() {
  const reqEmpWorkplaceShift = yield actionChannel('empWorkplaceShift');
  while (true) {
    const { data } = yield take(reqEmpWorkplaceShift);
    yield call(empWorkplaceShift, data);
  }
}

//registrationStatus
function* registrationStatus(data) {
  const resRegistrationStatus = yield api.postWithPayloadwithToken(
    '/api/cms/account/registration-status',
    data
  );
  yield put({ type: 'response_registrationStatus', resRegistrationStatus });
}
function* actionWatcherRegistrationStatus() {
  const reqRegistrationStatus = yield actionChannel('registrationStatus');
  while (true) {
    const { data } = yield take(reqRegistrationStatus);
    yield call(registrationStatus, data);
  }
}

//registrationStatus
function* specificAttendance(data) {
  const resSpecificAttendance = yield api.postWithPayloadwithToken(
    '/api/cms/mobile/attendence-list',
    data
  );
  yield put({ type: 'response_specificAttendance', resSpecificAttendance });
}
function* actionWatcherSpecificAttendance() {
  const reqAttendanceOfSpecific = yield actionChannel('specificAttendance');
  while (true) {
    const { data } = yield take(reqAttendanceOfSpecific);
    yield call(specificAttendance, data);
  }
}

export default function* rootSaga() {
  yield all([
    actionWatcher(),
    actionWatcherOtp(),
    actionWatcherlogout(),

    // actionWatcherlogoutnew(),
    actionWatcherChangepassword(),
    actionWatcherResetpwd(),
    actionWatcherGetProfile(),
    actionWatcherUpdateProfile(),
    actionWatcherDashboard(),
    actionWatcherCheckIn(),
    actionWatcherAttendance(),
    actionWatcherAttendanceReport(),
    actionWatcherLeaveCreate(),
    actionWatcherLeaveList(),
    actionWatcherTeamLeaveList(),
    actionWatcherLeaveType(),
    actionWatcherRequestCreate(),
    actionWatcherRequestList(),
    actionWatcherSetFcmToken(),
    actionWatcherGuestSignup(),
    actionWatcherRegistration(),
    actionWatcherAttendanceHistory(),
    actionWatcherWorkplaceList(),
    actionWatcherWorkplaceUpdate(),
    actionWatcherEmployeeAllot(),
    actionWatcherEmployeeUpdate(),
    actionWatcherCompanySearch(),
    actionWatcherEmployeeSearch(),
    actionWatcherEmpWorkplaceUpdate(),
    actionWatcherWorkplaceShift(),
    actionWatcherRegistrationStatus(),
    actionWatcherSpecificAttendance()
  ]);
}

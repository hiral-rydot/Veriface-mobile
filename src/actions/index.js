export const apiLogin = data => ({ type: 'login', data }); //signin
export const apiOtp = data => ({ type: 'otp', data }); //otp
export const apiResetpwd = data => ({ type: 'resetpwd', data }); //resetPassword
export const apiGetProfile = data => ({ type: 'getprofile', data }); //getProfile
export const apiChangePwd = data => ({ type: 'changepwd', data }); //changePassword
export const apiUpdateProfile = data => ({ type: 'updateprofile', data }); //updateProfile
export const apiDashboard = (data, showLoader) => ({ type: 'dashboard', data, showLoader }); //dashBoard
export const apiCheckInOut = data => ({ type: 'checkinout', data }); //check/in-out
export const apiTodayAttendance = data => ({ type: 'attendance', data }); //today'sAttendance
export const apiAttendanceReport = data => ({ type: 'attendanceReport', data }); //attendanceReport
export const apiLeaveCreate = data => ({ type: 'leaveCreate', data }); //leave
export const apiLeaveList = data => ({ type: 'leaveList', data }); //leaveList
export const apiLeaveType = data => ({ type: 'leaveType', data }); //leaveType
export const apiRequestCreate = data => ({ type: 'requestCreate', data }); //requestCreate
export const apiRequestList = data => ({ type: 'requestList', data }); //requestList
export const apiAboutus = data => ({ type: 'aboutus', data }); //aboutUs
export const apiSetFCMToken = data => ({ type: 'setFcmToken', data }); //fcmToken
export const apiGuestSignup = data => ({ type: 'guestSignup', data }); //signUP
export const apiRegistration = data => ({ type: 'registration', data }); //registration
export const apiAttendanceHistory = data => ({ type: 'attendancehistory', data }); //attendanceHistory
export const apiWorkplaceList = data => ({ type: 'workplaceList', data }); // workplaceList
export const apiWorkplaceUpdate = (data, id) => ({ type: 'workplaceUpdate', data, id }); // workplaceUpdate
export const apiEmployeeAllot = (data, id) => ({ type: 'employeeAllot', data, id }); // employeeAllotment
export const apiEmployeeUpdate = (data, id) => ({ type: 'employeeUpdate', data, id }); // employeeUpdate
export const apiCompanySearch = (data) => ({ type: 'companySearch', data }); // companySearch
export const apiEmployeeSearch = (data) => ({ type: 'employeeSearch', data }); // employeeSearch
export const apiEmpWorkplaceUpdate = (data, id) => ({ type: 'empWorkplaceUpdate', data, id }); // updateAllotment
export const apiEmpWorkplaceShift = (data) => ({ type: 'empWorkplaceShift', data }); // employeeSearch
export const apiRegistrationStatus = (data) => ({ type: 'registrationStatus', data }); // registrationStatus
export const apiSpecificAttendanceDetails = (data) => ({ type: 'specificAttendance', data }); // specificAttendance

export const apiTeamLeaveList = data => ({ type: 'teamLeaveList', data }); //TeamLeaveList



export const saveProfileState = data => ({ type: 'saveprofile', data })
export const logout = data => ({ type: 'logout' }); //logout

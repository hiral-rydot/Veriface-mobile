
const reducer = (state = { loading: false }, action) => {
  switch (action.type) {
    case 'login': //login
      return { ...state, data: action.data, loading: true };
    case 'SIGNIN_RESPONSE':
      return { ...state, usersignin: action.usersignin, loading: false };

    case 'logout': //logout
      return { state: { loading: false } };
    case 'receive_logout':
      return { ...state, usersignin: undefined, loading: false };

    case 'otp':
      return { ...state, data: action.data, loading: true };
    case 'RESPONSE_OTP':
      return { ...state, requestOtp: action.requestOtp, loading: false };


    case 'reset-password':
      return { ...state, data: action.data, loading: true };
    case 'RESPONSE_RESETPWD':
      return { ...state, resetPassword: action.resetPassword, loading: false };

    case 'changepwd':
      return { ...state, data: action.data, loading: true };
    case 'response_changepwd':
      return { ...state, resChangepwd: action.resChangepwd, loading: false };



    case 'getprofile':
      return { ...state, data: action.data, loading: true };
    case 'RESPONSE_GETPROFILE':
      return { ...state, myprofile: action.myprofile, loading: false };


    case 'updateprofile':
      return { ...state, data: action.data, loading: true };
    case 'RESPONSE_UPDATEPROFILE':

      return {
        ...state, updateprofile: action.updateprofile, loading: false,
        profileState: { ...state.profileState, ...action.data }
      };

    case 'dashboard':
      return { ...state, data: action.data, loading: action.showLoader };
    case 'RESPONSE_DASHBOARD':
      return { ...state, dashboard: action.dashboard, loading: false };

    case 'checkinout':
      return { ...state, data: action.data, loading: true };
    case 'response_checkinout':
      return { ...state, resCheckInOut: action.resCheckInOut, loading: false };

    case 'attendance':
      return { ...state, data: action.data, loading: true };
    case 'response_attendance':
      return { ...state, resAttendance: action.resAttendance, loading: false };

    case 'attendanceReport':
      return { ...state, data: action.data, loading: true };
    case 'response_attendanceReport':
      return { ...state, resAttendanceReport: action.resAttendanceReport, loading: false };

    case 'leaveCreate':
      return { ...state, data: action.data, loading: true };
    case 'response_leaveCreate':
      return { ...state, resLeaveCreate: action.resLeaveCreate, loading: false };

    case 'leaveList':
      return { ...state, data: action.data, loading: false };
    case 'response_leaveList':
      return { ...state, resLeaveList: action.resLeaveList, loading: false };

    case 'teamLeaveList':
      return { ...state, data: action.data, loading: true };
    case 'response_teamLeaveList':
      return { ...state, resTeamLeaveList: action.resTeamLeaveList, loading: false };


    case 'leaveType':
      return { ...state, data: action.data, loading: true };
    case 'response_leaveType':
      return { ...state, resLeaveType: action.resLeaveType, loading: false };

    case 'requestCreate':
      return { ...state, data: action.data, loading: true };
    case 'response_requestCreate':
      return { ...state, resRequestCreate: action.resRequestCreate, loading: false };

    case 'requestList':
      return { ...state, data: action.data, loading: true };
    case 'response_requestList':
      return { ...state, resRequestList: action.resRequestList, loading: false };

    case 'aboutus':
      return { ...state, data: action.data, loading: true };
    case 'response_aboutus':
      return { ...state, resAboutus: action.resAboutus, loading: false };


    case 'setFcmToken':
      return { ...state, data: action.data }
    case 'response_fcmToken':
      return { ...state, resFcmToken: action.resFcmToken, };

    case 'guestSignup':
      return { ...state, data: action.data, loading: true }
    case 'response_guestSignup':
      return { ...state, resGuestSignup: action.resGuestSignup, loading: false }

    case "registration":
      return { ...state, data: action.data, loading: true }
    case "response_registration":
      return { ...state, resRegistration: action.resRegistration, loading: false }

    case "attendanceHistory":
      return { ...state, data: action.data, loading: true }
    case "response_attendanceHistory":
      return { ...state, resAttendanceHistory: action.resAttendanceHistory, loading: false }

    case "workplaceList":
      return { ...state, data: action.data, loading: true }
    case "response_workplaceList":
      return { ...state, resWorkplaceList: action.resWorkplaceList, loading: false }

    case "workplaceUpdate":
      return { ...state, data: action.data, id: action.id, loading: true }
    case "response_workplaceUpdate":
      return { ...state, resWorkplaceUpdate: action.resWorkplaceUpdate, loading: false }

    case "employeeAllot":
      return { ...state, data: action.data, id: action.id, loading: true }
    case "response_employeeAllot":
      return { ...state, resEmployeeAllot: action.resEmployeeAllot, loading: false }

    case "employeeUpdate":
      return { ...state, data: action.data, id: action.id, loading: true }
    case "response_employeeUpdate":
      return { ...state, resEmployeeUpdate: action.resEmployeeUpdate, loading: false }

    case "companySearch":
      return { ...state, data: action.data, loading: true }
    case "response_companySearch":
      return { ...state, resCompanySearch: action.resCompanySearch, loading: false }

    case "employeeSearch":
      return { ...state, data: action.data, loading: true }
    case "response_employeeSearch":
      return { ...state, resEmployeeSearch: action.resEmployeeSearch, loading: false }

    case "empWorkplaceUpdate":
      return { ...state, data: action.data, id: action.id, loading: true }
    case "response_empWorkplaceUpdate":
      return { ...state, resEmpWorkplaceUpdate: action.resEmpWorkplaceUpdate, loading: false }

    case "empWorkplaceShift":
      return { ...state, data: action.data, loading: true }
    case "response_empWorkplaceShift":
      return { ...state, resEmpWorkplaceShift: action.resEmpWorkplaceShift, loading: false }

    case "registrationStatus":
      return { ...state, data: action.data, loading: false }
    case "response_registrationStatus":
      return { ...state, resRegistrationStatus: action.resRegistrationStatus, loading: false }

    case "specificAttendance":
      return { ...state, data: action.data, loading: true }
    case "response_specificAttendance":
      return { ...state, resSpecificAttendance: action.resSpecificAttendance, loading: false }


    case 'saveprofile':
      return { ...state, profileState: { ...state.profileState, ...action.data }, }

    default:
      return state;
  }



};

export default reducer;

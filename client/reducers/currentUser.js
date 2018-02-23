
const initialState = {
  currentUser: {},
}

export default function (state = initialState, action) {
  if(action.type == 'SETCURRENTUSER') {
    // console.log("Set Current User", action.user)
    return { ...state, currentUser: action.user }
  }
  
  if(action.type == 'LOGOUTUSER') {
    return { ...state, currentUser: {} }
  }
  return state
}


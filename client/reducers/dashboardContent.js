
const initialState = {
  dashboardContent: '',
}

export default function (state = initialState, action) {
  if(action.type == 'SETDASHBOARDCONTENT') {
    //console.log(action.content)
    return { ...state, dashboardContent: action.content }
  }
  return state
}


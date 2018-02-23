
const initialState = {
  dashboards: undefined,
  overrides: {}
}

export default function update(state = initialState, action) {

  if(action.type === "SET_DASHBOARDS") {
    //console.log(action)
    return { 
      dashboards: action.dashboards, 
      overrides: action.overrides
    }
  }
  return state
}
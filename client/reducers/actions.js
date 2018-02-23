
const initialState = {
  definitions: undefined,
  entryPoints: undefined,
  actions: [{}]
}

export default function update(state = initialState, action) {

  if(action.type === "SET_ACTIONS") {
    // console.log(action)
    return { 
      definitions: action.definitions,
      entryPoints: action.entryPoints
    }
  }
  return state
}
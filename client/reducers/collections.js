
const initialState = {
  definitions: undefined
}

export default function update(state = initialState, action) {
  if (action.type === "SET_COLLECTIONS") {
    // console.log(action)
    return {
      definitions: action.definitions
    }
  }
  return state
}
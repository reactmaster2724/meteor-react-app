
const initialState = {
  todos: undefined,
}

export default function update(state = initialState, action) {

  if(action.type === "SET_TASKS") {
    return { 
      todos: action.todos
    }
  }
  return state
}

const initialState = {
  panel: {
    leftPanel: false,
    rightPanel: false,
    toggleRight: false, 
    toggleLeft: false
  }
}

export default function (state = initialState, action) {
  if(action.type == 'SETPANEL') {

    var newPanel = {toggleRight: state.panel.toggleRight, toggleLeft: state.panel.toggleLeft};
    
    if (action.panel.toggleRight != undefined)
      newPanel.toggleRight = action.panel.toggleRight;
    if (action.panel.toggleLeft != undefined)
      newPanel.toggleLeft = action.panel.toggleLeft;
    return { 
      ...state, 
      panel: newPanel
    }
  }
  return state
}


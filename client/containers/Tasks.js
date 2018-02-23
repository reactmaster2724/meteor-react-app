import { connect } from 'react-redux'

export default TaskService = function(store) {

  var self = this;
  Meteor.call('getTaskCards', (error, response) => { 
    if (error){
      console.error("Couldn't get taskcards");
    }
    self.todos = response;
    store.dispatch({ type: 'SET_TASKS', todos: self.todos})
  });
}

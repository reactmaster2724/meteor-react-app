
import { connect } from 'react-redux'

export default ActionService = function(store, userId) {

  var self = this;
  Meteor.call('getDefinitions', userId, (error, response) => { 
    if (error){
      console.error("Couldn't get taskcards"); 
      return;
    }
    // console.log("action.service definitions->", response);
    self.definitions = response;
    self.entry_points = response.entry_points;
    store.dispatch({ type: 'SET_ACTIONS', definitions: self.definitions, entryPoints: self.entry_points})
  });
}

ActionService.prototype.undoAction = function(action, userid, callback){
  Meteor.call('undoAction', action._id,  userid, (error, response) => {
    if (error){
      console.error("Couldn't undoAction");
      return;
    }
    callback();
  });
}

ActionService.prototype.cancelAction = function(action, userid, callback) {
  Meteor.call('releaseAction', action._id, action.formData, userid, (err, res)=>{
    if (err){
      console.error("Couldn't releaseAction");
    }
    callback()
  });
}

ActionService.prototype.pauseAction = function(action, userid, callback) {
  Meteor.call('pauseAction', action._id, action.formData, userid, (err, res)=>{
    if (err){
      console.error("Couldn't pauseAction");
    }
    callback()
  });
}

ActionService.prototype.completeAction = function(action, userid, callback) {
  Meteor.call('continueAction', action._id, action.formData, userid, (err)=>{
    if (err){
      console.error("Couldn't continueAction");
    }
    callback()
  });
}



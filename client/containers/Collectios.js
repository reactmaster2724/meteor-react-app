
import { connect } from 'react-redux'

export default CollectionService = function (store, userId) {

  var self = this;
  Meteor.call('getModelDefinitions', userId, (error, response) => {
    if (error) {
      console.error("Couldn't get taskcards");
      return;
    }
    self.definitions = response;
    store.dispatch({
      type: 'SET_COLLECTIONS',
      definitions: self.definitions
    })
  });
}

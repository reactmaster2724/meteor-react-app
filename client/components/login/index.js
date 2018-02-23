import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux';
import { compose } from 'redux';
import { withTracker } from 'meteor/react-meteor-data';
import { browserHistory } from 'react-router'
import Toolbar from '../toolbar/'

import { setUser } from '../../actions/setUser';
import { setActions } from '../../actions/setActions';
import { setCollections } from '../../actions/setCollections';

class Login extends Component {

  constructor(props) {
    super(props);
    this.state = {username: '', password: '', loginButton: 0};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChangePassword = this.handleChangePassword.bind(this);
    this.loginButton = this.loginButton.bind(this);
    this.loggingInButton = this.loggingInButton.bind(this);
    this.loginWithGoogle = this.loginWithGoogle.bind(this);

    // console.log("currentUser: ", this.props.currentUser)
    // //console.log(this.props.state);
  }

  componentDidMount(){
    if (this.state.username === "")
      this.textInput.focus();
    /*
    $meteor.call("getErpUrl").then(function(url) {
      $scope.erpnextdesk = `https://${url}/desk#desktop`;
      //$scope.erpnextlogin = "https://" + url + "/testcookie"
      $scope.erpnextlogin = `https://${url}/login`;
      return $scope.erpnexturl = url;
    });


    $scope.$root.$broadcast("clearLoader");


    const receiveMessage = function(event) {
      //console.log(`login.controller Recieved event ${JSON.stringify(event.data)}from origin: ${event.origin}`);
      const activbmregex = /https:.*.activbm.com/;
      const openbregex = /https:.*openb.net/;
      if (activbmregex.test(event.origin) || openbregex.test(event.origin)) {
        //console.log("passed security checks, adding key to users");
        Meteor.call('addErpCookie', event.data.user_id, event.data.sid);
        return $scope.loginWithGoogle([{login_hint: event.data.user_id}]);
      }
    };
        // return

    window.addEventListener('message', receiveMessage, false);

    return $scope.iframeLoadedCallBack = function() {
      
      let iframe;
      //console.log("login.controller erpnext onload triggered");


      try { 
        iframe = angular.element('#erpnext').contents();
      } catch (e) {
        //console.log(e);
        alert("You should be using NextAction with the provided App, not your normal browser");
      }
  

      //console.log("after iframe");

      if ((iframe.find('p').length === 1) && (iframe.find('p').text() === 'You are not permitted to access this page.')) {
        //console.log('login.controller dashboard erpnext view verified we are in not permitted access page on erpnext');
        angular.element('#erpnext').attr('src', $scope.erpnextlogin);
        return true; // https://stackoverflow.com/questions/23838497/coffeescript-referencing-dom-nodes-in-angular-expressions-is-disallowed
      }

      if (iframe.find('.btn-google').length > 0) {
        //console.log('login.controller dashboard erpnext view we are in erpnext login page');
        const btngooglehref = iframe.find('.btn-google').attr('href');
        angular.element('#erpnext').attr('src', btngooglehref);
        return true; // https://stackoverflow.com/questions/23838497/coffeescript-referencing-dom-nodes-in-angular-expressions-is-disallowed
      }

      if (iframe.find('#page-desktop').length > 0) {
        //console.log('login.controller erpnext #page-desktop ready, sending getCookie');
        return window.frames[0].postMessage('getCookie','*');
      }
    };
  }
    */
  }

  actionService(userId){
    var self = this;
    Meteor.call('getDefinitions', userId, (error, response) => { 
      if (error){
        console.error("Couldn't get action definitions",error);
        return;
      }
      //console.log("action.service definitions: ", response);
      self.definitions = response;
      self.entry_points = response.entry_points;
      this.props.setActions(self.definitions, self.entry_points);
    });
  }

  collectionService(userId){
    var self = this;
    Meteor.call('getModelDefinitions', userId, (error, response) => { 
      if (error){
        console.error("Couldn't get collection");
        return;
      }
      // console.log("collection.service definitions: ", response);
      self.definitions = response;
      this.props.setCollections(self.definitions);
    });
  }

  componentWillReceiveProps(nextProps){
    if (nextProps.currentUser){
      this.props.setUser(nextProps.currentUser);
      this.actionService(nextProps.currentUser._id);
      this.collectionService(nextProps.currentUser._id);
      browserHistory.push('/dashboard')
    }
  }

  handleChange(event) {
    this.setState({username: event.target.value});
  }

  handleChangePassword(event) {
    this.setState({password: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();
    // //console.log("login.controller $scope.login called STUB only");
  }

  loginButton(){
    if (this.state.loginButton == 0){
      //console.log((!this.state.username || !this.state.password));
      return (
        <button type="submit" className={"btn btn-primary " + ((!this.state.username || !this.state.password) ? "disabled":"")}>Login</button>
      );
    }
    return null;
  }

  loggingInButton(){
    if (this.state.loginButton == 1)
      return (
        <button className="btn btn-primary disabled"><i className="fa fa-spinner fa-spin"></i>&nbsp;&nbsp;Logging in...</button>
      )
    return null;
  }

  loginWithGoogle(){
    Meteor.loginWithGoogle({
      requestPermissions: ['email']
    }, (err) => {
      if (err) {
        console.log(err)
      } else {
        var currentUser = Meteor.user();
        this.props.setUser(currentUser);
        this.actionService(currentUser._id);
        this.collectionService(currentUser._id);
        browserHistory.push('/dashboard')
      }
    });
  }

  render() {
    return (
      <div>
        <div id="navbar">
          <Toolbar name="login"/>
        </div>
        <alert type="warning" className="col-md-6 col-md-offset-3">You must login first.</alert>
        <div className="col-md-6 col-md-offset-3">
            <form className="form-horizontal" noValidate onSubmit={this.handleSubmit}>
                <div className="form-group">
                    <label className="col-md-3 control-label">Username/Email</label>
                    <div className="col-md-9">
                        <input className="form-control" type="text" value={this.state.username} onChange={this.handleChange} ref={(input) => { this.textInput = input; }} />
                    </div>
                </div>
                <div className="form-group">
                    <label className="col-md-3 control-label">Password</label>
                    <div className="col-md-9">
                        <input className="form-control" type="password" value={this.state.password} onChange={this.handleChangePassword} />
                    </div>
                </div>
                <hr/>
                <div className="col-md-9 col-md-offset-3">
                    {this.loginButton()}
                    {this.loggingInButton()}
                    <span className="col-md-offset-1">OR</span>
                </div>
            </form>

            <div className="col-md-9 col-md-offset-3">
                <hr/>
                <a onClick={this.loginWithGoogle} className="btn btn-success">Login With Your Gmail</a>
            </div>
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setUser: user => {dispatch(setUser(user))},
    setActions: (definitions, entryPoints) => {dispatch(setActions(definitions, entryPoints))},
    setCollections: (definitions) => {dispatch(setCollections(definitions))}
  }
}
const mapStateToProps = state => ({
  state: state
});

export default 
  compose (
    connect(mapStateToProps, mapDispatchToProps),
    withTracker(() => {
      return { currentUser: Meteor.user() }
    })
  )(Login);

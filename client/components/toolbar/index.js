import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux';
import Gravatar from 'react-gravatar';
import { logoutUser } from '../../actions/setUser';
import { browserHistory } from 'react-router'
import { setPanel } from '../../actions/setPanel';

function DashboardsDrop(props) {
  //console.log(props)
  return (
    <a role="menuitem" onClick={()=>props.onClick(props.name)}> 
      {props.dashboard.label} 
      {props.dashboard.notifications? <sup className="notification">{props.dashboard.notifications / 2}</sup>:null}
    </a>
  );
}

class Toolbar extends Component {

  static propTypes = {
  }

  constructor(props) {
    super(props);
    this.state={
      showDashboardMenu: this.props.name.indexOf("dashboard") != -1 ? true : false,
      showManager: false,
      buttonText: 'Toggle Manager',
      users: Meteor.users.find({}).fetch(),
    }
    // //console.log("users", this.state.users)
  }

  logout() {
    
    if(Meteor.isClient){
      this.props.currentUser={};
      this.props.logoutUser();
      // //console.log('toolbar.controller $scope.logout called',this.props);
      var self = this;
      return Meteor.logout(()=>{
        // self.props.logoutUser();
        browserHistory.push('/')
      });
    }
    
  }

  componentWillMount(){
    if ((this.props.dashboardName) && (this.props.dashboards)){
      this.setState({currentDashboard: this.props.dashboards[this.props.dashboardName]})
    }
  }

  componentWillUnmount(){
    
  }

  componentWillReceiveProps(nextProps){
    if (nextProps.name.indexOf("dashboard") != -1)
      this.setState({showDashboardMenu: true})
    if (nextProps.dashboardName){
      if (this.props.dashboards){
        this.setState({currentDashboard: this.props.dashboards[nextProps.dashboardName]})
      }
    }
  }

  gotoDashboard(name){
    // //console.log(name);
    browserHistory.push('/dashboard/'+ name);
  }
  
  dashboardList(){
    var list = [];
    var key, index = 0;

    for (el in this.props.dashboards) {
      index ++;
      if (this.props.dashboards.hasOwnProperty(el)) {
        if (el == this.props.dashboardName){
          var dashboard = this.props.dashboards[el];
          var item = <a role="menuitem" key={el}>{dashboard.label} {dashboard.notifications? <sup className="notification">{dashboard.notifications / 2}</sup>:null}</a>;
          list.push(item);
        } else if (el != "main"){
          var dashboard = this.props.dashboards[el];
          //console.log(el)
          var item = <DashboardsDrop key={index} name={el} dashboard={dashboard} onClick={(name)=>this.gotoDashboard(name)}/>
          list.push(item);
        }
      }
    }
    return list
  }

  toggleManager(){
  }

  __guard__(value, transform) {
    return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
  }

  isManager(user) {
    //console.log 'menu.controller $scope.isManager user: ' + JSON.stringify(user,null,2)
    if (this.__guard__(user != null ? user.profile : undefined, x => x.groups) != null) {
      return Array.from(user.profile != null ? user.profile.groups : undefined).includes('manager');
    }
  }

  groupFilter(group) {

    inputs = this.state.users;
    //console.log 'toolbar.directive groupFilter inputs: ' + JSON.stringify(inputs) + ' group: ' + group
    const output = [];
    for (let input of Array.from(inputs)) {
    //console.log 'toolbar.directive groupFilter input: ' + JSON.stringify(input)
      if ((input.profile.groups != null) && Array.from(input.profile.groups).includes(group)) {
        output.push(input);
      }
    }

    //console.log 'toolbar.directive groupFilter output: ' + JSON.stringify(output)
    return output;
  }

  getLaneName(role){
    return role
  //    return Meteor.getLaneName(role);
  }

  showUsers(){
    var self = this;
    var roleList = function(manager){
      var l = manager.profile.roles.map((role)=>(<span className="user-role" key={role}>{self.getLaneName(role)} </span>))
      return l;
    }

    var managers = this.groupFilter('manager');
    //console.log("managers", managers)
    var managerList = managers.map((manager, index)=>(
        <div className="group-user" key={index}>
          <Gravatar title={manager.profile.name} email={manager.profile.email} size={50} style={{borderRadius: 25, borderWidth: 1,  borderColor: "#ddd"}}/>
          <span className="group-name">{manager.display_name}</span>
          {roleList(manager)}
          <div><img src={manager.profile.roles ? 'assets/checkmark.png' : 'assets/questionmark.png'} width={30} height={30}/></div>
        </div>
      ))
    return (
      <div>
        {managerList}
      </div>
    )
  }

  toggleMenu(main) {
    if (main){
      this.props.setPanel({toggleRight: false})
      return;
    }

    if (this.props.name !== 'management_user') {
      //console.log('routes-base.ng toggleMenu state != management_user');

      if (!this.props.panel.toggleRight) {
        this.props.setPanel({toggleRight: true, toggleLeft: false})
        return;
      } else {
        this.props.setPanel({toggleRight: false})
      }
    }
  }

  render() {
    return (
      <div className="navbar navbar-inverse navbar-fixed-top" id="toolbar" role="navigation">
        <div className="container-fluid">
          <div className="navbar-header">
            {
              (this.props.name != 'login') ? 
              (
                <a className="navbar-toggle navbar-link mobile-toggle" onClick={()=>this.toggleMenu(false)} >
                  <span className="glyphicon glyphicon-align-justify"></span>
                </a>
              ): null
            }
          </div>

              {
                this.props.currentUser._id? 
                (
                  <div className="navbar-collapse">
                    <div className="dropdown">
                      <img className="dropbtn" src="assets/favicon.png" />
                      <div className="dropdown-content">
                        <a href="https://bitbucket.org/openbnet/nextaction-customer-issues/issues?status=new&status=open" target="_blank">Found a bug? Submit an issue here</a>
                      </div>
                    </div>
                    <ul className="nav navbar-nav navbar-right">
                      {/*<!-- dashboards menu -->*/}
                      {
                        this.state.showDashboardMenu ? (
                          <li className="dropdown">
                            <a href className="dropdown-toggle" data-toggle="dropdown" role="button">
                              <span className="glyphicon glyphicon-stats"></span> {this.state.currentDashboard ? this.state.currentDashboard.label:null}
                              {
                                (this.state.currentDashboard && this.state.currentDashboard.notifications) ?
                                  <sup className="notification">{this.state.currentDashboard.notifications / 2}</sup> : null
                              }
                              <span className="caret"></span>
                            </a>
                            <ul className="dropdown-menu" role="menu">
                              <li role="presentation">
                                {this.dashboardList()}
                              </li>
                            </ul>
                          </li>
                          ):null
                      }
                      {/*<!-- user menu -->*/}
                      <li className="dropdown">
                        <a href className="dropdown-toggle" data-toggle="dropdown" role="button">
                          <Gravatar email={this.props.currentUser.profile.email} size={30} style={{borderRadius: 15}} /> {(this.props.currentUser && this.props.currentUser.profile) ? this.props.currentUser.profile.name : null} 
                          <span className="caret"></span>
                        </a>
                        <div className="dropdown-menu" role="menu">

                          <div className="user-dropdown-header">
                            <table><tbody><tr><td>
                              <Gravatar email={this.props.currentUser.profile.email} size={30} style={{borderRadius: 15}} />
                              <span>
                                <span className="name">{(this.props.currentUser && this.props.currentUser.profile) ? this.props.currentUser.profile.name : null}</span><br/>
                                <small>{(this.props.currentUser && this.props.currentUser.profile && this.props.currentUser.profile.groups)? this.props.currentUser.profile.groups[this.props.currentUser.profile.groups.length - 1] : "Guest"} </small>
                              </span>
                            </td>
                            <td>
                              {
                                this.state.showManager? <a className="btn btn-default manage-button" role="menuitem" onClick={this.toggleManager()}> Cancel</a> : null
                              }
                              {
                                this.isManager(this.props.currentUser) ? 
                                  <a className="btn btn-primary manage-button" role="menuitem" onClick={this.toggleManager()}>
                                    {this.state.buttonText}
                                  </a>
                                : null
                              }
                              <a className="btn btn-primary manage-button" role="menuitem" onClick={()=>this.logout()}>
                                <span className="glyphicon glyphicon-off"></span> Logout
                              </a>
                            </td></tr></tbody></table>
                          </div>

                          <div className="user-dropdown-body" id="group-menu">
                            <div className="table" >
                              <div className="group-title">
                                <span>
                                  <h4>Manager list</h4>
                                  <span>
                                    ({this.groupFilter('manager').length}::users)
                                  </span>
                                 </span>
                                </div>
                            </div>

                            {this.showUsers()}
                          </div>

                        </div>
                      </li>

                      {/*<!-- page menu -->*/}
                      {
                        (this.state.showDashboardMenu && this.props.dashboardName != "erpnext") ?
                        (
                          <li>
                            <a className="navbar-link" title="Toggle menu" onClick={()=>{this.toggleMenu(false)}}>
                              <span className="glyphicon glyphicon-align-justify"></span>
                            </a>
                          </li>
                        ) : null
                      }

                    </ul>
                  </div>
                ):null
              }
        {/*
              </li>

              <!-- page menu -->
              <li ng-hide="state.current == 'dashboard.erpnext'">
                <a href class="navbar-link {{currentState}}" title="Toggle menu" ng-click="toggleMenu(false)">
                  <span class="glyphicon glyphicon-align-justify"></span>
                </a>
              </li>
            </ul>

          </div>
        */}
        </div>
      </div>
    )
  }
}

function bindAction(dispatch) {
  return {
    logoutUser: () => {dispatch(logoutUser())},
    setPanel: panel => {dispatch(setPanel(panel))}
  };
}

const mapStateToProps = state => ({
  currentUser: Meteor.user() ? Meteor.user() : state.currentUser.currentUser,
  dashboards: state.dashboards.dashboards,
  panel: state.panel.panel
});

export default connect(mapStateToProps, bindAction)(Toolbar);

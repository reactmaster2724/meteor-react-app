
import { connect } from 'react-redux';
import React, { Component, PropTypes } from 'react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import Gravatar from 'react-gravatar';
import { logoutUser } from '../../actions/setUser';
import { browserHistory } from 'react-router'
import { setPanel } from '../../actions/setPanel';
import { Draggable } from 'react-drag-and-drop'

const _ = window.lodash;

class Menu extends Component {

  constructor(props) {
    super(props);
    // console.log(props);
    this.state = {
      users: Meteor.users.find({}).fetch(),
      dashboard: (props.dashboards && props.dashboardName) ? props.dashboards[props.dashboardName] : null,
      selectedUser: { user: null }
    }
    if (props.panel) {
      var html = document.getElementsByTagName("html")[0];
      //console.log(props.panel.toggleRight);
      html.className = props.panel.toggleRight ? 'open' : 'closed'
    }
  }

  componentWillReceiveProps(nextProps) {

    if (nextProps.panel) {
      var html = document.getElementsByTagName("html")[0];
      //console.log(nextProps.panel.toggleRight);
      html.className = nextProps.panel.toggleRight ? 'open' : 'closed'
    }
    if ((nextProps.dashboards) && (nextProps.dashboardName)) {
      this.setState({ dashboard: nextProps.dashboards[nextProps.dashboardName] });
    }
    var users = Meteor.users.find({}).fetch();
    this.setState({ users: users });
    this.updatePermissions(nextProps);
  }
  componentWillMount() {
    
    this.updatePermissions(this.props)
  }
  hasEntryPoint() {
    //console.log 'menu.controller called hasEntryPoint()'
    if (!this.props.entryPoints) {
      //console.log 'menu.controller hasEntryPoint called without $scope.entryPoints'
      return false;
    }

    if (!this.state.dashboard.lanes) {
      //console.log 'menu.controller hasEntryPoint called without $scope.dashboard.lanes'
      return false;
    }
    for (let entryPoint of Array.from(this.props.entryPoints)) {
      //console.log 'menu.controller hasEntryPoint entryPoint in $scope.entryPoints: ' + entryPoint
      //console.log 'menu.controller hasEntryPoint $scope.dashboard: ' + JSON.stringify($scope.dashboard,null,2)
      for (let lane of Array.from(this.state.dashboard.lanes)) {
        if (Array.from(lane.ids).includes(entryPoint)) {
          //console.log 'menu.controller hasentrypoint $scope.entryPoint in $scope.dashboard = true'
          return true;
        }
      }
    }
    //console.log 'menu.controller hasentrypoint $scope.entryPoint = false catchall'
    return false;
  }

  updatePermissions(nextProps) {

    if (!nextProps.dashboardName)
      return;

    var dashboardName = nextProps.dashboardName;

    if (dashboardName === 'personal') {
      this.setState({ createPermissions: true });
    } else {
      let relLane, relLaneIds;
      if (nextProps.dashboards) {
        var dashboard = nextProps.dashboards[dashboardName];
        if (dashboard.lanes) {
          if (dashboard.lanes[0].name === 'INBOX') {
            relLane = dashboard.lanes[1].name;
            relLaneIds = dashboard.lanes[1].ids;
          } else {
            relLane = dashboard.lanes[0].name;
            relLaneIds = dashboard.lanes[0].ids;
          }
        }

      }
      // Lane needs to be in entry points
      const intersection = _.intersection(relLaneIds, this.props.entryPoints);
      // refresh $scope.currentUser
      if (nextProps.currentUser.profile) {
        this.setState({ createPermissions: Array.from(nextProps.currentUser.profile.roles).includes(relLane) && (intersection.length > 0) })
      }

      return;
    }
  }

  saveUser(thisUser, users) {
    //console.log 'menu.controller $scope.saveUser thisUser: ' + thisUser + ' users: ' + users
    // if thisUser['active'] == false || !thisUser['active']
    if (this.__guard__(this.state.selectedUser != null ? this.state.selectedUser.user : undefined, x => x._id) !== thisUser._id) {
      this.setState({ selectedUser: { user: thisUser } });
      this.state.selectedUser['user'] = thisUser;
    } else if (this.__guard__(this.state.selectedUser != null ? this.state.selectedUser.user : undefined, x1 => x1._id) === thisUser._id) {
      this.setState({ selectedUser: { user: null } });
    }
    //console.log(this.state.selectedUser);

    return (() => {
      const result = [];
      for (let user of Array.from(users)) {
        if (user !== thisUser) {
          result.push(user.active = false);
        } else {
          result.push(undefined);
        }
      }
      return result;
    })();
  }

  isDashboardPage() {
    if (this.props.name != null) {
      if (this.props.name.indexOf("dashboard") != -1)
        return true;
    }
    return false;
  }

  isManager(user) {
    //console.log 'menu.controller $scope.isManager user: ' + JSON.stringify(user,null,2)
    if (this.__guard__(user != null ? user.profile : undefined, x => x.groups) != null) {
      return Array.from(user.profile != null ? user.profile.groups : undefined).includes('manager');
    }
  }

  removeRole($data) {
    //console.log 'menu.controller $scope.removeRole $data: ' + $data
    if (($data.lane != null) && (($data != null ? $data.user : undefined) != null)) {
      if (Array.from($data.user.profile.roles).includes($data.lane.name)) {
        const role = $data.user.profile.roles.indexOf($data.lane.name);
        if (role >= 0) {
          return $data.user.profile.roles.splice(role, 1);
        }
      }
    }
  }

  __guard__(value, transform) {
    return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
  }

  goToDashboardName(name) {
    //console.log(name);
  }

  dashboardLists() {
    var list = null;
    if ((this.props.dashboards) && (this.props.dashboards.length > 0)) {
      list = this.props.dashboards.map((name, dashboard) => (
        <li role="presentation" key={name}>
          {
            (name != dashboardName) ? (
              <a role="menuitem" onClick={() => this.goToDashboardName(name)}>A {dashboard.label}
                {
                  (dashboard.notifications) ? (
                    <sup className="notification">{dashboard.notifications / 2}</sup>
                  ) : null
                }
              </a>
            ) : null
          }
        </li>
      )
      )
    }

    return (
      <ul className="dropdown-menu" role="menu">
        {list}
      </ul>
    )
  }

  logout() {
    //console.log('toolbar.controller $scope.logout called',this.props);
    var self = this;
    return Meteor.logout(() => {
      //self.props.logoutUser();
      browserHistory.push('/')
    });
  }

  gotoAction() {
    //action({source: dashboardName, lane: dashboard.lanes[(dashboard.lanes[0].name == 'INBOX') ? 1 : 0].ids[0]})"

    browserHistory.push('/action?source=' + this.props.dashboardName + '&lane=' + this.state.dashboard.lanes[(this.state.dashboard.lanes[0].name == 'INBOX') ? 1 : 0].ids[0]);

    //this.props.toggleMenu(false);
    this.props.setPanel({ toggleRight: false })
  }

  showSwitch() {
    /*
    if (this.props.dashboardName == "")
      return ();
    */
    //default

    if (!this.state.dashboard)
      return null;
    var el = (
      <div>
        {
          (this.hasEntryPoint() && this.state.createPermissions) ? (
            <a onClick={() => { this.gotoAction() }} className="btn btn-default btn-block text-left">
              Create {this.state.dashboard.lanes[(this.state.dashboard.lanes[0].name == 'INBOX') ? 1 : 0].label}
            </a>
          ) : (
              <div>
                You do not have create permissions for this dashboard
            </div>
            )
        }
      </div>
    )

    return el;
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

  showUserList() {
    //console.log(this.state.selectedUser);
    var list = this.state.users.map((singleUser) => (
      <a key={singleUser._id} className={((this.state.selectedUser['user']) && (this.state.selectedUser['user']._id == singleUser._id)) ? 'group-user user-active' : 'group-user'}>
        <Draggable type="user" data={JSON.stringify(singleUser)}>
          <div className="well well-sm user" onClick={() => this.saveUser(singleUser, this.state.users)}>
            <table style={{ textOverflow: "ellipsis" }}>
              <tbody>
                <tr>
                  <td>
                    <Gravatar title={singleUser.profile.name} email={singleUser.profile.email} size={30} style={{ borderRadius: 16, borderWidth: 1, boderColor: "#ddd" }} />
                  </td>
                  <td>
                    <span className="group-name">{singleUser.profile.name}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Draggable>
      </a>
    ))

    return list;
  }

  gotoManageUser() {
    browserHistory.push('/management/' + this.props.dashboardName);
  }

  gotoDashboard() {
    browserHistory.push('/dashboard/' + this.props.dashboardName);
  }

  render() {
    return (
      <div id="side-menu">
        <Tabs id="fixed-tabs" defaultIndex={(this.props.name == 'management_user' ? 1 : 0)}>
          <div className={'nav ' + (this.isManager(this.props.currentUser) ? '' : 'tab-full-width')}>
            <TabList>
              <Tab><img src="assets/tasklist.png" width="30" height="30" /></Tab>
              <Tab><img src="assets/group.png" width="30" height="30" /></Tab>
            </TabList>

            <TabPanel>
              {
                (this.props.name == 'management_user') ? null :
                  (
                    <div className="menu-content">
                      <div className="navbar-toggle top-mobile">
                        {
                          (this.props.currentUser.profile) ? (
                            <ul className="nav navbar-nav navbar-right">
                              {/*<!-- dashboards menu -->*/}
                              {
                                (this.isDashboardPage()) ? (
                                  <li className="dropdown">
                                    <a className="dropdown-toggle" data-toggle="dropdown" role="button">
                                      <span className="glyphicon glyphicon-stats"></span>
                                      {(this.state.dashboard && this.state.dashboard.label) ? this.state.dashboard.label : null}
                                      {
                                        (this.state.dashboard && this.state.dashboard.notifications) ? (
                                          <sup ng-show="dashboard.notifications" className="notification">
                                            {this.state.dashboard.notifications / 2}
                                          </sup>
                                        ) : null
                                      }
                                      <span className="caret"></span>
                                    </a>

                                    {this.dashboardLists()}
                                  </li>
                                ) : null
                              }

                              {/*<!-- user menu -->*/}
                              <li className="dropdown">
                                <a href className="dropdown-toggle" data-toggle="dropdown" role="button">
                                  <Gravatar email={this.props.currentUser.profile.email} size={30} style={{ borderRadius: 15 }} />
                                  {this.props.currentUser.profile.name}
                                  <span className="caret"></span>
                                </a>
                                <ul className="dropdown-menu" role="menu">
                                  <li role="presentation">
                                    <a role="menuitem" onClick={() => this.logout()}>
                                      <span className="glyphicon glyphicon-off"></span> Logout
                                      </a>
                                  </li>
                                </ul>
                              </li>
                            </ul>
                          ) : null
                        }
                      </div>

                      <hr />

                      {this.showSwitch()}

                      <hr />

                      <h4>Productivity Insights</h4>
                      <span>Average time in progress: </span><br />
                      <span>Average time paused: </span><br />
                      <span>Productivity index: </span><br />
                      <span>Bottlenecked lane:</span><br />
                    </div>
                  )
              }

            </TabPanel>
            <TabPanel>
              <div>
                <img src="assets/group.png" width="30" height="30" />
              </div>
              <div id="group-menu">
                <div className="table">
                  <div className="group-title">
                    <span>
                      <h4>User list</h4>
                      <span>({this.groupFilter('employee').length}::users)</span>
                    </span>
                    <span>
                      {
                        (this.props.name == 'management_user') ?
                          <a className="btn btn-primary" onClick={() => this.gotoDashboard()}>Done</a> :
                          <a className="btn btn-primary" onClick={() => this.gotoManageUser()}>Manage</a>
                      }
                    </span>
                  </div>
                </div>

                {this.showUserList()}
              </div>
            </TabPanel>
          </div>
        </Tabs>
      </div>
    )
  }
}

function bindAction(dispatch) {
  return {
    logoutUser: () => { dispatch(logoutUser()) },
    setPanel: panel => { dispatch(setPanel(panel)) }
  };
}

const mapStateToProps = state => ({
  entryPoints: state.actions.entryPoints,
  dashboards: state.dashboards.dashboards,
  currentUser: Meteor.user() ? Meteor.user() : state.currentUser.currentUser,
  panel: state.panel.panel
});

export default connect(mapStateToProps, bindAction)(Menu);

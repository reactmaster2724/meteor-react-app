import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux';
import { compose } from 'redux';
import { withTracker } from 'meteor/react-meteor-data';
import { browserHistory } from 'react-router'
import Toolbar from '../toolbar/'
import Menu from '../menu/'
import Gravatar from 'react-gravatar';
import { Droppable } from 'react-drag-and-drop'

class Management extends Component {

  constructor(props) {
    super(props);
    this.state = {
      dashboardName: props.params.name,
      dashboard: this.props.dashboards[props.params.name],
      contentName: 'management_user',
      panel: {},
      time: {},
      message: []
    };
    //console.log(props)
  }

  componentWillMount(){
    var self = this;
    Meteor.call("getUsersTimes", function(err, times) {
      if (err != null) {
        //console.log('getUsersTime err: ');
        //console.log(err);
      }
      //console.log(`management.controller getUsersTimes ${times}`);
      const laneTimes = {};
      for (let time of Array.from(times)) {
        if (!laneTimes[time._id.lane]) { laneTimes[time._id.lane] = {}; }
        if (!laneTimes[time._id.lane][time._id.user]) { laneTimes[time._id.lane][time._id.user] = {}; }
        laneTimes[time._id.lane][time._id.user][time._id.status] = time.duration;
      }

      self.setState({time: laneTimes});
      //console.log(`management.controller laneTimes: ${laneTimes}`);
      return;
    });
  }

  componentWillReceiveProps(nextProps){
  }

  dropUser(data, event, targetLane, index) {
    //console.log(data, event, targetLane);

    var user = JSON.parse(data.user);

    if (!user | !targetLane) {
      event.stopPropagation();
      event.preventDefault();
      return;
    }

    var self = this;
    if ((user != null) && !((user.lane != null) && (user.user != null))) {
      Meteor.call("addUserRole", user._id,targetLane.name, function() {
        var newMessage = "You've successfully assigned " + user.profile.name + " to this lane.";
        var message = self.state.message;
        message[index] = newMessage;
        self.setState({message: message})

        //$scope.selectedUser['user'] = null;
        setTimeout(() => {
          var message = self.state.message;
          message[index] = "";
          self.setState({message: message});
        }
          , 1000);
      });
    }
  }

  userRoleFilter(inputs, lane) {
    const output = [];
    inputs.map((input)=>{
      if ((input.profile.roles != null) && Array.from(input.profile.roles).includes(lane.name)) {
        output.push(input);
      }
    })
    return output;
  }

  removeRole(lane, targetUserID, event, index) {
    // stop lanes ngclick and management task exit
    event.stopPropagation();
    event.preventDefault();

    const currentuser = Meteor.user();
    //console.log "management.controller removeRole currentuser: " + JSON.stringify(currentuser,null,2)
    var self = this;
    Meteor.call("removeUserRole", currentuser, targetUserID, lane.name, function() {
      var newMessage = "You've successfully unassigned " + targetUserID + " from this lane.";
      var message = self.state.message;
      message[index] = newMessage;
      self.setState({message: message});

      setTimeout(() => {
        var message = self.state.message;
        message[index] = "";
        self.setState({message: message});
      }
        , 1000);
    });
  }


  content(){
    var users = this.props.users;
    var time = this.state.time;
    var self = this;

    var userList = function (lane, laneIndex) {
      var laneUsers = self.userRoleFilter(users, lane);
      var l = laneUsers.map((user, index)=>(
          <a className="task-link view" key={index}>
            <div className="well well-sm user">
            <table style={{textOverflow: 'ellipsis'}}>
              <tbody>
                <tr>
                  <td>
                    <Gravatar title={user.profile.name} email={user.profile.email} size={30} style={{borderRadius:15, marginRight: 9}} />
                  </td>
                  <td>
                    <span className="name" title={user.profile.name}>{user.profile.name}</span>
                    <span style={{fontSize: 10}}>{user.profile.groups[0] || 'Employee'}</span>

                    {
                      ( ((time[lane.name]) && (time[lane.name][user._id]) && (time[lane.name][user._id].in_progress)) ? (
                        <span className="name" style={{fontSize: 10}}>In Progress: {time[lane.name][user._id].in_progress/1000 | duration}</span>
                      ) : (
                        <span className="name" style={{fontSize: 10}}>In Progress: N/A</span>
                      ) )
                    }

                    {
                      ( ((time[lane.name]) && (time[lane.name][user._id]) && (time[lane.name][user._id].paused)) ? (
                        <span className="name" style={{fontSize: 10}}>Paused: {time[lane.name][user._id].paused/1000 | duration}</span>
                      ) : (
                        <span className="name" style={{fontSize: 10}} >Paused: N/A</span>
                      ))
                    }

                  </td>
                  <td>
                    <img src="/assets/remove.png" onClick={(e)=>self.removeRole(lane, user._id, e, laneIndex)} width={30} height={30} />
                  </td>
                </tr>
              </tbody>
            </table>
            </div>
          </a>
        ))

      return l;
    }

    var list = this.state.dashboard.lanes.map((lane, index)=>(
      <td className="user-cell" key={index}>
        <Droppable types={['user']} onDrop={(data, event)=>this.dropUser(data, event, lane, index)}>
          <div className="user-lane">
            <div className="user-lane-head">
              <b>{lane.label}</b>
              <br/>
            </div>
            <div className={"lane-feedback " + (this.state.message[index]) ? 'active' : ''}>{this.state.message[index]}</div>
            <div className="user-lane-body">
            {userList(lane, index)}
            <div className="well well-sm user-drop"><img src="/assets/add-user.png" width="30" height="30" /><br />Drop the user here to assign</div>
            </div>
          </div>
        </Droppable>
      </td>
    ))

    return (
      <div className="container-fluid dashboard-div">
        <table className="table table-bordered lanes table-users scroll">
          <tbody>
            <tr>
              {list}
            </tr>
          </tbody>
        </table>
        <div className="user-footer">Drag and drop users on the lane to assign them to the respective lanes ..</div>
      </div>
    )
  }

  render() {
    return (
      <div>
        <div id="navbar">
          <Toolbar name={this.state.contentName} dashboardName={this.state.dashboardName}/>
        </div>

        <Menu panel={this.state.panel} name={this.state.contentName} dashboardName={this.state.dashboardName}/>

        {this.content()}
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
  }
}
const mapStateToProps = state => ({
  dashboards: state.dashboards.dashboards,
});

export default 
  compose (
    connect(mapStateToProps, mapDispatchToProps),
    withTracker(() => {
      return { 
        users: Meteor.users.find({}).fetch() 
      }
    })
  )(Management);

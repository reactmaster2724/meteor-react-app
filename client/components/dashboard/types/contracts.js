import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux';
import { browserHistory } from 'react-router'
import DurationProgressBar from '../../common/DurationProgressBar'

class Contracts extends Component {

  constructor(props) {
    super(props);
    this.state = {
      jobopenings: []
    }
    //console.log("DashboardDefault props: ", props)
    //console.log("Generics.jobopening: ", Generics.jobopening);
  }

  componentWillMount() {
    var jobopenings = Mongo.Collection.get('jobopening').find({}).fetch();
    this.setState({ jobopenings: jobopenings });

    //console.log(Mongo.Collection.get('jobopening').find().fetch());
  }

  createJobOpening() {
  }

  headerList() {
    const list = this.props.dashboard.lanes.map((lane, index) => {
      return (
        (!lane.collapsed) ?
          (
            <th
              className="text-center"
              key={index}
              style={{ width: this.props.columnWidth }}
              onClick={() => this.props.toggleCollapse(lane)}
            >
              {lane.label}
              <i className="pull-right dimmed glyphicon glyphicon-minus"></i>
            </th>
          ) : (
            <th className="text-center collapsed-th" key={index} onClick={() => this.props.toggleCollapse(lane)}>
              <i className="glyphicon glyphicon-plus"></i>
            </th>
          )
      )
    });

    return (
      <table className="table lanes table-header" style={{ width: this.props.container.style.minWidth - this.props.scrollBar, tableLayout: this.props.tableLayout }}
        ref={(ref) => { if (ref) this.headerHeight = ref.offsetHeight }}
      >
        <thead>
          <tr>
            {list}
          </tr>
        </thead>
      </table>
    )
  }

  createJobApplicant(job_title, customer) {
    const jobopening = { formData: { "job_title": job_title, "customer_name": customer } };
    //console.log(`dashboard.recruitment.controller creatJobApplicant`);
    /*
    ActionService.createAction("APPLICANTS_1", $scope.currentUserId,jobopening, true)
        .then(act => $state.go("action", {id: act._id, source: $stateParams.name}));
    */
  }

  bodyList() {
    const { tasks, actions, source, dashboard, users } = this.props
    const { gotoAction } = this
    const { actionTimes } = this.state

    var taskcard;
    if (tasks) {
      if (tasks.hasOwnProperty(source)) {
        taskcard = tasks[source];
      } else {
        taskcard = false;
      }
    } else {
      taskcard = false;
    }
    function getOwner(ownerID, sort) {

      for (let user of Array.from(users)) {
        if (user._id === ownerID) {
          if (sort === 'email') {
            return user.profile.email;
          }
          if (sort === 'name') {
            return user.profile.name;
          }
        }
      }
    }
    function gravatar_url(ownerID) {
      var email = getOwner(ownerID, 'email');
      if (email) {
        var options = { secure: true };
        var md5Hash = Gravatar.hash(email);
        var url = Gravatar.imageUrl(email, options);
        return url;
      } else {
        return "assets/no-user.png";
      }
    }

    const formData = (data) => {
      var temp = {};
      Object.keys(data).map(function (key) {
        if (data[key] && typeof (data[key]) == "object") {
          Object.keys(data[key]).map(function (k) {
            temp[k] = data[key][k];
          });
        } else {
          temp[key] = data[key]
        }
      });
      return temp;
    }

    function getLane(laneName) {

      const lanePanel = actions.map((action, index) =>
        (action.dashboardName !== source) ? null :
          (action.lane == laneName && action.state != "DONE") ? (
            <a className="task-link ng-scope view" key={index} onClick={() => gotoAction({ source: source, id: action._id, lane: action.lane })}>
              <div className="well well-sm task">
                <div className="info">
                  <div className={"text-primary " + ((action.state == "paused") ? ('red') : ('green'))}>{(taskcard) ? ((action.data[taskcard.title]) ? (action.data[taskcard.title]) : (formData(action.formData)[taskcard.title])) : null}</div>
                  <div className="lines">
                    <div className="line" >{(taskcard) ? ((action.data[taskcard.line1]) ? (action.data[taskcard.line1]) : (formData(action.formData)[taskcard.line1])) : null}</div>
                    <div className="line">{(taskcard) ? ((action.data[taskcard.line2]) ? (action.data[taskcard.line2]) : (formData(action.formData)[taskcard.line2])) : null}</div>
                    <div className="line">{(taskcard) ? taskcard.display_sequence ? action.seq_id : null : null}</div>
                  </div>
                  <div className="user-photo">
                    {(action.ownerID) ? (
                      //insert gravater IMG
                      <img src={gravatar_url(action.ownerID)} draggable="false" height="50" width="50" className="ng-scope" style={{ borderRadius: 25 + 'px' }} />
                    ) : (
                        <img src="assets/no-user.png" draggable="false" height="50" width="50" className="ng-scope" style={{ borderRadius: 25 + 'px' }} />
                      )}

                  </div>
                </div>
                {(!(action.status == 'done' || action.lane == 'DONE' || action.status == 'DONE' || action.status == 'failed') && (
                  typeof (dashboard.name) !== "undefined") ? ((dashboard.name != "personal") ? true : false) : (true)) ? (
                    <div className="status">
                      <span className={"glyphicon glyphicon-time " + ((action.status == "in_progress") ? ("blue") : ((action.status == "paused") ? ("red") : ("green")))}></span>
                      <div>
                        <span>Lane:
                                <span>{moment(actionTimes[action._id]).fromNow()}</span>
                        </span>
                        <span>Workflow:
                                <span>{moment(action._created).fromNow()}</span>
                        </span>
                      </div>
                    </div>
                  ) : null}
                {source == 'personal' ? (
                  // <!-- PERSONAL DASHBOARD --> 
                  <div className="status">
                    <span className="glyphicon glyphicon-map-marker" aria-hidden="true"></span>
                    <div>
                      <span>Source:<span>...</span></span>
                    </div>
                  </div>
                ) : null
                }
              </div>
            </a>
          ) : null
      )
      return lanePanel
    }

    const done_lane = actions.map((action, index) =>
      (action.dashboardName !== source) ? null :
        (action.state == "DONE") ? (
          <a className="task-link ng-scope view" key={index} onClick={() => gotoAction({ source: source, id: action._id, lane: action.lane })}>
            <div className="well well-sm task">
              <div className="info">
                <div className={"text-primary " + ((action.state == "paused") ? ('red') : ('green'))}>{(taskcard) ? ((action.data[taskcard.title]) ? (action.data[taskcard.title]) : (formData(action.formData)[taskcard.title])) : null}</div>
                <div className="lines">
                  <div className="line" >{(taskcard) ? ((action.data[taskcard.line1]) ? (action.data[taskcard.line1]) : (formData(action.formData)[taskcard.line1])) : null}</div>
                  <div className="line">{(taskcard) ? ((action.data[taskcard.line2]) ? (action.data[taskcard.line2]) : (formData(action.formData)[taskcard.line2])) : null}</div>
                  <div className="line">{(taskcard) ? taskcard.display_sequence ? action.seq_id : null : null}</div>
                </div>
                <div className="user-photo">
                  {(action.ownerID) ? (
                    <img src={gravatar_url(action.ownerID)} draggable="false" height="50" width="50" className="ng-scope" style={{ borderRadius: 25 + 'px' }} />
                  ) : (
                      <img src="assets/no-user.png" draggable="false" height="50" width="50" className="ng-scope" style={{ borderRadius: 25 + 'px' }} />
                    )}

                </div>
              </div>
              {(!(action.status == 'done' || action.lane == 'DONE' || action.status == 'DONE' || action.status == 'failed') && (dashboard.name) ? ((dashboard.name != "personal") ? true : false) : (true)) ? (
                <div className="status">
                  <span className={"glyphicon " + ((action.status == "failed") ? ("glyphicon-remove red") : ("glyphicon-ok green"))}></span>
                  <div>
                    <span>{action.status}
                      <span>{moment(actionTimes[action._id]).fromNow()}</span>
                    </span>
                    <span>Workflow:
                            <span>{moment(action._created).fromNow()}</span>
                    </span>
                  </div>
                </div>
              ) : null}
              {source == 'personal' ? (
                // <!-- PERSONAL DASHBOARD --> 
                <div className="status">
                  <span className="glyphicon glyphicon-map-marker" aria-hidden="true"></span>
                  <div>
                    <span>Source:<span>...</span></span>
                  </div>
                </div>
              ) : null
              }
            </div>
          </a>
        ) : (null)
    )

    const lanes = this.props.dashboard.lanes.map((lane, index) =>
      (!lane.collapsed) ? (
        <td key={index} style={{ paddingTop: (this.headerHeight) ? 10 + this.headerHeight : 48, height: window.innerHeight - 70 }}>
          {getLane(lane.name)}
          {(lane.name == "DONE") ? done_lane : null}
        </td>
      ) :
        (
          <td className="collapsed-td" key={index} onClick={() => this.props.toggleCollapse(lane)} style={{ paddingTop: (this.headerHeight) ? 10 + this.headerHeight : 10, height: window.innerHeight }}>
            <div className="collapsed-label">{lane.label}</div>
          </td>
        )
    )


    return (
      <table className="table lanes table-main" style={{ width: this.props.container.style.minWidth - this.props.scrollBar, tableLayout: this.props.tableLayout }}>
        <tbody>
          <tr>
            {lanes}
          </tr>
        </tbody>
      </table>
    )
  }

  footerList() {
    const footers = this.props.dashboard.lanes.map((lane, index) =>
      (!lane.collapsed) ? (
        <td key={index}>
          <div className="footer-info">
            <div className="time">
              <span>
                <span className="value">{this.props.durationFilter(this.props.time[lane.name])}
                </span> {this.props.suffixFilter(this.props.time[lane.name])}
              </span>
              <span className="text-grey">Average time</span>
            </div>
            <div className="costs">
              <span>R
                <span className="value"> {this.props.littlesLaw(this.props.time[lane.name], this.props.actions.length, this.props.suffixFilter(this.props.time[lane.name]))}</span>
              </span>
              <span className="text-grey">Throughput</span>
            </div>
          </div>
          <div className="footer-progress text-grey">
            <div className="bar">
              <span>Productivity bar</span>
              {
                !(lane.name == 'INBOX' || lane.name == 'DONE') ? (
                  <DurationProgressBar
                    tbp={this.props.time[lane.name] ? this.props.time[lane.name].tbp : null}
                    paused={this.props.time[lane.name] ? this.props.time[lane.name].paused : null}
                    inprogress={this.props.time[lane.name] ? this.props.time[lane.name].in_progress : null}
                    ng-show="!(lane.name == 'INBOX' || lane.name == 'DONE')"
                  >
                  </DurationProgressBar>
                ) : null
              }
            </div>
            <div className="text">
              <span className="value">{this.props.actions[lane.name] ? this.props.actions[lane.name].length : null}</span>Total task
            </div>
          </div>
        </td>
      ) :
        (
          <td className="collapsed-td" key={index} onClick={() => this.props.toggleCollapse(lane)} >
          </td>
        )
    )

    return (
      <table
        className="table lanes table-footer" style={{ width: this.props.container.style.minWidth - this.props.scrollBar, tableLayout: this.props.tableLayout }}
        onClick={(e) => this.props.openFooter(e)}
      >
        <tbody>
          <tr>
            {footers}
          </tr>
        </tbody>
      </table>
    )
  }

  render() {
    var jobopeningShow = [];
    for (var i = 0; i < (this.state.jobopenings.length > 10 ? 10 : this.state.jobopenings.length); i++) {
      jobopeningShow[i] = this.state.jobopenings[i];
    }

    var self = this;
    const jobList = jobopeningShow.map((jobopening) => (
      <div className="entity" onClick={self.createJobApplicant(jobopening.job_title, jobopening.customer)} style={{ width: 300 }}>
        <table id="model">
          <tr>
            <td>
              <span className="entity-info">
                <span>{jobopening.job_title}</span>
                <span>{jobopening.customer}</span>
                <span className="smaller">{jobopening.jobstatus}</span>
              </span>
            </td>
          </tr>
        </table>
      </div>
    ))

    return (
      <div>

        <div className="contr-container" id="mapper" style={{ width: 300 }}>
          <div className="search-col contracts">
            <div className="contr-head" style={{ height: this.headerHeight }}>
              <span>Job Contracts</span>
            </div>
            <div className="contr-body">
              {jobList}
            </div>
          </div>
        </div>

        {this.headerList()}
        {this.bodyList()}
        {this.footerList()}
      </div>
    )
  }
}

function bindAction(dispatch) {
  return {
  };
}

const mapStateToProps = state => ({
  dashboards: state.dashboards.dashboards,
  overrides: state.dashboards.overrides,
  currentUser: state.currentUser.currentUser,
  entryPoints: state.actions.entryPoints
});

export default connect(mapStateToProps, bindAction)(Contracts);

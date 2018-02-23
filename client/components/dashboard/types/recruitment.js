import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux';
import { browserHistory } from 'react-router'

class DurationProgressBar extends Component {
  render() {
    var total = ((this.props.tbp || 0) + (this.props.paused || 0) + (this.props.inprogress || 0));

    var tbpPercentage = (((this.props.tbp || 0) / total) * 100) + "%";
    var pausedPercentage = (((this.props.paused || 0) / total) * 100) + "%";
    var inprogressPercentage = (((this.props.inprogress || 0) / total) * 100) + "%";

    return (
      <div className="duration-bar">
        <div className="bar-tbp" style={{ width: tbpPercentage }}>
          <div className="bar-info">
            To Be Pulled: {this.props.tbp}
          </div>
        </div>
        <div className="bar-paused" style={{ width: pausedPercentage }}>
          <div className="bar-info">
            Paused: {this.props.paused}
          </div>
        </div>
        <div className="bar-inprogress" style={{ width: inprogressPercentage }}>
          <div className="bar-info">
            In Progress: {this.props.inprogress}
          </div>
        </div>
      </div>
    )
  }
}

class Recruitment extends Component {

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
            <th className="text-center" style={{ borderRight: 0, borderRightColor: 'black', borderRadius: 0, width: this.props.columnWidth }}>
              Job Openings
              <button className="btn btn-info pull-right" onClick={this.createJobOpening()}>
                <span className="glyphicon glyphicon-plus"></span>
              </button>
            </th>
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

    const lanes = this.props.dashboard.lanes.map((lane, index) =>
      (!lane.collapsed) ? (
        <td key={index} style={{ paddingTop: (this.headerHeight) ? 10 + this.headerHeight : 10, height: window.innerHeight - 70 }}>

        </td>
      ) :
        (
          <td className="collapsed-td" key={index} onClick={() => this.props.toggleCollapse(lane)} style={{ paddingTop: (this.headerHeight) ? 10 + this.headerHeight : 10, height: window.innerHeight }}>
            <div className="collapsed-label">{lane.label}</div>
          </td>
        )
    )

    var jobopeningShow = [];
    for (var i = 0; i < (this.state.jobopenings.length > 10 ? 10 : this.state.jobopenings.length); i++) {
      jobopeningShow[i] = this.state.jobopenings[i];
    }

    var self = this;
    const jobList = jobopeningShow.map((jobopening) => (
      <a className="entity info entity-info" onClick={self.createJobApplicant(jobopening.job_title, jobopening.customer)}>
        <div className="well task" style={{ marginBottom: 0, borderWidth: 1, borderRightColor: 'black', borderRadius: 0 }}>
          <div className="text-primary line">{jobopening.job_title}</div>
          <div className="line">{jobopening.customer}</div>
          <div className="line">{jobopening.jobstatus}</div>
        </div>
      </a>
    ))

    return (
      <table className="table lanes table-main" style={{ tableLayout: this.props.tableLayout }}>
        <tbody>
          <tr>
            <td style={{ paddingTop: (this.headerHeight) ? 10 + this.headerHeight : 10, paddingBottom: 110, width: this.props.columnWidth }}>
              {jobList}
            </td>
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
            <td style={{ width: this.props.columnWidth }}>For Job Opening contract functionality</td>
            {footers}
          </tr>
        </tbody>
      </table>
    )
  }

  render() {
    return (
      <div>
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

export default connect(mapStateToProps, bindAction)(Recruitment);

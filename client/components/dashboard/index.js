import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux';
import { browserHistory } from 'react-router'
import Toolbar from '../toolbar/'
import Menu from '../menu/'

import DashboardDefault from './types/default'
import Recruitment from './types/recruitment'
import Erpnext from './types/erpnext'
import Contracts from './types/contracts'
import ContractsModels from './types/contracts-models'
import Finance from './types/finance'

import { withTracker } from 'meteor/react-meteor-data';
import appConfig from '../../config'
import { compose } from 'redux';
import { setDashboardContent } from '../../actions/setDashboardContent';
import { setPanel } from '../../actions/setPanel';
import moment from "moment";
require("moment-duration-format");

const _ = window.lodash;

class Dashboard extends Component {

  static propTypes = {
  }

  constructor(props) {
    super(props);
    this.state = {
      name: "",
      tableLayout: "fixed",
      scrollbar: 0,
      container: { style: {} },
      totalWidth: window.innerWidth,
      columnWidth: 0,
      dashboardName: ((props.params) && (props.params.name)) ? props.params.name : '',
      dashboard: ((props.dashboards) && (props.params) && (props.params.name)) ? props.dashboards[props.params.name] : null,
      time: {}
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWidth());
  }

  componentWillMount() {

    var self = this;

    // if (!Object.keys(this.props.currentUser).length) {

    //   browserHistory.push('/login');

    // } else {

    var scw = this.getScrollBarWidth();

    this.setState({ scrollbar: scw })

    this.updateWidth();

    window.addEventListener('resize', this.updateWidth());

    if (this.props.location.pathname == "/dashboard") {

      if (this.props.dashboards) {

        var dashboards = this.props.dashboards;

        browserHistory.push('/dashboard/' + Object.keys(dashboards)[1]);

      }

    }

    var self = this;

    Meteor.call("getTimeTracker", function (err, times) {

      if (err != null) {

        console.log(err);
      }
      var stateTime = {} //JSON.parse(JSON.stringify(self.state.time));

      for (let time of Array.from(times)) {

        if (!stateTime[time._id.lane]) {

          stateTime[time._id.lane] = {};

        }

        stateTime[time._id.lane][time._id.status] = time.duration;

      }

      self.setState({ time: stateTime });

      return;
    });
    // }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.location.pathname == "/dashboard") {
      var dashboards = nextProps.dashboards;
      browserHistory.push('/dashboard/' + Object.keys(dashboards)[1]);
      return;
    }
    if (nextProps.params.name) {
      this.setState({ dashboardName: nextProps.params.name });
      this.findContents(nextProps.params.name, nextProps);
      if (nextProps.dashboards)
        this.updateWidthWithParam(nextProps.dashboards[nextProps.params.name])
    }
  }

  getScrollBarWidth() {
    var outer = document.createElement("div");
    outer.style.visibility = "hidden";
    outer.style.width = "100px";
    outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps

    document.body.appendChild(outer);

    var widthNoScroll = outer.offsetWidth;
    // force scrollbars
    outer.style.overflow = "scroll";

    // add innerdiv
    var inner = document.createElement("div");
    inner.style.width = "100%";
    outer.appendChild(inner);

    var widthWithScroll = inner.offsetWidth;

    // remove divs
    outer.parentNode.removeChild(outer);
    return widthNoScroll - widthWithScroll;
  }

  findContents(name, nextProps) {

    if (!this.props.currentUser) {
      browserHistory.push('/login');
    }

    if (this.props.dashboards) {
      this.setState({ dashboard: this.props.dashboards[name] });
    }
    else if (nextProps.dashboards) {
      this.setState({ dashboard: nextProps.dashboards[name] });
    }

    // Navigate away from the default, figure out 
    var contentName = ""
    if (['personal', 'erpnext'].includes(name)) {
      contentName = "dashboard." + name;
    } else {
      //console.log 'dashboard.controller override: ' + override
      var override = this.props.overrides[name];
      if (override != null) {
        contentName = "dashboard." + override.type;
        var param = override;
      } else {
        contentName = "dashboard.default";
      }
    }
    if (contentName) {
      //console.log(contentName);
      this.props.setDashboardContent(contentName);
    }
  }

  updateWidthWithParam(dashboard) {
    this.setState({ windowWidth: window.innerWidth })
    var windowWidth = window.innerWidth;
    var minWidth;
    if (!this.props.panel.toggleRight) {

      if (this.state.totalWidth > windowWidth) {
        minWidth = this.state.totalWidth + this.state.scrollbar;
      } else {
        minWidth = windowWidth;
      }
    } else {
      if (this.state.totalWidth > windowWidth) {
        minWidth = "100%";
      } else {
        minWidth = windowWidth;
      }
    }

    const lanes = dashboard != null ? dashboard.lanes : undefined;
    if (!lanes)
      return

    const laneNumber = lanes.length;
    let collapsedLanes = 0;

    for (let lane of Array.from(lanes)) {
      if (lane.collapsed) {
        collapsedLanes++;
      }
    }

    var totalWidth = (collapsedLanes * 30) + ((lanes.length - collapsedLanes) * appConfig.config.tableColumn);

    if (this.state.totalWidth <= windowWidth) {
      //console.log("auto")
      this.setState({ container: { style: { minWidth: minWidth } }, totalWidth: totalWidth, columnWidth: "auto" })
    } else {
      //console.log("fixed column")
      this.setState({ container: { style: { minWidth: minWidth } }, totalWidth: totalWidth, columnWidth: appConfig.config.tableColumn })
    }
  }

  updateWidth() {
    this.setState({ windowWidth: window.innerWidth })
    this.recalcColumns()
  }

  recalcColumns() {
    var windowWidth = window.innerWidth;
    var minWidth;
    if (!this.props.panel.toggleRight) {

      if (this.state.totalWidth > windowWidth) {
        minWidth = this.state.totalWidth + this.state.scrollbar;
      } else {
        minWidth = windowWidth;
      }
    } else {
      if (this.state.totalWidth > windowWidth) {
        minWidth = "100%";
      } else {
        minWidth = windowWidth;
      }
    }

    const lanes = this.state.dashboard != null ? this.state.dashboard.lanes : undefined;
    if (!lanes)
      return

    const laneNumber = lanes.length;
    let collapsedLanes = 0;

    for (let lane of Array.from(lanes)) {
      if (lane.collapsed) {
        collapsedLanes++;
      }
    }

    var totalWidth = (collapsedLanes * 30) + ((lanes.length - collapsedLanes) * appConfig.config.tableColumn);

    if (this.state.totalWidth <= windowWidth) {
      //console.log("auto")
      this.setState({ container: { style: { minWidth: minWidth } }, totalWidth: totalWidth, columnWidth: "auto" })
    } else {
      //console.log("fixed column")
      this.setState({ container: { style: { minWidth: minWidth } }, totalWidth: totalWidth, columnWidth: appConfig.config.tableColumn })
    }
  }

  toggleCollapse(theLane) {
    // //console.log("toggleCollapse");
    if (!this.state.dashboard)
      return null
    if (!theLane.collapsed) {
      // only allow if there's at least 1 other lane left expanded
      const hasOtherExpandedLane = _.some(this.state.dashboard.lanes, function (lane) {
        // don't include it in the calculation
        if (lane.name === theLane.name)
          return false

        // may exit early
        if (!lane.collapsed)
          return true
      });
      if (hasOtherExpandedLane) { theLane.collapsed = true; }
    } else {
      theLane.collapsed = false;
    }
    this.recalcColumns();
    return;
  }

  openFooter(e) {
    e = e || window.event;
    e.target.classList.toggle("visible");
    var scw = this.getScrollBarWidth();
    if (e.target.classList.contains("visible")) {
      this.setState({ scrollbar: scw })
    } else {

      this.setState({ scrollbar: scw })
    }
    return;
  }

  getLane(id) {
    // Now just add the current to it
    for (let dbName in this.props.dashboards) {

      const dashboard = this.props.dashboards[dbName];
      if (!dashboard.lanes) { continue; } //Skip lane free dashboards
      for (let lane of Array.from(dashboard.lanes)) {
        if (Array.from(lane.ids).includes(id)) {
          return lane.name;
        }
      }
    }
    return null;
  }

  togglePanel() {
  }

  durationFilter(input) {

    if (!input) { return "00:00"; }
    // The time here should already be an average
    const totalTime = (input.tbp || 0) + (input.paused || 0) + (input.in_progress || 0);
    // averageTime = totalTime / taskCount

    const duration = moment.duration(totalTime);

    if (duration.asDays() < 1) {
      //console.log("durationFileter",moment.duration(duration.minutes(),"minutes").format("h:mm",{trim:false}))
      return moment.duration(duration.minutes(), "minutes").format("hh:mm", { trim: false })
    } else if (duration.asMonths() < 1) {
      return moment.duration(duration.hours(), "hours").format("dd:hh", { trim: "left" })
    } else {
      return moment.duration(duration.days(), "days").format("MM", { trim: "left" })
    }
  }

  suffixFilter(input) {
    if (!input) { return ""; }

    const totalTime = input.tbp + input.paused + input.in_progress;
    const duration = moment.duration(totalTime);
    if (duration.asDays() < 1) {
      return "hours";
    } else if (duration.asMonths() < 1) {
      return "days";
    } else {
      return "months";
    }
  }

  littlesLaw(time, inventory, suffix) {
    let throughput;
    if (!time) { return 0; }

    // figure out by how much we need to divide
    let divisor = 1000; // 1 second
    if (['minutes', 'mins'].includes(suffix)) {
      divisor = divisor * 60;
    } else if (['hrs', 'hours'].includes(suffix)) {
      divisor = divisor * 60 * 60;
    } else if (suffix === 'days') {
      divisor = divisor * 60 * 60 * 24;
    }


    // We get T (time) and I (inventory), little's law is I = R * T
    let total_time = time.tbp + time.in_progress + time.paused;

    let dividor = 60000;
    if (suffix === 'hours') {
      dividor *= 60;
    } else if (suffix === 'days') {
      dividor *= 60 * 24;
    } else if (suffix === 'months') {
      dividor *= 60 * 24 * 12;
    }

    //console.log("litteslaw",total_time)
    // We want total time to be in minutes
    total_time = total_time / dividor;
    if (total_time !== 0) {
      // We calculate throughput I / T = R
      throughput = inventory / total_time;
    } else {
      throughput = 0; // Unknown until we have data
    }

    if (isNaN(throughput)) { return 0; }

    // Round to 2 decimal places
    return Math.round(throughput * 10000) / 10000;
  }

  todoFilter(inputs, fromDays, toDays) {
    let from, to;
    /*
    const today = moment().startOf('day');

    if (fromDays === "today") {
      from = today;
    } else if (fromDays != null) {
      from = moment().add(fromDays,'days');
    }

    if (toDays === "today") {
      from = today;
    } else if (toDays != null) {
      to = moment().add(toDays,'days');
    }

    _.filter(inputs, function(input) {
      //return false if !input.formData?.deadline?
      let date = moment(angular.copy(input.formData.duedate));
      date = date.startOf('day');

      const fromDiff = !from || (from && from.isBefore(date));
      const toDiff = !to || (to && to.isAfter(date));

      if (date.isBefore(today)) {
        input.overDue = true;
      }

      if (fromDiff && toDiff) {
        return input;
      }
    })*/
  }

  content() {
    console.log("here is dashboard index.js", this.props.contentName)
    if (this.props.contentName == "dashboard.default" && this.state.dashboard) {

      return <DashboardDefault
        dashboard={this.state.dashboard}
        tableLayout={this.state.tableLayout}
        scrollBar={this.state.scrollbar}
        container={this.state.container}
        toggleCollapse={(lane) => this.toggleCollapse(lane)}
        columnWidth={this.state.columnWidth}
        openFooter={(e) => this.openFooter(e)}
        time={this.state.time}
        durationFilter={(input) => this.durationFilter(input)}
        suffixFilter={(input) => this.suffixFilter(input)}
        littlesLaw={(time, inventory, suffix) => this.littlesLaw(time, inventory, suffix)}
        actions={this.props.actions}
        users={this.props.users}
        source={this.state.dashboardName}
        tasks={this.props.tasks}
      />
    } else if (this.props.contentName == "dashboard.recruitment" && this.state.dashboard) {
      return <Recruitment
        dashboard={this.state.dashboard}
        tableLayout={this.state.tableLayout}
        scrollBar={this.state.scrollbar}
        container={this.state.container}
        toggleCollapse={(lane) => this.toggleCollapse(lane)}
        columnWidth={this.state.columnWidth}
        openFooter={(e) => this.openFooter(e)}
        time={this.state.time}
        durationFilter={(input) => this.durationFilter(input)}
        suffixFilter={(input) => this.suffixFilter(input)}
        littlesLaw={(time, inventory, suffix) => this.littlesLaw(time, inventory, suffix)}
        actions={this.props.actions}
        users={this.props.users}
        source={this.state.dashboardName}
        tasks={this.props.tasks}
      />
    } else if (this.props.contentName == "dashboard.contracts" && this.state.dashboard) {
      return <Contracts
        dashboard={this.state.dashboard}
        tableLayout={this.state.tableLayout}
        scrollBar={this.state.scrollbar}
        container={this.state.container}
        toggleCollapse={(lane) => this.toggleCollapse(lane)}
        columnWidth={this.state.columnWidth}
        openFooter={(e) => this.openFooter(e)}
        time={this.state.time}
        durationFilter={(input) => this.durationFilter(input)}
        suffixFilter={(input) => this.suffixFilter(input)}
        littlesLaw={(time, inventory, suffix) => this.littlesLaw(time, inventory, suffix)}
        actions={this.props.actions}
        users={this.props.users}
        source={this.state.dashboardName}
        tasks={this.props.tasks}
      />
    } else if (this.props.contentName == "dashboard.contracts-models" && this.state.dashboard) {
      return <ContractsModels
        dashboard={this.state.dashboard}
        tableLayout={this.state.tableLayout}
        scrollBar={this.state.scrollbar}
        container={this.state.container}
        toggleCollapse={(lane) => this.toggleCollapse(lane)}
        columnWidth={this.state.columnWidth}
        openFooter={(e) => this.openFooter(e)}
        time={this.state.time}
        durationFilter={(input) => this.durationFilter(input)}
        suffixFilter={(input) => this.suffixFilter(input)}
        littlesLaw={(time, inventory, suffix) => this.littlesLaw(time, inventory, suffix)}
        actions={this.props.actions}
        users={this.props.users}
        source={this.state.dashboardName}
        tasks={this.props.tasks}
      />
    } else if (this.props.contentName == "dashboard.finance" && this.state.dashboard) {
      return <Finance
        dashboard={this.state.dashboard}
        tableLayout={this.state.tableLayout}
        scrollBar={this.state.scrollbar}
        container={this.state.container}
        toggleCollapse={(lane) => this.toggleCollapse(lane)}
        columnWidth={this.state.columnWidth}
        openFooter={(e) => this.openFooter(e)}
        time={this.state.time}
        durationFilter={(input) => this.durationFilter(input)}
        suffixFilter={(input) => this.suffixFilter(input)}
        littlesLaw={(time, inventory, suffix) => this.littlesLaw(time, inventory, suffix)}
        actions={this.props.actions}
        users={this.props.users}
        dashboardName={this.state.dashboardName}
        source={this.state.dashboardName}
        tasks={this.props.tasks}
      />
    } else if (this.props.contentName == "dashboard.erpnext") {
      return <Erpnext />
    }
    return null;
  }

  render() {

    return (
      <div>
        <div id="navbar">
          <Toolbar name={this.props.contentName} dashboardName={this.state.dashboardName} />
        </div>

        <Menu name={this.props.contentName} dashboardName={this.state.dashboardName} />
        {
          this.props.panel.toggleLeft ? (
            <div onClick={() => this.togglePanel()} className="overlay"></div>
          ) : null
        }

        <div onClick={() => this.props.setPanel({ toggleRight: false })}>
          {this.content()}
        </div>
      </div>
    )
  }
}

function bindAction(dispatch) {
  return {
    setDashboardContent: content => { dispatch(setDashboardContent(content)) },
    setPanel: panel => { dispatch(setPanel(panel)) },
  };
}

function getActions() {
  Meteor.call('getAllAction', function (error, action) {
    if (error) {
      return;
    } else {
      Session.set("actions", action);
    }
  });
}

const mapStateToProps = state => ({
  dashboards: state.dashboards.dashboards,
  tasks: state.todos.todos,
  overrides: state.dashboards.overrides,
  currentUser: state.currentUser.currentUser,
  contentName: state.dashboardContent.dashboardContent,
  panel: state.panel.panel
});

export default
  compose(
    connect(mapStateToProps, bindAction),
    withTracker(() => {
      getActions();
      if (Session.get("actions")) {
        return {
          users: Meteor.users.find({}).fetch(),
          actions: Session.get("actions")
        }
      } else {
        return {
          users: Meteor.users.find({}).fetch(),
          actions: Actions.find({}).fetch()
        }
      }

    })
  )(Dashboard);

import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux';
import { browserHistory } from 'react-router'
import moment from "moment";
import DurationProgressBar from '../../common/DurationProgressBar'
import DashboardTask from '../task/dashbordtask'

class DashboardDefault extends Component {

    constructor(props) {
        super(props);
        this.state = {
        }
    }
    componentWillMount() {

        var actionTimes = {};

        $.each(this.props.actions, function (key, action) {

            var lane, time, total_time;

            if (!Object.keys(action.time).length) {

                return;

            }

            lane = action.lane;

            if (!lane) {

                return;
            }
            time = action.time[lane];

            if (!time) {

                return;

            }
            total_time = time.tbp + time.paused + time.in_progress + (new Date()).valueOf() - action.status_start;

            return actionTimes[action._id] = (new Date()).valueOf() - total_time;

        });

        this.setState({ actionTimes: actionTimes });

    }

    headerList() {
        //console.log("here is default.js",this)
        const list = this.props.dashboard.lanes.map((lane, index) => {
            return (
                (!lane.collapsed) ?
                    (
                        <th
                            className="text-center"
                            key={index}
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

    getOwner(ownerID, sort) {
        for (let user of Array.from(this.props.users)) {
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

    gotoAction(action) {
        browserHistory.push('/action?source=' + this.props.source + '&lane=' + action.lane + "&id=" + action.id);
    }

    bodyList() {

        const lanes = this.props.dashboard.lanes.map((lane, index) =>
            (!lane.collapsed) ? (
                <td key={index} style={{ paddingTop: (this.headerHeight) ? 10 + this.headerHeight : 10, height: window.innerHeight - 70 }}>
                    {this.props.actions.map((action, index) =>
                        (
                            <a className="task-link view" key={index} onClick={() => this.gotoAction({ id: action._id, lane: lane.name })}>
                                <DashboardTask action={action} dashboardName={this.props.source} task={this.props.task} users={this.props.users} actionTimes={this.state.actionTimes} laneName={lane.name}/>
                            </a>
                        )
                    )}
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
        function getTotaltaskNum(actions, laneName) {
            var count = 0;
            if (Object.keys(actions).length) {
                $.each(actions, function (k, v) {
                    if (v.state === "DONE" && laneName === "DONE") {
                        count++;
                    }
                    if (v.lane === laneName && v.state != "DONE") {
                        count++;
                    }
                });
                return count;
            } else {
                return 0;
            }

        }
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
                            <span className="value">{getTotaltaskNum(this.props.actions, lane.name)}</span>Total task
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
        if (this.props.dashboard.lanes) {
            return (
                <div>
                    {this.headerList()}
                    {this.bodyList()}
                    {this.footerList()}
                </div>
            )
        } else {
            return (
                <h1>{this.props.dashboard.label}</h1>
            )
        }

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

export default connect(mapStateToProps, bindAction)(DashboardDefault);

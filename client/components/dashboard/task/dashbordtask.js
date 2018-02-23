import React, { Component, PropTypes } from 'react'
import moment from "moment";

export default class Label extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }
    render() {
        const { action, dashboardName, task, users, actionTimes, laneName } = this.props;
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
        var taskcard;
        if (task) {
            if (task.hasOwnProperty(dashboardName)) {
                taskcard = task[dashboardName];
            } else {
                taskcard = false;
            }
        } else {
            taskcard = false;
        }
        return (
            (dashboardName != 'Accounts Receivables' && dashboardName != 'Accounts Payables') ? (
                // {<!-- MAIN DASHBOARDS -->}
                (!(action.status == 'done' || action.lane == 'DONE' || action.state == 'DONE' || action.status == 'failed') && action.state == laneName && dashboardName != 'personal') ? (
                    <div className="well well-sm task">
                        <div className="info">
                            <div className="text-primary" className="{red: action.status == 'paused', green: action.status == 'tbp', blue: action.status == 'in_progress'}">{action.data[taskcard.title] || action.formData[taskcard.title]}</div>
                            <div className="lines">
                                <div className="line">{(taskcard) ? action.formData[taskcard.line1] || action.data[taskcard.line1] : null}</div>
                                <div className="line">{(taskcard) ? action.formData[taskcard.line2] || action.data[taskcard.line2] : null}</div>
                                {taskcard ? taskcard.display_sequence ? (
                                    <div className="line">{action.seq_id}</div>
                                ) : null : null}

                            </div>
                            <div className="user-photo">
                                {action.ownerID ? (
                                    <img draggable="false" title={getOwner(action.ownerID, 'name')} src={gravatar_url(action.ownerID)}
                                        height="50" width="50" style={{ borderRadius: 25 + 'px' }} />
                                ) : (
                                        <img src="assets/no-user.png" draggable="false" height="50" width="50" />
                                    )}

                            </div>
                        </div>
                        {/* {<!-- NORMAL LANES --> */}
                        <div className="status">
                            <span aria-hidden="true" className={"glyphicon glyphicon-time " + ((action.status == "in_progress") ? ("blue") : null || ((action.status == "paused") ? ("red") : null || (action.status == 'tbp') ? "green" : null))}></span>
                            <div>
                                <span>Lane:<span>{moment(actionTimes[action._id]).fromNow()}</span></span>
                                <span>Workflow:<span>{moment(action._created).fromNow()}</span></span>
                            </div>
                        </div>
                        {dashboardName == 'personal' ? (
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
                ) : (
                        ((action.state == "DONE" && laneName == "DONE") || (action.status == 'failed' && laneName == "DONE")) ? (
                            <div className="well well-sm task">
                                <div className="info">
                                    <div className="text-primary" className="{red: action.status == 'paused', green: action.status == 'tbp', blue: action.status == 'in_progress'}">{action.data[taskcard.title] || action.formData[taskcard.title]}</div>
                                    <div className="lines">
                                        <div className="line">{(taskcard) ? action.formData[taskcard.line1] || action.data[taskcard.line1] : null}</div>
                                        <div className="line">{(taskcard) ? action.formData[taskcard.line2] || action.data[taskcard.line2] : null}</div>
                                        {taskcard ? taskcard.display_sequence ? (
                                            <div className="line">{action.seq_id}</div>
                                        ) : null : null}

                                    </div>
                                    <div className="user-photo">
                                        {action.ownerID ? (
                                            <img draggable="false" title={getOwner(action.ownerID, 'name')} src={gravatar_url(action.ownerID)}
                                                height="50" width="50" style={{ borderRadius: 25 + 'px' }} />
                                        ) : (
                                                <img src="assets/no-user.png" draggable="false" height="50" width="50" />
                                            )}

                                    </div>
                                </div>
                                {/* {<!-- DONE LANE -->}  */}
                                < div className="status">
                                    <span className={"glyphicon " + ((action.status == 'failed') ? 'glyphicon-remove' : 'glyphicon-ok') + ((action.status == 'failed' ? " red" : null || (action.status != 'failed') ? " green" : null))} aria-hidden="true"></span>
                                    <div>
                                        <span>{action.status}:<span></span>{moment(actionTimes[action._id]).fromNow()}dd</span>
                                        <span>Workflow:<span>{moment(action._created).fromNow()}</span></span>
                                    </div>
                                </div>
                                {dashboardName == 'personal' ? (
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
                        ) : null
                    )
            ) : (
                    // {<!-- FINANCE DASHBOARD -->}
                    <div className="well well-sm task">
                        <div className="info">
                            <div className="text-primary" className="{red: action.status == 'paused', green: action.status == 'tbp', blue: action.status == 'in_progress'}">{action.data[taskcard.title] || action.formData[taskcard.title]}</div>
                            <div className="lines">
                                <div className="line">{(taskcard) ? action.formData.products.total || action.formData[taskcard.line1] : 0}.00</div>
                                <div className="line">
                                    <span className="{red: action.overDue}">{action.overDue ? 'Overdue: ' : 'Due date: '}
                                        <span am-time-ago="">{moment(action._created).fromNow()}</span></span>
                                </div>
                                {taskcard ? taskcard.display_sequence ? (
                                    <div className="line">{action.seq_id}</div>
                                ) : null : null}
                            </div>
                            <div className="user-photo">
                                {action.ownerID ? (
                                    <img draggable="false" title={getOwner(action.ownerID, 'name')} src={gravatar_url(action.ownerID)}
                                        height="50" width="50" style={{ borderRadius: 25 + 'px' }} />
                                ) : (
                                        <img src="assets/no-user.png" draggable="false" height="50" width="50" />
                                    )}

                            </div>
                        </div>
                        {(!(action.status == 'done' || action.lane == 'DONE' || action.state == 'DONE' || action.status == 'failed') && dashboardName != 'personal') ? (
                            //  { <!-- NORMAL LANES -->} 
                            <div className="status">
                                <span aria-hidden="true" className={"glyphicon glyphicon-time " + ((action.status == "in_progress") ? ("blue") : null || ((action.status == "paused") ? ("red") : null || (action.status == 'tbp') ? "green" : null))}></span>
                                <div>
                                    <span>Lane:<span>{moment(actionTimes[action._id]).fromNow()}</span></span>
                                    <span>Workflow:<span>{moment(action._created).fromNow()}</span></span>
                                </div>
                            </div>
                        ) : (
                                //  { <!-- DONE LANE -->} 
                                <div className="status">
                                    <span className={"glyphicon " + (action.status == 'failed') ? 'glyphicon-remove' : 'glyphicon-ok' + (action.status == 'failed' ? " red" : null || (action.status != 'failed') ? " green" : null)} aria-hidden="true"></span>
                                    <div>
                                        <span>{action.status} :<span>{moment(actionTimes[action._id]).fromNow()}</span></span>
                                        <span>Workflow:<span>{moment(action._created).fromNow()}</span></span>
                                    </div>
                                </div>
                            )}
                    </div>
                )

        )
    }
}

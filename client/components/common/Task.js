import React, { Component, PropTypes } from 'react'
import Gravatar from 'react-gravatar';

export default class Task extends Component {
  render (){
    var color;
    
    if (this.props.action.status == 'paused')
      color = "red"
    else if (this.props.action.status == 'tbp')
      color = "green"
    else if (this.props.action.status == 'in_progress')
      color = "blue"

    return (
      <div>
        {/*<!-- MAIN DASHBOARDS -->*/}
        {
          (dashboardName != 'Accounts Receivables' && dashboardName !=  'Accounts Payables') ? (
            <div className="well well-sm task">
              <div className="info">
                <div className={"text-primary " + color}>{this.props.action.data[taskcard.title] || this.props.action.formData[taskcard.title]}</div>
                <div className="lines">
                  <div className="line">{this.props.action.data[taskcard.line1] || this.props.action.formData[taskcard.line1]}</div>
                  <div className="line">{this.props.action.data[taskcard.line2] || this.props.action.formData[taskcard.line2]}</div>
                  {
                    taskcard.display_sequence ? (
                      <div className="line">{ this.props.action.seq_id/* | minLength:4*/ }</div>
                    ) : null}
                </div>
                <div className="user-photo">
                  {
                    this.props.action.ownerID ? (
                        <Gravatar draggable="false" email={getOwner(this.props.action.ownerID, 'email')} size={50} style={{borderRadius: 25}} />
                      ) : (
                        <img src="assets/no-user.png" draggable="false" height="50" width="50" />
                      )
                  }
                </div>
              </div>
              {/*<!-- MAIN DASHBOARDS -->*/}
              {/*<!-- NORMAL LANES -->*/}
              {
                (dashboard.name == 'personal') ? (
                  /*<!-- PERSONAL DASHBOARD -->*/
                  <div className="status">
                    <span className="glyphicon glyphicon-map-marker" aria-hidden="true"></span>
                    <div>
                      <span>Source: <span>...</span></span>
                    </div>
                  </div>
                ) : (
                  !(this.props.action.status == 'done' || this.props.action.lane == 'DONE' || this.props.action.state == 'DONE' || this.props.action.status == 'failed') ? (
                    <div className="status">
                      <span className={"glyphicon glyphicon-time " + color} aria-hidden="true"></span>
                      <div>
                        <span>Lane: 
                          <span am-time-ago={this.props.actionTimes[this.props.action._id]} am-without-suffix="true"></span>
                        </span>
                        <span>Workflow: <span am-time-ago={this.props.action.CreationDateTime} am-without-suffix="true"></span></span>
                      </div>
                    </div>
                  ) : (
                    /*<!-- DONE LANE -->*/
                    <div className="status" >
                      <span className={"glyphicon " + (this.props.action.status == 'failed') ? 'glyphicon-remove red' : 'glyphicon-ok green'} aria-hidden="true"></span>
                      <div>
                        <span>{this.props.action.status}: 
                          <span am-time-ago={this.props.actionTimes[this.props.action._id]}></span>
                        </span>
                        <span>Workflow: <span am-time-ago={this.props.action.CreationDateTime} am-without-suffix="true"></span></span>
                      </div>
                    </div>
                  )
                )
              }
            </div>
          ) : (
            /*<!-- FINANCE DASHBOARD -->*/
            <div className="well well-sm task">
              <div className="info">
                <div className={"text-primary " + color}>{this.props.action.data[taskcard.title] || this.props.action.formData[taskcard.title]}</div>
                <div className="lines">
                  <div className="line">{this.props.action.data.products.total || this.props.action.formData[taskcard.line1]}.00</div>
                  <div className="line">
                    <span className={this.props.action.overDue ? "red" : ""}>{this.props.action.overDue ? 'Overdue: ' : 'Due date: '}
                      <span am-time-ago={this.props.action.formData.duedate}></span>
                    </span>
                  </div>
                  {
                    (taskcard.display_sequence) ? (<div className="line">{this.props.action.seq_id/* | minLength:4*/}</div>) : null
                  }
                </div>
                <div className="user-photo">
                  {
                    this.props.action.ownerID ? (
                        <Gravatar draggable="false" email={getOwner(this.props.action.ownerID, 'email')} size={50} style={{borderRadius: 25}} />
                      ) : (
                        <img src="assets/no-user.png" draggable="false" height="50" width="50" />
                      )
                  }
                </div>
              </div>
              {
                /*<!-- NORMAL LANES -->*/
                (dashboard.name == 'personal') ? (
                  null
                ) : (
                  !(this.props.action.status == 'done' || this.props.action.lane == 'DONE' || this.props.action.state == 'DONE' || this.props.action.status == 'failed') ? (
                    <div className="status">
                      <span className={"glyphicon glyphicon-time " + color} aria-hidden="true"></span>
                      <div>
                        <span>Lane: <span am-time-ago={this.props.actionTimes[this.props.action._id]} am-without-suffix="true"></span></span>
                        <span>Workflow: <span am-time-ago={this.props.action.CreationDateTime} am-without-suffix="true"></span></span>
                      </div>
                    </div>
                  ) : (
                    /*<!-- DONE LANE -->*/
                    <div className="status" >
                      <span className={"glyphicon " + (this.props.action.status == 'failed') ? 'glyphicon-remove red' : 'glyphicon-ok green'} aria-hidden="true"></span>
                      <div>
                        <span>{this.props.action.status}: 
                          <span am-time-ago={this.props.actionTimes[this.props.action._id]}></span>
                        </span>
                        <span>Workflow: <span am-time-ago={this.props.action.CreationDateTime} am-without-suffix="true"></span></span>
                      </div>
                    </div>
                  )
                )
              }
            </div>
          )
        }
      </div>
    )
  }
}

import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux';
import { browserHistory } from 'react-router'
import { compose } from 'redux';
import DurationProgressBar from '../../common/DurationProgressBar'

const _ = window.lodash;

export default class ActionControl extends Component {

  constructor(props) {
    
    super(props);
    this.state = {
    }
  }

  componentWillMount(){
   
  }

  componentWillReceiveProps(nextProps){
  }

  // resume(){
  // }

   render() {
     //console.log(Object(this.props.action.time).hasOwnProperty(this.props.action.lane))
    return (
      <div>
        <ul className="nav navbar-nav">
            <li className="footer-left">
              {
                this.props.buttons.resume ? ( 
                  <button title="Resume" ng-if="buttons.resume" className="btn btn-default" onClick={()=>this.props.parent.resume()}>
                    <span className="glyphicon glyphicon-arrow-left"></span> <span className="cb-text">Resume</span>
                  </button> ) : null
              }
              {
                this.props.buttons.back ? (
                  <button title="Back" className="btn btn-default" onClick={()=>this.props.parent.back()}>
                    <span className="glyphicon glyphicon-arrow-left"></span> 
                    <span className="cb-text">Back</span>
                  </button>
                ) : null
              }
              {
                this.props.buttons.cancel ? (
                  <button title="Release" className="btn btn-default" onClick={()=>this.props.parent.cancel()}>
                    <span className="glyphicon glyphicon-remove"></span> <span className="cb-text">Release</span>
                  </button>
                ) : null
              }
              {
                this.props.buttons.pause ? (
                  <button title="Pause" className="btn btn-danger" onClick={()=>this.props.parent.pause()}>
                    <span className="glyphicon glyphicon-pause"></span> <span className="cb-text">Pause</span>
                  </button>
                ) : null
              }
            </li>

            <li className="footer-middle">
              <DurationProgressBar 
                tbp={(Object(this.props.action.time).hasOwnProperty(this.props.action.lane))?(this.props.action.time[this.props.action.lane].tbp):null}
                paused={(Object(this.props.action.time).hasOwnProperty(this.props.action.lane))?(this.props.action.time[this.props.action.lane].paused):null}
                inprogress={ (Object(this.props.action.time).hasOwnProperty(this.props.action.lane)) ? (this.props.action.time[this.props.action.lane].in_progress):null}
              >
              </DurationProgressBar>
            </li>

            <li className="footer-right">
              {
                this.props.buttons.fail ? (
                  <button title="Failed" className="btn btn-default" onClick={()=>this.props.parent.fail()}>
                    <span className="glyphicon glyphicon-ban-circle"></span> 
                    <span className="cb-text">Failed</span>
                  </button>
                ) : null
              }
              {
                this.props.buttons.done ? (
                  <button title={this.props.finalLane ? 'Done' : 'Completed'} disabled={!this.props.formProperties.valid} className="btn btn-success" onClick={()=>this.props.parent.done()}>
                    <span className="glyphicon glyphicon-ok"></span> 
                    <span className="cb-text">{this.props.finalLane ? " Done" : " Completed"}</span>
                  </button>
                ) : null
              }
              {
                this.props.buttons.save ? (
                  <button title="Save Changes" disabled={!this.props.formProperties.valid} className="btn btn-success" onClick={()=>this.props.parent.done()}>
                    <span className="glyphicon glyphicon-ok"></span> 
                    <span className="cb-text">Save Changes</span>
                  </button>
                ) : null
              }
            </li>
        </ul>
      </div>
    )
  }
}


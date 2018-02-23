import React, { Component, PropTypes } from 'react'
import moment from "moment";

export default class DurationProgressBar extends Component {

  durationFilter(totalTime) {
    
    if (!totalTime) { return "00:00"; }
    // averageTime = totalTime / taskCount
    const duration = moment.duration(totalTime);

    if(duration.asMinutes()<1){
      return "a few seconds"
    }else if(duration.asHours()<1){
      return duration.get("minutes")+" minutes";
    }else if(duration.asDays()<1){
      return duration.get("hours") +" hours";
    } else if(duration.asMonths()<1){
      return duration.get("days") +" days";
    }else if(duration.asYears()<1){
      return duration.get("months") +" months";
    }else{
      return duration.get("years")+" years";
    }
  }

  render (){
    // console.log('DurationProgressBar',this)
    var total = ((this.props.tbp || 0) + (this.props.paused || 0) + (this.props.inprogress || 0));

    var tbpPercentage=(((this.props.tbp || 0) / total) * 100) + "%";
    var pausedPercentage=(((this.props.paused || 0) / total) * 100) + "%";
    var inprogressPercentage=(((this.props.inprogress || 0) / total) * 100) + "%";

    return (
      <div className="duration-bar"> 
        <div className="bar-tbp" style={{width: tbpPercentage}}>
          <div className="bar-info">
            To Be Pulled: {this.durationFilter(this.props.tbp)}
          </div>
        </div>
        <div className="bar-paused" style={{width: pausedPercentage}}> 
          <div className="bar-info">
            Paused: {this.durationFilter(this.props.paused)}
          </div>
        </div>
        <div className="bar-inprogress" style={{width: inprogressPercentage}}> 
          <div className="bar-info"> 
            In Progress: {this.durationFilter(this.props.inprogress)}
          </div>
        </div> 
      </div>
    )
  }
}

import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux';
import { browserHistory } from 'react-router'
import DurationProgressBar from '../../common/DurationProgressBar'

class ContractsModels extends Component {

  constructor(props) {
    super(props);
    this.state = {
      jobopenings: [],
      models: []
    }
    //console.log("DashboardDefault props: ", props)
    //console.log("Generics.jobopening: ", Generics.jobopening);
  }

  componentWillMount() {
    /*
    Meteor.subscribe('models');

    //console.log(Generics.models)
    //console.log(Mongo.Collection.getAll())
    var models = Mongo.Collection.get('models').find({}).fetch();
    this.setState({models: models});
    //console.log("Models", models);
    */
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

    return (
      <table className="table lanes table-main" style={{ tableLayout: this.props.tableLayout }}>
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

  gotoEditCollection(id, source) {

  }

  render() {

    var modelList = this.state.models.map((model) => (
      <div className="entity" onClick={() => gotoEditCollection(model._id, dashboard.name)}>
        <table id="model">
          <tr>
            <td>
              <span className="avatar">
                <img src={model.thumbnail} width="50" />
              </span>
              <span className="entity-info">
                <span>{model.name}</span>
                <span className="smaller">Min hour: {model.MinimumHourlyRate} - Min day: {model.MinimumDailyRate}</span>
              </span>
            </td>
          </tr>
        </table>
      </div>
    ))

    return (
      <div>

        <div className="contr-container" id="mapper">
          <div className="search-col contracts-models">
            <div className="contr-head" style={{ height: this.headerHeight }}>
              <span>Models</span>
            </div>
            <div className="contr-body">
              {modelList}
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

export default connect(mapStateToProps, bindAction)(ContractsModels);

import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux';
import { browserHistory } from 'react-router'
import Toolbar from '../toolbar/'
import ActionControl from './control/'
import ActionService from '../../containers/Actions'

import { withTracker } from 'meteor/react-meteor-data';
import appConfig from '../../config'
import { compose } from 'redux';
//Import Modules
import ActionMom_sat from './modules/mom_sat/action_mom_sat';
import ActionMom_apply_pass from './modules/mom_apply_pass/action_mom_apply_pass';
import Attachments from './modules/attachments/attachments'
import DashboardService from '../../containers/Dashboards'
import Listing from './modules/listing/listing'
import Capedge from './modules/capedge/action_capedge'
//Import ActionForms
import Form from "react-jsonschema-form";
import CustomFieldTemplates from './customFormTempletes'
//Import toast notification
import { ToastContainer, toast } from 'react-toastify';

const _ = window.lodash;
const ActionOverrides = {
  GANTT: "gantt",
  DO: "delivery_order"
}
class Action extends Component {

  constructor(props) {
    super(props);
    //console.log("Action Props", props);
    this.state = {
      stateName: "",
      print: { overlay: false },
      lane: props.location.query.lane,
      dashboardName: props.location.query.source,
      actionId: props.location.query.id,
      action: undefined,
      canToggle: false,
      currentUserId: this.props.currentUser._id ? this.props.currentUser._id : Meteor.userId(),
      viewName: 'action',
      formProperties: { valid: false },
      buttons: {
        fail: true,
        // save: true,
        // back: true,
        cancel: true,
        pause: true,
        //  resume:true,
        done: true
      },
      form: {},
      action: [],
      attachmentList: []
    }
  }

  componentWillMount() {
    try {
      return this.redirect();
    } catch (e) {
      console.log(e);
      return //console.log(e);
    }
  }

  getOptimumAction(actionid, callback) {
    // first we try finding from local minimogo
    const action = Actions.find({ "_id": this.state.actionId }).fetch();
    //console.log(`action.controller getOptimumAction Actions.find from minimongo $scope.action: ${JSON.stringify(this.state.action)}`);

    if (!action) {
      //console.log(this.state.actionId);
    }

    if (action.length === 0) {
      return Meteor.call('getAction', actionid, function (error, action) {
        if (error) {
          //console.log("Can't get Actions")
          return;
        }
        // //console.log('action.controller getOptimumAction $meteor.call getAction method action: ');
        // //console.log(action);
        return callback(action);
      })
    }
    this.setState({ action: action });
  }

  getModule(lane) {
    // lane is lane name, but modules are stored as lanename_1modules
    lane = lane.replace('_1', '');
    // console.log(`getModule return for lane: ${lane}`, this);
    return this.props.definitions.modules[lane];
  }

  setModule(action) {
    // console.log('action.controller setModule on action: ',action); 
    var module = this.getModule(action.lane);
    if (!module || action.state == "DONE")
      return;

    this.setState(
      {
        canToggle: module.canToggle,
        module: module,
        moduleName: module.name,
        moduleToggle: true,
        orgModuleTemplate: true
      }
    )
    // module = ActionModules[module.name];
    // moduleController = module.controller;
    // moduleTemplate = module.templateUrl;
    // this.setState({ moduleController: moduleController, moduleTemplate: moduleTemplate, orgModuleTemplate: moduleTemplate, moduleToggle: module.templateUrl })

  }

  redirect() {

    if (this.state.actionId != null) {

      var self = this;

      self.getOptimumAction(this.state.actionId, function (action) {

        if (!action) {

          return;

        } else {

          self.state.action = action;

        }

        if (!self.state.actions) {

          self.actions = [{}];

        } else {

        }

        action.lane = self.state.lane;

        const gotoState = ActionOverrides[action.lane] || 'default';

        self.setModule(action);

        if (action.can.edit && (action.status === 'in_progress') && (action.ownerID === self.state.currentUserId)) {

          self.setState({ stateName: `action.${gotoState}` });

          return //$state.go(`action.${gotoState}`);

        } else if (action.can.edit && [null, self.state.currentUserId, undefined].includes(action.ownerID)) {

          var userid = self.state.currentUserId;

          if (action.status != 'done' && action.status != 'failed') {

            Meteor.call('startAction', action._id, userid, function () {

              if (action.status === 'in_progress') {

                self.setState({ stateName: `action.${gotoState}` });

                return //$state.go(`action.${gotoState}`);

              } else {

                Meteor.call('getAction', action._id, function (action) {

                  self.setState({ stateName: `action.${gotoState}` });

                  return;

                });

              }

            });

          } else {

            self.setState({ stateName: `action.${gotoState}` });

            return;

          }

        } else if (action.can.view) {

          self.setState({ stateName: "action.view" });

          return //$state.go("action.view");

        } else {

          self.setState({ stateName: "error" });

          return //$state.go("error", {message: "Tried to access an invalid resource"});

        }

      });

    } else {

      var self = this;

      this.createAction(this.state.lane, this.props.currentUser._id, '', true, function (act) {

        self.state.actionId = act._id;

        self.redirect();

      })
    }
  }

  createAction(lane, userid, data, start, callback) {
    if (start == null) { start = true; }
    const action = {};
    action.formData = {};
    action.status = start ? "in_progress" : 'tbp';
    action.lane = lane;
    action.dashboardName = this.state.dashboardName
    action.can = {
      create: true,
      edit: true,
      remove: true,
      view: true
    };

    if (data != null) { _.extend(action, data); }

    Meteor.call('createAction', action, lane, userid, start, function (error, action) {
      if (error) {
        console.error("Couldn't create Action!!");
        return;
      }
      callback(action);
    });
  }

  resume() {

    Meteor.call('releaseAction', this.state.action._id, this.state.currentUserId, this.getAttachmentList(), (error) => {
      if (error) {
        console.error("Couldn't releaseAction");
        return;
      } else {
        browserHistory.push("/dashboard/" + this.state.dashboardName);
      }
    });
  }

  back() {
    Actions.remove(this.state.action._id, () => {
      browserHistory.push("/dashboard/" + this.state.dashboardName);
    })
  }

  cancel() {

    Meteor.call('releaseAction', this.state.action._id, this.state.action.formData, this.state.currentUserId, this.getAttachmentList(), (err) => {
      if (err) {
        console.error("Couldn't releaseAction");
      } else {
        browserHistory.push("/dashboard/" + this.state.dashboardName);
      }
    });
  }

  pause() {

    Meteor.call('pauseAction', this.state.action._id, this.state.action.formData, this.state.currentUserId, this.getAttachmentList(), (err) => {
      if (!err) {
        browserHistory.push("/dashboard/" + this.state.dashboardName);
      } else {
        return;
      }
    })
  }

  fail() {
    Meteor.call('failAction', this.state.action._id, this.state.currentUserId, (err) => {
      if (!err) {
        browserHistory.push("/dashboard/" + this.state.dashboardName);
      } else {
        console.error("Couldn't failAction");
        return;
      }
    });
  }

  done() {

    Meteor.call('continueAction', this.state.action._id, this.state.action.formData, this.state.currentUserId, this.getAttachmentList(), (err) => {
      if (err) {
        console.error("Couldn't continueAction");
      } else {
        browserHistory.push("/dashboard/" + this.state.dashboardName);
      }
    });
  }

  actionControlView() {
    return <ActionControl buttons={this.state.buttons} action={this.state.action} formProperties={this.state.formProperties} parent={this} />
  }

  getAttachmentList() {
    if (this.state.attachmentList.length) {
      return this.state.attachmentList;
    } else {
      return this.state.action.attachments
    }

  }

  attachmentsList(attachments) {
    this.state.attachmentList = attachments;
  }

  moduleTemplate() {
    switch (this.state.moduleName) {
      case "mom_sat":
        return <ActionMom_sat formData={this.state.action.formData} actionId={this.state.actionId} />
        break;
      case "mom_apply_pass":
        return <ActionMom_apply_pass formData={this.state.action.formData} actionId={this.state.actionId} />
        break;
      case "attachments":
        return <Attachments addAttachments={this.attachmentsList.bind(this)} action={this.state.action} />
        break;
      case "listing":
        return <Listing module={this.props.definitions.modules[this.state.lane]} />;
        break;
      case "capedge":
        return <Capedge />;
        break;
      default:
        return (
          <div>
            <div className="panel panel-default mom-sat-module">
              <div className="panel-heading">
                <h3>Can not find Module</h3>
              </div>
              <div className="panel-body">
                <div className="text-center">
                  Please add "{this.state.moduleName}"module
                </div>
              </div>
            </div>
          </div>
        )
        break;
    }
    /*
    switch(this.state.moduleName) {
      case listing:
        <ListingView />
        break;
      case email:
        <TemplateTpl />
        break;
      case attachments:
        <ActionAttachments />
        break;
      case mom_sat:
        <ActionMom_sat />
        break;
      case mom_apply_pass:
        <ActionMom_apply_pass />
        break;
      case uob_get_lastmthstatement:
        <ActionUob_get_lastmthstatement />
        break;
    }
    */
  }

  printForm() {
  }

  getPdf() {
  }

  getLane(action) {
    if (!action) {
      //console.log('dashboard.service getLane called without action');
      return false;
    }
    let { state } = action;
    if (state === 'DONE') {
      state = action.lastState;
    }
    for (let dashboardName in this.props.dashboards) {
      const dashboard = this.props.dashboards[dashboardName];
      if (!dashboard.lanes) { continue; }
      for (let lane of Array.from(dashboard.lanes)) {
        if (Array.from(lane.ids).includes(state)) {
          return lane.name;
        }
      }
    }
    return null;
  }

  getActionForm(formSchema, formTitle, action, lane) {
    //  console.log("here is action form generater:",this.state.dashboardName)
    switch (this.state.dashboardName) {
      case "Recruitment":
        return <RecruitmentActionForm formSchema={formSchema} formTitle={formTitle} action={action} laneName={lane} onChange={this.onChange.bind(this)} />
        break;
      case "OpenB_Sales":
        return <OpenB_SalesActionForm formSchema={formSchema} formTitle={formTitle} action={action} laneName={lane} onChange={this.onChange.bind(this)} />
        break;
      case "Project Planning":
        return <ProjectPlanning formSchema={formSchema} formTitle={formTitle} action={action} laneName={lane} onChange={this.onChange.bind(this)} />
        break;
      default:
        return <RecruitmentActionForm formSchema={formSchema} formTitle={formTitle} action={action} laneName={lane} onChange={this.onChange.bind(this)} />
    }
  }

  notify = (err) => {
    toast.error(err, {
      position: toast.POSITION.TOP_LEFT
    });
  }

  dismissAll = () => toast.dismiss();

  childView() {

    if (this.state.stateName == "action.default") {

      var lane = this.getLane(this.state.action);

      var formSchema = this.props.definitions.schemas[lane];

      definitions = this.props.definitions.definitions[lane];

      var self = this;

      function CustomFieldTemplate(props) {
        const { id, classNames, label, help, required, description, errors, children, schema } = props;
        if (schema.type === "array" || schema.type === "object" || schema.type === "string" || schema.type === "number" || schema.type === "integer" || schema.type === "boolean") {
          return (
            <div className={classNames + " " + children.props.schema.htmlClass}>
              {(schema.key) ? (
                <label htmlFor={id}> {label} {required ? "*" : null} </label>
              ) : null}
              {children}
            </div>
          );
        } else {
          return (
            <CustomFieldTemplates schema={props} mapToForm={self.mapToForm.bind(this)} />
          )
        }
      }

      function ArrayFieldTemplate(props) {

        if (props.schema.format) {
          return (<CustomFieldTemplates schema={props} />)
        } else {
          return (
            <div className={props.className}>
              <legend>
                {props.schema.title}
              </legend>
              {props.items && props.items.map(element => (
                <div key={element.index}>
                  <div className="col-xs-10"> {element.children} </div>
                  <div className="col-xs-2"> {(props.title) ? (<label> &nbsp;</label>) : null}
                    <div className="array-action-btn-group">
                      {
                        (element.hasMoveDown) ? (
                          <button className="" onClick={element.onReorderClick(element.index, element.index + 1)}>
                            <i className="glyphicon glyphicon-arrow-down"> </i>
                          </button>
                        ) : (
                            <button className="disabled">
                              <i className="glyphicon glyphicon-arrow-down"> </i>
                            </button>
                          )
                      }
                      {
                        (element.hasMoveUp) ? (
                          <button className="" onClick={element.onReorderClick(element.index, element.index - 1)}>
                            <i className="glyphicon glyphicon-arrow-up"> </i>
                          </button>
                        ) : (<button className="disabled">
                          <i className="glyphicon glyphicon-arrow-up"> </i> </button>
                          )
                      }
                      <button className="" onClick={element.onDropIndexClick(element.index)}>
                        <i className="glyphicon glyphicon-remove"> </i>
                      </button>
                    </div>
                  </div>
                </div>
              ))
              }
              {(props.canAdd) ? (
                <div className="productAddBtn">
                  <button onClick={props.onAddClick} type="button">
                    <i className="glyphicon glyphicon-plus"> </i>
                  </button>
                </div>
              ) : null}
            </div>
          );
        }

      }

      function transformErrors(errors) {
        self.dismissAll()
        return errors.map(error => {
          if (error.name === "pattern") {
            error.message = "Only digits are allowed."
          } else if (error.name === "required") {
            error.message = "Requires field " + error.schema.properties[error.argument].title
          }
          self.notify(error.message)
          return error;
        });
      }

      return (
        <div className="panel panel-default rfq-container">
          <div className="panel-heading">
            <h3>
              {(definitions.title || "Form has no title")}
            </h3>
            <button className="btn btn-primary print-button" onClick={() => this.printForm()}>
              <span className="glyphicon glyphicon-print">
              </span>Print </button> <button className="btn btn-primary" onClick={() => this.getPdf()}>
              <span className="glyphicon glyphicon-print"> </span>PDF </button>
            <small> &nbsp; </small>
          </div>
          <div className="panel-body" style={{ marginBottom: 40 + "px" }}>
            <Form
              schema={formSchema}
              FieldTemplate={CustomFieldTemplate}
              uiSchema={definitions.uiSchema}
              ArrayFieldTemplate={ArrayFieldTemplate}
              formData={this.state.action.formData}
              onChange={this.onChange.bind(this)}
              transformErrors={transformErrors}
              liveValidate={true}
              showErrorList={false}
              name="actionform">
              <div></div>
            </Form>
            <ToastContainer
              position="top-right"
              autoClose={false}
              newestOnTop={false}
              closeOnClick
              pauseOnHover
            />
          </div>
        </div>
      )
    }
  }

  mapToForm = (data, IDS) => {
    if (IDS) {
      const newState = this.state;
      var _ = require('lodash-isnumeric');
      var id = "root_" + IDS;
      IDS = IDS.split("_");
      var dataString = "newState.action.formData"
      IDS.map((key) => {
        if (_.isNumeric(key)) {
          dataString += "[" + key.trim() + "]";
        } else {
         dataString += "." + key.trim();
       }
      });
      Object.keys(data).map((key) => {
        eval(dataString + "." + key + "=" + "'" + data[key] + "'");
        $("#" + id + "_" + key).val(function () {
          return data[key];
        })
      });
      this.setState(newState);
    }
  }

  onChange(formData) {
    // if (!formData.errors.length) {
    this.state.action.formData = formData.formData
    this.state.formProperties.valid = true;
    if (!formData.errors.length) {
      this.state.formProperties.valid = true;
    } else {
      this.state.formProperties.valid = false
    }
  }

  render() {
    return (
      <div>
        <div id="navbar">
          <Toolbar name="action" dashboardName={null} />
        </div>
        <div>
          {
            this.state.print.overlay ? <div className="print-overlay" ng-show="print.overlay"></div> : null
          }
          <div className="container-fluid action-main-container schema-form">
            <div className="full-height" id="COLUMN">
              {/*<!--   dont need this?  <div id="{{(action.state == 'PROJECTMAN') ? '' : 'COLUMN'}}" > -->*/}
              <div className="row mapper full-height">
                {/*<!-- Action -->*/}
                <div className={"full-height position-relative form-panel " + (this.state.moduleToggle ? 'col-md-6 left-panel' : '')}>
                  {this.childView()}
                </div>
                {/*<!-- Module -->*/}
                {
                  (this.state.canToggle && this.state.orgModuleTemplate && !this.state.moduleToggle) ?
                    (<button className="open-module toggle-module btn btn-success" style={{ right: this.props.scrollbar }} onClick={() => this.props.toggleModule()}></button>) : null
                }
                {
                  this.state.moduleToggle ? (
                    <div className="col-md-6 full-height right-panel">
                      {/*<!-- Module import here -->*/}
                      {
                        (this.state.canToggle && this.state.orgModuleTemplate && this.state.moduleToggle) ?
                          (<button className="close-module toggle-module btn btn-primary" onClick={this.props.toggleModule()}></button>) : null
                      }
                      <div className="full-height">
                        {this.moduleTemplate()}
                      </div>
                    </div>
                  ) : null
                }
              </div>
              {/*<!--     </div> -->*/}
            </div>
          </div>

          <div className="navbar navbar-static-bottom">
            {this.actionControlView()}
          </div>

        </div>
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
  tasks: state.todos.todos,
  overrides: state.dashboards.overrides,
  currentUser: state.currentUser.currentUser,
  contentName: state.dashboardContent.dashboardContent,
  panel: state.panel.panel,
  definitions: state.actions.definitions
});

export default
  compose(
    connect(mapStateToProps, bindAction),
    withTracker(() => {
      return {
        users: Meteor.users.find({}).fetch()
      }
    })
  )(Action);

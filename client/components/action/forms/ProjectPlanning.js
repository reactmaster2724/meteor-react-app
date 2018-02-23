import React, { Component, PropTypes } from 'react'
import Form from "react-jsonschema-form";

export default class ProjectPlanning extends Component {
    constructor(props){
        super(props);
        this.state={
            schema:null,
            formTitle:null,
            formData:null,
            uiSchema:null,
            liveValidate:true
        }
      }
    componentWillMount(){
      this.state.formTitle = (this.props.formTitle) ? this.props.formTitle.title : false;
        this.state.uiSchema = this.setUiSchema();
    }
    setUiSchema(){
        var uiSchema={};
        (this.props.laneName=="ISSUEPASS")?(uiSchema={"ui:disabled": true}):(uiSchema={"ui:disabled": false});
        return uiSchema;
    }

    render(){
      function CustomFieldTemplate(props) {
        const { id, classNames, label, help, required, description, errors, children } = props;
        if (!props.schema.key) {//
          return (
            <div className={classNames + " " + children.props.schema.htmlClass}>
              {children}
              {errors}
            </div>
          );
        } else {
          return (
            <div className={classNames + " " + children.props.schema.htmlClass}>
              <label htmlFor={id}>{label}{required ? "*" : null}</label>
              {children}
              {errors}
            </div>
          );
        }
        return;
      }
        return (
            <div className="panel panel-default rfq-container">
            <div className="panel-heading">
              <h3>{(this.state.formTitle)?(this.state.formTitle || "Form has no title"):("Form has no title")}</h3>
              <button className="btn btn-primary print-button" onClick={()=>this.printForm()}>
                <span className="glyphicon glyphicon-print"></span>Print
              </button>
              <button className="btn btn-primary" onClick={()=>this.getPdf()}>
                <span className="glyphicon glyphicon-print"></span>PDF
              </button>
              <small>&nbsp;</small>
            </div>
            <div className="panel-body">
            {(this.props.action.state != "DONE")?(
                <Form schema={this.props.formSchema} formData={this.props.action.formData} uiSchema={this.state.uiSchema} FieldTemplate={CustomFieldTemplate} liveValidate={this.state.liveValidate} onChange={this.props.onChange} name="actionform" >
                <div></div>
                </Form>
            ):(
                <h1>Completed</h1>
            )}
            </div>
        </div>
        )
    }
}
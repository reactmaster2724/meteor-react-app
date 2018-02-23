import React, {
  Component,
  PropTypes
} from 'react'
import Form from "react-jsonschema-form";

export default class RecruitmentActionForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formTitle: null,
      formData: null,
      uiSchema: null,
      liveValidate: true
    }
  }
  componentWillMount() {
    this.state.formTitle = (this.props.formTitle) ? this.props.formTitle.title : false;
    this.state.uiSchema = this.setUiSchema();
    this.state.formData = this.props.action.formData
  }

  componentWillUpdate(nextProps, nextState) {
    // console.log(" componentWillUpdate -> nextState",nextState)
  }

  setUiSchema() {
    var uiSchema = {};
    if (this.props.formTitle) {
      (this.props.formTitle.uiSchema) ? (uiSchema = this.props.formTitle.uiSchema) : null;
      (this.props.laneName == "ISSUEPASS") ? (uiSchema["ui:disabled"] = true) : (uiSchema["ui:disabled"] = false);
    }
    return uiSchema;
  }

  onFocus(parm) {
    console.log("formFocus Event", this)
  }

  formChange(data) {
    var products = data.formData.fieldset4.product;
    var totalSum = 0;
    for (i = 0; i < products.length; i++) {
      products[i].rolls = products[i].qty
      products[i].subtotal = products[i].qty * products[i].price
      totalSum += products[i].subtotal;
    }
    data.formData.fieldset4.total = parseFloat(totalSum.toFixed(2));
    data.formData.fieldset4.gst = parseFloat((data.formData.fieldset4.total * 7 / 100).toFixed(2))
    data.formData.fieldset4.totalamount = parseFloat((data.formData.fieldset4.total + data.formData.fieldset4.gst).toFixed(2))
    data.formData.fieldset4.totaldeposit = parseFloat((data.formData.fieldset4.totalamount * data.formData.fieldset4.deposit / 100).toFixed(2))
    data.formData.fieldset4.balance = parseFloat((data.formData.fieldset4.totalamount - data.formData.fieldset4.totaldeposit).toFixed(2))

    // const newState = this.state;
    // newState.formData = data.formData;
    // this.setState(newState);
    this.props.onChange(data)
  }
  render() {
    function CustomFieldTemplate(props) {
      const { id, classNames, label, help, required, description, errors, children } = props;

      if (!props.schema.key) { //
        if (props.schema.type === "label") {
          return (
            <div className={props.schema.htmlClass}>
              <label>
                {props.schema.title}
              </label>
            </div>
          )
        }
        return (
          <div className={classNames + " " + children.props.schema.htmlClass}>
            {children} {errors}
          </div>
        );
      } else {
        return (
          <div className={classNames + " " + children.props.schema.htmlClass}>
            <label htmlFor={id}>
              {label} {required ? "*" : null}
            </label>
            {children} {errors}
          </div>
        );
      }
      return;
    }

    function ArrayFieldTemplate(props) {
      console.log(props)
      return (<div className={props.className}>
        <legend>
          {props.schema.title}
        </legend>
        {props.items && props.items.map(element => (
          (!props.schema.isremark) ? (
            <div key={element.index}>
              <div className="col-xs-10">
                {element.children} </div>
              <div className="col-xs-2">
                {(props.title) ? (
                  <label> &nbsp;

                      </label>) : null
                }
                <div className="array-action-btn-group">
                  {(element.hasMoveDown) ? (
                    <button className="" onClick={element.onReorderClick(element.index, element.index + 1)}>
                      <i className="glyphicon glyphicon-arrow-down"> </i>
                    </button>
                  ) : (
                      <button className="disabled">
                        <i className="glyphicon glyphicon-arrow-down"> </i>
                      </button>
                    )
                  }
                  {(element.hasMoveUp) ? (
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
          ) : (
              <div key={element.index}>
                <div>
                  {element.children}
                </div>
                <div style={{ width: "30px", float: "right", marginTop: "-79px", marginRight: "11px" }}>
                  <label> &nbsp; </label>
                  <button style={{ border: "0px", background: "#fdfdfd" }} onClick={element.onDropIndexClick(element.index)}>
                    <i className="glyphicon glyphicon-remove"> </i>
                  </button>
                </div>
              </div>
            )
        ))
        }
        {(props.canAdd) ? ((!props.schema.isremark) ? ((props.schema.isproduct) ? (
          <div className="productAddBtn" style={{ marginTop: "-30px" }}>
            <button onClick={props.onAddClick} type="button">
              <i className="glyphicon glyphicon-plus"> </i>
            </button>
          </div>
        ) : (<div className="productAddBtn">
          <button onClick={props.onAddClick} type="button">
            <i className="glyphicon glyphicon-plus"> </i>
          </button> </div>
          )
        ) : (
            <div style={{ width: 4 + '%', position: "absolute", left: "1px", top: "0px" }}>
              <button style={{ height: "34px" }} onClick={props.onAddClick}>
                <i style={{ top: "5px" }} className="glyphicon glyphicon-triangle-bottom"> </i>
              </button>
            </div>
          )
        ) : null
        }
      </div>
      );
    }

    return (
      <div className="panel panel-default rfq-container">
        <div className="panel-heading">
          <h3>
            {(this.state.formTitle) ? (this.state.formTitle || "Form has no title") : ("Form has no title")}
          </h3>
          <button className="btn btn-primary print-button" onClick={() => this.printForm()}>
            <span className="glyphicon glyphicon-print">
            </span>Print </button> <button className="btn btn-primary" onClick={() => this.getPdf()}>
            <span className="glyphicon glyphicon-print"> </span>PDF </button>
          <small> &nbsp; </small>
        </div>
        <div className="panel-body">
          {(this.props.action.state != "DONE") ? (
            <Form schema={this.props.formSchema}
              formData={this.state.formData}
              uiSchema={this.state.uiSchema}
              FieldTemplate={CustomFieldTemplate}
              liveValidate={this.state.liveValidate}
              onChange={this.formChange.bind(this)}
              onFocus={this.onFocus}
              ArrayFieldTemplate={ArrayFieldTemplate}
              name="actionform">
              <div> </div>
            </Form>
          ) : (<h1> Completed </h1>)
          }
        </div>
      </div>
    )
  }
}
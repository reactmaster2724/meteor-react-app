import React, { Component, PropTypes } from 'react'

export default class Label extends Component {
    constructor(props) {
        super(props);
        this.state = {
            formData: this.props.schema.children.props.formData
        }
    }
    render() {
        // console.log(this)
        const { id, classNames, label, help, required, description, errors, children, schema } = this.props.schema;
        return (
            <div className={classNames + " " + children.props.schema.htmlClass}>
                <label htmlFor={id}> {label} {required ? "*" : null} </label>
                <label className="form-control-label" name="territory">{this.state.formData}</label>
            </div>
        )
    }
}
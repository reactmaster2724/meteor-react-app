import React, { Component, PropTypes } from 'react'
import ArrayTable from './arraytable'
import AutoComplete from './autocomplete'
import Label from './label'

export default class CustomFieldTemplate extends Component {
    constructor(props) {
        super(props);
    }

    setTemplete() {
        var keyword;
        if (this.props.schema.schema.format) {
            keyword = this.props.schema.schema.type + this.props.schema.schema.format;
        } else {
            keyword = this.props.schema.schema.type
        }
        switch (keyword) {
            case "arraytable":
                return <ArrayTable schema={this.props.schema} />
                break;
            case "autocomplete":
                return <AutoComplete schema={this.props.schema} mapToForm={this.props.mapToForm}/>
                break;
            case "label":
                return <Label schema={this.props.schema} />
            default:
                return (
                    <div className="error">Cannot find template</div>
                )
        }
    }

    render() {
        return this.setTemplete();
    }

}
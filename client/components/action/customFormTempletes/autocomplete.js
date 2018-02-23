import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux';
import { compose } from 'redux';
import { withTracker } from 'meteor/react-meteor-data';
//for auto complete
import Autosuggest from 'react-autosuggest';
import AutosuggestHighlightMatch from "autosuggest-highlight/match"
import AutosuggestHighlightParse from "autosuggest-highlight/parse"
//for form
import Form from "react-jsonschema-form";
import CustomFieldTemplates from './index'
//for modal
import Modal from 'react-modal';
const customStyles = {
    content: {
        top: '5%',
        left: '25%',
        right: 'auto',
        bottom: 'auto',
        width: '50%',
        height: 'auto'

    },
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.59)'
    },
};

class AutoComplete extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            value: this.props.schema.children.props.formData ? this.props.schema.children.props.formData : "",
            suggestions: [],
            modalIsOpen: false,
            collection: this.props.schema.schema.query.model,
            viewValue: this.props.schema.schema.query.field,
            mapField: this.props.schema.schema.query.map,
            CollectionService: null,
            can_create: true,
            modalTitle: null,
            formSchema: null,
            formData: {},
            items: [],
            selectedSuggestion: null
        }
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }
    /** set state **/
    componentWillMount() {
        this.setState({
            suggestions: [this.initSuggestion()],
            can_create: this.props.create ? this.props.create : true,
            modalTitle: this.setModalTitle(),
            formSchema: this.getSchema(this.state.collection),
            CollectionService: this.getCollection(this.state.collection)
        }, () => {
            Meteor.subscribe(this.state.collection);
        });
    }

    getSchema(collection) {
        return this.props.Collections.definitions[collection].schema;
    }

    getCollection(collection) {
        if (window[collection] instanceof Meteor.Collection) {
            return window[collection];
        }
        if (window.Generics[collection] instanceof Meteor.Collection) {
            return window.Generics[collection];
        }
        return;
    }

    getDefinitions(collection) {
        return this.props.Collections.definitions[collection].definitions;
    }

    setModalTitle() {
        element_name = this.state.collection.toLowerCase();//.slice(0, -1);
        // console.log(this.state.collection.slice(-1))
        element_name = "Create new " + element_name[0].toUpperCase() + element_name.slice(1);
        return element_name;
    }

    initSuggestion() {
        var initSuggestion = {};
        return initSuggestion[this.state.viewValue] = this.state.value;
    }
    /** end of set state  */

    /** AutoSuggestion (Auto complete) **/
    setSuggestionsList() {
        var items = this.state.CollectionService.find({}).fetch();
        this.state.items = items;
    }
    onSuggestionsFetchRequested = ({ value }) => {
        this.setState({
            suggestions: this.getSuggestions(value)
        });
    };

    onSuggestionsClearRequested = () => {
        this.setState({
            suggestions: this.getSuggestions(this.state.value)
        });
    };

    onSuggestionSelected = (event, { suggestionIndex }) => {

        selectedSuggestion = (this.state.suggestions[suggestionIndex])
        this.mapToForm(selectedSuggestion);

    }

    getSuggestionValue = suggestion => suggestion[this.state.viewValue];

    renderSuggestion(suggestion, { query }) {
        const matches = AutosuggestHighlightMatch(suggestion[this.state.viewValue], query);
        const parts = AutosuggestHighlightParse(suggestion[this.state.viewValue], matches);
        return (
            <span>
                {parts.map((part, index) => {
                    const className = part.highlight ? 'react-autosuggest__suggestion-match' : null;
                    return (
                        <span className={className} key={index}>
                            {part.text}
                        </span>
                    );
                })}
            </span>
        );
    }

    getSuggestions = value => {
        this.setSuggestionsList();

        value = value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "");
        const inputValue = value.trim().toLowerCase();
        const inputLength = inputValue.length;
        return inputLength === 0 ? [] : this.state.items.filter(item =>
            item[this.state.viewValue].toLowerCase().search(inputValue) > -1 ? true : false
        );
    };

    //When change AutoSuggention input 
    onChange = (event, { newValue }) => {
        var parentprops = this.props.schema.children.props;
        this.setState({
            value: newValue
        }, () => parentprops.onChange(newValue));
    }

    /** End of AutoSuggention  **/

    /** Modal Box Functions **/

    openModal() {
        this.state.formData[this.state.viewValue] = this.state.value
        this.setState({ modalIsOpen: true });
    }
    //When click button in modal box
    confirm() {
        if (Object.keys(this.state.formData).length) {
            this.state.CollectionService.insert(this.state.formData);
            this.setState({ suggestions: [this.initSuggestion()] });
            this.mapToForm(this.state.formData, this.props.schema.schema.query.map)

        }
        this.closeModal();
    }
    //when change data of modal box
    changeForm(data) {
        if (!data.errors.length) {
            this.state.formData = data.formData
        }
    }

    closeModal() {
        this.setState({ modalIsOpen: false });
    }
    /**End of Modal functions **/

    /** Map To Another input **/
    mapToForm(selectedSuggestion, mapField) {
        var mappingfield = mapField ? mapField : this.state.mapField;
        var name = this.props.schema.children.props.name;
        var ID = this.props.schema.id;

        if (mappingfield && selectedSuggestion) {
            var mappingData = {}
            Object.keys(mappingfield).map(function (key) {
                // if (selectedSuggestion[key])
                mappingData[mappingfield[key]] = selectedSuggestion[key];
            });
            ID = ID.slice(0, ID.search(name) - 1)
            ID = ID.slice(5, ID.length)

            this.props.mapToForm(mappingData, ID)
        }
    }
    /** End of Map To Another input **/

    /**  Render function */
    formView() {

        function CustomFieldTemplate(props) {
            const { id, classNames, label, help, required, description, errors, children, schema } = props;
            if (schema.type === "array" || schema.type === "object" || schema.type === "string" || schema.type === "number" || schema.type === "integer" || schema.type === "boolean") {
                return (
                    <div className={classNames + " " + children.props.schema.htmlClass}>
                        <label htmlFor={id}> {label} {required ? "*" : null} </label>
                        {children} {errors}
                    </div>
                );
            } else {
                return (
                    <CustomFieldTemplates schema={props} />
                )
            }
        }
        return (
            <Form
                schema={this.state.formSchema}
                FieldTemplate={CustomFieldTemplate}
                onChange={this.changeForm.bind(this)}
                formData={this.state.formData}>
                <div></div>
            </Form>
        )
    }

    render() {
        const { id, classNames, label, help, required, description, errors, children, schema } = this.props.schema;
        const { value, suggestions } = this.state;
        const inputProps = {
            value,
            onChange: this.onChange,
            className:"form-control"
        };
        return (
            <div className={classNames + " " + children.props.schema.htmlClass}>
                <label htmlFor={id}> {label} {required ? "*" : null} </label>
                <Autosuggest
                    suggestions={suggestions}
                    onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                    onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                    getSuggestionValue={this.getSuggestionValue}
                    renderSuggestion={this.renderSuggestion.bind(this)}
                    inputProps={inputProps}
                    highlightFirstSuggestion={true}
                    onSuggestionSelected={this.onSuggestionSelected}
                />
                {(suggestions.length) ? null :
                    (!value) ? null :
                        (
                            <div className="schema-modal-open"><p onClick={this.openModal}>{this.state.modalTitle}</p></div>
                        )}
                <Modal
                    isOpen={this.state.modalIsOpen}
                    onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    style={customStyles}
                    contentLabel="Create Project Plan">
                    <div className="modal-header">
                        <h2>{this.state.modalTitle}</h2>
                    </div>
                    <div className="modal-body">
                        {this.formView()}
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-success" onClick={this.confirm.bind(this)}> Confirm</button>
                    </div>
                </Modal>
            </div>
        )
    }
    /** End of Render function */
}

const mapDispatchToProps = dispatch => {
    return {
    }
}
const mapStateToProps = state => (
    {
        currentUser: Meteor.user() ? Meteor.user() : state.currentUser.currentUser,
        Collections: state.collections
    });

export default
    compose(
        connect(mapStateToProps, mapDispatchToProps)
    )(AutoComplete);
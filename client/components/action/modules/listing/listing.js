import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux';
import { compose } from 'redux';
import { withTracker } from 'meteor/react-meteor-data';

import List from './list'

class Listing extends Component {

    constructor(props) {

        super(props);
        this.state = {
            module: this.props.module,
            collection: this.getCollectionSevice(this.props.module.collection),
            moduleTitle: this.setModuleTitle(),
            lists: null,
            products: null,
            total: null,
            qty: 1,
            uom: null,
            itemprice: null
        }
        this.subscribes();
    }

    componentWillMount() {
        this.setState({
            uom: this.getUom(),
            itemprice: this.getItemPrice(),
            total: this.getTotal()
        });
        console.log(this)
    }
    // getCollection() {
    //     return this.props.Collections.definitions[this.props.module.collection]
    // }
    getUom() {
        let collectionSevice = this.getCollectionSevice("Uom_conversion_detail");
        return collectionSevice.find({}, {
            sort: {
                parent: 1
            }
        }).fetch();
    }
    getItemPrice() {
        let collectionSevice = this.getCollectionSevice("itemprice");
        return collectionSevice.find({}, {
            sort: {
                Itemcode: 1
            }
        }).fetch()
    }
    getCollectionSevice(collection) {
        if (window[collection] instanceof Meteor.Collection) {
            return window[collection];
        }
        if (window.Generics[collection] instanceof Meteor.Collection) {
            return window.Generics[collection];
        }
        return;
    }
    getTotal() {
        let collectionSevice = this.state.collection;
        return collectionSevice.find({}).count();;
    }
    subscribes() {
        var module = this.state.module;
        Meteor.subscribe("itemprice");
        Meteor.subscribe("delivery_note_item");
        Meteor.subscribe("purchase_receipt");
        Meteor.subscribe("stockledgerentry");
        Meteor.subscribe("Uom_conversion_detail");
        Meteor.subscribe(module.collection);

        if (((ref = module.chain) ? ref.find : null)) {
            ref2 = ((ref1 = module.chain) ? ref1.find : null);
            for (i = 0, len = ref2.length; i < len; i++) {
                item = ref2[i];

                Meteor.subscribe(item.model)
            }
        }
    }

    setModuleTitle() {
        var title = this.props.module.collection;
        title = title[0].toUpperCase() + title.slice(1);
        return title;
    }
    getItemStock = (item) => {
        let stockledgerentry_collection = this.getCollectionSevice("stockledgerentry");
        let stockledgerentry = stockledgerentry_collection.find({
            item_code: item.item_code
        }, {
                sort: {
                    modified: -1
                },
                limit: 1
            }
        );

        if (stockledgerentry[0]) {
            return stockledgerentry[0].qty_after_transaction;
        } else {
            return 0;
        }
    }

    addItem = (item, quantity) => {
        let itm, j, len1, ref3;
        item.qty = Number(quantity);
        item.price = item.Price;
        if ($scope.action.formData["products"]["productdetails"][0] === null || !$scope.action.formData["products"]["productdetails"][0].item_code) {
            return $scope.action.formData["products"]["productdetails"][0] = item;
        } else {
            ref3 = $scope.action.formData["products"]["productdetails"];
            for (j = 0, len1 = ref3.length; j < len1; j++) {
                itm = ref3[j];
                if (itm._id === item._id) {
                    itm.qty = Number(itm.qty) + Number(quantity);
                    return;
                }
            }
            return $scope.action.formData["products"]["productdetails"].push(item);
        }
    }
    render() {
        return (
            <div id="mapper">
                <div className="panel panel-default search-col">
                    <div className="panel-heading">
                        <h3>{"Search " + this.state.moduleTitle}</h3>
                        <small>&nbsp;</small>
                    </div>
                    <div className="panel-body" style={{ padding: "0px" }}>
                        <div className="search-box">
                            <div className="select">
                                <div className="schema-form-select">
                                    <select>
                                        <option value="Product_name">Product name</option>
                                        <option value="item_code">Product code</option>
                                        <option value="size">Size</option>
                                        <option value="item_group">Category</option>
                                        <option value="color_description">Color</option>
                                    </select>
                                </div>
                            </div>
                            <input className="form-control" type="text" placeholder="Search" />
                            <span className="search-total">Total: {this.state.total}</span>
                        </div>
                        <List lists={this.state.lists} />
                    </div>
                </div>
            </div>

        )
    }

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
    )(Listing);
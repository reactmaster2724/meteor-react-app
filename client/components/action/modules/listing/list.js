import React, { Component, PropTypes } from 'react'

export default class List extends Component {
    constructor(props) {
        super(props);
        this.state = {
            erpnext: this.seterpnexturl()
        }
    }

    seterpnexturl() {
        return "erpnexturl"
    }

    getItemStock(item) {

    }

    getProductsList() {
        const { lists } = this.props
        let productsList;
        (!lists) ? null :
            productsList = lists.map((item, index) => {
                return (
                    <div className="entity" key={index}>
                        <table id="entity" >
                            <tbody>
                                <tr>
                                    <td>
                                        <span className="avatar">
                                            {(item.fieldMapping.image && item.fieldMapping.image.indexOf('http://') < 0) ? (
                                                <img src={this.state.erpnext + item.fieldMapping.image}
                                                    width="50" height="50" />
                                            ) : null}
                                            {(!item.fieldMapping.image && item.fieldMapping.image.indexOf('http://') >= 0) ? (
                                                <img src={item.fieldMapping.image || "assets/unavailable.jpg"}
                                                    width="50" height="50" />
                                            ) : null}
                                        </span>
                                    </td>
                                    <td>
                                        <table>
                                            <tbody>
                                                <tr>
                                                    <td className="entity-main">
                                                        <span className="item_name" title={item.fieldMapping.display_name || item.Product_name || "No mapping for display_name"}></span>
                                                        {item.fieldMapping.display_name || item.Product_name || "No mapping for display_name"}
                                                        <span className="item_price text-right padding-right"></span>
                                                        {item.Price || '0,00'} / {(item.fieldMapping.uom) == 'Roll(s)' ? 'Meter' : item.fieldMapping.uom}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td colSpan="2" className="entity-info smaller text-right">
                                                        <span className="item_info">
                                                            {(item.item_code) ? (
                                                                <span > <b>Code:</b> {item.item_code}</span>
                                                            ) : null}
                                                            {(item.fieldMapping.brand) ? (
                                                                <span ><b>Brand:</b> {item.fieldMapping.brand || item.brand || 'No brand'}</span>
                                                            ) : null}
                                                            {(item.fieldMapping.size) ? (
                                                                <span ><b>Size:</b>{item.fieldMapping.size}</span>
                                                            ) : null}
                                                            {(true || item.fieldMapping.conv) ? (
                                                                <span ><b>Conv:</b>{item.conversion_factor}</span>
                                                            ) : null}
                                                            {(item.re_order_level != null) ? (
                                                                <span><b>Reorder:</b>{item.re_order_level} </span>
                                                            ) : null}
                                                            {(item.item_group) ? (
                                                                <span ><b>Group:</b>{item.item_group}</span>
                                                            ) : null}
                                                            {(item.color_description) ? (
                                                                <span><b>Color:</b> {item.color_description}</span>
                                                            ) : null}
                                                            {(item.default_supplier) ? (
                                                                <span><b>Supplier:</b>{item.default_supplier}</span>
                                                            ) : null}
                                                        </span>
                                                        <span className="entity-stock text-right padding-right">
                                                            <span className="quantity smaller">
                                                                <b>Stock:</b>{this.getItemStock(item) || '0'}
                                                            </span>
                                                        </span>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                    <td className="input">
                                        <span className="entity-add">
                                            <input type="number" />
                                            {/* ng-model="qty" */}
                                            <button >Add</button>
                                            {/* click="addItem(item, qty)" */}
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )
            });
        return productsList;
    }

    render() {
        return (
            <div className="list-group">
                {this.getProductsList()}
            </div>
        )
    }
}    
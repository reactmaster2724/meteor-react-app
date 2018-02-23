import React, { Component, PropTypes } from 'react'


export default class ArrayTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            formData: this.props.schema.formData,
            isShow: []
        }
    }
    onChange(name, elementIndex, type) {
        var data = this.props.schema.formData;
        var items = this.props.schema.schema.items.properties;
        var comp = this.comp
        var compTotal = this.compTotal
        return (event) => {

            if (name != "deposit") {
                (type === "number") ?
                    data[elementIndex][name] = parseFloat(event.target.value) :
                    data[elementIndex][name] = event.target.value;
                Object.keys(items).map(function (key) {
                    if (items[key]["expression"] && items[key]['type'] == "label") {
                        data[elementIndex][key] = comp(items[key]["expression"], parseFloat(event.target.value), data[elementIndex]);
                    }
                });
                var total = 0;
                for (i = 0; i < data.length; i++) {
                    total = total + (data[i].subtotal ? data[i].subtotal : 0);
                }
                if (isNaN(total)) total = 0;

                Object.keys(items).map(function (key) {
                    if (items[key]["expression"] && items[key]['type'] == "total") {
                        data[0][key] = compTotal(items[key]["expression"], parseFloat(data[0].deposit), total);
                    }
                });
            } else if (name === "remarks") {
                data[elementIndex][name] = event.target.value;
            } else {
                (type === "number") ?
                    data[0][name] = parseFloat(event.target.value) :
                    data[0][name] = event.target.value;
                var total = 0;
                for (i = 0; i < data.length; i++) {
                    total = total + (data[i].subtotal ? data[i].subtotal : 0);
                }
                if (isNaN(total)) total = 0;

                Object.keys(items).map(function (key) {
                    if (items[key]["expression"] && items[key]['type'] == "total") {
                        data[0][key] = compTotal(items[key]["expression"], parseFloat(event.target.value), total);
                    }
                });
            }
            const newState = this.state;
            newState.formData = data;
            this.setState(newState);
        };

    }
    comp(exp, value, param) {
        (value) ? value = value : value = 0
        return parseFloat(eval(exp));
        function round(value, n) {
            return (Math.round(value * Math.pow(10, n)) / Math.pow(10, n))
        }
    }
    compTotal(exp, deposit, total) {
        return parseFloat(eval(exp))
        function round(value, n) {
            return (Math.round(value * Math.pow(10, n)) / Math.pow(10, n))
        }
    }
    getColSpanNum(items) {
        var colSpanNum = 0;
        Object.keys(items).map(function (key) {
            (items[key].type === "array") ? null :
                (items[key].type === "total") ? null :
                    (arrayItems[key].type === "textarea") ? null :
                        colSpanNum++;
        });
        return colSpanNum;
    }
    showHiddenRemark(index) {
        const newState = this.state;
        newState.isShow[index] = (this.state.isShow[index]) ? false : true;;
        this.setState(newState);
    }
    setReamrkValues(data) {
        for (i = 0; i < data.length; i++) {
            this.state.isShow.push(false);
        }
    }
    reCompTotal(data, items) {
        var total = 0;
        var compTotal = this.compTotal
        for (i = 0; i < data.length; i++) {
            total = total + (data[i].subtotal ? data[i].subtotal : 0);
        }
        if (isNaN(total)) total = 0;
        Object.keys(items).map(function (key) {
            if (items[key]["expression"] && items[key]['type'] == "total") {
                if (data.length)
                    data[0][key] = compTotal(items[key]["expression"], data[0]['deposit'], total);
            }
        });
        return data;
    }
    render() {
        schema = this.props.schema;
        arrayItems = schema.schema.items.properties;
        formData = this.reCompTotal(this.props.schema.formData, arrayItems);
        colSpanNum = this.getColSpanNum(arrayItems);
        isShowRemark = [false, true];
        this.setReamrkValues(formData)
        return (
            <div className={arrayItems}>
                <table className={"action-table schema-table" + schema.htmlClass}>
                    <tbody>
                        <tr>
                            <th style={{ textAlign: "center" }}>~</th>
                            {Object.keys(arrayItems).map(key => (
                                (arrayItems[key].type === "array") ? null :
                                    (arrayItems[key].type === "total") ? null :
                                        (arrayItems[key].type === "textarea") ? null :
                                            (
                                                <th style={{ textAlign: "center" }} key={key}>{arrayItems[key].title}</th>
                                            )
                            ))}
                            <th style={{ width: "7%" }}>Action</th>
                        </tr>
                        {schema.items && schema.items.map(element => (
                            isShowRemark.map(isRemark => (
                                (!isRemark) ? (
                                    < tr key={isRemark} >
                                        <td>
                                            {
                                                (this.state.isShow[element.index]) ? (
                                                    <button style={{
                                                        height: "100%", width: "100%",
                                                        backgroundColor: "#fff", border: "0px"
                                                    }} onClick={this.showHiddenRemark.bind(this, element.index)}>
                                                        <i style={{ top: "5px" }} className="glyphicon glyphicon-triangle-top"> </i>
                                                    </button>
                                                ) : (
                                                        <button style={{
                                                            height: "100%", width: "100%",
                                                            backgroundColor: "#fff", border: "0px"
                                                        }} onClick={this.showHiddenRemark.bind(this, element.index)}>
                                                            <i style={{ top: "5px" }} className="glyphicon glyphicon-triangle-bottom"> </i>
                                                        </button>
                                                    )
                                            }
                                        </td>
                                        {
                                            Object.keys(arrayItems).map(key => (
                                                (arrayItems[key].type === "array") ? null :
                                                    (arrayItems[key].type === "total") ? null :
                                                        (arrayItems[key].type === "textarea") ? null :
                                                            <td key={key}>
                                                                {(arrayItems[key].type === "label") ? (
                                                                    (formData[element.index]) ?
                                                                        (
                                                                            <label>{(formData[element.index][key]) ? formData[element.index][key] : "~"}</label>
                                                                        ) : (
                                                                            <label>---</label>
                                                                        )
                                                                ) : (
                                                                        <input value={(formData[element.index]) ? (formData[element.index][key]) : 0} style={{ width: "100%" }} type={arrayItems[key].type} onChange={this.onChange(key, element.index, arrayItems[key].type)} />)}
                                                            </td>
                                            ))
                                        }
                                        < td >
                                            <div style={{ textAlign: "center" }}>
                                                <button className="" onClick={element.onDropIndexClick(element.index)}>
                                                    <i className="glyphicon glyphicon-remove"> </i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                        (this.state.isShow[element.index]) ? (
                                            <tr key={isRemark}>
                                                <td><div style={{
                                                    transformOrigin: "70% 15%",
                                                    transform: "rotate(90deg)",
                                                    width: "25px"
                                                }}>{arrayItems['remarks'].title}</div></td>
                                                <td colSpan={colSpanNum} style={{ textAlign: "center" }}>
                                                    <textarea style={{ width: "90%", padding: "10px", marginLeft: "10px" }} placeholder="Some text here" value={(formData[element.index]) ? (formData[element.index]["remarks"]) : ""} onChange={this.onChange("remarks", element.index, "string")} />
                                                </td>
                                            </tr>
                                        ) : null
                                    )
                            ))
                        ))}
                    </tbody>
                    <tfoot>
                        {Object.keys(arrayItems).map((key, index) => (
                            (arrayItems[key].type === "total") ?
                                <tr key={key}>
                                    <td colSpan={colSpanNum} style={{ textAlign: "right" }}>{arrayItems[key].title}</td>
                                    {(key === "deposit") ? (
                                        <td>
                                            <input value={(formData[0]) ? formData[0][key] ? formData[0][key] : "" : ""} style={{ width: "100%" }} type="number" onChange={this.onChange(key, index, arrayItems[key].type)} />
                                        </td>
                                    ) :
                                        (<td>{(formData[0]) ? formData[0][key] ? formData[0][key] : "~" : "~"}</td>)
                                    }
                                    {(key === "total") ? (
                                        <td>
                                            {(schema.canAdd) ? (
                                                <div style={{ textAlign: "center" }}>
                                                    <button onClick={schema.onAddClick} type="button">
                                                        <i className="glyphicon glyphicon-plus"> </i>
                                                    </button>
                                                </div>
                                            ) : null}
                                        </td>
                                    ) : null}
                                </tr>
                                : null
                        ))}
                    </tfoot>
                </table>

            </div >
        )
    }

}
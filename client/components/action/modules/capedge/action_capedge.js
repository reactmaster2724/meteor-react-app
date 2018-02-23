import React, { Component, PropTypes } from 'react'

// Import React Table
import ReactTable from "react-table";
import "react-table/react-table.css";
import matchSorter from 'match-sorter'
import namor from "namor";

export default class ActionCapedge extends Component {
    constructor(props) {
        super(props);
        this.state = {
            jsondump: null,
            data: null,
            fields: null
        }
    }

    componentWillMount() {

    }

    makeData(response) {

        var data = [];
        const lens = [];
        var fields = [];
        const newOb = (t, v, k) => {
            return {
                ["title_" + k]: t,
                ["value_" + k]: v
            };
        };
        const range = len => {
            lens.push(len);
        };

        const cells = k => {
            var ob = {};
            ob['title'] = "title_" + k;
            ob['value'] = "value_" + k;
            ob['key'] = k;
            fields.push(ob);
        }

        const convertOBtoArr = (ob, key) => {
            return Object.keys(ob).map(function (k) {
                return newOb(k, ob[k], key)
            })
        }
        var arr = [];
        Object.keys(response).map(function (key) {

            if (Object.keys(response[key]).length) {
                cells(key)
                range(Object.keys(response[key]).length);
                arr.push(convertOBtoArr(response[key], key));
            }
        });
        var largest = Math.max.apply(Math, lens);
        for (i = 0; i < largest; i++) {
            var ob = {}
            for (j = 0; j < arr.length; j++) {
                if (arr[j][i]) {
                    Object.keys(arr[j][i]).map(function (k) {
                        ob[k] = arr[j][i][k];
                    });
                }
                // else{
                //     console.log(fields)
                // }
            }
            data.push(ob);
        }
        this.state.fields = fields;
        return data;
    }

    valueMSFT() {

        var request = require('request');

        var headers = {
            'Accept': 'application/json; indent=4'
        };

        var options = {
            url: 'https://capedge.valuation.openb.net/valuation/%7B%22roa%22:%200.070305999999999993,%20%22roe%22:%200.14355899999999999,%20%22earningsyield%22:%200.033459000000000003,%20%22netincomeqoqgrowth%22:%20-0.39034999999999997,%20%22nwc%22:%2073150000000.0,%20%22revenuegrowth%22:%200.077701000000000006,%20%22dfcfnwctorev%22:%20-0.169823,%20%22croic%22:%201.8329359999999999,%20%22preferredtocap%22:%200.0,%20%22ebitda%22:%2024464000000.0,%20%22capex%22:%205944000000.0,%20%22nopatqoqgrowth%22:%20-0.39852100000000001,%20%22ebitgrowth%22:%20-0.33475899999999997,%20%22nopatgrowth%22:%20-0.45676600000000001,%20%22sgaextorevenue%22:%200.049272999999999997,%20%22netnonopex%22:%20-227955800.5,%20%22ltdebttoebitda%22:%201.1367,%20%22roicnnepspread%22:%201.2256020000000001,%20%22ebitmargin%22:%200.197767,%20%22ocfqoqgrowth%22:%20-0.090050000000000005,%20%22dio%22:%2030.7242,%20%22invturnover%22:%2011.879899999999999,%20%22costofrevtorevenue%22:%200.35304600000000003,%20%22netdebttonopat%22:%20-6.1250999999999998,%20%22investedcapitalqoqgrowth%22:%20-0.53269599999999995,%20%22dfnwctorev%22:%200.86165800000000004,%20%22dpo%22:%2077.462199999999996,%20%22roce%22:%200.14355899999999999,%20%22evtoebitda%22:%2011.9002,%20%22arturnover%22:%204.9973000000000001,%20%22ltdebtandcapleases%22:%2027808000000.0,%20%22debttoebitda%22:%201.4426000000000001,%20%22oroa%22:%200.106713,%20%22evtoebit%22:%2015.730600000000001,%20%22ebitqoqgrowth%22:%20-0.31046899999999999,%20%22debttototalcapital%22:%200.30588900000000002,%20%22nnep%22:%200.003032,%20%22dso%22:%2073.039000000000001,%20%22evtonopat%22:%2024.331499999999998,%20%22ltdebttocap%22:%200.24102299999999999,%20%22augmentedpayoutratio%22:%201.9949969999999999,%20%22profitmargin%22:%200.13029499999999999,%20%22noncontrollinginterestsharingratio%22:%200.0,%20%22investedcapitalgrowth%22:%20-0.46407999999999999,%20%22debttonopat%22:%202.9496000000000002,%20%22evtoocf%22:%209.8127999999999993,%20%22debt%22:%2035292000000.0,%20%22quickratio%22:%202.3050000000000002,%20%22faturnover%22:%206.7464000000000004,%20%22investedcapitalincreasedecrease%22:%20-5885000000.0,%20%22roic%22:%201.2286330000000001,%20%22altmanzscore%22:%203.7789999999999999,%20%22interestburdenpct%22:%201.0,%20%22revenueqoqgrowth%22:%20-0.012682000000000001,%20%22evtorevenue%22:%203.1110000000000002,%20%22epsqoqgrowth%22:%20-0.38589200000000001,%20%22currentratio%22:%202.4733999999999998,%20%22fcffqoqgrowth%22:%200.36995099999999997,%20%22dfnwc%22:%2080634000000.0,%20%22fcffgrowth%22:%200.070943000000000006,%20%22ocfgrowth%22:%20-0.087194999999999995,%20%22ebitdamargin%22:%200.26142300000000002,%20%22efftaxrate%22:%200.34116800000000003,%20%22netdebt%22:%20-73287000000.0,%20%22debttoequity%22:%200.44069999999999998,%20%22epsgrowth%22:%20-0.43726199999999998,%20%22netdebttoebitda%22:%20-2.9956999999999998,%20%22nopatmargin%22:%200.127859,%20%22ebitdaqoqgrowth%22:%20-0.25969900000000001,%20%22evtoinvestedcapital%22:%2042.838000000000001,%20%22evtofcff%22:%2016.3096,%20%22investedcapital%22:%206796000000.0,%20%22totalcapital%22:%20115375000000.0,%20%22dfcfnwc%22:%20-15892000000.0,%20%22nopat%22:%2011965044199.5,%20%22freecashflow%22:%2017850044199.5,%20%22rdextorevenue%22:%200.12872400000000001,%20%22grossmargin%22:%200.64695400000000003,%20%22taxburdenpct%22:%200.65883199999999997,%20%22ebit%22:%2018507000000.0,%20%22stdebttocap%22:%200.064866999999999994,%20%22normalizednopatmargin%22:%200.19833899999999999,%20%22ltdebttoequity%22:%200.34720000000000001,%20%22operatingmargin%22:%200.19406899999999999,%20%22ebitdagrowth%22:%20-0.25938499999999998,%20%22ocftocapex%22:%204.9912520000000002,%20%22ltdebttonopat%22:%202.3241000000000001,%20%22rnnoa%22:%20-1.0850740000000001,%20%22compoundleveragefactor%22:%202.0419,%20%22pretaxincomemargin%22:%200.197767,%20%22apturnover%22:%204.7119999999999997,%20%22noncontrolinttocap%22:%200.0,%20%22leverageratio%22:%202.0419,%20%22dividendyield%22:%200.028867,%20%22netincomegrowth%22:%20-0.447631,%20%22assetturnover%22:%200.53959999999999997,%20%22netnonopobligations%22:%20-73287000000.0,%20%22opextorevenue%22:%200.45288499999999998,%20%22nwctorev%22:%200.78168400000000005,%20%22finleverage%22:%20-0.88529999999999998,%20%22commontocap%22:%200.69411100000000003,%20%22investedcapitalturnover%22:%209.6092999999999993,%20%22depreciationandamortization%22:%205957000000.0,%20%22normalizednopat%22:%2018560609283.0,%20%22divpayoutratio%22:%200.81046499999999999,%20%22ccc%22:%2026.300899999999999%7D',
            headers: headers,
            auth: {
                'user': 'admin',
                'pass': 'valuHANSELke1117'
            }
        };

        var self = this;

        function callback(error, response, body) {

            if (!error && response.statusCode == 200) {
                self.setState({ jsondump: JSON.parse(body) })
            }
        }
        request.get(options, callback);
    }

    render() {
        var data = this.state.jsondump?this.makeData(this.state.jsondump):null
        const {fields } = this.state;
        const column = fields => {
            var ob = {
                Header: fields.key,
                columns: [
                    {
                        Header: "Title",
                        accessor: fields.title,
                        filterMethod: (filter, rows) =>
                            matchSorter(rows, filter.value, { keys: [fields.title] }),
                        filterAll: true
                    },
                    {
                        Header: "Value",
                        accessor: fields.value,
                        filterMethod: (filter, rows) =>
                            matchSorter(rows, filter.value, { keys: [fields.value] }),
                        filterAll: true
                    }
                ]
            }

            return ob;
        }
        var columns = (fields && data) ? fields.map(function (field) { return (column(field)); }) : null;
        return (
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h3>Capital Edge valuation</h3><button className="btn btn-info" onClick={this.valueMSFT.bind(this)}><span aria-hidden="true" className="glyphicon glyphicon-plus" style={{ "fontSize": "12px", "paddingRight": "5px" }}></span>MSFT</button>
                </div>
                <div>
                    <h1>Example Code</h1>
                    {(!data) ? null : (
                        (!columns) ? null :
                        <ReactTable
                            data={data}
                            filterable
                            defaultFilterMethod={(filter, row) => String(row[filter.id]) === filter.value}
                            columns={columns}
                            defaultPageSize={20}
                            className="-striped -highlight"
                        />
                    )}
                </div>

            </div>
        )
    }
}
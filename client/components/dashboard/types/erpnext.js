import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
class Erpnext extends Component {

    constructor(props) {
        super(props);
        this.state = {
            pageTitle: 'Dashboard',
            authenticate: true
        }
    }
    componentWillMount() {
        self = this;
        Meteor.call('getErpUrl', function (error, url) {
            if (error) {
                return;
            } else {
                self.setState({ erpnextdesk: "https://" + url + "/desk#desktop" });
                self.setState({ erpnextlogin: "https://" + url + "/login" });
            }
        });
    }

    iframeLoadedCallBack() {

        //$scope.$root.$broadcast("clearLoader");
        var btngooglehref, iframe;
        iframe = $('#erpnext').contents();
        if (iframe.find('p').length === 1 && iframe.find('p').text() === 'You are not permitted to access this page.') {
            iframe.attr('src', this.state.erpnextlogin);
            return true;
        }

        if (iframe.find('.btn-google').length > 0) {
            btngooglehref = iframe.find('.btn-google').attr('href');
            iframe.attr('src', btngooglehref);
            return true;
        }
    }

    render() {
        return (
            <iframe src={this.state.erpnextdesk}
                id="erpnext"
                onLoad={this.iframeLoadedCallBack()}
                style={{ width: "100%", height: "800px", border: "0px" }}>
            </iframe>
        )
    }
}
function bindAction(dispatch) {
    return {};
}
const mapStateToProps = state => ({});

export default connect(mapStateToProps, bindAction)(Erpnext);

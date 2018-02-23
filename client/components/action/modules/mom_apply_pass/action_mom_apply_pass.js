
import React, { Component, PropTypes } from 'react'

export default class ActionMom_sat extends Component {
  constructor(props){
    super(props);
    ////console.log("ActionMom_sat");
  }

  componentWillMount(){
      $('#mom-apply-pass').on('load',function(){
      
                  var iframe = $('#mom-apply-pass').contents();
                   iframe.find('#antiClickjack').remove();
                   iframe.find('script:contains("var antiClickjack = document.getElementById")').remove();
      
      
                   if (iframe.find('li:nth-child(1) .link--enter').length > 0) {
                    iframe.find('li:nth-child(1) .link--enter').click();
                   };
      
                  if (iframe.find('#entityId').length > 0) {
      
                    iframe.find('#entityId').val("201412150G");
                    iframe.find('#corpPassId').val("NEXTACTION");
                    iframe.find('#entityId').val("201412150G");
                    iframe.find('#password').val("workonThe8");
                    iframe.find('.btn-primary').click();
          }
    });
  }

  render(){
    return (
      <div className="panel panel-default mom-apply-pass-module">
        <div className="panel-heading">
          <h3>MOM Apply Pass</h3><button className="btn btn-info"><span aria-hidden="true" className="glyphicon glyphicon-plus" style={{"fontSize":"12px","paddingRight":"5px"}}></span>Submit to MOM</button>
        </div>
        <div className="panel-body">
          <div className="text-center">
            <iframe sandbox="allow-forms allow-pointer-lock allow-popups allow-same-origin allow-scripts allow-presentation" height="1200" id="mom-apply-pass" name="mom-apply-pass" src="http://www.mom.gov.sg/eservices/services/ep-online" width="800"></iframe>
          </div>
        </div>
      </div>
    )
  }
}
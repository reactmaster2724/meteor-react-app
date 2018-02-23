import React, { Component, PropTypes } from 'react'

import AttachmentsDropFiles from './dropfiles/attachments.dropfiles'

export default class Attachments extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {

  }

  changeDropZone(attachments) {
    var attachmentList=[];
    $.each(attachments,function(index,item){
      if(item){
        attachmentList.push(item)
      }
    });
    console.log(attachmentList)
    this.props.addAttachments(attachmentList);
  }

  render() {
    return (
      <div className="panel panel-default attachment-module" > {/*ng-controller="AttachmentsModuleController"*/}

        <div className="panel-heading">
          <h3>Attachment(s)</h3>
          <small>&nbsp;</small>
        </div>
        <div className="panel-body">
          <div className="text-center">
            <AttachmentsDropFiles changeDropZone={this.changeDropZone.bind(this)} action={this.props.action}/>
          </div>
        </div>
      </div>
    )
  }
}
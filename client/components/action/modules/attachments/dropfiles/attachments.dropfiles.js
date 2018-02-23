import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom';

import DropzoneComponent from 'react-dropzone-component';

export default class AttachmentsDropFiles extends Component {
    constructor(props) {
        super(props);
        this.state = {
            attachments: this.props.action.attachments || []
        }
        this.djsConfig = {
            addRemoveLinks: true,
            sendingmultiple: true,
            maxFilesize: 30,
            maxFiles: 20
        };

        this.componentConfig = {
            postUrl: '/uploadtogcs',
        };

        var self = this;

        this.addedfile = function (file) {

            if (file.size < 22 * 1024 * 1024) {

                var reader = new FileReader(),
                    method, encoding = 'binary', type = type || 'binary';
                var fileInfo = {
                    name: file.name,
                    type: file.type,
                    size: file.size
                }

                switch (type) {
                    case 'text':
                        method = 'readAsText';
                        encoding = 'utf8';
                        break;
                    case 'binary':
                        method = 'readAsBinaryString';
                        encoding = 'binary';
                        break;
                    default:
                        method = 'readAsBinaryString';
                        encoding = 'binary';
                        break;
                }

                var attachmentscomponet = self;

                reader.onload = function (fileLoadEvent) {

                    Meteor.call('uploadtogcs', fileInfo, reader.result, encoding, function (err, filePath) {

                        if (err) {
                            console.log(err)
                        } else {
                            if (filePath) {
                                attachmentscomponet.state.attachments.push(filePath);
                                file['index'] = attachmentscomponet.state.attachments.length - 1;
                                attachmentscomponet.props.changeDropZone(self.state.attachments)
                            }
                        }
                    });

                };
                reader.readAsBinaryString(file);
            }

        }
        this.removedfile = function (file) {

            Meteor.call('deleteFile', self.state.attachments[file.index].publicurl, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    delete self.state.attachments[file.index];
                    self.props.changeDropZone(self.state.attachments);
                }
            });
        }
        this.dropzone = null;
    }

    componentWillMount() {

    }

    removeFormGCS(fileInfo, index) {
        self = this;
        attachments = this.props.action.attachments
        Meteor.call('deleteFile', fileInfo.publicurl, function (err) {
            delete attachments[index];
            self.props.changeDropZone(attachments);
            const newState = self.state;
            newState.attachments.splice(index, 1);
            self.setState(newState)
        })
    }

    uploadedFileView() {

        function getFileSize(size) {
            var numb = size / 1024 / 1024;
            return numb.toFixed(2);
        }

        function isImage(fileInfo) {
            if (fileInfo.type) {
                var type = fileInfo.type.split('/');

                if (type[0] == "image") {
                    return "img"
                } else {
                    var ext = fileInfo.publicurl.split(".");
                    return (ext[ext.length - 1]);
                }
            } else {
                return "UNKNOWN";
            }

        }
        const fileList = this.state.attachments.map((fileInfo, index) => {
            return (
                <div key={index} className="dz-preview dz-processing dz-success dz-complete dz-image-preview">
                    <div className="dropzone dz-preview dz-preview-area">
                        <div className="dz-image dz-image-area">
                            {(isImage(fileInfo) == "img") ? (
                                <img src={fileInfo.publicurl} />
                            ) : (
                                    <div>{isImage(fileInfo)}</div>
                                )}

                        </div>
                        <div className="dz-details">
                            <div className="dz-size">
                                <span data-dz-size=""><strong>{getFileSize(fileInfo.size)}</strong> MB</span>
                            </div>
                            <div className="dz-filename">
                                <span data-dz-name="">{fileInfo.filename}</span>
                            </div>
                            <a className="action-btn remove-attach" href="javascript:undefined;" onClick={() => this.removeFormGCS(fileInfo, index)}>
                                <span className="glyphicon glyphicon-remove" title="Remove attachment"></span>
                            </a>
                            <a className="action-btn download-attach" target="_blank" href={fileInfo.publicurl}>
                                <span className="glyphicon glyphicon-save" title="Download attachment"></span>
                            </a>
                        </div>

                    </div>

                </div>
            )
        })
        return (
            <div className="filepicker dropzone dz-clickable dz-started">
                {fileList}
            </div>
        )
    }

    render() {
        const config = this.componentConfig;
        const djsConfig = this.djsConfig;
        const eventHandlers = {
            addedfile: this.addedfile,
            removedfile: this.removedfile
        }
        return (
            <div>
                {(this.state.attachments.length) ? (this.uploadedFileView()) : null}
                <DropzoneComponent config={config} eventHandlers={eventHandlers} djsConfig={djsConfig} />
            </div>
        )
    }
}   

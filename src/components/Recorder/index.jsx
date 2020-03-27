import React, { Component } from 'react';
import { Form, Input, Button, message } from 'antd';
import TWebsocket from '@/tools/websocket';
import TRecorder from '@/tools/recorder';

import { connect, disconnect } from '@/api/recorder';
import './index.less';
class Recorder extends Component{
    constructor(props) {
        super(props);
        this.audioRef = React.createRef();
        this.state = {
            status: 0,
            audioReady: false,
            recording: false
        };
    }
    connectHandle = () => {
        if(this.state.status===0){
            this.props.form.validateFields((err, values) => {
                if (!err) {
                    this.setState({status: 1});
                    this.server = values.server;
                    connect({
                        server: values.server,
                        device: "web",
                        source: "",
                        target: values.deviceId, //对讲目标设备id，必填
                        sampleRateInHz: "4",
                        audioFormat: "3",
                        fileFormat: ""
                    }).then(data => {
                        this.session = data.session;
                        this.socketUrl = data.receive_rtmp
                        if(this.socketUrl){
                            this.socket = new TWebsocket({
                                socketUrl: this.socketUrl,
                                socketOpen: this._socketOpen.bind(this),
                                socketClose: this._socketDisconnect.bind(this),
                                socketError: null
                            });
                            this.socket.connectWs();
                        }else{
                            setTimeout(() => {
                                message.error('连接失败');
                                this.setState({status: 0});
                            }, 1000);
                        }
                    });
                }
            });
        }else if(this.state.status===2){
            this.disconnectHandle();
        }
    }
    disconnectHandle = () => {
        this.audio.stop();
        this.audio.close();
        disconnect({
            server: this.server,
            session: this.session
        }).then(() => {
            this.setState({status: 0});
            this.socket && this.socket.close();
        });
    }
    _socketOpen = () => {
        this.setState({status: 2});
        this.audio = new TRecorder();
        this.audio.open().then(() => {
            this.setState({audioReady: true});
        });
    }
    _socketDisconnect = () => {
        message.error('连接中断');
        this.setState({status: 0});
    }
    recorderHandle = () => {
        this.audio.start();
        this.setState({recording: true});
        document.querySelector('audio') && document.removeChild(document.querySelector('audio'));
    }
    sendHandle = () => {
        this.audio.stop();
        this.audio.mediaRecorder.ondataavailable = event => {
            let audio = document.createElement('audio');
            audio.src = window.URL.createObjectURL(event.data);
            audio.play();
            this.socket && this.socket.sendMessage(event.data);
        }
        this.setState({recording: false});
    }
    statusWatcher = (status) => {
        if(status===0){
            return '建立连接';
        }else if(status===1){
            return '连接中....';
        }else if(status===2){
            return '断开连接';
        }
    }
    componentWillUnmount() {
        this.disconnectHandle();
    }
    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <div className="recorder-wrapper">
               <Form onSubmit={this.handleSubmit} className="recorder-form">
                    <Form.Item>
                        {getFieldDecorator('server', {
                            rules: [{ required: true, message: '请输入服务地址' }],
                        })(<Input placeholder="服务地址" className="form-input" />)
                        }
                    </Form.Item>
                    <Form.Item>
                        {getFieldDecorator('deviceId', {
                            rules: [{ required: true, message: '请输入设备ID' }],
                        })(<Input className="form-input" placeholder="设备ID" />)
                        }
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" 
                            className="form-btn" 
                            loading={this.state.status===1} 
                            disabled={(this.state.status===0 || this.state.status===2)?false:true} 
                            onClick={this.connectHandle}>
                            {this.statusWatcher(this.state.status)}
                        </Button>
                    </Form.Item>
                    <Form.Item>
                        <Button 
                            type={this.state.recording?'danger':'primary'} 
                            className="form-btn" 
                            disabled={!this.state.audioReady}
                            onMouseDown={this.recorderHandle} 
                            onMouseUp={this.sendHandle}>
                            {this.state.recording?'松开结束': '按住说话'}
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        )
    }
}
export default Form.create({ name: 'recorder-form' })(Recorder)
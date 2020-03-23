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
            status: 0
        };
    }
    connectHandle = () => {
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({status: 1});
                connect({
                    device: "web",
                    source: "",
                    target: values.deviceId, //对讲目标设备id，必填
                    sampleRateInHz: "4",
                    audioFormat: "3",
                    fileFormat: ""
                }).then(data => {
                    this.session = data.session;
                    this.socketUrl = data.receive_rtmp
                });
                this.socket = new TWebsocket({
                    socketUrl: this.socketUrl,
                    socketOpen: this._socketOpen.bind(this),
                    socketMessage: null,
                    socketClose: this._socketDisconnect.bind(this),
                    socketError: null
                });
            }
        });
    }
    _socketOpen = session => {
        this.setState({status: 2});
        this.recorder = new TRecorder();
        this.recorder.start();
        this.recorder.ondataavailable = event => {
            this.socket.sendMessage(event.data);
        }
    }
    _socketDisconnect = () => {
        message.error('连接中断');
        this.setState({status: 3});
    }
    finishHandle = () => {
        this.recorder && this.recorder.stop();
        this.session && disconnect({
            session: this.session
        });
        this.setState({status: 0});
        this.socket && this.socket.close();
    }
    statusWatcher = (status) => {
        if(status===0){
            return '开始对讲';
        }else if(status===1){
            return '连接建立中....';
        }else if(status===2){
            return '对讲中';
        }else if(status===3){
            return '正在重连';
        }
    }
    componentWillUnmount() {
        this.finishHandle();
    }
    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <div className="recorder-wrapper">
               <Form onSubmit={this.handleSubmit} className="recorder-form">
                    <Form.Item>
                        {getFieldDecorator('api', {
                            rules: [{ required: true, message: '请输入API地址' }],
                        })(<Input placeholder="API地址" className="form-input" />)
                        }
                    </Form.Item>
                    <Form.Item>
                        {getFieldDecorator('deviceId', {
                            rules: [{ required: true, message: '请输入设备ID' }],
                        })(<Input className="form-input" placeholder="设备ID" />)
                        }
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" loading={this.state.status===1} disabled={this.state.status===0?false:true} onClick={this.connectHandle}>{this.statusWatcher(this.state.status)}</Button>
                        <Button type="danger" onClick={this.finishHandle}>结束对讲</Button>
                    </Form.Item>
                </Form>
            </div>
        )
    }
}
export default Form.create({ name: 'recorder-form' })(Recorder)
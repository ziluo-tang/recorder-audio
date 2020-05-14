import React, { Component } from 'react';
import { Form, Input, Button, message } from 'antd';
import TWebsocket from '@/tools/websocket';
import TRecorder from 'web-tele-lib';

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
    wsHandle = () => {
        if(this.state.status===0){
            this.wsConnect();
        }else if(this.state.status===2){
            this.wsDisconnect();
        }
    }
    wsConnect = () => {
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({status: 1});
                this.server = values.server;
                connect({
                    server: values.server,
                    target: values.deviceId //对讲目标设备id，必填
                }).then(res => {
                    const { data } = res;
                    this.session = data.session;
                    this.socketUrl = data.receive_rtmp;
                    if(res.errorCode==="SUCCESS" && this.socketUrl){
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
                }).catch(err => {
                    message.error(err);
                    this.setState({status: 0});
                });
            }
        });
    }
    wsDisconnect = () => {
        this.audio && this.audio.stop();
        this.audio && this.audio.close();
        this.session && disconnect({
            server: this.server,
            session: this.session
        }).then(res => {
            if(res.errorCode==='SUCCESS'){
                this.setState({
                    status: 0,
                    audioReady: false,
                    recording: false
                });
                this.socket && this.socket.close();
            }else{
                message.error('断开连接失败');
            }
        }).catch(err => {
            message.error(err);
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
        if(this.state.status!==0){
            message.error('连接中断');
            this.wsDisconnect();
        }
    }
    audioHandle = () => {
        if(!this.state.recording){
            this.audio.start(data => {
                this.socket.sendMessage(data);
            });
            this.setState({recording: true});
        }else{
            this.audio.stop();
            this.setState({recording: false});
        }
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
        this.wsDisconnect();
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
                        <Button type={this.state.status===0?'primary':'danger'} 
                            className="form-btn" 
                            loading={this.state.status===1} 
                            disabled={((this.state.status===0 || this.state.status===2) && !this.state.recording)?false:true} 
                            onClick={this.wsHandle}>
                            {this.statusWatcher(this.state.status)}
                        </Button>
                    </Form.Item>
                    <Form.Item>
                        <Button 
                            type={this.state.recording?'danger':'primary'} 
                            className="form-btn" 
                            disabled={!this.state.audioReady}
                            onClick={this.audioHandle}>
                            {this.state.recording?'结束对话': '开始对话'}
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        )
    }
}
export default Form.create({ name: 'recorder-form' })(Recorder)
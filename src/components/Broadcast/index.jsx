import React, { Component } from 'react';
import { Form, Input, Icon, Button, message } from 'antd';
import TRecorder from '@/tools/recorder';
import TWebsocket from '@/tools/websocket';
import { startBroadcast, stopBroadcast } from '@/api/recorder';
import './index.less';
class Broadcast extends Component{
    id = 0
    constructor(props) {
        super(props);
        this.audioRef = React.createRef();
        this.state = {
            status: 0,
            audioReady: false,
            recording: false
        };
    }
    add = e => {
        const { form } = this.props;
        const keys = form.getFieldValue('keys');
        const nextKeys = keys.concat(this.id++);
        form.setFieldsValue({
            keys: nextKeys,
        });
    }
    remove = k => {
        const { form } = this.props;
        const keys = form.getFieldValue('keys');
        form.setFieldsValue({
          keys: keys.filter(key => key !== k),
        });
    }
    componentDidMount(){
        this.add();
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
                startBroadcast({
                    server: values.server,
                    targets: values.names.filter(id => id !== null) //对讲目标设备id，必填
                }).then(res => {
                    const { data } = res;
                    this.session = data.session;
                    this.socketUrl = data.send_rtmp;
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
                });
            }
        });
    }
    wsDisconnect = () => {
        this.audio && this.audio.stop();
        this.audio && this.audio.close();
        this.session && stopBroadcast({
            server: this.server,
            session: this.session
        }).then(() => {
            this.setState({
                status: 0,
                audioReady: false,
                recording: false
            });
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
        if(this.state.status!==0){
            message.error('连接中断');
            this.wsDisconnect();
        }
    }
    broadcastHandle = () => {
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
            return '建立中....';
        }else if(status===2){
            return '断开连接';
        }
    }
    componentWillUnmount() {
        this.wsDisconnect();
    }
    render() {
        const { getFieldDecorator, getFieldValue } = this.props.form;
        getFieldDecorator('keys', { initialValue: [] });
        const keys = getFieldValue('keys');
        const formItems = keys.map((k, index) => (
            <Form.Item
                required={false}
                key={k}
            >
                {getFieldDecorator(`names[${k}]`, {
                    validateTrigger: ['onChange', 'onBlur'],
                    rules: [{
                            required: true,
                            whitespace: true,
                            message: "请输入设备ID"
                    }]
                })(<Input placeholder="设备ID" className="form-input device-input" />)}
                    <Icon
                        className="dynamic-delete-button"
                        type="minus-circle-o"
                        onClick={() => this.remove(k)}
                    />
            </Form.Item>
        ));
        return (
            <div className="broadcast-wrapper">
                {/* <div className="audio-wrapper">
                    <audio controls autoPlay></audio>
                </div> */}
                <Form onSubmit={this.handleSubmit}>
                    <Form.Item>
                        {getFieldDecorator('server', {
                            rules: [{ required: true, message: '请输入服务地址' }],
                        })(<Input placeholder="服务地址" className="form-input" />)
                        }
                    </Form.Item>
                    {formItems}
                    <Form.Item>
                        <Button type="dashed" onClick={this.add} disabled={this.state.status!==0}>
                            <Icon type="plus" /> 添加设备
                        </Button>
                    </Form.Item>
                    <Form.Item>
                        <Button 
                            type={this.state.status===0?'primary':'danger'}  
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
                            onClick={this.broadcastHandle}>
                                {this.state.recording?'结束对话': '开始对话'}
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        )
    }
}

export default Form.create({ name: 'broadcast-form' })(Broadcast)
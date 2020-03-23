import React, { Component } from 'react';
import { Form, Input, Button, message } from 'antd';
import io from "socket.io-client";
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
        // const { send_rtmp, session } = start(
        //     {
        //         source: "",
        //         target: "",
        //         device :"web",
        //         sampleRateInHz: "44100Hz",
        //         audioFormat: "ENCODING_PCM_16BIT",
        //         fileFormat: "AAC"
        //     }
        // );
        // this.session = session;
        // this.ws = this.initWebSocket(send_rtmp);
    }
    componentDidMount() {
        this.recorder = new TRecorder(this.audioRef.current);
    }
    componentWillUnmount() {
        // this.ws.close();
    }
    connectHandle = () => {
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({status: 1});
                const {wsUrl} = connect({

                });
                const socket = io(wsUrl);
                socket.on('connect', () => {
                    console.log(socket.connected); // true
                });
            }
        });
    }
    recorderHandle = () => {
        this.recorder.start();
    }
    finishHandle = () => {
        // this.recorder.stop();
        // const data = this.recorder.getBlob();
        // this.ws.send(data);
        // stop(this.session);
        this.setState({status: 0});
        disconnect();
    }
    statusWatcher = (status) => {
        if(status===0){
            return '开始对讲';
        }else if(status===1){
            return '连接建立中....';
        }else if(status===2){
            return '对讲中';
        }
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
                        })(<Input type="password" className="form-input" placeholder="设备ID" />)
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
import React, { Component } from 'react';
import { Form, Input, Icon, Button, message } from 'antd';
import TRecorder from '@/tools/recorder';
import { connect, disconnect, broadcast } from '@/api/recorder';
import './index.less';
class Broadcast extends Component{
    id = 0
    constructor(props) {
        super(props);
        this.audioRef = React.createRef();
        this.state = {
            status: 0
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
    connectHandle = () => {
        this.props.form.validateFields((err, values) => {
            if (!err) {
                
            }
        });
    }
    broadcastHandle = () => {
        this.props.form.validateFields((err, values) => {
            if (!err) {
                
            }
        });
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
        // this.ws.close();
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
                })(<Input placeholder="设备ID" className="form-input" />)}
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
                        <Button type="dashed" onClick={this.add}>
                            <Icon type="plus" /> 添加设备
                        </Button>
                    </Form.Item>
                    <Form.Item>
                        <Button 
                            type="primary" 
                            className="form-btn" 
                            loading={this.state.status===1} 
                            disabled={this.state.status===0?false:true} 
                            onClick={this.connectHandle}>
                                {this.statusWatcher(this.state.status)}
                        </Button>
                    </Form.Item>
                    <Form.Item>
                        <Button 
                            type="primary" 
                            className="form-btn" 
                            htmlType="submit" 
                            onClick={this.broadcastHandle}>
                                开始对话
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        )
    }
}

export default Form.create({ name: 'broadcast-form' })(Broadcast)
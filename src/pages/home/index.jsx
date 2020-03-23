import React, { Component } from 'react';
import Broadcast from '@/components/Broadcast';
import Recorder from '@/components/Recorder';
import { Card } from 'antd';
import './index.less';
const tabList = [
    {
      key: 'recorder',
      tab: '点播'
    },
    {
      key: 'broadcast',
      tab: '广播'
    }
];
const contentList = {
    recorder: <Recorder/>,
    broadcast: <Broadcast/>
};
export default class extends Component{
    state = {
        key: 'recorder'
    }
    onTabChange = key => {
        this.setState({ key: key });
    }
    render() {
        return (
            <div className="home">
                <Card 
                    title={<h1>Recorder Audio</h1>}
                    tabList={tabList}
                    activeTabKey={this.state.key}
                    onTabChange={this.onTabChange}
                    bordered={false}
                >
                    { contentList[this.state.key] }
                </Card>
            </div>
        )
    }
}
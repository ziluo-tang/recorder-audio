import { message } from "antd";
import { tuple } from "antd/lib/_util/type";
export default class webSocket {
    constructor(param = {}) {
        this.param = param;
        this.reconnectCount = 0;
        this.socket = null;
        this.taskRemindInterval = null;
        this.isConnect = false;
    }
    connectWs = () => {
        let { socketUrl } = this.param;
        if ('WebSocket' in window) {
            this.socket = new WebSocket(socketUrl);
            this.socket.onopen = this.onopen;
            this.socket.onmessage = this.onmessage;
            this.socket.onclose = this.onclose;
            this.socket.onerror = this.onerror;
            this.socket.sendMessage = this.sendMessage;
            this.socket.closeSocket = this.closeSocket;
        }else{
            message.info('您的浏览器不支持 WebSocket!');
        }
    }
    onopen = () => {
        let { socketOpen } = this.param;
        this.isConnect = true;
        socketOpen && socketOpen();
    }
    onmessage = event => {
        let { socketMessage } = this.param;
        socketMessage && socketMessage(event.data);
    }
    onclose = event => {
        this.isConnect = false;
        let { socketClose } = this.param;
        socketClose && socketClose(event);
        this.socket.close();
        // 根据后端返回的状态码做操作
        // 我的项目是当前页面打开两个或者以上，就把当前以打开的socket关闭
        // 否则就1秒重连一次，直到重连成功为止 
        // if(event.code === '1006'){
        //     this.socket.close();
        // }else{
        //     this.taskRemindInterval = setInterval(()=>{
        //         if(!this.isConnect){
        //             this.connectWs();
        //         }else{
        //             clearInterval(this.taskRemindInterval)
        //         }
        //     },1000)
        // }
    }
    //socket连接报错触发
    onerror = event => {
        let { socketError } = this.param;
        this.socket = null;
        socketError && socketError(event);
    };
    sendMessage = data => {
        console.log(data, "***websocket测试数据***");
        this.socket && this.socket.send(data);
    }
    close = () => {
        this.socket && this.socket.close();
    }
}
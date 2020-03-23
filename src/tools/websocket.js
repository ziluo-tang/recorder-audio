import { message } from "antd";
export default class webSocket {
    constructor(param = {}) {
        this.param = param;
        this.reconnectCount = 0;
        this.socket = null;
        this.taskRemindInterval = null;
        this.isSucces=true;
    }
    connection = () => {
        let { socketUrl, timeout = 0 } = this.param;
        if ('WebSocket' in window) {
            this.socket = new WebSocket(socketUrl);
            this.socket.onopen = this.onopen;
            this.socket.onmessage = this.onmessage;
            this.socket.onclose = this.onclose;
            this.socket.onerror = this.onerror;
            this.socket.sendMessage = this.sendMessage;
            this.socket.closeSocket = this.closeSocket;
            // 检测返回的状态码 如果socket.readyState不等于1则连接失败，关闭连接
            if(timeout) {
                let time = setTimeout(() => {
                    if(this.socket && this.socket.readyState !== 1) {
                        this.socket.close();
                    }
                    clearInterval(time);
                }, timeout);
            }
        }else{
            message.info('您的浏览器不支持 WebSocket!');
        }
    };
    onopen = () => {
        let { socketOpen } = this.param;
        this.isSucces= false  //连接成功将标识符改为false
        socketOpen && socketOpen();
    };
    onmessage = event => {
        let { socketMessage } = this.param;
        socketMessage && socketMessage(event.data);
    };
    onclose = event => {
        this.isSucces = true;  //关闭将标识符改为true
        let { socketClose } = this.param;
        socketClose && socketClose(event);
        // 根据后端返回的状态码做操作
        // 我的项目是当前页面打开两个或者以上，就把当前以打开的socket关闭
        // 否则就1秒重连一次，直到重连成功为止 
        if(event.code=='4500'){
            this.socket.close();
        }else{
            this.taskRemindInterval = setInterval(()=>{
                if(this.isSucces){
                    this.connection();
                }else{
                    clearInterval(this.taskRemindInterval)
                }
            },1000)
        }
    }
    //socket连接报错触发
    onerror = event => {
        let { socketError } = this.param;
        this.socket = null;
        socketError && socketError(event);
    };
    sendMessage = data => {
        this.socket && this.socket.send(data);
    }
    close = () => {
        this.socket && this.socket.close();
    }
}
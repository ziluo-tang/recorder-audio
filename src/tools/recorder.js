import { message } from 'antd';
export default class Recorder{
    constructor() {
        this.chunks = [];
        this.init();
    }
    init() {
        const constrains = {
            audio: true
        };
        let success = stream => {
            this.mediaRecorder = new MediaRecorder(stream, {
                audioBitsPerSecond : 128000, // 音频码率
                mimeType : 'audio/webm' // 编码格式
            });
            this.mediaRecorder.ondataavailable = event => {
                this.chunks.push(event.data);
            }
            this.mediaRecorder.onstop = event => {
                
            }
        };
        let error = err => {
            switch (err.code || err.name) {  
                case 'PERMISSION_DENIED':  
                case 'PermissionDeniedError':  
                    message.error('用户拒绝提供信息');  
                    break;  
                case 'NOT_SUPPORTED_ERROR':  
                case 'NotSupportedError':  
                    message.error('浏览器不支持硬件设备');  
                    break;  
                case 'MANDATORY_UNSATISFIED_ERROR':  
                case 'MandatoryUnsatisfiedError':  
                    message.error('无法发现指定的硬件设备');  
                    break;  
                default:  
                    message.error(`无法打开麦克风，异常信息: (${err.code || err.name})`);  
                    break;  
            }  
        };
        if(navigator.mediaDevices.getUserMedia){
            navigator.mediaDevices.getUserMedia(constrains).then(success).catch(error);
        } else if (navigator.webkitGetUserMedia){
            navigator.webkitGetUserMedia(constrains).then(success).catch(error);
        } else if (navigator.mozGetUserMedia){
            navigator.mozGetUserMedia(constrains).then(success).catch(error);
        } else if (navigator.getUserMedia){
            navigator.getUserMedia(constrains).then(success).catch(error);
        } else {
            message.error('当前浏览器不支持录音功能');
        }
    }
    start() {
        this.mediaRecorder.start();
    }
    stop() {
        this.mediaRecorder.stop();
    }
    getBlob() {
        return new Blob(this.mediaRecorder.requestData(), { type: 'audio/wav' });
        // return new Blob(this.chunks, { type: 'audio/wav' });
    }
}
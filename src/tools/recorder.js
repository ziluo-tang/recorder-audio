import { message } from 'antd';
export default class Recorder{
    constructor() {
        this.isRecorder = false;
    }
    async open() {
        const constrains = {
            video: false,
            audio: true
        };
        let success = stream => {
            this.connect(stream)
            // this.isRecorder = true;
            // this.mediaRecorder = new MediaRecorder(stream, {
            //     audioBitsPerSecond : 128000, // 音频码率
            //     mimeType : 'audio/webm' // 编码格式
            // });
        };
        let error = err => {
            this.isRecorder = false;
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
        if(navigator.getUserMedia){
            return await navigator.getUserMedia(constrains, success, error);
        }else if (navigator.mediaDevices.getUserMedia){
            return await navigator.mediaDevices.getUserMedia(constrains).then(success).catch(error);
        } else if (navigator.webkitGetUserMedia){
            return await navigator.webkitGetUserMedia(constrains).then(success).catch(error);
        } else if (navigator.mozGetUserMedia){
            return await navigator.mozGetUserMedia(constrains).then(success).catch(error);
        } else if (navigator.getUserMedia){
            return await navigator.getUserMedia(constrains).then(success).catch(error);
        } else {
            return await message.error('当前浏览器不支持录音功能');
        }
    }
    connect(stream) {
        this.audioContext = new AudioContext();
        console.log(this.audioContext);
        this.audioInput = this.audioContext.createMediaStreamSource(stream);
        console.log(this.audioInput);
        this.recorder = this.audioContext.createScriptProcessor(4096, 2, 2);
        this.recorder.onaudioprocess = e => {
            console.log(e);
        }
    }
    start() {
        // this.isRecorder && this.mediaRecorder.start();
        this.audioInput.connect(this.recorder);  
        this.recorder.connect(this.audioContext.destination);
    }
    stop() {
        this.recorder.disconnect();
        // if(this.mediaRecorder.state!=='inactive'){
        //     this.mediaRecorder.stop();
        // }
    }
    close() {
        this.mediaRecorder.stream.getTracks()[0].stop();
    }
    getData() {
        return this.chunks;
    }
}
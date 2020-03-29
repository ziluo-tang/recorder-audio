import { message } from 'antd';
export default class Recorder{
    constructor() {
        this.isRecorder = false;
    }
    async open() {
        if(navigator.mediaDevices === undefined) {
            navigator.mediaDevices = {};
        }
        if(navigator.mediaDevices.getUserMedia === undefined) {
            navigator.mediaDevices.getUserMedia = function(constraints) {
              let getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
              if (!getUserMedia) {
                message.error('当前浏览器不支持录音功能');
                return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
              }
              return new Promise(function(resolve, reject) {
                getUserMedia.call(navigator, constraints, resolve, reject);
              });
            }
        }
        const result =  await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true
        }).then(stream => {
            this.audioContext = new AudioContext();
            this.audioInput = this.audioContext.createMediaStreamSource(stream);
            this.recorder = this.audioContext.createScriptProcessor(4096, 1, 1);
            this.recorder.onaudioprocess = e => {
                // console.log(e.inputBuffer.getChannelData(0));
            }
        }).catch(err => {
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
        });
        return result;
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
}
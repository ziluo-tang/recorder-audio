import { message } from 'antd';
export default class Recorder{
    constructor() {
        this.isRecorder = false;
    }
    async open({bufferSize = 4096, numberOfInputChannels = 2, numberOfOutputChannels = 2} = {}) {
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
            this.recorder = this.audioContext.createScriptProcessor(bufferSize, numberOfInputChannels, numberOfOutputChannels);
            this.stream = stream;
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
    start(callback) {
        this.audioInput.connect(this.recorder);  
        this.recorder.connect(this.audioContext.destination);
        this.recorder.onaudioprocess = e => {
            if(callback && typeof callback === "function") {
                callback(e.inputBuffer.getChannelData(0));
            }
        }
    }
    stop() {
        this.recorder.disconnect();
    }
    close() {
        this.stream.getTracks()[0].stop();
    }
}
import http from './http';
import config from './config';

export async function connect(param) {
    return await http.post(`${param.server}/v1/voice/start`, Object.assign(config, param));
}

export async function disconnect(param) {
    return await http.post(`${param.server}/v1/voice/stop`, param);
}

export async function startBroadcast(param) {
   return await http.post(`${param.server}/v1/voice/broadcast/start`, Object.assign(config, param));
}

export async function stopBroadcast(param) {
    return await http.post(`${param.server}/v1/voice/broadcast/stop`, param);
}
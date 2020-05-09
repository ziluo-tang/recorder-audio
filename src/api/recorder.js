import http from './http';
import config from './config';

export async function connect(param) {
    return await http.post(`${param.server}/v1/voice/start`, Object.assign(config, param));
    // try{
    //     const response = await fetch(`${param.server}/v1/voice/start`, {
    //         body: JSON.stringify(Object.assign(config, param)),
    //         cache: 'no-cache',
    //         credentials: 'include',
    //         headers: {
    //             'content-type': 'application/json'
    //         },
    //         method: 'POST',
    //         mode: 'cors',
    //         redirect: 'follow',
    //         referrer: 'no-referrer'
    //     });
    //     const result = await response.json();
    //     if (!response.ok) {
    //         message.error(result.message || '网络错误');
    //     }
    //     return result;
    // }catch(err){
    //     return Promise.reject(err);
    // }
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
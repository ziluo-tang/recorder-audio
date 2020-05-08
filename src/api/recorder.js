import { message } from 'antd';
import config from './config';

const NetworkError = 'network error';
export async function connect(param) {
    const response = await fetch(`${param.server}/v1/voice/start`, {
        body: JSON.stringify(Object.assign(config, param)),
        cache: 'no-cache',
        credentials: 'include',
        headers: {
            'content-type': 'application/json'
        },
        method: 'POST',
        mode: 'cors',
        redirect: 'follow',
        referrer: 'no-referrer'
    }).catch(err => {
        message.error(NetworkError);
        return NetworkError;
    });
    if(response===NetworkError){
        return Promise.reject(NetworkError);
    }else{
        const result = await response.json();
        if (!response.ok) {
            message.error(result.message || '网络错误');
        }
        return result;
    }
}

export async function disconnect(param) {
    const response = await fetch(`${param.server}/v1/voice/stop`, {
        body: JSON.stringify(param),
        cache: 'no-cache',
        credentials: 'include',
        headers: {
            'content-type': 'application/json'
        },
        method: 'POST',
        mode: 'cors',
        redirect: 'follow',
        referrer: 'no-referrer'
    });
    const result = await response.json();
    if (!response.ok) {
        message.error(result.message || '网络错误');
    }
    return result;
}

export async function startBroadcast(param) {
    const response = await fetch(`${param.server}/v1/voice/broadcast/start`, {
        body: JSON.stringify(Object.assign(config, param)),
        cache: 'no-cache',
        credentials: 'include',
        headers: {
            'content-type': 'application/json'
        },
        method: 'POST',
        mode: 'cors',
        redirect: 'follow',
        referrer: 'no-referrer'
    });
    const result = await response.json();
    if(!response.ok) {
        message.error(result.message || '网络错误');
    }
    return result;
}

export async function stopBroadcast(param) {
    const response = await fetch(`${param.server}/v1/voice/broadcast/stop`, {
        body: JSON.stringify(param),
        cache: 'no-cache',
        credentials: 'include',
        headers: {
            'content-type': 'application/json'
        },
        method: 'POST',
        mode: 'cors',
        redirect: 'follow',
        referrer: 'no-referrer'
    });
    const result = await response.json();
    if(!response.ok) {
        message.error(result.message || '网络错误');
    }
    return result;
}
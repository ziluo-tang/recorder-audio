import { message } from 'antd';
export async function connect(param) {
    const response = await fetch('/v1/voice/start', {
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
    const reslut = await response.json();
    if (!response.ok) {
        message.error(reslut.message || '网络错误');
    }
    return reslut.data;
}

export async function disconnect(param) {
    const response = await fetch('/v1/voice/stop', {
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
    const reslut = await response.json();
    if (!response.ok) {
        message.error(reslut.message || '网络错误');
    }
    return reslut.data;
}

export async function broadcast(param) {
    const response = await fetch('/v1/voice/broadcast', {
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
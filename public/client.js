var socket = io();
const configuration = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] }
var isSender = true;
var peerConnection = new RTCPeerConnection(configuration);

//Signaling
socket.on('registered', (id) => {
    console.log('joined', id);
    setup();
});


function register() {
    let id = randomId();
    if (document.getElementById('sessionId').value) {
        id = document.getElementById('sessionId').value
        isSender = false;
        setup();
    } else {
        document.getElementById('sessionId').value = id;
    }

    socket.emit('register', id);
}

function randomId() {
    const uint32 = window.crypto.getRandomValues(new Uint32Array(1))[0];
    return uint32.toString(16);
}

//Setup WebRTC
async function setup() {
    socket.on('pair', setupCall);

    //hack needed?
    const offer = await peerConnection.createOffer({offerToReceiveAudio: true});
    await peerConnection.setLocalDescription(offer);
    socket.emit('pair', { 'offer': offer });
    socket.on('pair', setupRecieve);
}


async function setupCall(message) {
    
    if (message.answer && peerConnection.signalingState !== "stable") {
        console.debug('pair call', message);
        socket.removeListener('pair', setupCall);
        const remoteDesc = new RTCSessionDescription(message.answer);
        await peerConnection.setRemoteDescription(remoteDesc);
    }
}

async function setupRecieve(message) {
    console.debug("r", message)
    if (message.offer && !isSender) {
        console.debug('pair recv', message);
        socket.removeListener('pair', setupRecieve);
        peerConnection.setRemoteDescription(new RTCSessionDescription(message.offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socket.emit('pair', { 'answer': answer });
    }
}

peerConnection.addEventListener('icecandidate', event => {
    console.debug('emit ice', event);
    if (event.candidate) {
        socket.emit('pair', { 'iceCandidate': event.candidate });
    }
});

// Listen for remote ICE candidates and add them to the local RTCPeerConnection
socket.on('pair', async message => {
    if (message.iceCandidate) {
        console.log('pair ice', message);
        try {
            await peerConnection.addIceCandidate(message.iceCandidate);
        } catch (e) {
            console.error('Error adding received ice candidate', e);
        }
    }
});

// Listen for connectionstatechange on the local RTCPeerConnection
peerConnection.addEventListener('connectionstatechange', event => {
    console.log(event);
    if (peerConnection.connectionState === 'connected') {
        // Peers connected!
        console.log(peerConnection);
    }
});
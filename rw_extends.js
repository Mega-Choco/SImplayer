window.RealWorld = {
    _onCameraFrameCallback: null,
    invoke(name, ...params) {
        let callName = name;
        if (window.webkit && window.webkit.messageHandlers) {
            if (params.length === 0) {
                window.webkit.messageHandlers[callName].postMessage('');
            } else {
                window.webkit.messageHandlers[callName].postMessage(...params);
            }
        } else if (window.Android) {
            if (params.length === 0) {
                window.Android[callName]();
            } else {
                window.Android[callName](...params);
            }
        }
    },
    beginCameraFrameStream(camera, callback) {
        window.RealWorld._onCameraFrameCallback = callback;
        window.RealWorld.invoke('beginCameraFrameStream', camera);
    },
    closePage() {
        window.RealWorld.invoke('closePage');
    },
    submitAction(input) {
        window.RealWorld.invoke('submitAction', input);
    }
}
function onCameraFrameReceive(frame) {
    if (window.RealWorld._onCameraFrameCallback) {
        window.RealWorld._onCameraFrameCallback(frame);
    }
}
/// Library End ///
function closePage() {
    window.RealWorld.closePage();
}



function RegistThisLib(){
    CommandList.set('rw_close', realworld_close);
    CommandList.set('rw_submit',realworld_submitAction);
}



//command
function realworld_close(){
    window.RealWorld.closePage();
}

function realworld_submitAction(_input){
    window.RealWorld.submitAction(_input);
}

RegistThisLib();
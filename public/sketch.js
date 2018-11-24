let myStream
let gcapture
let peer;
let gnumber

let constraints = {
  audio: true,
  video: true
}

let socket = io()
let fullscreen = false;
let currentCall;


function initialize() {

  //screenshare
  // navigator.getDisplayMedia({
  //   video: true
  // }).then(stream => {
  //   console.log("here", stream);
  //   var capturevideo = document.getElementById("screencap");
  //   console.log(capturevideo);
  //   capturevideo.srcObject = stream;
  //   capturevideo.onloadedmetadata = function() {
  //     capturevideo.play();
  //   }
  //
  // }, error => {
  //   console.log('unable to acquire screen' + errer)
  // })


  //sockets
  socket.on('connect', () => {
    console.log("connected to server")
  })


  socket.on('disconnect', (data) => {
    console.log(data)
  })


  socket.on('onlineUsers', (users) => {
    console.log(users)

    let onlineIDs = users.map(id => id.user)
    console.log(onlineIDs)
    let list = document.querySelector(".onlinelist")

    list.innerHTML = "";
    onlineIDs.forEach(element => {
      var chatIcon = document.createElement('button');
      chatIcon.setAttribute("id", element)
      chatIcon.innerHTML = element
      list.appendChild(chatIcon)
      // let phoneNumber = chatIcon.innerHTML
      chatIcon.addEventListener('click', () => {
        let number = chatIcon.innerHTML
        gnumber = number;
        makeCall(number, myStream)
      })
    })
  })


  //promt user for video permission
  navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
      var videoElement = document.getElementById('thevideo');
      videoElement.srcObject = stream;

      //make stream global using myStream
      myStream = stream;

      videoElement.onloadedmetadata = function() {
        videoElement.play();

      }
    })
    .catch(function(err) {
      alert(err);
    })

  //Global container for id (id is like a phone number)
  var peerId;
  var name;


  //This is necessary (using peerserver.js) file in digitalocean server
  let createName = document.querySelector('#nameButton')
  createName.addEventListener('click', () => {
    name = document.querySelector('#yourName').value
    console.log(name)
    createName.style.display = 'none'


    peer = new Peer(name, {
      host: 'smj470.itp.io',
      port: 9000,
      path: '/'
    })

    peer.on('open', (name) => {
      console.log("my peer id is : " + name)
      socket.emit('users', name)
    })

    peer.on('error', (err) => {
      console.log(err)
    })


    peer.on('call', (incomingCall) => {
      console.log("Got a call");
      currentCall = incomingCall;


      let pickupButton = document.querySelector('#pickup')
      pickupButton.style.visibility = 'visible';
      pickupButton.addEventListener('click', () => {
        incomingCall.answer(myStream);
      })

      incomingCall.on('stream', function(remoteStream) {
        pickupButton.style.visibility = 'hidden';
        var thisVideoElement = document.getElementById('thevideo')
        thisVideoElement.classList.add('active')
        // thisVideoElement.style.height = '144px';
        // thisVideoElement.style.marginLeft = '287px';
        // thisVideoElement.style.marginTop = '318px';
        var otherVideoElement = document.getElementById('othervideo');
        otherVideoElement.style.visibility = 'visible';
        otherVideoElement.srcObject = remoteStream;
        otherVideoElement.onloadedmetadata = function() {
          otherVideoElement.play();
        }
        otherVideoElement.addEventListener('click', openfullscreen)
        var flipScreen = document.getElementById('flipvideo')
        flipScreen.addEventListener('click', flip.bind(this, currentCall.peer))
      });
    });
    let endChat = document.querySelector("#endchat")
    endChat.addEventListener('click', hangup);
  })

}



function makeCall(number, typeofstream) {
  console.log("clicked")
  alert("You are about to call: " + number)
  var call = peer.call(number, typeofstream);
  currentCall = call;
  call.on('stream', function(remoteStream) {
    var otherVideoElement = document.getElementById('othervideo');
    otherVideoElement.style.visibility = 'visible';
    otherVideoElement.srcObject = remoteStream;
    var thisVideoElement = document.getElementById('thevideo')
    thisVideoElement.classList.add('active')
    // thisVideoElement.style.height = '144px';
    // thisVideoElement.style.marginLeft = '287px';
    // thisVideoElement.style.marginTop = '318px';
    otherVideoElement.onloadedmetadata = function() {
      otherVideoElement.play();
    }
    otherVideoElement.addEventListener('click', openfullscreen)
  });
  var flipScreen = document.getElementById('flipvideo')
  flipScreen.addEventListener('click', flip.bind(this, currentCall.peer))
}

function hangup() {
  currentCall.close();
  var otherVideoElement = document.getElementById('othervideo');
  otherVideoElement.style.visibility = "hidden";
  var thisVideoElement = document.getElementById('thevideo')
  thisVideoElement.classList.remove('active')
  // thisVideoElement.style.height = '432px';
  // thisVideoElement.style.marginLeft = '95px';
  // thisVideoElement.style.marginTop = '30px';
}

function openfullscreen() {
  var otherVideoElement = document.getElementById('videoCon')
  console.log("Click")
  if (screenfull.enabled) {
    screenfull.request(otherVideoElement);
  } else {
    console.log("DIDNTWORK")
  }
}

// can't get this to work under stream. Is new call necessary? if so
//  Attempt take the capture and make it global gcapture -> use make call function again
//change myStream to g capture
function flip(onGoingCall) {
  console.log("FLIP")
  navigator.getDisplayMedia({
    video: true
  }).then(capture => {
    var capturevideo = document.getElementById("screencap");
    capturevideo.srcObject = capture;
    console.log("here", capture);
    capturevideo.onloadedmetadata = function() {
      capturevideo.play();
    }
    console.log("MAKING CALL")
    makeCall(onGoingCall, capture)
  }, error => {
    console.log('unable to acquire screen' + errer)
  })
}

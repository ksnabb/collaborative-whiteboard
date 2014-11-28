(function() {
  var canvas = document.querySelector("canvas"),
    context = canvas.getContext("2d"),
    socketConnection = new WebSocket("ws://" + document.location.host + "/api"),
    coords,
    pressed = false,
    innerWidth = window.innerWidth,
    innerHeight = window.innerHeight,
    canvasX, canvasY,
    currentPath = [],
    peerPathsToBeDrawn = [],
    clientXY,
    isTouchDevice = 'ontouchstart' in document.documentElement,
    clientId = Date.now(); // client id as the current time, good enough for this scenario;
    
  window.onresize = function(evt) {
    innerWidth = window.innerWidth;
    innerHeight = window.innerHeight;
  };

  // translate between client and canvas coordinates
  var clientToCanvas = function(clientX, clientY) {
    canvasX = (canvas.width / innerWidth) * clientX;
    canvasY = (canvas.height / innerHeight) * clientY;
    return [Math.round(canvasX), Math.round(canvasY)];
  };
  // get the clientX and clientY from either mouse event or touch event
  var getClientXY = function(evt) {
    if (evt.type === "touchmove" || evt.type === "touchstart") {
      clientX = evt.targetTouches[0].clientX;
      clientY = evt.targetTouches[0].clientY;
    } else {
      clientX = evt.clientX;
      clientY = evt.clientY;
    }
    return [clientX, clientY];
  };
  var start = function(evt) {
    pressed = true;
    clientXY = getClientXY(evt);
    coords = clientToCanvas(clientXY[0], clientXY[1]);
    context.moveTo(coords[0], coords[1]);
    currentPath.push(coords);
  };
  var drag = function(evt) {
    if (pressed) {
      clientXY = getClientXY(evt);
      coords = clientToCanvas(clientXY[0], clientXY[1]);
      context.lineTo(coords[0], coords[1]);
      context.stroke();
      currentPath.push(coords);
    }
  };
  // draw paths received from peers
  var drawPeerPaths = function() {
    var i, j, path;
    if (!pressed) {
      for (i = 0; i < peerPathsToBeDrawn.length; i++) {
        path = peerPathsToBeDrawn[i].path;

        for (j = 0; j < path.length; j++) {
          if (j === 0) {
            context.moveTo(path[j][0], path[j][1]);
          } else if (j === path.length - 1) {
            context.stroke();
          } else {
            context.lineTo(path[j][0], path[j][1]);
          }
        }
      }
      peerPathsToBeDrawn = [];
    }
  };
  var stop = function(evt) {
    pressed = false;

    // send path to peers
    socketConnection.send(JSON.stringify({
      "path": currentPath,
      "id": clientId
    }));
    currentPath = [];

    drawPeerPaths();
  };
  
  if (isTouchDevice) {
    canvas.addEventListener("touchstart", start);
    canvas.addEventListener("touchend", stop);
    canvas.addEventListener("touchcancel", stop);
    canvas.addEventListener("touchleave", stop);
    canvas.addEventListener("touchmove", drag);
  } else {
    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mousemove", drag);
    canvas.addEventListener("mouseup", stop);
    canvas.addEventListener("mouseleave", function() {
      if (pressed) {
        stop();
      }
    });
  }
  
  socketConnection.onmessage = function(event) {
    var i, data = JSON.parse(event.data);
    if (data.id !== clientId) {
      peerPathsToBeDrawn.push(data);
      drawPeerPaths();
    }
  };
})();

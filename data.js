function get (id) {
  return document.getElementById(id);
}

Pencil = {version: "2018.09.19a", lineWidthMulti: 8 };

Pencil.init = function ()
{
  // disable android back button
  window.history.pushState({}, '');
  window.addEventListener('popstate', function() { window.history.pushState({}, '')})

  get("version").innerHTML = "version "+Pencil.version; // updates the Pencil version UI.
  console.log(get("version").innerHTML);
  Pencil.lineWidth = 0;
  Pencil.isMousedown = false; // ??
  Pencil.lines = [];
  Pencil.points = [];

  // var canvas = get('canvas'); // note uneccessary duplication of canvas.
  Pencil.initCanvas();
  canvas.addEventListener('touchstart', Pencil.drawBegin);
  canvas.addEventListener('mousedown', Pencil.drawBegin);
  canvas.addEventListener('touchmove', Pencil.drawMove);
  canvas.addEventListener('mousemove', Pencil.drawMove);
  canvas.addEventListener('touchend', Pencil.drawEnd);
  canvas.addEventListener('touchleave', Pencil.drawEnd);
  canvas.addEventListener('mouseup', Pencil.drawEnd);
  Pencil.sendData(); // ??
}

Pencil.initCanvas = function ()
{
  var canvas = get('canvas');
  Pencil.context = canvas.getContext('2d');
  canvas.width = canvas.parentElement.offsetWidth * 0.99;
  canvas.height = canvas.parentElement.offsetHeight * 0.95;
  Pencil.context.strokeStyle = 'black';
  Pencil.context.lineCap = 'round';
  Pencil.context.lineJoin = 'round';
  Pencil.coords = Pencil.getXY(get('canvas'));
}


Pencil.getPressure = function (ev) { return ((ev.touches && ev.touches[0] && typeof ev.touches[0]["force"]!=="undefined") ? ev.touches[0]["force"] : 1.0); }
Pencil.debugPressure = function (poo) {
return (ev.touches);
}
Pencil.getX = function (ev) { return ((ev.touches && ev.touches[0]) ? ev.touches[0].pageX : ev.pageX) - Pencil.coords.x; }
Pencil.getY = function (ev) { return ((ev.touches && ev.touches[0]) ? ev.touches[0].pageY : ev.pageY) - Pencil.coords.y; }

Pencil.drawBegin = function (ev)
{
  //var pressure = Pencil.getPressure(ev); //- duplicate?
  var x = Pencil.getX(ev);
  var y = Pencil.getY(ev);
  Pencil.isMousedown = true
  Pencil.context.lineWidth = Pencil.lineWidth;
  Pencil.context.beginPath();
  Pencil.context.moveTo(x, y);
  Pencil.points.push({ time:new Date().getTime(), x:x, y:y, lineWidth:Pencil.lineWidth, pressure:pressure });
}

Pencil.drawMove = function (ev)
{
  ev.preventDefault();
  if (!Pencil.isMousedown) return;
  var pressure = Pencil.getPressure(ev);
  var x = Pencil.getX(ev);
  var y = Pencil.getY(ev);
  Pencil.lineWidth = (Math.log(pressure + 1) * Pencil.lineWidthMulti + Pencil.lineWidth * 0.6);
  Pencil.points.push({ time:new Date().getTime(), x:x, y:y, lineWidth:Pencil.lineWidth, pressure:pressure });
  if (Pencil.points.length >= 3)
  {
    var a = Pencil.points[Pencil.points.length-2];
    var b = Pencil.points[Pencil.points.length-1];
    var xc = (a.x + b.x) / 2;
    var yc = (a.y + b.y) / 2;
    Pencil.context.lineWidth = b.lineWidth;
    Pencil.context.quadraticCurveTo(a.x, a.y, xc, yc);
    Pencil.context.stroke();
    Pencil.context.beginPath();
    Pencil.context.moveTo(xc, yc);
  }
  //get('log').innerHTML = "pression = " + pressure;
  }

Pencil.drawEnd = function (ev)
{
  var pressure = Pencil.getPressure(ev);
  var x = Pencil.getX(ev);
  var y = Pencil.getY(ev);
  Pencil.isMousedown = false
  if (Pencil.points.length > 0)
  {
    var p = Pencil.points[Pencil.points.length-1];
    Pencil.context.quadraticCurveTo(p.x, p.y, x, y);
    Pencil.context.stroke();
  }
  Pencil.lines.push(Pencil.points.slice(0));
  var averagePressure = 0;
  var nbPoints = 0;
  for(var i=0; i<Pencil.lines.length; i++)
  {
    for(var j=0; j<Pencil.lines[i].length; j++)
    {
      averagePressure += Pencil.lines[i][j].pressure;
      nbPoints++;
    }
  }
  averagePressure /= nbPoints;
  Pencil.points = [];
  Pencil.lineWidth = 0;
  }

// I assume the below is doing basic math to work out the correct pencil movements
// but in relation to what?? just the tabled area?

Pencil.getXY = function (obj)
{
  var x = 0, y = 0;
  if (obj.getBoundingClientRect)
  {
    var box = obj.getBoundingClientRect();
    var D = document.documentElement;
    x = box.left + Math.max(D.scrollLeft, document.body.scrollLeft) - D.clientLeft;
    y = box.top + Math.max(D.scrollTop, document.body.scrollTop) - D.clientTop
  }
  else for (; obj != document.body; x += obj.offsetLeft, y += obj.offsetTop, obj = obj.offsetParent) {}
  return { x: x, y: y }
}


Pencil.clear = function (bypass)
{
  if(!bypass && !confirm("Effacer ?")) return;
  Pencil.initCanvas();
  Pencil.lines = [];
}


Pencil.cleanPatientName = function ()
{
  var name = get('patient').value;
  name = name.replace(/[^\w\d]/gi, '');
  get('patient').value = name;
}


Pencil.saveData = function ()
{
  var data = {
    'patient': get('patient').value,
    'date': (new Date()).getTime(),
    'size': { w:get('canvas').width, h:get('canvas').height },
    'lines': Pencil.lines
  }
  localStorage.setItem('Pencil_'+(new Date()).getTime()+"_"+get('patient').value,JSON.stringify(data));
  alert("Données enregistrée !");
  Pencil.sendData();
  Pencil.clear(true);
}


Pencil.countData = function ()
{
  var count = 0;
  var keys = Object.keys(localStorage);
  for(var i=0; i<keys.length; i++)
    if(keys[i].indexOf("Pencil_")==0)
      count ++;
  return count;
}


Pencil.sendData = function ()
{
  if(Pencil.countData()==0) return (get('log').innerHTML = ".");
  if(!navigator.onLine) return (get('log').innerHTML = "["+Pencil.countData()+"]");
  for(var k in Object.keys(localStorage))
  {
    var key = Object.keys(localStorage)[k];
    if(key.indexOf("Pencil_")==0)
    {
      var val = localStorage.getItem(key);
      console.log("sending "+key);
      ajax("savedata.php", { name: key, data: val }, function(response, status)
      {
        console.log('response : '+response);
        if(status!=200 || response.substr(0,2)!="OK")
          return (get('log').innerHTML = (status==0 ? "!" : ("erreur : "+response+" ("+status+")")) + " ["+Pencil.countData()+"]");
        localStorage.removeItem(key);
        Pencil.sendData();
      });
      return;
    }
  }
}

function ajax (url, args, callback)
{
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () { if(xhr.readyState==4 && callback) callback(xhr.responseText, xhr.status); };
  xhr.open("POST",url,true);
  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  var argsTab = [];
  if(args) for(var a in args) argsTab.push(a+"="+encodeURIComponent(args[a]));
  xhr.send(argsTab.join('&'));
}

// for debugging
Pencil.logData = function ()
{
  var txt = "";
  for(var j=0; j<Pencil.lines.length; j++)
  {
    for(var k=0; k<Pencil.lines[j].length; k++)
    {
      var p = Pencil.lines[j][k];
      txt += p.time+";"+p.x+";"+p.y+";"+p.pressure+"\n";
    }
    txt += "\n";
  }
  console.log(txt);
}

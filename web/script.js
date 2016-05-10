var files = [];

function basename(url) {
  return ((url = /(([^\/\\\.#\? ]+)(\.\w+)*)([?#].+)?$/.exec(url)) != null) ? url[2] : '';
}

function redraw() {
  var html = "";

  for(let file of files) {
    html = html + file.filename + "<br>";
  }

  document.getElementById('filelist').innerHTML = html;
}

function reset() {
  files = [];
  document.getElementById('filelist').innerHTML = "";
  document.getElementById('result').innerHTML = "";
}

function setupReader(file) {
  var name = file.name;
  var reader = new FileReader();
  reader.onload = function(e) {
    files.push({filename: name, contents: reader.result});
    redraw();
  };
  reader.readAsText(file);
}

function handleFileSelect(event) {
  event.stopPropagation();
  event.preventDefault();

  var files = event.dataTransfer.files;

  reset();

  for (var i = 0; i < files.length; i++) {
    setupReader(files[i]);
  }
}

function handleDragOver(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

function setup_listeners() {
  var dropZone = document.getElementById('drop_zone');
  dropZone.addEventListener('dragover', handleDragOver, false);
  dropZone.addEventListener('drop', handleFileSelect, false);
}
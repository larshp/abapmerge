import File from "./file";
import FileList from "./file_list";
import Merge from "./merge";

let files: FileList;

function fname(s: string): string {
    return s.split(".")[0];
}

export function onClick(e) {
  let merged = "";

  try {
    merged = Merge.merge(files, e.srcElement.text);
  } catch (err) {
    alert(err);
    return;
  }

  document.getElementById("filelist").innerHTML =
    "<pre>" +
    merged +
    "</pre>";
}

function redraw() {
  let html = "Select main file:<br>";

  for (let i = 0; i < files.length(); i++) {
    html = html +
      "<a id='myLink" + i + "' title='Set as main' href='#' value=''>" +
      files.get(i).getName() +
      "</a><br>";
  }

  document.getElementById("filelist").innerHTML = html;

  for (let i = 0; i < files.length(); i++) {
    document.getElementById("myLink" + i).onclick = onClick;
  }
}

function reset() {
  files = new FileList();
  document.getElementById("filelist").innerHTML = "";
}

function setupReader(file) {
  let name = file.name;
  let reader = new FileReader();

  reader.onload = function() {
    files.push(new File(fname(name), reader.result));
    redraw();
  };

  reader.readAsText(file);
}

function handleFileSelect(event) {
  event.stopPropagation();
  event.preventDefault();

  let input = event.dataTransfer.files;

  reset();

  for (let i = 0; i < input.length; i++) {
    setupReader(input[i]);
  }
}

function handleDragOver(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  evt.dataTransfer.dropEffect = "copy"; // explicitly show this is a copy.
}

function setup_listeners() {
  let dropZone = document.getElementById("drop_zone");
  dropZone.addEventListener("dragover", handleDragOver, false);
  dropZone.addEventListener("drop", handleFileSelect, false);
}

document.body.onload = setup_listeners;

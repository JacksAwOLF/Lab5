// script.js


// used to load image from <input> and draw to canvas
const img = new Image(); 

// the canvas HTML object to draw everything in
const canvas = document.getElementById("user-image");
const context = canvas.getContext('2d');

// the buttons that we need 
const buttonGen = document.querySelector("button");
const buttonsBottom = document.querySelectorAll("#button-group button")
const buttonClear = buttonsBottom[0];
const buttonRead = buttonsBottom[1];

let textTopEle = document.getElementById("text-top");
let textBotEle = document.getElementById("text-bottom");


let slider = document.querySelector("#volume-group input");
let volumeImage = document.querySelector("#volume-group img"); 

// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {
  
  // fill the canvas with black background
  context.fillStyle = 'black';
  context.fillRect(0, 0, canvas.width, canvas.height);

  // draw the new image
  let imgDims = getDimmensions(
    canvas.width, canvas.height, 
    img.width, img.height
  );

  context.drawImage(img, 
    imgDims['startX'], imgDims['startY'], 
    imgDims['width'], imgDims['height']
  );


  // Some helpful tips:
  // - Fill the whole Canvas with black first to add borders on non-square images, then draw on top
  // - Clear the form when a new image is selected
  // - If you draw the image to canvas here, it will update as soon as a new image is selected
});


// this even triggers whenever the image-file-input selects a new image
let imageInput = document.getElementById("image-input");
imageInput.addEventListener("change", (event) => {

  let file = imageInput.files[0];

  // create a FileReader to read the data from user's computer
  let reader = new FileReader();

  // onload, sets the source of the image object we created above
  reader.onload = function(e){
    img.src = e.target.result;
    img.alt = file['name'];
  }

  // load the file that was selected by this input
  reader.readAsDataURL(file);
});


document.getElementById("generate-meme").onsubmit = function(){

  // get the text (string) that the user input
  let textTop = textTopEle.value;
  let textBot = textBotEle.value;
  if (textTop + textBot == "") 
    return false;

  // draw text on the context of the canvas
  let txtMarginTop = 30;  // how much from the top is the top text
  let txtMarginBot = 11;  // how much from the bottom is the lower text
  // align in center, and make the text big
  context.textAlign = 'center';
  context.font = '2em sans-serif';
  // white insides
  context.fillStyle = 'white';
  context.fillText(textTop, canvas.width/2, txtMarginTop);
  context.fillText(textBot, canvas.width/2, canvas.height - txtMarginBot);
  // blackoutline
  context.strokeStyle = 'black';
  context.strokeText(textTop, canvas.width/2, txtMarginTop);
  context.strokeText(textBot, canvas.width/2, canvas.height - txtMarginBot);

  toggleButtons();

  // so the page doesn't reload
  return false;
};


// toggle the state of all three buttons at the bottom
function toggleButtons(){
  buttonGen.disabled = !buttonGen.disabled;
  buttonClear.disabled = !buttonClear.disabled;
  buttonRead.disabled = !buttonRead.disabled;
}

// clear everything on the canvas
buttonClear.onclick = function(){
  context.clearRect(0, 0, canvas.width, canvas.height);
  toggleButtons();
  textTopEle.value = "";
  textBotEle.value = "";
  imageInput.value = null;
}

// common variables for speech
let synth = window.speechSynthesis;
let voiceSelect = document.getElementById("voice-selection");
let voices;

// load up all the speech options on this browser  
function populateVoice(){

  voices = synth.getVoices();

  // remove the option that says no voice selected...
  voiceSelect.children[0].remove();
  // also make sure it's not disabled
  voiceSelect.disabled = false;

  // loop and add optionss
  for (let i=0; i<voices.length; i++){    
    let option  = document.createElement('option');
    option.textContent = voices[i].name + ' (' + voices[i].lang + ')';
    if(voices[i].default) 
      option.textContent += ' -- DEFAULT';
    option.setAttribute('data-name', voices[i].name);
    voiceSelect.appendChild(option);
  }

}

// apparantly we need to give to browser some time to load all the options first
setTimeout(populateVoice, 100);



buttonRead.onclick = function(){

  // get the text in the box
  let textTop = textTopEle.value;
  let textBot = textBotEle.value;
  if (textTop + textBot == "") 
    return false;

  // make utterance  
  let utterance = new SpeechSynthesisUtterance(textTop + "\n" + textBot);

  // find the correct utterance...
  for (let i=0; i<voices.length; i++)
    if (voices[i].name == voiceSelect.selectedOptions[0].getAttribute('data-name'))
      utterance.voice = voices[i];
  
  utterance.volume = (slider.value)/100;
  window.speechSynthesis.speak(utterance);
}



// change the image of the volume icon when the slider changed values
slider.onchange = function(){

  let imgUrl = "icons/";
  if (slider.value == 0){
    imgUrl += "volume-level-0.svg";
  } else if (slider.value <= 33){
    imgUrl += "volume-level-1.svg";
  } else if (slider.value <= 66){
    imgUrl += "volume-level-2.svg";
  } else {
    imgUrl += "volume-level-3.svg";
  }

  // that's weird why didn't the deployment update
  volumeImage.src = imgUrl;
}




/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimmensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}

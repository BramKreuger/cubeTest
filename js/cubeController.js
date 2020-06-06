var currentFace = 0;
var currentQuestion = 0;
var nrOfQuestions = 0;
var questionsInstance; // Saves all the questions and answers in a class instance
var rotating = false;
var selectedAnswers; // Saves all the selected answers in an array of integers
var rotTop = "up";
var rotBottom = "up";
// 1 IS RIGHT, -1 IS LEFT

// This changes everything
"use strict";

document.onload = setTimeout(function(){loadPage(0)}, 100);

// This function checks the parameters passed to the URL and loads the corresponding xml :)
function loadPage(){
    var params;
    if(location.href.split('?')[1] != undefined)
    {
        params = location.href.split('?')[1].split('&');
        data = {};
        for (x in params)
        {
            data[params[x].split('=')[0]] = params[x].split('=')[1];

        }
    }
    else{
        alert("Could not find \"?kubus=\" in url. Please add \"?kubus=<integer>\" to the url");
    }

    if(data.kubus != undefined){

        var id = TryParseInt(data.kubus, null);

        if(Number.isInteger(id)){
            console.log("Yes the parameter passed to \'kubus\' is an integer, with value: " + id);
            LoadXMLDoc(id);
        }
        else{
            alert("Parameter passed to \"?kubus=\" is incorrect. Please make sure the URL looks like this:       \"https://bramkreuger.com/cube?kubus=0\"");
        }
    }
    else{
        alert("Could not find \"?kubus=\" in url. Please add \"?kubus=<integer>\" to the url");
    }
}

function TryParseInt(str,defaultValue) {
     var retValue = defaultValue;
     if(str !== null) {
         if(str.length > 0) {
             if (!isNaN(str)) {
                 retValue = parseInt(str);
             }
         }
     }
     return retValue;
}

function TurnLeft() {
    if (rotating == false && currentQuestion > 0) {
        Rotate(-1);
    }
} // <-- Nodig

function Rotate(right) {
    SaveAnswer(); //Save answer by putting current bool in array

    currentQuestion += right;
    ChangeQuestions(right); // Replace the questions on the next / previous face

    rotating = true;
    setTimeout(FinishRotating, 2000); // Disable rotating for two seconds
    var cubeStyle = document.getElementById("cube").style;

    // Turn right
    if (right == 1) {
        switch (currentFace) {
            case 0:
                cubeStyle.animationName = "rotate-1-right";
                break;
            case 1:
                cubeStyle.animationName = "rotate-2-right";
                break;
            case 2:
                cubeStyle.animationName = "rotate-3-right";
                break;
            case 3:
                cubeStyle.animationName = "rotate-4-right";
                break;
        }
    }
    // Turn left
    else if (right == -1) {
        switch (currentFace) {
            case 0:
                cubeStyle.animationName = "rotate-1-left";
                break;
            case 1:
                cubeStyle.animationName = "rotate-2-left";
                break;
            case 2:
                cubeStyle.animationName = "rotate-3-left";
                break;
            case 3:
                cubeStyle.animationName = "rotate-4-left";
                break;
        }
    }

    currentFace += right;

    // Overflow currentFace
    if (currentFace > 3) {
        currentFace = 0;
    }
    if (currentFace < 0) {
        currentFace = 3;
    }
    var topFace    = document.getElementById("top_face").firstElementChild;
    var bottomFace = document.getElementById("bottom_face").firstElementChild;

    var rotation = currentFace * 90;
    topFace.style.transform    = "rotate(-" + rotation + "deg)";
    bottomFace.style.transform = "rotate(" + rotation + "deg)";
}

// Reset rotation bool
function FinishRotating() {
    rotating = false;
}

function Exit() {
    var someIframe = window.parent.document.getElementById('iframe_callback');
    someIframe.parentNode.removeChild(window.parent.document.getElementById('iframe_callback'));
}

function SaveAnswer() {
    var form = document.getElementsByClassName("cubeForm")[currentFace]; // Get the form of the current face
    var inputs = form.elements;
    var radios = [];

    //Loop and find only the Radios
    for (var i = 0; i < inputs.length; ++i) {
        if (inputs[i].type == 'radio' || inputs[i].type == 'checkbox') {
            radios.push(inputs[i]);
        }
    }

    var bools = new Array(questionsInstance[currentFace].antwoorden.length);
    for (var i = 0; i < radios.length; i++) {
        bools[i] = radios[i].checked;
    }
    selectedAnswers[currentQuestion] = new SelectedAnswers(bools);
}

// Manipulate the DOM to add the answers.
function AddQuestion(questionNr, answerNr, text, multipleChoice) {
    var allCubeForms = document.getElementsByClassName("cubeForm");
    var submit = document.getElementsByClassName("check");

    var p = document.createElement("P"); // This is the container of all the elements
    var cont = document.createElement("DIV"); // Container of the custom radio button
    var check = document.createElement("SPAN");
    var radio = document.createElement("INPUT");

    p.setAttribute("class", "question");
    cont.setAttribute("class", "customRadio");
    check.setAttribute("class", "checkmark");

    if(multipleChoice == false)
        radio.setAttribute("type", "radio");
    else
        radio.setAttribute("type", "checkbox");

    var name = "vraag_";
    name += questionNr;
    radio.setAttribute("name", name);
    var val = name;
    val += "_";
    val += answerNr;
    radio.value = val;

    if (answerNr == 0) radio.checked = true;
    if (selectedAnswers != undefined) { // If the array exists
        if (selectedAnswers[currentQuestion] != undefined) { // If the current question has been loaded before
            radio.checked = selectedAnswers[currentQuestion].correct[answerNr];
        }
    }
    cont.appendChild(radio);

    var label = document.createElement("LABEL");
    label.setAttribute("for", val);
    label.innerHTML = text;

    // Append all
    cont.appendChild(check);
    p.appendChild(cont);
    p.appendChild(label)
    submit[questionNr].before(p); // Put the questions before the submit button in the DOM
}

// Load XML from URL
function LoadXMLDoc(id) {
    var xmlhttp;
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        // code for older browsers
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log("The XML was loaded");
            ParseXML(this.responseXML)
        }
        else if(this.readyState == 4 && this.status == ""){;
            alert("The integer you passed as parameter is not valid. You passed: " + id);
        }
    };
    var url = "https://bramkreuger.com/cube/vragen/kubus_" + id + ".xml"
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

class Vraag {
    constructor(_vraag, _image, _antwoorden) {
        this.vraag = _vraag;
        this.image = _image;
        this.antwoorden = _antwoorden;
    }
}

class Antwoord {
    constructor(_antwoord, _correct) {
        this.antwoord = _antwoord;
        this.correct = _correct;
    }
}

class SelectedAnswers{
    constructor(_correct){
        this.correct = _correct;
    }
}

// Stick the XML data in more managable classes
function ParseXML(xml) {
    var questions = xml.getElementsByTagName("vraag_en_antwoord");
    var images    = xml.getElementsByTagName("image");
    nrOfQuestions = questions.length - 1;
    var vragen = new Array(questions.length);

    for (var i = 0; i < questions.length; i++) {

        var antwoordenXML = questions[i].getElementsByTagName("antwoord");
        var antwoorden = new Array(antwoordenXML.length);

        for (var j = 0; j < antwoordenXML.length; j++) {

            var text = antwoordenXML[j].childNodes[1].textContent;
            var correct = (antwoordenXML[j].childNodes[3].textContent == 'true');
            antwoorden[j] = new Antwoord(text, correct);

        }

        var image = new Image(); // Make sure to preload the images.
        image.src = "https://bramkreuger.com/cube/images/" + images[i].textContent + ".jpg";
        vragen[i] = new Vraag(questions[i].getAttribute("vraag"), image, antwoorden)
    }
    questionsInstance = vragen;
    ChangeQuestions(0)

    selectedAnswers = new Array(questions.length);
}

function RemoveQuestions(newFace) {
    var forms = document.getElementsByClassName("cubeForm");
    while (forms[newFace].firstChild && forms[newFace].firstChild.tagName != "INPUT") {
        forms[newFace].removeChild(forms[newFace].firstChild);
    }
}

// Bulk add all the questions
function ChangeQuestions(right) {
    // Overflow currentface
    var newFace = currentFace + right;
    if (newFace > 3) {
        newFace = 0;
    }
    if (newFace < 0) {
        newFace = 3;
    }

    ChangeCounter(newFace);
    ChangePaginator(newFace, right);
    RemoveQuestions(newFace);

    var titles = document.getElementsByClassName("vraag");
    var forms  = document.getElementsByClassName("cubeForm");
    var images = document.getElementsByClassName("art");

    titles[newFace].innerHTML = questionsInstance[currentQuestion].vraag;
    images[newFace].src       = questionsInstance[currentQuestion].image.src;

    var correctCounter = 0;
    var multipleChoice = false;
    for(var i=0; i < questionsInstance[currentQuestion].antwoorden.length; i++){
        if(questionsInstance[currentQuestion].antwoorden[i].correct == true){
            correctCounter++;
        }
    }
    if(correctCounter > 1){
        multipleChoice = true;
    }

    for (var j = 0; j < questionsInstance[currentQuestion].antwoorden.length; j++) {
        AddQuestion(newFace, j, questionsInstance[currentQuestion].antwoorden[j].antwoord, multipleChoice);
    }
}

function CheckCorrect(groupNumber) {
    if (rotating == false) {
        var groupName = "vraag_" + groupNumber;
        var radios = document.getElementsByName(groupName);
        var wrong = false;
        for (i = 0; i < radios.length; i++) {
            if(radios[i].checked != questionsInstance[groupNumber].antwoorden[i].correct)
                wrong = true;

            // Answer is correct, move on
            if (i == radios.length - 1 && wrong == false) {
                if(currentQuestion < nrOfQuestions)
                {
                    Rotate(1);
                    playAudio("audioRight");
                    faceGlow(groupNumber, true);
                    return;
                }
                else
                {
                    document.getElementById("confetti-container").style.display = "block";
                    moveToFace(0);
                    playAudio("audioFinished");
                    faceGlow(groupNumber, true);
                    return;
                }
            }
        }
        playAudio("audioWrong");
        faceGlow(groupNumber, false);
        return;
    }
}

function playAudio(id) {
    var audio = document.getElementById(id);
    if(id = "audioFinished")
        audio.volume = 0.5;
    if (audio.paused) {
        audio.play();
    } else {
        audio.currentTime = 0
    }
}

function faceGlow(faceNumber, correct) {
    var face = document.getElementsByClassName("face-glow")[faceNumber];
    face.style.animation = "none";
    face.offsetWidth;
    face.style.animation = null;

    if (correct) face.style.animationName = "glow-green";
    else face.style.animationName = "glow-red";
}

function ChangeCounter(question) {
    var currentCounter = document.getElementsByClassName("counter")[question];
    currentCounter.innerHTML = (currentQuestion + 1) + " / " + (nrOfQuestions + 1) + " van " + "35";
}

function ChangePaginator(question, right) {
    console.log(question + " : " + right);
    var pagers = document.getElementsByClassName("pagination");
    if (pagers[question].children.length == 0) { // If there are no "-"'s make new ones.
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < nrOfQuestions + 1; j++) {
                (function (j) {
                    var page = document.createElement("P");
                    page.addEventListener("click", function () { // Bind the onclick with param to the P
                        moveToFace(j);
                    });
                    page.innerHTML = " ";
                    pagers[i].appendChild(page);
                })(j);
            }
        }
    }
    if (right == 0) { // initial load
        for (var i = 0; i < 4; i++) {
            pagers[i].children[question].classList.add("active");
        }
    } else { // You turned left or right
        for (var i = 0; i < 4; i++) {
            var prev = right * -1;
            pagers[i].children[currentQuestion + prev].classList.remove("active");
            pagers[i].children[currentQuestion + prev].classList.add("finished");
            pagers[i].children[currentQuestion].classList.add("active");
        }
    }
}

function moveToFace(toFace) {
    if (rotating == false) {
        var pagers = document.getElementsByClassName("pagination");
        var newFace = pagers[currentFace].children[toFace];

        if (newFace.classList.contains("finished")) { // Of it's legal to turn
            var distance = toFace - currentQuestion;
            var right = 1; //go right
            if (distance < 0) { // If you are rotating left
                distance = distance * -1;
                right = -1;
            }
            for (var i = 0; i < distance; i++) { // Que the rotation functions
                setTimeout(function () {
                    Rotate(right);
                }, 2000 * i);
            }
        }
    }
}

function rotateTop(){
    var cube     = document.getElementById("cube");
    var animName = "rotate-top-" + (currentFace + 1) + "-" + rotTop;
    cube.style.animationName = animName;
    console.log(animName);
    if(rotTop == "up"){
        rotTop = "down";
    }
    else{
        rotTop = "up";
    }
}

function rotateBottom(){
    var cube     = document.getElementById("cube");
    var animName = "rotate-bottom-" + (currentFace + 1) + "-" + rotBottom;
    cube.style.animationName = animName;
    if(rotBottom == "up"){
        rotBottom = "down";
    }
    else{
        rotBottom = "up";
    }
}

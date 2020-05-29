var currentFace = 0;
var currentQuestion = 0;
var nrOfQuestions = 0;
var questionsInstance; // Saves all the questions and answers in a class instance
var rotating = false;
var selectedAnswers; // Saves all the selected answers in an array of integers
document.onload = LoadXMLDoc();
// 1 IS RIGHT, -1 IS LEFT

// This changes everything
"use strict";

function TurnLeft() {
    if (rotating == false && currentQuestion > 0) {
        Rotate(-1);
    }
}

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
}

// Reset rotation bool
function FinishRotating() {
    rotating = false;
}

function Exit() {
    console.log("Add exit logic here.");
}

function SaveAnswer() {
    var form = document.getElementsByClassName("cubeForm")[currentFace]; // Get the form of the current face
    var inputs = form.elements;
    var radios = [];

    //Loop and find only the Radios
    for (var i = 0; i < inputs.length; ++i) {
        if (inputs[i].type == 'radio') {
            radios.push(inputs[i]);
        }
    }

    //var found = 1;
    for (var i = 0; i < radios.length; i++) {
        if (radios[i].checked) {
            selectedAnswers[currentQuestion] = i;
        }
    }
}

// Manipulate the DOM to add the answers.
function AddQuestion(questionNr, answerNr, text) {
    var allCubeForms = document.getElementsByClassName("cubeForm");
    var submit = document.getElementsByClassName("check");

    var p = document.createElement("P"); // This is the container of all the elements
    var radio = document.createElement("INPUT");
    var cont = document.createElement("DIV"); // Container of the custom radio button
    var check = document.createElement("SPAN");

    p.setAttribute("class", "question");
    cont.setAttribute("class", "customRadio");
    check.setAttribute("class", "checkmark");

    radio.setAttribute("type", "radio");
    var name = "vraag_";
    name += questionNr;
    radio.setAttribute("name", name);
    var val = name;
    val += "_";
    val += answerNr;
    radio.value = val;

    if(selectedAnswers != undefined){ // If the array exists
        if(selectedAnswers[currentQuestion] != undefined){ // If the current question has been loaded before
            if(answerNr == selectedAnswers[currentQuestion]){ // If the current answer equals the selected answer
                radio.checked = true;
            }
        }
    }

    var label = document.createElement("LABEL");
    label.setAttribute("for", val);
    label.innerHTML = text;

    cont.appendChild(radio); // Append all
    cont.appendChild(check);
    p.appendChild(cont);
    p.appendChild(label)
    submit[questionNr].before(p); // Put the questions before the submit button in the DOM
}

// Load XML from URL
function LoadXMLDoc() {
    var xmlhttp;
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        // code for older browsers
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            ParseXML(this.responseXML)
        }
    };
    xmlhttp.open("GET", "https://bramkreuger.com/cube/vragen.xml", true);
    xmlhttp.send();
}

class Vraag {
    constructor(_vraag, _antwoorden) {
        this.vraag = _vraag;
        this.antwoorden = _antwoorden;
    }
}

class Antwoord {
    constructor(_antwoord, _correct) {
        this.antwoord = _antwoord;
        this.correct = _correct;
    }
}

// Stick the XML data in more managable classes
function ParseXML(xml) {
    var questions = xml.getElementsByTagName("vraag_en_antwoord");
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
        vragen[i] = new Vraag(questions[i].getAttribute("vraag"), antwoorden)
    }
    questionsInstance = vragen;
    ChangeQuestions(0)

    selectedAnswers = new Array(questions.length);

    // For Demo purposes:
    var loaded = document.createElement("P");
    loaded.innerHTML = "Loaded the questions from XML"
    loaded.style.color = "#f54242"
    document.getElementById("interface").appendChild(loaded);
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

    RemoveQuestions(newFace);

    var titles = document.getElementsByClassName("vraag");
    var forms = document.getElementsByClassName("cubeForm");

    titles[newFace].innerHTML = questionsInstance[currentQuestion].vraag;
    for (var j = 0; j < questionsInstance[currentQuestion].antwoorden.length; j++) {
        AddQuestion(newFace, j, questionsInstance[currentQuestion].antwoorden[j].antwoord);
    }
}

function CheckCorrect(groupNumber) {
    if (rotating == false && currentQuestion < nrOfQuestions) {
        var groupName = "vraag_" + groupNumber;
        var radios = document.getElementsByName(groupName);
        for (i = 0; i < radios.length; i++) {
            // Answer is correct, move on
            if (radios[i].checked && questionsInstance[groupNumber].antwoorden[i].correct == true) {
                Rotate(1);
                playAudio("audioRight");
                faceGlow(groupNumber, true);
                return;
            }
        }
        playAudio("audioWrong");
        faceGlow(groupNumber, false);
        return;
    }
}

function playAudio(id) {
    var audio = document.getElementById(id);
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

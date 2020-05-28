var currentFace = 0;
var numberOfQuestions = 0;
var currentMargin = 15;
var questionsInstance;

document.onload = LoadXMLDoc();
// 1 IS RIGHT, -1 IS LEFT

// This changes everything
"use strict";

function Rotate(right) {

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

    // Overflow currentface
    if (currentFace > 3) {
        currentFace = 0;
    }
    if (currentFace < 0) {
        currentFace = 3;
    }
}

function Exit(){
    console.log("Add exit logic here.");
}

// Manipulate the DOM to add the answers.
function AddQuestion(questionNr, answerNr, text) {
    var allCubeForms = document.getElementsByClassName("cubeForm");
    var submit = document.getElementsByClassName("check");

    var p     = document.createElement("P"); // This is the container of all the elements
    var radio = document.createElement("INPUT");
    var cont  = document.createElement("DIV"); // Container of the custom radio button
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

    var label = document.createElement("LABEL");
    label.setAttribute("for", val);
    label.innerHTML = text;

    cont.appendChild(radio);
    cont.appendChild(check);
    p.appendChild(cont);
    p.appendChild(label)
    submit[questionNr].before(p); // Put the questions before the submit button in the DOM

    var questions = document.querySelectorAll('#cube p')
    for (var j = 0; j < questions.length; j++) {
        questions[j].style.marginTop = currentMargin;
    }
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
    ChangeQuestions(vragen)
}

// Bulk add all the questions
function ChangeQuestions(vragen) {
    var titles = document.getElementsByClassName("vraag");
    var forms = document.getElementsByClassName("cubeForm");
    for (var i = 0; i < titles.length; i++) {
        titles[i].innerHTML = vragen[i].vraag;
        for (var j = 0; j < vragen[i].antwoorden.length; j++) {
            AddQuestion(i, j, vragen[i].antwoorden[j].antwoord);
        }
    }

    // For Demo purposes:
    var loaded = document.createElement("P");
    loaded.innerHTML = "Loaded the questions from XML"
    loaded.style.color = "#f54242"
    document.getElementById("interface").appendChild(loaded);

}

function CheckCorrect(groupNumber) {
    var groupName = "vraag_" + groupNumber;
    var radios = document.getElementsByName(groupName);
    for (i = 0; i < radios.length; i++) {
        if (radios[i].checked && questionsInstance[groupNumber].antwoorden[i].correct == true) {
            console.log("checked: " + i)
            Rotate(1)
            faceGlow(groupNumber, true);
            return;
        }
    }
    faceGlow(groupNumber, false);
    return;
}

function faceGlow(faceNumber, correct) {
    var face = document.getElementsByClassName("face-glow")[faceNumber];
    face.style.animation = "none";
    face.offsetWidth;
    face.style.animation = null;

    if (correct) face.style.animationName = "glow-green";
    else face.style.animationName = "glow-red";
}

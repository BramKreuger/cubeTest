var currentFace = 0;
var currentQuestion = 0;
var nrOfQuestions = 0;
var questionsInstance; // Saves all the questions and answers in a class instance
var rotating = false;
var selectedAnswers; // Saves all the selected answers in an array of integers
var rotTop = "up";
var rotBottom = "up";
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
    document.getElementById("cube-wrapper").style.display = "none";
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

    if (answerNr == 0) radio.checked = true;

    if (selectedAnswers != undefined) { // If the array exists
        if (selectedAnswers[currentQuestion] != undefined) { // If the current question has been loaded before
            if (answerNr == selectedAnswers[currentQuestion]) { // If the current answer equals the selected answer
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

function ChangeCounter(question) {
    var currentCounter = document.getElementsByClassName("counter")[question];
    currentCounter.innerHTML = (currentQuestion + 1) + " / " + (nrOfQuestions + 1) + " van " + "35";
}

function ChangePaginator(question, right) {
    var pagers = document.getElementsByClassName("pagination");
    if (pagers[question].children.length == 0) { // If there are no "-"'s make new ones.
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < nrOfQuestions + 1; j++) {
                (function (j) {
                    var page = document.createElement("P");
                    page.addEventListener("click", function () { // Bind the onclick with param to the P
                        moveToFace(j);
                    });
                    page.innerHTML = "-";
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

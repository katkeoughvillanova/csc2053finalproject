 
 function startTimer(duration, display) {

    var timer = duration, minutes, seconds;


    setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = minutes + ":" + seconds;

        if (minutes == 0 && seconds == 0){

            alert("Oh no! You're out of time!");
            window.location.replace('trivia.html');

        }

        if (--timer < 0) {
            timer = duration;
        }
    }, 1000);
}



 let numQuestions = 10; 
 let score = 0; 

 

 function getCategory() { 

    return fetch(`https://opentdb.com/api_category.php`).then(res => res.json());
 }

 function getQuestions(num, token, categoryId) {

    if (categoryId) {
        return fetch(`https://opentdb.com/api.php?amount=${num}&token=${token}&category=${categoryId}`).then(res => res.json());
    }
    else {
        return fetch(`https://opentdb.com/api.php?amount=${num}&token=${token}`).then(res => res.json());    
    }
}

function getToken() {

    return fetch(`https://opentdb.com/api_token.php?command=request`).then(res => res.json())
}

function resetToken(token) {

    return fetch(`https://opentdb.com/api_token.php?command=reset&token=${token}`).then(res => res.json())
}



function chooseCategory(categories) {

    const form = document.createElement("form");

    const inputDropDown = document.createElement("select");
    const inputSubmit = document.createElement("input");

    form.appendChild(inputDropDown);

    inputDropDown.type ="select";
    inputDropDown.id = "categories";


    categories.forEach((category) => {
        const option = document.createElement("option");
        option.innerHTML = category.name;
        option.value = category.id;
        inputDropDown.appendChild(option)
    })

    inputSubmit.type = "submit";
    inputSubmit.value = "Enter";

    
    form.appendChild(inputSubmit);

    return form;

}


let chosenCategory = ""; 
let questionContainer = document.getElementById("question"); 
  


function preStart(form) {

    const h2 = document.createElement('h2')
    h2.innerHTML = "Welcome! <br> <br> Choose a Category to Begin <br>"

    
    form.addEventListener('submit',(event) => {

        updateScore()

        chosenCategory = document.getElementById("categories").value;

        questionContainer.innerHTML = "";

        startPlay()
        
    });
    
    questionContainer.appendChild(h2);
    questionContainer.appendChild(form);
}



function checkQandA(questions, token) {
    
    
    if (questions.response_code === 4) {
        resetToken(token).then( () => {
            
            getQuestions(numQuestions,token,chosenCategory).then((resetQuestions) => {
                appendQuestion(resetQuestions.results,0)
                })
        })
    }
    else {
        
       appendQuestion(questions.results,0);
    }
}

function startPlay() {

    var twoMinutes = 60 * 2,
    display = document.querySelector('#time');
    startTimer(twoMinutes, display);

    const token = localStorage.getItem('token')
    
    if (!token){

        getToken().then((data) => {
            localStorage.setItem('token', data.token);
       
            getQuestions(numQuestions, data.token,chosenCategory).then((questions) => {
                
                checkQandA(questions,data.token)
        
            });
                
        }) 
    }
    else {
        getQuestions(numQuestions, token,chosenCategory).then((questions) => {
            
            checkQandA(questions,token)
    
        });
    }

}



function updateScore() {

    const currentScore = document.querySelector("h3#current-score")
    
    currentScore.innerHTML = `Current Score: ${score}`

}


function createQuestion(questions, counter) {

    const question = questions[counter]

    const div = document.createElement("div");
    div.id = "question-div"

    const questionNumber = document.createElement("h4")
    questionNumber.textContent = `${counter + 1} of ${questions.length}`

    

    const h2 = document.createElement("h2");
    h2.textContent = question.category

    const p = document.createElement("p")
    p.innerHTML = question.question

    const ul = document.createElement("ul")
    ul.id = "answer-list"


    const answers = [...question.incorrect_answers]
    const insertIndex = Math.floor(Math.random() * (answers.length + 1)) 
    answers.splice(insertIndex, 0, question.correct_answer);


    answers.forEach((answer) => {
        const li = document.createElement("li");
        li.innerHTML = answer;
        li.classList.add("hover");
        li.addEventListener('click',() => {
            checkAnswer(decode(answer),decode(question.correct_answer), li);
            nextQuestion(questions,counter);
        });
        
        ul.appendChild(li);
    })

    
    div.appendChild(h2);
    div.appendChild(p);
    div.appendChild(ul);
    div.appendChild(questionNumber)
    
    
    return div

}



function nextQuestion(questions,counter) {

    const questionDiv = document.getElementById("question-div");
    const answerList = document.getElementById("answer-list");


    const replaceAnswers = answerList.innerHTML
    answerList.innerHTML = replaceAnswers;

    
    const button = document.createElement("button");
    button.textContent = "Next Question"

    questionDiv.appendChild(button);

    button.addEventListener('click', () => {
        if(counter < questions.length - 1) {
            appendQuestion(questions,counter + 1)
        }
        else {
            appendPlayAgainDiv(playAgainDiv());
        }
    });
}


function appendQuestion(questions,counter) {
    questionContainer.innerHTML = "";
    const questionDiv = createQuestion(questions,counter)
    questionContainer.appendChild(questionDiv)

}


function decode(encodedHTML) {
    const temporaryTag = document.createElement('p');
    temporaryTag.innerHTML = encodedHTML;
    return temporaryTag.innerHTML;
}


function checkAnswer(answer,correctAnswer, answerLi) {

    const rightOrWrong = document.createElement("h3");
    const h4 = document.querySelector("h4")
    const questionDiv = document.getElementById("question-div")
    const listItems = [...document.getElementsByTagName('li')]
    

    listItems.forEach((li) => {

        li.classList.remove("hover")

        if(answer !== correctAnswer && li.innerHTML === correctAnswer ) {
            
            li.id = "correct-answer";
        }
    })

    if(answer === correctAnswer) {
        rightOrWrong.textContent = "Correct";
        rightOrWrong.id = "right";

        questionDiv.insertBefore(rightOrWrong,h4);
        
        score = score + 100;
        
        updateScore();
        answerLi.id = "correct-answer";
        
    }
    else {

        rightOrWrong.textContent = "Wrong";
        rightOrWrong.id = "wrong";
        questionDiv.insertBefore(rightOrWrong,h4);

        answerLi.id = "wrong-answer";

    }

}


function appendPlayAgainDiv(div) {

    questionContainer.appendChild(div)
}


function playAgainDiv() {
    
    questionContainer.innerHTML = "";

    const div = document.createElement("div");
    div.id = "play-again"

    const h2 = document.createElement("h2");
    h2.textContent = `Final Score: ${score}`;

    const h4 = document.createElement("h4");

    if (score == 1000) {

        h4.textContent = "Congrats! You got a perfect score!"

    }

    if (score >= 500) {

        h4.textContent = "Not Bad!"

    }

    if(score < 500) {

        h4.textContent = "Better Luck Next Time!"

    }

    const button = document.createElement("button");
    button.textContent = "Play Again?";
    button.addEventListener('click',restartPlay);

    div.appendChild(h2);
    div.appendChild(h4)
    div.appendChild(button);
    return div;
}


function restartPlay() {
    score = 0;
    updateScore()
    startPlay();
    startTimer(); 
}


getCategory().then((categories) => preStart(chooseCategory(categories.trivia_categories)))




const apiKey = "a1WVxQCaDjD1niOyPCYPqx0e9elLr3ML6Vo5dDm4sfbyfN6bHj";

const taglist = [
	"reddit",
	"astronaut",
	"stephen fry",
	"jennifer hale",
	"chilli",
	"batteries",
	"tesla",
	"patrick stewart",
	"laura bailey",
	"apex legends",
	"interior decorating"
]

let randomTag = ""
const answersToGenerate = 6;

function populatePhotos() {
	
	let mainContentArea = document.querySelector("#main-content");
	while (mainContentArea.hasChildNodes()) {
		mainContentArea.removeChild(mainContentArea.lastChild);
	}
	
	randomTag = taglist[ Math.floor(Math.random() * taglist.length ) ];
	console.log("Selected tag: " + randomTag);

	let apiOutput = "";
	fetch("https://api.tumblr.com/v2/tagged?tag=" + randomTag + "&type=photo&api_key=a1WVxQCaDjD1niOyPCYPqx0e9elLr3ML6Vo5dDm4sfbyfN6bHj")
		.then( function(response) {
			return response.json();
		} )
		.then( function(result) {
			let returnedPosts = result.response;
			console.log(returnedPosts);
	
			returnedPosts.forEach(element => {
				if (element.type == "photo") {
					let newImg = document.createElement('img');
					newImg.src = element.photos[0].alt_sizes[0].url;
					newImg.classList.add("img-fluid", "col", "mx-1", "my-1", "px-0", "py-0");
					let altSizeArray = element.photos[0].alt_sizes;
					newImg.height = altSizeArray[1].height;
					newImg.width =  altSizeArray[1].width;
					document.querySelector("#main-content").appendChild(newImg);
					newImg.onload = function(event) {
						imgMasonry.addItems(newImg);
						imgMasonry.layout();
					}
				}
			});
	
		} );

		let imgMasonry = new Masonry(mainContentArea, {
			itemSelector: "img",
			percentPosition: true,
			// fitWidth: true,
			columnWidth: 40
		})

}

function setAnswerBoxState( newState ) {
	let answerBox = document.querySelector("#answer-prompt-bg");
	if (newState == true) {
		answerBox.classList.add("d-flex");
		answerBox.classList.remove("d-none");
	} else {
		answerBox.classList.remove("d-flex");
		answerBox.classList.add("d-none");
	}
}

function initializeInputs() {
	let continueButton = document.querySelector("#continue-button");
	continueButton.onclick = function(event) {
		setAnswerBoxState(false);
		populatePhotos();
		generateAnswerButtons( answersToGenerate - 1 );
	}
}

function generateAnswerButtons( numExtraButtons ) {
	let remainingPossibleAnswers = [];
	taglist.forEach( element => {
		remainingPossibleAnswers.push(element);
	} )

	let possibleAnswers = [];
	remainingPossibleAnswers.splice( remainingPossibleAnswers.indexOf(randomTag), 1 );
	
	for ( let otherAnswerCount = 0; otherAnswerCount < numExtraButtons; otherAnswerCount++ ) {
		console.log(remainingPossibleAnswers);
		let randomAnswer = remainingPossibleAnswers[ Math.floor(Math.random() * remainingPossibleAnswers.length ) ];
		possibleAnswers.push(  randomAnswer );
		remainingPossibleAnswers.splice( remainingPossibleAnswers.indexOf(randomAnswer), 1 );
	}

	possibleAnswers.splice( Math.floor(Math.random() * possibleAnswers.length) , 0, randomTag);
	
	let buttonContainer = document.querySelector("#response-container");
	while (buttonContainer.hasChildNodes()) {
		buttonContainer.removeChild(buttonContainer.lastChild);
	}

	possibleAnswers.forEach(element => {
		let newButton = document.createElement("button");
		newButton.classList.add( "btn", "btn-lg", "mx-1", "my-1", "answer-button");
		newButton.textContent = element;
		buttonContainer.appendChild(newButton);
		newButton.onclick = function(event) {
			evaluateTextAnswer( element );
		}
	});

}

function evaluateTextAnswer( inputText ) {
	// let inputText = document.querySelector("#guess-text-input").value;

	if (inputText != "") {
		let answerText = document.querySelector("#answer-text");
		if (inputText === randomTag) {
			console.log("U WIN");
			answerText.textContent = "You guessed correctly!";
		} else {
			console.log("U GUESS WRONG LOL");
			answerText.textContent = "You guessed wrong. The tag was '" + randomTag + "'.";
		}
		setAnswerBoxState(true);
	}
}

initializeInputs();
populatePhotos();
generateAnswerButtons( answersToGenerate - 1 );
setAnswerBoxState(false);
let gameGridContainer;
let gameGridObjects = [];
let gameGrid = [];
let gameRows;

// Game Settings
const maxPlayers = 2
const lineLengthToWin = 3;
const aiPlayerIndexList = [ 1 ];		// Players with this index will be controlled by the AI.
const gridSize = 3;

const playerSymbols = [
	{
		playerIndex: 0,
		playerSymbol: "X"
	},
	{
		playerIndex: 1,
		playerSymbol: "O"
	},
	{
		playerIndex: 2,
		playerSymbol: "N"
	}
]

// State Management Variables
let aiEnabled = true;
let currentPlayer = 0;
let gameReceivesInput = true;
let gameIsRunning = true;

// Grid Object Classes
function gridSquare(xPosition, yPosition, owningPlayer, targetObject){
	this.worldObject = targetObject;
	this.xPos = xPosition;
	this.yPos = yPosition;
	this.owner = owningPlayer;
	this.isOwned = squareOwned;
	this.adjacentSquares = getAdjacentSquares;
}

function squareOwned() {
	let ownershipState = false;
	if ( this.owner >= 0) {
		ownershipState = true;
	} else {
		ownershipState = false;
	}
	return ownershipState;
}

function getAdjacentSquares() {
	let output = [];
	for (let x = -1; x < 2; x++) {
		for (let y = -1; y < 2; y++) {
			if (x == 0 && y == 0) {
			} else {
				let foundSquare = gameGrid.find( gridSquare => (gridSquare.xPos == (this.xPos + x) && gridSquare.yPos == (this.yPos + y) ) );
				if (foundSquare != undefined) {
					output.push( foundSquare );
				}
			}
		}
	}
	// console.log(output);
	return output;
}

// Utility Functions

function calculateNormalizedStraightLineVector( origin, destination ) {
	let xVector = Math.sign(destination.xPos - origin.xPos);
	let yVector = Math.sign(destination.yPos - origin.yPos);
	outputVector = {
		x: xVector,
		y: yVector
	}
	return outputVector;
}

function findGridSquaresInSite( gridContainer ) {
	for (let rowCount = 0; rowCount < gameGridContainer.children.length; rowCount++) {
		for (let colCount = 0; colCount < gameGridContainer.children[rowCount].children.length; colCount++) {
			let targetGridSquareObject = gameGridContainer.children[rowCount].children[colCount];
			gameGridObjects.push( targetGridSquareObject )
			let newGridSquare = new gridSquare(rowCount, colCount, -1, targetGridSquareObject);
			gameGrid.push(newGridSquare);
		}	
	}
}

function generateGridSquares( gridContainer, gridSize ) {
	while ( gridContainer.hasChildNodes() ) {
		gridContainer.removeChild( gridContainer.lastChild );
	}

	for (let rowCount = 0; rowCount < gridSize; rowCount++) {
		let row = document.createElement("row");
		row.classList.add("row");
		gridContainer.appendChild(row);
		for (let colCount = 0; colCount < gridSize; colCount++) {
			let targetGridSquareObject = document.createElement("col");
			row.appendChild(targetGridSquareObject);
			targetGridSquareObject.classList.add( "col"	);
			gameGridObjects.push( targetGridSquareObject )
			let newGridSquare = new gridSquare(rowCount, colCount, -1, targetGridSquareObject);
			gameGrid.push(newGridSquare);
		}	
	}
}

// Game State Management

function initializeGrid() {
	gameGridContainer = document.querySelector("#game-grid");
	console.log("gameGrid query found: " + gameGridContainer);
	
	// findGridSquaresInSite( gameGridContainer );
	generateGridSquares( gameGridContainer, gridSize );

	gameGrid.forEach(square => {
		console.log(square.xPos + ", " + square.yPos + ", Owned: " + square.isOwned() );
	})

	gameGridContainer.onclick = function(event) {
		console.log("Player " + currentPlayer + " Clicked " + event.target);
		evaluateSquareClick( event.target );
	}
}


function evaluateWinStateFromGridSquare( originSquare ) {
	let outputState = false;
	let adjacentSquares = originSquare.adjacentSquares();
	adjacentSquares.forEach( adjacentSquare => {
		if (adjacentSquare.owner == originSquare.owner) {
			let numInRow = 1;
			let checkDistance = 1;
			let checkVector = calculateNormalizedStraightLineVector( originSquare, adjacentSquare );
				
				while (checkDistance < lineLengthToWin && numInRow < lineLengthToWin) {
					let checkPositions = {
						x: originSquare.xPos + (checkVector.x * checkDistance),
						y: originSquare.yPos + (checkVector.y * checkDistance),
						negX: originSquare.xPos - (checkVector.x * checkDistance),
						negY: originSquare.yPos - (checkVector.y * checkDistance)
					}
	
					console.log(checkPositions);
					
					let nextSquarePos = gameGrid.find( square => square.xPos == checkPositions.x && square.yPos == checkPositions.y);
					let nextSquareNeg = gameGrid.find( square => square.xPos == checkPositions.negX && square.yPos == checkPositions.negY);

					if (nextSquarePos != undefined && nextSquarePos.owner == originSquare.owner) {
						numInRow++;
						// console.log("Found forward continuation at " + nextSquarePos.xPos + ", " + nextSquarePos.yPos + " total length = " + numInRow);
					}

					if (nextSquareNeg != undefined && nextSquareNeg.owner == originSquare.owner) {
						numInRow++;
						// console.log("Found backward continuation at " + nextSquareNeg.xPos + ", " + nextSquareNeg.yPos + " total length = " + numInRow);
					}

					checkDistance++;
				}

				if (numInRow == lineLengthToWin) {
					outputState = true;
				}
			}
	} )
	
	if (outputState == true) {
		setWinnerTextState(currentPlayer);
		gameReceivesInput = false;
		gameIsRunning = false;
	} else {
		let drawState = true;
		gameGrid.forEach( square => {
			if ( !square.isOwned() ) {
				drawState = false;
			}
		})
	
		if (drawState == true) {
			gameIsRunning = false;
			document.querySelector("#winner-announcement").textContent = "Game's a draw. Go home, do something else."
		}
	}

	return outputState;
}

function advanceCurrentPlayer() {
	if (currentPlayer < maxPlayers - 1) {
		currentPlayer++;
	} else {
		currentPlayer = 0;
	}
}

function setWinnerTextState( winningPlayer = -1 ) {
	let winningPlayerSymbolSet = playerSymbols.find( playerSet => playerSet.playerIndex == winningPlayer );
	let winText = document.querySelector("#winner-announcement");
	if (winningPlayerSymbolSet != undefined ) {
		winText.textContent = winningPlayerSymbolSet.playerSymbol + " is the Winner!";
	} else {
		winText.textContent = "";
	}
}

// Game Grid Functions

function evaluateSquareClick( target ) {
	if ( gameReceivesInput && gameGridObjects.includes(target) ) {
		claimSquare( target, currentPlayer )
	}
}

function claimSquare( squareObject, playerIndex ) {
	if (squareObject != undefined && playerIndex >= 0) {
		console.log( "Claiming square: " + gameGridObjects.indexOf( squareObject ));
		let targetSquare = gameGrid[ gameGridObjects.indexOf( squareObject ) ];
		if (targetSquare.isOwned() == false) {
			targetSquare.owner = playerIndex;
			squareObject.innerHTML = "<span class='game-symbol'>" + playerSymbols.find( playerSymbol => playerSymbol.playerIndex == currentPlayer ).playerSymbol + "</span>";
			squareObject.style.color = "white";
			evaluateWinStateFromGridSquare( targetSquare )
			console.log("Square " + targetSquare.xPos + ", " + targetSquare.yPos + " claimed by Player " + currentPlayer);
			advanceCurrentPlayer();
			if (aiPlayerIndexList.includes(currentPlayer) && aiEnabled == true ) {
				evaluateAIPlayerMove( true );
			}
		}
	}
}

// AI Functions

function evaluateAIPlayerMove( usesStrategy ) {
	if (gameIsRunning == true) {
		let selectedSquare;
		let availableSquares = [];
		gameGrid.forEach( square => {
			if ( !square.isOwned() )  {
				availableSquares.push(square);
			}
		} )
		console.log(availableSquares);

		if (usesStrategy == true) {
			let highestThreatSquare = gameGrid[ findHighestThreatSquareIndex( availableSquares, currentPlayer ) ];

			selectedSquare = highestThreatSquare;
		} else {
			console.log("AI selecting square index: " + Math.floor( Math.random() * (availableSquares.length - 1)) );
			selectedSquare = availableSquares[ Math.floor( Math.random() * (availableSquares.length - 1) ) ];
			console.log("AI selecting square: " + selectedSquare.xPos + ", " + selectedSquare.yPos);
		}

		if (selectedSquare != undefined ) {
			claimSquare( gameGridObjects[ gameGrid.indexOf(selectedSquare) ] , currentPlayer );
		}
	}
}

function findHighestThreatSquareIndex( squaresToAssess, forPlayer ) {
	let threatArray = []

	squaresToAssess.forEach( originSquare => {
		let maxThreatValue = 0;
		let adjacentSquares = originSquare.adjacentSquares();
		adjacentSquares.forEach( adjacentSquare => {
			let threatValuePos = 0;
			let threatValueNeg = 0
			let checkDistance = 1;
			let checkVector = calculateNormalizedStraightLineVector( originSquare, adjacentSquare );
			
			while (checkDistance < lineLengthToWin) {
				let checkPositions = {
					x: originSquare.xPos + (checkVector.x * checkDistance),
					y: originSquare.yPos + (checkVector.y * checkDistance),
					negX: originSquare.xPos - (checkVector.x * checkDistance),
					negY: originSquare.yPos - (checkVector.y * checkDistance)
				}

				let nextSquarePos = gameGrid.find( square => square.xPos == checkPositions.x && square.yPos == checkPositions.y);
				let nextSquareNeg = gameGrid.find( square => square.xPos == checkPositions.negX && square.yPos == checkPositions.negY);
				
				let numThreatsInRow = 1;
				if (nextSquarePos != undefined) {
					if (nextSquarePos.owner >= 0 && nextSquarePos.owner != originSquare.owner) {
						threatValuePos += 1 * numThreatsInRow;
					} else if (nextSquarePos.owner == currentPlayer) {
						console.log("Threat interrupted at " + nextSquarePos.xPos + ", " + nextSquarePos.yPos + ", owner " + nextSquarePos.owner);
						threatValuePos = 0;
						numThreatsInRow = 0;
					} 
				}
	
				numTreatsInRow = 0
				if (nextSquareNeg != undefined) {
					if (nextSquareNeg.owner >= 0 && nextSquareNeg.owner != originSquare.owner) {
						threatValueNeg += 1 * numThreatsInRow;
						// console.log("Found backward continuation at " + nextSquareNeg.xPos + ", " + nextSquareNeg.yPos + " total length = " + numInRow);
					} else if (nextSquareNeg.owner == currentPlayer) {
						console.log("Threat interrupted at " + nextSquareNeg.xPos + ", " + nextSquareNeg.yPos);
						threatValueNeg = 0;
						numThreatsInRow = 0;
					}
				} 
				checkDistance++;
			}

			let threatValue = Math.max(threatValuePos, threatValueNeg);

			if (threatValue > maxThreatValue) {
				maxThreatValue = threatValue;
			}
		} )

		threatArray.push( {
			gridIndex: gameGrid.indexOf( originSquare ),
			threat: maxThreatValue
		} )

	} )

	console.log(threatArray);
	let highestThreatEntry = threatArray[0];
	threatArray.forEach( threatEntry => {
		if (threatEntry.threat >= highestThreatEntry.threat) {
			highestThreatEntry = threatEntry;
		}
	})

	return highestThreatEntry.gridIndex;
}

// UI Functions
function initializeResetButton() {
	let resetButton = document.querySelector("#reset-button");
	resetButton.onclick = function(event) {
		window.location.reload(false);
	}
}

initializeResetButton();
initializeGrid();

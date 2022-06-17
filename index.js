const game = document.getElementById('game')
const winTxt = ['Genius!!!','Magnificent!!','Impressive!','Splendid!','Great','Good Job','Close One','Phew']
let wordLength = localStorage.wordLength || 5
let guesses = localStorage.guesses || 6
let currentGuess = ''
let guessesUsed = 0
let [words,acceptable,answer,gameWon] = []

Array.prototype.getRandom = function(){
	return this[~~(Math.random()*this.length)]
}

function loadTiles(){
	game.innerHTML = ''
	for(let row=0;row<guesses;row++) {
		const rowElmt = document.createElement('div')
		rowElmt.classList = 'row'
		for(let tile=0;tile<wordLength;tile++) {
			const tileElmt = document.createElement('div')
			tileElmt.classList = 'tile'
			tileElmt.id = `tile${tile},${row}`
			rowElmt.appendChild(tileElmt)
		}
		game.appendChild(rowElmt)
	}
}loadTiles()

function checkSliders(init) {
	['wordLength','guesses'].map(id=>{
		const slider = document.getElementById(id)
		const label = document.getElementById(`${id}Label`)
		eval(`${id} = ${init? localStorage[id] || slider.value : slider.value}`)
		const val = eval(id)
		localStorage[id] = val
		label.innerText = label.innerText.replace(/\d/g,'') + val
		slider.value = val
	})
	currentGuess = ''
	guessesUsed = 0
	loadTiles()
}checkSliders(true)

document.getElementById('wordLength').addEventListener('input',()=>{
	checkSliders()
	refreshList()
})
document.getElementById('guesses').addEventListener('input',()=>checkSliders())

function check() {
	if(currentGuess.length !== wordLength) return toast(`Word must be ${wordLength} letter${wordLength==1?'':'s'} long!`)
	if(!words.includes(currentGuess) && !acceptable.includes(currentGuess)) return toast(`${currentGuess.toUpperCase()} is not in the word list!`)

	let state = Array(wordLength).fill(0) // 0 = gray, 1 = yellow, 2 = green
	let amntEachLetter = {}
	answer.split('').map(l => {
		amntEachLetter[l] = amntEachLetter[l]? amntEachLetter[l]+1 : 1
	})

	for(let x=0;x<wordLength;x++) {
		const letter = currentGuess[x]
		state[x] = 0
		if(answer[x]==letter) {
			amntEachLetter[answer[x]]--
			state[x] = 2
		}
	}

	state = state.map((cell,idx) => {
		if(cell==2) return 2
		if(amntEachLetter[currentGuess[idx]]>0) {
			amntEachLetter[currentGuess[idx]]--
			return 1
		}
		return 0
	})
	
	for(let x=0;x<wordLength;x++){
		const tile = document.getElementById(`tile${x},${guessesUsed}`)
		switch(state[x]) {
			case 1:
				tile.classList.add('tileExist')
				break;
			case 2:
				tile.classList.add('tileCorrect')
				break;
			default:
				tile.classList.add('tileIncorrect')
				break;
		}
	}
	if(state.every(a=>a)) {
		gameWon = true
		toast(winTxt[guessesUsed])
		return setTimeout(() => {
			location.reload()
		},5000)
	}
	guessesUsed++
	currentGuess=''
}

function toast(txt) {
	const t = document.createElement('div')
	t.classList = 'toast'
	t.innerHTML = txt
	document.querySelector('body').appendChild(t)
	setTimeout(()=>{t.remove()},3950)
}

function refreshList() {
	reg = new RegExp(`.{1,${wordLength}}`,'g')
	words = LIST.answers[wordLength+''].match(reg) || []
	acceptable = LIST.acceptable[wordLength+''].match(reg) || []
	answer = words.getRandom()
} refreshList()

function render(){
	for(let tile=0;tile<wordLength;tile++) {
		const tileElmt = document.getElementById(`tile${tile},${guessesUsed}`)
		tileElmt.innerText = currentGuess[tile] || ''
	}
}

document.addEventListener('keydown', e=>{
	if(gameWon) return
	if(e.key=='Backspace') {currentGuess = e.ctrlKey? '' : currentGuess.substr(0,currentGuess.length-1); return render()}
	if(e.ctrlKey) return
	if(e.key=='Enter') return check()
	if(!/[a-zA-Z]{1}/.test(e.key) || e.key.length>1) return
	let letter = e.key.toUpperCase()
	
	currentGuess = (currentGuess+letter).substr(0,wordLength)
	render()
})
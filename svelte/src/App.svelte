<script>
	import { initializeApp } from "firebase/app";
	import {
		getAuth,
		signInWithPopup,
		GoogleAuthProvider } from "firebase/auth";		
		
		import { shortcut } from "./misc.js"
		import { onMount, afterUpdate } from 'svelte';
		let element
		
		import { getDatabase, ref, set, get, child } from "firebase/database";
		
		
		const firebaseConfig = {
			apiKey: "AIzaSyBVRnJfrP4-VHoIHl0SFJSqSkdXT6Q3cXY",
			authDomain: "neutral-fd231.firebaseapp.com",
			projectId: "neutral-fd231",
			storageBucket: "neutral-fd231.appspot.com",
			messagingSenderId: "279993688340",
			appId: "1:279993688340:web:4905f1d9fecb0e8d5c6201",
			databaseURL: "https://neutral-fd231-default-rtdb.firebaseio.com/"
		};
		
		const app = initializeApp(firebaseConfig);
		
		let unsubscribe
		const auth = getAuth(app)
		const provider = new GoogleAuthProvider(app);
		const user = auth.currentUser;
		
		const db = getDatabase();
		
		let displayWebElements = 'none'
		let displayWebElementsText = 'none'
		let displayMobileElements = 'none'
		
		
		function detectMob() {
			const toMatch = [
			/Android/i,
			/webOS/i,
			/iPhone/i,
			/iPad/i,
			/iPod/i,
			/BlackBerry/i,
			/Windows Phone/i
			];
			
			return toMatch.some((toMatchItem) => {
				return navigator.userAgent.match(toMatchItem);
			});
		}
		console.log(detectMob())
		
		if (detectMob()) {
			displayWebElements = 'none'
			displayWebElementsText = 'none'
			displayMobileElements = 'flex'
		}
		else {
			displayWebElements = 'flex'
			displayWebElementsText = 'block'
			displayMobileElements = 'none'
		}
		
		let userId = null;
		let displayName
		let todos = [];
		
		let whenSignedOutDisplay = 'none'
		let whenSignedInDisplay = 'none'
		let showSubText = 'none'
		let showMenuItems = 'none'
		let showShortcuts = 'none'
		
		let userInput = ''
		let showInputField = 'none';
		let focusInputField = false
		let inputRef;		
		let moreInfoDisplay = 'none'
		
		let todoHeight = '23px'
		let subTextHeight = 0
		
		function getWelcomeText() {
			const now = new Date();
			const hours = now.getHours();
			
			if (hours >= 5 && hours < 12) {
				return 'good morning';
			}
			else if (hours >= 12 && hours < 18) {
				return 'good afternoon';
			}
			else {
				return 'good evening';
			}
		}
		
		let todoHeightUpdated
		
		
		function updateTodoHeight(event, index) {
			
			let el = event.target

			todoHeightUpdated = (el.scrollHeight > el.clientHeight) ? (el.scrollHeight) + "px" : '23px';
			
			
			console.log(todoHeightUpdated)
			
			
			todos[index].todoHeight = todoHeightUpdated

			writeUserData()
			
		}
		
		
		var showUserNameStorage = JSON.parse(localStorage.getItem('showUserName'))
		let showUserName
		if (showUserNameStorage == 'none') {
			showUserName = 'none'
		}
		else {
			showUserName = 'block'
		}
		
		var isDarkModeStorage = JSON.parse(localStorage.getItem('isDarkModeStorage'))
		let isDarkMode
		if (isDarkModeStorage == true) {
			isDarkMode = true;
			window.document.body.classList.toggle('darkMode')
		}
		else {
			isDarkMode = false;
		}
		
		var isBlurStorage = JSON.parse(localStorage.getItem('isBlurStorage'))		
		let isBlur
		if (isBlurStorage == 5) {
			isBlur = 5
		}
		else {
			isBlur = 0
		}
		
		
		let writeUserData = function() {
			setTimeout(function () {
				if (userId === null)
				writeUserData();
				
				else {
					set(ref(db, 'users/' + userId), {
						
						cloudTodos: todos
					});
					console.log(userId)
				}
			}, 500);
		};
		
		
		
		
		
		
		
		function logInButton() {
			signInWithPopup(auth, provider)
			.then((result) => {
				whenSignedOutDisplay = 'none'
				whenSignedInDisplay = 'flex'
			})
			.catch((error) => {
				console.error("Authentication error:", error);
			});
		}
		
		function signOutButton() {
			auth.signOut()
			.then(() => {
				whenSignedOutDisplay = 'flex'
				whenSignedInDisplay = 'none'
			})
			.catch((error) => {
				console.error("Signout error:", error);
			});
		}
		
		
		auth.onAuthStateChanged(user => {
			if (user) {
				var userLoggedIn = true;
				console.log('user logged in' + userLoggedIn)
				whenSignedOutDisplay = 'none'
				whenSignedInDisplay = 'flex'
				displayName = user.displayName
				userId = user.uid
				console.log(userId)				
				const dbRef = ref(db, 'users/' + userId)
				get(child(dbRef, 'cloudTodos'))
				.then((snapshot) => {
					var cloudTodosRetrieve = []
					snapshot.forEach(childSnapshot => {
						cloudTodosRetrieve.push(childSnapshot.val())
						
					})
					console.log(cloudTodosRetrieve)
					todos = cloudTodosRetrieve
					
				})
			}
			else {
				var userLoggedIn = false;
				console.log('user logged in' + userLoggedIn)
				whenSignedOutDisplay = 'flex'
				whenSignedInDisplay = 'none'
				userId = null
				
			}
		});
		
		
		
		
		
		function addTodo() {
			writeUserData()
			
		}
		
		
		function removeTodo(index) {
			todos = [...todos.slice(0, index), ...todos.slice(index+1)]
			writeUserData()
		}
		
		
		
		
		
		
		
		
		function autoGrowSubText(event) {
			const element = event.target;
			element.style.height = '5px';
			element.style.height = element.scrollHeight + 'px';
			console.log(element.style.height)
		}
		
		function handleKeyDown(event) {
			if (event.ctrlKey && event.code === 'Space') {
				focusInputField = true
				showInputField = 'block'
			}
			
			if (event.ctrlKey && event.code === 'KeyU') {
				event.preventDefault()
				if (showUserName == 'block') {
					showUserName = 'none'	
					window.localStorage.setItem('showUserName', JSON.stringify(showUserName))
				}
				else if (showUserName == 'none') {
					showUserName = 'block'
					window.localStorage.setItem('showUserName', JSON.stringify(showUserName))
				}
				
			}
			
			
			if (event.ctrlKey && event.code === 'KeyK') {
				event.preventDefault()
				window.document.body.classList.toggle('darkMode')
				isDarkMode = !isDarkMode
				localStorage.setItem("isDarkModeStorage", isDarkMode)
			}
			
			
			if (event.ctrlKey && event.code === 'KeyB') {
				
				event.preventDefault()
				if (isBlur == 0) {
					isBlur = 5
					localStorage.setItem("isBlurStorage", isBlur)
				}
				else if (isBlur == 5) {
					isBlur = 0
					localStorage.setItem("isBlurStorage", isBlur)
				}
			}
			
			if (event.ctrlKey && event.code === 'KeyP') {
				event.preventDefault()
				console.log(todos)
				
			}
			
			
		}
		
		onMount(() => {
			
			
			document.addEventListener('keydown', handleKeyDown);
			return () => {
				document.removeEventListener('keydown', handleKeyDown);
			};
			
		});
		
		afterUpdate(() => {
			if (focusInputField) {
				inputRef.focus();
				focusInputField = false;
			}
			
		});
		
		
	</script>
	
	<main style="filter: blur({isBlur}px);">
		<section id="whenSignedOut" style="display: {whenSignedOutDisplay};">
			<span class="homePageText">{getWelcomeText()}</span>
			<p class="homePageText" id="mainText" >
				welcome to <b>neutral.</b> the most lightweight and stripped down version of a todo list app you can find. <br><br>
				most todo apps have beautiful user interfaces and have a ton of features. i absolutely love that but i think it’s quite
				unproductive if a user gets distracted when they just want to come in, type what they need, look at their tasks and leave immediately.
				this is an app that i have built based on my specific requirements and nothing more. i feel this is perfectly geared towards students
				and power users that just want to get things done very efficiently without having to setup much. <br><br>
				designed with keyboard usage in mind so you’ll basically never have to touch the mouse and has a very low-key yet tasteful user interface.
			</p>
			
			
			<button class="defaultButton" on:click|preventDefault={logInButton} style="display: {displayWebElements};">log in</button>
			
			
			
			<div class="bottomElements" style="padding-top: 13vh;">
				
				<div style="display: flex; flex-direction: column">
					<p class="homePageText" style="display: {displayWebElementsText}"> use in your browser by logging in or <u>download for windows</u> </p>
					<p class="homePageText" style="display: {displayMobileElements};" >the app is currently only available for using on a web browser on a pc or as a windows native app. <br> an android version is in the works</p>
					
					<p on:click={ () => {
						whenSignedOutDisplay = 'none'
						moreInfoDisplay = 'flex'
					} } on:keydown style='cursor: pointer;'> <u>more info</u>  </p>
				</div>
				
				
				<p class="bottomElementsCredit" >  made by <u> <a href="https://github.com/sreeadithya" target="_blank">translate</a></u> </p>
			</div>
			
		</section>
		
		<section id="moreInfo" style="display: {moreInfoDisplay}; flex-direction: column;">
			
			<span class="homePageText">hi</span>
			<p class="homePageText" id="moreInfoText">
				neutral is a hobby project that i’ve created out of curiosity and boredom. i hope you enjoy the experience i have created. <br><br><br>
				the entire project is open source here <br> <br><br>
				web version built on svelte and firebase (auth and realtime db), hosted on netlify <br><br><br>
				desktop version made using tauri
			</p>
			<br>
			
			
			
			<div class="bottomElements" style="padding-top: 13vh;">
				<button on:click={() => {
					moreInfoDisplay = 'none'
					whenSignedOutDisplay = 'flex'
				}} class='defaultButton' id="backButton"> back </button>
				
				<p class="bottomElementsCredit" style="padding-bottom: 0px; margin-bottom: 0px;">
					made by <u> <a href="https://github.com/sreeadithya" target="_blank">translate</a></u> <br>
					buy me a coffee
				</p>
				
			</div>
			
			
			
		</section>
		
		<section id="whenSignedIn" style="display: {whenSignedInDisplay};">
			
			<div id="leftSide">
				<form on:submit|preventDefault={ () => { 
					if(userInput.trim().length) todos = [{todo:userInput, completed: false, subtext: '', showSubText: 'none'}, ...todos];
					userInput = '';  showInputField = 'none'; document.getElementById('inputArea').style.display='block'; addTodo();
				} }
				id="inputArea" style="display: {showInputField};" autocomplete="off" spellcheck="false" >
				<input type="text" bind:value={userInput} id="todoInputArea" bind:this={inputRef}>
			</form>
			
			{#each todos as {todo, completed, subtext, showSubText, todoHeight, subTextHeight}, index}
			
			<div class="todoAndCheckBox">
				<label class="checkBoxContainer">
					<input class="checkBox" type="checkbox" bind:checked={completed} on:input={writeUserData}
					
					
					spellcheck="false" 
					value=true>
					<span class="checkBoxIndicator"></span>
				</label>					
				<textarea   class="todos"
				bind:value={todo}
				on:input={ event => {
					updateTodoHeight(event, index)
					
					
				} }
				type="text"
				class:completedTodo={completed}
				style="height: {todoHeight}"
				spellcheck="false" use:shortcut={{
					
					control: true,
					code: 'KeyD',
					callback: () => removeTodo(index),
					
					code2: 'Enter',
					callback2: () => {
						showSubText = 'block'
						writeUserData()
					},
					
					code4: 'Backspace',
					callback4: () => {
						if (todo === '') {
							removeTodo(index)
							
						}
					},
					
						shift: true,
							callback5: () => {
								todo = todo + '\n'
							},
					code6: 'KeyC',
					callback6: () => {
						console.log('lmao')
						completed=!completed
						
						writeUserData()
					},
					
					
					todo: todo
					
				}}></textarea>
			</div>
			
			
			
			<textarea
			spellcheck="false" 
			
			class="subText"
			class:completedSubText={completed}
			type="text"
			bind:value={subtext}
			placeholder=""
			style="display: {showSubText}"
			on:input={writeUserData}
			use:shortcut={{
				code3: 'Backspace',
				callback3: () => {
					if (subtext === '') {
						showSubText = 'none';
						writeUserData()
					}
				},
				subtext: subtext,
			}}></textarea>
			
			
			
			<br>
			
			
			
			
			{/each}
		</div>
		
		
		<div id="rightSide" style=" display: {showUserName}; "   >
			
			<a href="/" on:click|preventDefault={ () => {
				if (showMenuItems == 'none') {
					showMenuItems = 'flex'
				}
				else if (showMenuItems == 'flex') {
					showMenuItems = 'none'
				}
				
			} }>
			<p class="homePageText" id="displayName" style="color: #B0B0B0; text-align: right"> {displayName} </p>
		</a>
		
		
		
		<div id="menuItems" style="display: {showMenuItems};">
			
			<a href="/" on:click|preventDefault={ () => {
				if (showShortcuts == 'none') {
					showShortcuts = 'flex'
				}
				else if (showShortcuts == 'flex') {
					showShortcuts = 'none'
				}
			}}>
			<p class="homePageText" > how to use </p>
		</a>
		
		<div id="shortcutsMenu" style="display: {showShortcuts};">
			<p style="line-height: 1.7em">
				<i> get started: </i>  <br>
				ctrl + space to create new task <br>
				hit enter on task to add sub text <br>
				<i> remember these:</i>  <br>
				ctrl + c to check selected <br>
				ctrl + d to delete <br>
				ctrl + u to hide username<br>
				ctrl + b to blur screen <br>
				ctrl + k for dark mode <br>  <br>
				
				<i> made by <a href="https://github.com/sreeadithya" target="_blank"> <u>translate</u>  </a> </i>  <br>
				<i> <a href="https://ko-fi.com/translate" target="_blank"> <u>buy me a coffee</u> </a></i> 
			</p>
		</div>
		
		<a href="/" on:click={signOutButton}>
			<p class="homePageText" > sign out </p>
		</a>
		
		
		
		
		
		
	</div>
	
	
</div>
</section>
</main>







<style>
	
	
	main {
		font-size: 18px;
		font-family: Helvetica, Arial, sans-serif;
		margin: 5%;
		margin-top: 7%;
	}
	
	
	:global(body) {
		background-color: #FFFFFF;
		color: #000000;
		transition: background-color 0.3s
	}
	:global(body.darkMode) {
		background-color: #121212;
		color: #FFFFFF;
	}
	
	:global(body.darkMode) .defaultButton {
		background-color: #121212;
		color: #FFFFFF;
	}
	
	:global(body.darkMode) #rightSide {
		background-color: #121212;
	}
	
	:global(body.darkMode) #shortcutsMenu {
		background-color: #121212;
		color: #FFFFFF;
	}
	
	:global(body.darkMode) textarea {
		background-color: #121212;
		color: #FFFFFF;
	}
	
	:global(body.darkMode) input[type='checkbox'] {
		background-color: #121212;
		color: #121212;
		accent-color: #FFFFFF;
		
	}
	
	:global(body.darkMode) .completedTodo {
		margin: 0px;
		padding-top: 0px;
		padding-bottom: 2px;
		color: #FFFFFF80;
	}
	
	:global(body.darkMode) .completedSubText {
		padding-bottom: 0px;
		margin: 0px;
		margin-left: 50px;
		color: #B0B0B0;
	}
	
	
	
	:global(body.darkMode) .checkBoxContainer input:checked ~ .checkBoxIndicator {
		color: #FFFFFF;
		
		
	}
	.completedTodo {
		margin: 0px;
		padding-top: 0px;
		padding-bottom: 2px;
		color: #B0B0B0;
	}
	
	.completedSubText {
		padding-bottom: 0px;
		margin: 0px;
		margin-left: 50px;
		color: #B0B0B0;
	}
	
	
	
	
	.checkBoxContainer input {
		display: none;
		cursor: pointer;
	}
	
	.checkBoxContainer .checkBoxIndicator {
		transform: scale(0.8);
		display: block;
		height: 18px;
		width: 18px;
		border: 2px solid #B0B0B0;
		float: left;
		margin-right: 5px;
		cursor: pointer;
	}
	
	
	.checkBoxContainer input:checked ~ .checkBoxIndicator {
		background: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzg4IiBoZWlnaHQ9IjM4OCIgdmlld0JveD0iMCAwIDM4OCAzODgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0zNDQgMTE0LjMwNEwzMDYuNzQyIDc3TDE0Ny41NDggMjM2LjMzMUw4MS4yNTgxIDE3MC4wMTlMNDQgMjA3LjMyM0wxNDcuNTQ4IDMxMUwzNDQgMTE0LjMwNFoiIGZpbGw9IiNCMEIwQjAiLz4KPC9zdmc+Cg==)
		center/cover no-repeat;
		color: #121212;
		
	}
	
	
	
	
	
	
	
	
	
	
	
	
	:global(body.darkMode) #displayName {
		color: #FFFFFF90 !important;
	}
	
	
	input[type="checkbox"] {
		accent-color: #121212;
		
	}
	
	textarea {
		color: #000000;
		overflow-y: hidden;
	}
	
	.defaultButton {
		
		outline: none;
		border-color: #B0B0B0;
		border-width: 2px;
		border-style: solid;
		width: auto;
		max-width: 80px;
		cursor: pointer;
		background-color: #FFFFFF;
		margin-top: 10vh;
		color: #000000;
		padding-left: 0.9em;
		
		
	}
	
	
	input:focus, textarea:focus{
		outline: none;
	}
	
	input {
		border-width: 0px;
	}
	
	#whenSignedIn {
		
		display: flex;
		flex-flow: row wrap;
		justify-content: space-between;
		align-items: flex-start;
	}
	
	
	#rightSide {
		display: flex;
		flex-direction: column;
		justify-content: right;
		align-items: flex-end;
		
		padding: 0px;
		margin: 0px;
		position: absolute;
		right: 0;
		z-index: 10;
		background-color: #FFFFFF;
		
	}
	
	#rightSide:hover {
		display: block;
		
	}
	
	
	#whenSignedOut {
		display: flex;
		flex-direction: column;
	}
	
	.todoAndCheckBox {
		display: flex;
		align-items: flex-start;
		margin: 0px;
		padding: 0px;
		
	}
	
	
	
	
	#mainText {
		padding-top: 10vh;
		width: 70vw;
	}
	
	#moreInfoText {
		padding-top: 10vh;
		width: 70vw;
	}
	
	
	.todos {
		margin: 0px;
		padding-top: 0px;
		padding-bottom: 2px;
	}
	
	.completedTodo {
		margin: 0px;
		padding-top: 0px;
		padding-bottom: 2px;
		color: #B0B0B0;
	}
	
	.completedSubText {
		padding-bottom: 0px;
		margin: 0px;
		margin-left: 50px;
		color: #B0B0B0;
	}
	
	.subText {
		padding-bottom: 0px;
		margin: 0px;
		margin-left: 50px;
	}
	
	.bottomElements {
		padding-top: 20vh;
		padding-bottom: 10vh;
		display: flex;
		flex-flow: row wrap;
		justify-content: space-between;
		height: 100%;
		bottom: 0;
		
	}
	
	
	.bottomElementsCredit {
		display: inline-block;
		align-self: flex-end;
	}
	
	
	@media screen and (max-height: 790px) {
		.bottomElements {
			padding-top: 8vh;
		}
	}
	
	@media screen and (max-width: 790px) {
		.bottomElements {
			padding-top: 6vh;
		}
	}
	
	@media screen and (max-width: 790px) {
		.defaultButton {
			margin-top: 6vh;
		}
	}
	
	#backButton {
		padding-left: 15px;
		padding-right: 15px;
		display: inline-block;
		align-self: flex-end;
	}
	
	#displayName {
		padding: 0px;
		margin: 0px;
		margin-bottom: 10px;
	}
	
	.checkBox {
		transform: scale(1.3);
		margin-right: 10px;
		margin-top: 5px;
		cursor: pointer;
		
	}
	
	.todos {
		width: 50vw;
		border: none;
		resize: none;
		overflow: hidden;
		min-height: 10px;
		height: 22px;
	}
	
	.subText {
		width: 40vw;
		border: none;
		resize: none;
		overflow: hidden;
		min-height: 10px;
		
		
	}
	
	a { color: inherit; }
	
	#menuItems {
		display: flex;
		flex-direction: column;
		text-align: right;
	}
	
	#shortcutsMenu {
		border-color: #B0B0B0;
		border-width: 2px;
		border-style: solid;
		padding-left: 20px;
		padding-right: 20px;
		color: #000000;
		display: flex;
		flex-direction: column;
	}
	
	
	
</style>
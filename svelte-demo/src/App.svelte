<script>
	import { initializeApp } from "firebase/app";
	import { 
		getAuth,
		signInWithPopup,
		GoogleAuthProvider } from "firebase/auth";
		import { getFirestore } from "firebase/firestore";
		import { shortcut } from "./misc.js"
		import { onMount } from 'svelte';
		
		const firebaseConfig = {
			apiKey: "AIzaSyBVRnJfrP4-VHoIHl0SFJSqSkdXT6Q3cXY",
			authDomain: "neutral-fd231.firebaseapp.com",
			projectId: "neutral-fd231",
			storageBucket: "neutral-fd231.appspot.com",
			messagingSenderId: "279993688340",
			appId: "1:279993688340:web:4905f1d9fecb0e8d5c6201"
		};
		
		const app = initializeApp(firebaseConfig);
		
		const auth = getAuth(app)
		const provider = new GoogleAuthProvider(app);
		const user = auth.currentUser;
		const db = getFirestore(app);


		let todos = []

		let whenSignedOutDisplay = 'none'
		let whenSignedInDisplay = 'none'
		let showSubText = 'none'
		let showMenuItems = 'none'
		let showShortcuts = 'none'

		

		let showUserName = 'block'

		let isDarkMode
		let isBlur

		
		let displayName
		var userSettings


		showUserName = JSON.parse(localStorage.getItem('showUserName'))

		var isDarkModeStorage = JSON.parse(localStorage.getItem('isDarkModeStorage'))

		if (isDarkModeStorage == true) {
			isDarkMode = true;
			window.document.body.classList.toggle('darkMode')
		}
		else {
			isDarkMode = false;
		}

		var isBlurStorage = JSON.parse(localStorage.getItem('isBlurStorage'))

		console.log(isBlurStorage)
		
		if (isBlurStorage == 5) {
			isBlur = 5
		}
		else {
			isBlur = 0
		}

		



		


		
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
			} 
			else {
				var userLoggedIn = false;
				console.log('user logged in' + userLoggedIn)
				whenSignedOutDisplay = 'flex'
				whenSignedInDisplay = 'none'
				
				
			}
		});
		
		
		
		
		
		
		onMount(() => {
			document.addEventListener('keydown', handleKeyDown);
			return () => {
				document.removeEventListener('keydown', handleKeyDown);
			};
		});
		
		function handleKeyDown(event) {
			if (event.ctrlKey && event.code === 'Space') {
				addTodo();
			}

			if (event.ctrlKey && event.code === 'KeyO') {
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


			if (event.ctrlKey && event.code === 'KeyM') {
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

			if (event.ctrlKey && event.code === 'KeyC') {
				event.preventDefault()
				console.log(todos)
				console.log(userSettings)
			}


		}
		
		
		
		function addTodo() {
			todos = [...todos, {todo:'', completed: false, subtext: '', showSubText: 'none'}]
		}
		
		
		function removeTodo(index) {
			todos = [...todos.slice(0, index), ...todos.slice(index+1)]
		}
		

		
		
		function autoGrow(event) {
			const element = event.target;
			element.style.height = '5px';
			element.style.height = element.scrollHeight + 'px';
		}
		
		
	</script>
	
	<main style="filter: blur({isBlur}px);">
		
		<p>text vercel</p>
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
			
			
			<button id="logInButton" on:click|preventDefault={logInButton}>log in</button> 
			
			
			
			<div id="bottomElements">
				<p class="homePageText" >use in your browser by logging in here or download the android or windows app.</p>
				<p id="bottomElementsCredit" class="homePageText">made by translate</p>
			</div>
			
		</section>
		
		
		<section id="whenSignedIn" style="display: {whenSignedInDisplay};">
			
			<div id="leftSide">
				{#each todos as {todo, completed, subtext, showSubText}, index}
				
				<div class="todoAndCheckBox">
					<input class="checkBox" type="checkbox" bind:checked={completed} value=true>
					
					<textarea class="todos" autofocus type="text" bind:this={todos.input} bind:value={todo} use:shortcut={{
						
						control: true,
						code: 'KeyD',
						callback: () => removeTodo(index),
						
						code2: 'Enter',
						callback2: () => {
							showSubText = 'block'
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
						
						todo: todo
						
					}} on:input={autoGrow}></textarea>
				</div>
				
				
				
				<textarea
				on:input={autoGrow}
				class="subText"
				type="text"
				bind:value={subtext}
				placeholder="subtext"
				style="display: {showSubText}"
				use:shortcut={{
					code3: 'Backspace',
					callback3: () => {
						if (subtext === '') {
							showSubText = 'none';
						}
					},
					subtext: subtext,
				}}></textarea>
				
				
				
				<br>
				
				
				
				
				{/each}
			</div>
			
			
			<div id="rightSide" style=" display: {showUserName} "  >

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
					<p class="homePageText" > shortcuts </p>
				</a>

				<div id="shortcutsMenu" style="display: {showShortcuts};">
					<p style="line-height: 1.7em">
						ctrl + space to create new task <br>
						shift + enter on a task to create new line <br>
						press enter on selected task to add sub text <br>
						hold ctrl to drag block <br> <br>
						ctrl + d to delete selected block <br>
						ctrl + o to hide sidebar (remember this tho)<br>
						ctrl + b to blur screen <br>
						ctrl + m to dark mode <br>
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
		font-family: Arial, x, sans-serif;
		margin: 5%;
	}

	:global(body) {
		background-color: #FFFFFF;
		color: #000000;
		transition: background-color 0.3s
	}
	:global(body.darkMode) {
		background-color: #121212;
		color: #FFFFFF99;
	}

	:global(body.darkMode) #logInButton {
		background-color: #121212;
		color: #FFFFFF99;
	}
	
	:global(body.darkMode) #shortcutsMenu {
		background-color: #121212;
		color: #FFFFFF99;
	}

	:global(body.darkMode) textarea {
		background-color: #121212;
		color: #FFFFFF99;
	}

	:global(body.darkMode) input[type='checkbox'] {
		background-color: #121212;
		color: #FFFFFF99;
		accent-color: #FFFFFF99;
	}

	:global(body.darkMode) #displayName {
		color: #FFFFFF70 !important;
	}


	input[type="checkbox"] {
		accent-color: #121212;
		
	}

	textarea {
		color: #000000;
	}

	#logInButton {
		
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
	
	.todos {
		margin: 0px;
		padding-top: 0px;
		padding-bottom: 2px;
	}
	
	.subText {
		padding-bottom: 0px;
		margin: 0px;
		margin-left: 50px;
	}
	
	#bottomElements {
		padding-top: 25vh;
		display: flex;
		flex-flow: row wrap;
		justify-content: space-between;
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
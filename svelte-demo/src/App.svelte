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
		const db = getFirestore(app);
		
		const user = auth.currentUser;
		let textAreaHeight =1 
		
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
		
		let whenSignedOutDisplay = 'none'
		let whenSignedInDisplay = 'none'
		
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
		
		let displayName
		
		auth.onAuthStateChanged(user => {
			if (user) {
				var userLoggedIn = true;
				console.log(userLoggedIn)
				whenSignedOutDisplay = 'none'
				whenSignedInDisplay = 'flex'
				displayName = user.displayName
			} 
			else {
				var userLoggedIn = false;
				console.log(userLoggedIn)
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
				
				console.log(todos)
			}
		}
		
		
		let todos = []
		
		function addTodo() {
			todos = [...todos, {todo:'', completed: false, subtext: '', showSubText: 'none'}]
			console.log(user)
		}
		
		
		function removeTodo(index) {
			todos = [...todos.slice(0, index), ...todos.slice(index+1)]
		}
		
		let showSubText = 'none'
		

		
	</script>
	
	<main>
		
		<section id="whenSignedOut" style="display: {whenSignedOutDisplay};">
			<span class="homePageText">{getWelcomeText()}</span>
			<p class="homePageText" id="mainText">
				welcome to <b>neutral.</b> the most lightweight and stripped down version of a todo list app you can find. <br><br>
				most todo apps have beautiful user interfaces and have a ton of features. i absolutely love that but i think it’s quite
				unproductive if a user gets distracted when they just want to come in, type what they need, look at their tasks and leave immediately.
				this is an app that i have built based on my specific requirements and nothing more. i feel this is perfectly geared towards students
				and power users that just want to get things done very efficiently without having to setup much. <br><br>
				designed with keyboard usage in mind so you’ll basically never have to touch the mouse and has a very low-key yet tasteful user interface. 
			</p>
			
			<form id="inputFields">
				
				<button id="logInButton" on:click|preventDefault={logInButton}>log in</button> 
				
			</form>
			
			
			<div id="bottomElements">
				<p class="homePageText" >use in your browser by logging in here or download the android or windows app.</p>
				<p id="bottomElementsCredit" class="homePageText">made by translate</p>
			</div>
			
		</section>
		
		
		<section id="whenSignedIn" style="display: {whenSignedInDisplay};">
			
			<div id="leftSide">
				{#each todos as {todo, completed, subtext, showSubText}, index}
				
				<input class="checkBox" type="checkbox" bind:checked={completed} value=true>
				<input class="todos" autofocus type="text" bind:this={todos.input} bind:value={todo} use:shortcut={{
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
					todo: todo
					
				}}>
				
				<br>
				<textarea 
				on:input={ () => {
					textAreaHeight = `${subtext.split('\n').length * 1.2}em`
				}  }
				class="subText" type="text" bind:value={subtext} placeholder="subtext" style="display: {showSubText}; height: {textAreaHeight}" use:shortcut={{
					code3: 'Backspace',
					callback3: () => {
						if (subtext === '') {
							showSubText = 'none';
						}
					},
					subtext: subtext
				}} wrap="hard"></textarea>
				
				
				
				<br>
				
				
				{/each}
			</div>
			
			
			<div id="rightSide">
				<p class="homePageText" id="displayName"> {displayName} </p>
				<button id="signOutButton" on:click={signOutButton}> sign out </button>
			</div>
			
			
			
		</section>
	</main>
	
	
	
	
	
	
	
	<style>
		
		main {
			font-size: 20px;
			font-family: Arial, x, sans-serif;
			margin: 5%;
		}
		
		#logInButton, #signOutButton {
			
			outline: none;
			border-color: #B0B0B0;
			border-width: 2px;
			border-style: solid;
			width: auto;
			max-width: 8vw;
			cursor: pointer;
			background-color: #FFFFFF;
			
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
		}
		
		
		#rightSide {
			display: flex;
			flex-direction: column;
			justify-content: right;
		}
		
		
		
		#whenSignedOut {
			display: flex;
			flex-direction: column;
		}
		
		
		#inputFields {
			width: 20%;
			background-color: #FFFFFF;
			padding-top: 10vh;
			display: flex;
			flex-direction: row;
		}
		
		
		#mainText {
			padding-top: 10vh;
			
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
			padding-left: 25vh;
			display: flex;
			flex-flow: row wrap;
			justify-content: space-between;
		}
		
		.checkBox {
			transform: scale(1.5);
			padding: 0px;
			margin: 0px;
		}
		
		.todos {
			width: 50vw;
		}

		.subText {
			width: 40vw;
			border: none;
			resize: none;
			overflow: hidden;
		}
		

	</style>
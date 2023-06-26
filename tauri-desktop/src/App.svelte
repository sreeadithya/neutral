<script>
  import { initializeApp } from "firebase/app";
  import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
  import { onMount, afterUpdate } from "svelte";

  import { getDatabase, ref, set, get, child } from "firebase/database";

  const firebaseConfig = {
    apiKey: "AIzaSyBVRnJfrP4-VHoIHl0SFJSqSkdXT6Q3cXY",
    authDomain: "neutral-fd231.firebaseapp.com",
    projectId: "neutral-fd231",
    storageBucket: "neutral-fd231.appspot.com",
    messagingSenderId: "279993688340",
    appId: "1:279993688340:web:4905f1d9fecb0e8d5c6201",
    databaseURL: "https://neutral-fd231-default-rtdb.firebaseio.com/",
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider(app);
  const db = getDatabase();
  const user = auth.currentUser;

  let userId = null;
  let todos = [];
  let userInput = "";

  let showSubText = "none";
  let showMenuItems = "none";
  let showShortcuts = "none";
  let whenSignedOutDisplay = "none";
  let whenSignedInDisplay = "none";
  let displayWebElements = "none";
  let showInputField = "none";
  let showDownloads = "none";
  let showCheckBoxes = "block";
  let showCheckBoxesBool = true;

  let todoHeight = "23px";
  let todoHeightUpdated;
  let subTextHeight = "20px";
  let subTextHeightUpdated;

  let unsubscribe;
  let displayName;
  let inputRef;
  let focusInputField = false;
  let connectedStatus = "none";

  var showUserNameStorage = JSON.parse(localStorage.getItem("showUserName"));
  let showUserName;
  if (showUserNameStorage == "none") {
    showUserName = "none";
  } else {
    showUserName = "block";
  }

  var isDarkModeStorage = JSON.parse(localStorage.getItem("isDarkModeStorage"));
  let isDarkMode;
  if (isDarkModeStorage == true) {
    isDarkMode = true;
    window.document.body.classList.toggle("darkMode");
  } else {
    isDarkMode = false;
  }

  var isBlurStorage = JSON.parse(localStorage.getItem("isBlurStorage"));
  let isBlur;
  if (isBlurStorage == 5) {
    isBlur = 5;
  } else {
    isBlur = 0;
  }

  var showCheckBoxesStorage = JSON.parse(
    localStorage.getItem("showCheckBoxesStorage")
  );
  if (showCheckBoxesStorage == "none") {
    showCheckBoxes = "none";
    showCheckBoxesBool = false;
    localStorage.setItem(
      "showCheckBoxesStorage",
      JSON.stringify(showCheckBoxes)
    );
  } else if (showCheckBoxesStorage == "block") {
    showCheckBoxes = "block";
    showCheckBoxesBool = true;
    localStorage.setItem(
      "showCheckBoxesStorage",
      JSON.stringify(showCheckBoxes)
    );
  } else {
    showCheckBoxes = "block";
    localStorage.setItem(
      "showCheckBoxesStorage",
      JSON.stringify(showCheckBoxes)
    );
  }

  function getWelcomeText() {
    const now = new Date();
    const hours = now.getHours();

    if (hours >= 5 && hours < 12) {
      return "good morning";
    } else if (hours >= 12 && hours < 18) {
      return "good afternoon";
    } else {
      return "good evening";
    }
  }

  const checkOnlineStatus = async () => {
    try {
      const online = await fetch("/1pixel.png");
      return online.status >= 200 && online.status < 300;
    } catch (err) {
      return false;
    }
  };

  setInterval(async () => {
    const result = await checkOnlineStatus();
    connectedStatus = result ? "none" : "block";
  }, 10000);

  window.addEventListener("load", async (event) => {
    connectedStatus = (await checkOnlineStatus()) ? "none" : "block";
  });

  let writeUserData = function () {
    setTimeout(function () {
      if (userId === null) writeUserData();
      else {
        set(ref(db, "users/" + userId), {
          cloudTodos: todos,
        });
      }
    }, 500);
  };

  function logInButton() {
    signInWithPopup(auth, provider)
      .then((result) => {
        whenSignedOutDisplay = "none";
        whenSignedInDisplay = "flex";
      })
      .catch((error) => {
        console.error("Authentication error:", error);
      });
  }

  function signOutButton() {
    auth
      .signOut()
      .then(() => {
        whenSignedOutDisplay = "flex";
        whenSignedInDisplay = "none";
      })
      .catch((error) => {
        console.error("Signout error:", error);
      });
  }

  auth.onAuthStateChanged((user) => {
    if (user) {
      var userLoggedIn = true;
      whenSignedOutDisplay = "none";
      whenSignedInDisplay = "flex";
      displayName = user.displayName;
      userId = user.uid;
      const dbRef = ref(db, "users/" + userId);
      get(child(dbRef, "cloudTodos")).then((snapshot) => {
        var cloudTodosRetrieve = [];
        snapshot.forEach((childSnapshot) => {
          cloudTodosRetrieve.push(childSnapshot.val());
        });
        todos = cloudTodosRetrieve;
      });
    } else {
      var userLoggedIn = false;
      whenSignedOutDisplay = "flex";
      whenSignedInDisplay = "none";
      userId = null;
    }
  });
  function removeTodo(index) {
    todos = [...todos.slice(0, index), ...todos.slice(index + 1)];
    writeUserData();
  }
  function autoGrowSubText(event) {
    const element = event.target;
    element.style.height = "5px";
    element.style.height = element.scrollHeight + "px";
  }
  function updateTodoHeight(event, index) {
    let el = event.target;
    el.style.height = "1px";
    todoHeightUpdated = 5 + el.scrollHeight + "px";
    todos[index].todoHeight = todoHeightUpdated;
    writeUserData();
  }

  function updateSubTextHeight(event, index) {
    let el = event.target;
    el.style.height = "1px";
    subTextHeightUpdated = 5 + el.scrollHeight + "px";
    todos[index].subTextHeight = subTextHeightUpdated;
    writeUserData();
  }

  function handleKeyDown(event) {
    if (event.ctrlKey && event.code === "Space") {
      focusInputField = true;
      showInputField = "block";
    }
    if (event.ctrlKey && event.code === "KeyU") {
      event.preventDefault();
      if (showUserName == "block") {
        showUserName = "none";
        window.localStorage.setItem(
          "showUserName",
          JSON.stringify(showUserName)
        );
      } else if (showUserName == "none") {
        showUserName = "block";
        window.localStorage.setItem(
          "showUserName",
          JSON.stringify(showUserName)
        );
      }
    }
    if (event.ctrlKey && event.code === "KeyK") {
      event.preventDefault();
      window.document.body.classList.toggle("darkMode");
      isDarkMode = !isDarkMode;
      localStorage.setItem("isDarkModeStorage", isDarkMode);
    }
    if (event.ctrlKey && event.code === "KeyB") {
      event.preventDefault();
      if (isBlur == 0) {
        isBlur = 5;
        localStorage.setItem("isBlurStorage", isBlur);
      } else if (isBlur == 5) {
        isBlur = 0;
        localStorage.setItem("isBlurStorage", isBlur);
      }
    }
    if (event.ctrlKey && event.code === "KeyP") {
      event.preventDefault();
      if (showCheckBoxes == "none") {
        showCheckBoxes = "block";
        showCheckBoxesBool = true;
        localStorage.setItem(
          "showCheckBoxesStorage",
          JSON.stringify(showCheckBoxes)
        );
      } else if (showCheckBoxes == "block") {
        showCheckBoxes = "none";
        showCheckBoxesBool = false;
        localStorage.setItem(
          "showCheckBoxesStorage",
          JSON.stringify(showCheckBoxes)
        );
      }
    }
  }

  onMount(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  });

  afterUpdate(() => {
    if (focusInputField) {
      inputRef.focus();
      focusInputField = false;
    }
  });

  function showDownloadsToggle() {
    if (showDownloads == "none") {
      showDownloads = "flex";
    } else if (showDownloads == "flex") {
      showDownloads = "none";
    }
  }
  function shortcut(
    node,
    {
      control,
      code,
      callback,
      code2,
      callback2,
      code3,
      callback3,
      subtext,
      code4,
      callback4,
      todo,
      shift,
      callback5,
      code7,
      callback7,
      code6,
      callback6,
    }
  ) {
    const handleKeydown = (event) => {
      if (control && event.ctrlKey && event.code === code) {
        event.preventDefault();
        callback();
      }

      if (event.code === code3) {
        callback3();
      }
      if (event.code === code4) {
        callback4();
      }
      if (shift && event.shiftKey && event.code === code2) {
        event.preventDefault();
        callback5();
      }
      if (event.code === code2) {
        event.preventDefault();
        callback2();
      }

      if (control && event.ctrlKey && event.code === code7) {
        event.preventDefault();
        callback7();
      }

      if (control && event.ctrlKey && event.code === code6) {
        event.preventDefault();
        callback6();
      }
    };
    node.addEventListener("keydown", handleKeydown);
  }
</script>

<main style="filter: blur({isBlur}px);">
  <section id="whenSignedOut" style="display: {whenSignedOutDisplay};">
    <div class="mainWhenSignedOut">
      <div class="leftSide">
        <p>{getWelcomeText()}</p>
        <p id="mainText">
          welcome to <b>neutral.</b>
        </p>
        <button class="defaultButton" on:click|preventDefault={logInButton}
          >log in / sign up</button
        >
      </div>

      <div class="bottomElementsCredit">
        <p>
          <a href="http://neutral.translate.lol/" target="_blank"
            >visit the website</a
          >
        </p>
        <p
          class="bottomElementsCredit"
          style="position: relative; padding-top:10px"
        >
          made by ​<u>
            <a href="https://translate.lol/" target="_blank">translate</a></u
          >
        </p>
      </div>
    </div>
  </section>

  <section id="whenSignedIn" style="display: {whenSignedInDisplay};">
    <div id="leftSide">
      <form
        on:submit|preventDefault={() => {
          if (userInput.trim().length)
            todos = [
              {
                todo: userInput,
                completed: false,
                subtext: "",
                showSubText: "none",
              },
              ...todos,
            ];
          userInput = "";
          showInputField = "none";
          document.getElementById("inputArea").style.display = "block";
          writeUserData();
        }}
        id="inputArea"
        style="display: {showInputField};"
        autocomplete="off"
        spellcheck="false"
      >
        <input
          type="text"
          bind:value={userInput}
          id="todoInputArea"
          bind:this={inputRef}
        />
      </form>

      {#each todos as { todo, completed, subtext, showSubText, todoHeight, subTextHeight }, index}
        <div class="todoAndCheckBox">
          <label class="checkBoxContainer" style="display: {showCheckBoxes};">
            <input
              class="checkBox"
              type="checkbox"
              bind:checked={completed}
              on:input={writeUserData}
              spellcheck="false"
              value="true"
            />

            <span class="checkBoxIndicator" />
          </label>
          <textarea
            class="todos"
            bind:value={todo}
            on:input={(event) => {
              updateTodoHeight(event, index);
            }}
            type="text"
            class:completedTodo={completed}
            style="height: {todoHeight}"
            spellcheck="false"
            use:shortcut={{
              control: true,
              code: "KeyD",
              callback: () => removeTodo(index),

              code2: "Enter",
              callback2: () => {
                showSubText = "block";
                writeUserData();
              },

              code4: "Backspace",
              callback4: () => {
                if (todos[index].todo == "") {
                  removeTodo(index);
                }
              },

              shift: true,
              callback5: () => {
                todo = todo + "\n";
              },
              code6: "KeyC",
              callback6: () => {
                completed = !completed;

                writeUserData();
              },

              todo: todo,
            }}
          />
        </div>

        <textarea
          spellcheck="false"
          class="subText"
          class:completedSubText={completed}
          class:hiddenCheckBoxSubText={!showCheckBoxesBool}
          class:hiddenCheckBoxCompletedSubText={completed &&
            !showCheckBoxesBool}
          type="text"
          bind:value={subtext}
          placeholder="_"
          on:input={(event) => {
            updateSubTextHeight(event, index);
          }}
          style="display: {showSubText}; height: {subTextHeight}; min-height: 23px;"
          on:input={writeUserData}
          use:shortcut={{
            code3: "Backspace",
            callback3: () => {
              if (subtext == "") {
                showSubText = "none";
                writeUserData();
              }
            },

            control: true,
            code7: "KeyD",
            callback7: () => {
              subtext = "";
              showSubText = "none";
              writeUserData();
            },
            code6: "KeyC",
            callback6: () => {
              completed = !completed;

              writeUserData();
            },

            subtext: subtext,
          }}
        />
        <br />
      {/each}
    </div>

    <div id="rightSide" style=" display: {showUserName}; ">
      <a
        href="/"
        on:click|preventDefault={() => {
          if (showMenuItems == "none") {
            showMenuItems = "flex";
          } else if (showMenuItems == "flex") {
            showMenuItems = "none";
          }
        }}
      >
        <p id="displayName" style="color: #B0B0B0; text-align: right">
          {displayName}
        </p>
      </a>
      <div id="menuItems" style="display: {showMenuItems};">
        <a
          href="/"
          on:click|preventDefault={() => {
            if (showShortcuts == "none") {
              showShortcuts = "flex";
            } else if (showShortcuts == "flex") {
              showShortcuts = "none";
            }
          }}
        >
          <p>how to use</p>
        </a>

        <div id="shortcutsMenu" style="display: {showShortcuts};">
          <p style="line-height: 1.7em">
            <i> get started: </i> <br />
            ctrl + space to create new task <br />
            hit enter on task to add sub text <br />
            tab to move around <br />
            shift + enter to add new line <br /> <br />
            <i> remember these:</i> <br />
            ctrl + c to mark done<br />
            ctrl + d to delete<br />
            ctrl + b to blur screen <br />
            ctrl + k for dark mode <br />
            ctrl + u to hide username<br />
            ctrl + p to hide checkboxes <br /> <br />

            <i>
              made by <a href="https://translate.lol/" target="_blank">
                <u>translate</u>
              </a>
            </i> <br />
            <i>
              <a href="https://ko-fi.com/translate" target="_blank">
                <u>buy me a coffee</u>
              </a></i
            >
          </p>
        </div>

        <a href="/" on:click={signOutButton}>
          <p>sign out</p>
        </a>
      </div>

      <p
        style="color: #B0B0B0; text-align: right; padding-top: 70vh; display: {connectedStatus}"
      >
        internet connection lost
      </p>
    </div>
  </section>
</main>

<style>
  main {
    font-size: 18px;
    font-family: Helvetica, Arial, sans-serif;
    margin: 5%;
    margin-top: 7%;
    height: 75vh;
  }
  textarea {
    color: #000000;
    overflow-y: hidden;
  }
  input:focus,
  textarea:focus {
    outline: none;
  }

  input {
    border-width: 0px;
  }
  a {
    color: inherit;
  }
  input[type="checkbox"] {
    accent-color: #121212;
  }

  .defaultButton {
    outline: none;
    border-color: #b0b0b0;
    border-width: 2px;
    border-style: solid;
    cursor: pointer;
    background-color: #ffffff;
    margin-top: 5vh;
    color: #000000;
    padding-left: 12px;
    padding-right: 12px;
    transition-duration: 0.1s;
  }
  .defaultButton:hover {
    background-color: #f0f0f0;
  }
  .defaultButton:active {
    background-color: #e0e0e0;
  }
  .todoAndCheckBox {
    display: flex;
    align-items: flex-start;
    margin: 0px;
    padding: 0px;
  }

  .leftSide {
    width: 50vw;
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
    color: #b0b0b0;
  }

  .subText {
    padding-bottom: 0px;
    margin: 0px;
    margin-left: 50px;
  }

  .completedSubText {
    color: #b0b0b0;
  }

  .hiddenCheckBoxCompletedSubText {
    color: #b0b0b0;
    margin-left: 25px;
  }

  .hiddenCheckBoxSubText {
    margin-left: 25px;
  }

  .bottomElementsCredit {
    align-self: flex-end;
    position: absolute;
    bottom: 0;
  }

  .mainWhenSignedOut {
    display: flex;
    flex-direction: row;
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

  .completedTodo {
    margin: 0px;
    padding-top: 0px;
    padding-bottom: 2px;
    color: #b0b0b0;
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
    border: 2px solid #b0b0b0;
    float: left;
    margin-right: 5px;
    cursor: pointer;
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
    background-color: #ffffff;
  }

  #rightSide:hover {
    display: block;
  }

  #whenSignedOut {
    display: flex;
    flex-direction: row;
  }

  #mainText {
    padding-top: 5vh;
    width: 40vw;
  }

  #todoInputArea {
    background-color: #ffffff;
  }

  #displayName {
    padding: 0px;
    margin: 0px;
    margin-bottom: 10px;
  }

  #whenSignedOut a {
    text-decoration: underline;
  }

  #menuItems {
    display: flex;
    flex-direction: column;
    text-align: right;
  }

  #shortcutsMenu {
    border-color: #b0b0b0;
    border-width: 2px;
    border-style: solid;
    padding-left: 20px;
    padding-right: 20px;
    color: #000000;
    display: flex;
    flex-direction: column;
  }

  :global(body) {
    background-color: #ffffff;
    color: #000000;
    transition: background-color 0.3s;
  }
  :global(body.darkMode) {
    background-color: #121212;
    color: #ffffff;
  }

  :global(body.darkMode) .defaultButton {
    background-color: #121212;
    color: #ffffff;
  }

  :global(body.darkMode) #rightSide {
    background-color: #121212;
  }

  :global(body.darkMode) .defaultButton:active {
    background-color: rgb(43, 43, 43);
  }

  :global(body.darkMode) #shortcutsMenu {
    background-color: #121212;
    color: #ffffff;
  }

  :global(body.darkMode) textarea {
    background-color: #121212;
    color: #ffffff;
  }

  :global(body.darkMode) input[type="checkbox"] {
    background-color: #121212;
    color: #121212;
    accent-color: #ffffff;
  }

  :global(body.darkMode) .completedTodo {
    color: #ffffff80;
  }

  :global(body.darkMode) .completedSubText {
    color: #ffffff80;
  }

  :global(body.darkMode) .checkBoxContainer input:checked ~ .checkBoxIndicator {
    color: #ffffff;
  }

  :global(body.darkMode) #todoInputArea {
    background-color: #121212;
    color: #ffffff;
  }

  :global(body.darkMode) #displayName {
    color: #ffffff90 !important;
  }

  .checkBoxContainer input:checked ~ .checkBoxIndicator {
    background: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzg4IiBoZWlnaHQ9IjM4OCIgdmlld0JveD0iMCAwIDM4OCAzODgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0zNDQgMTE0LjMwNEwzMDYuNzQyIDc3TDE0Ny41NDggMjM2LjMzMUw4MS4yNTgxIDE3MC4wMTlMNDQgMjA3LjMyM0wxNDcuNTQ4IDMxMUwzNDQgMTE0LjMwNFoiIGZpbGw9IiNCMEIwQjAiLz4KPC9zdmc+Cg==)
      center/cover no-repeat;
    color: #121212;
  }
</style>

<script>
  import { initializeApp } from "firebase/app";
  import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
  import { onMount, afterUpdate } from "svelte";
  import Draggable from "./Draggable.svelte";

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
  let moreInfoDisplay = "none";
  let displayWebElements = "none";
  let displayWebElementsText = "none";
  let displayMobileElements = "none";
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

  function detectMob() {
    const toMatch = [
      /Android/i,
      /webOS/i,
      /iPhone/i,
      /iPad/i,
      /iPod/i,
      /BlackBerry/i,
      /Windows Phone/i,
    ];

    return toMatch.some((toMatchItem) => {
      return navigator.userAgent.match(toMatchItem);
    });
  }

  if (detectMob()) {
    displayWebElements = "none";
    displayWebElementsText = "none";
    displayMobileElements = "flex";
  } else {
    displayWebElements = "flex";
    displayWebElementsText = "block";
    displayMobileElements = "none";
  }

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
          welcome to <b>neutral.</b> the most lightweight and stripped down
          version of a todo list app you can find. (excluding a piece of paper
          ofcourse) <br /><br />
          most todo apps have beautiful user interfaces and have a ton of features.
          i absolutely love that but i think it’s quite unproductive if someone gets
          distracted trying to set up their perfect workspace when they just want
          to come in, type what they need, look at their tasks and leave immediately.
          this is an app that i have built based on my specific requirements and
          nothing more. i feel this is perfectly geared towards students and power
          users that just want to get things done very efficiently without having
          to put in any effort. <br /><br />
          designed with extreme minimalism and productivity in mind, basically everything
          can be done with the keyboard and crucial ui elements can be hidden. has
          dark mode and the screen can also be blurred quickly with a shortcut in
          case someone comes around unexpectedly.
        </p>
      </div>

      <div class="rightSide">
        <button
          class="defaultButton"
          on:click|preventDefault={logInButton}
          style="display: {displayWebElements};">log in / sign up</button
        >

        <div id="downloadText">
          <p style="display: {displayWebElementsText}; margin-top: 5vh">
            use in your browser by logging in <br /> or
            <a on:click|preventDefault={showDownloadsToggle} href="/"
              ><u> download for windows</u></a
            >
          </p>

          <Draggable>
            <div style="display: {showDownloads}" id="showDownloadsBox">
              <div class="topBar" style="padding: 0px 20px 0px 20px">
                <div>
                  <p>downloads</p>
                </div>
                <div>
                  <p
                    on:click={() => {
                      showDownloads = "none";
                    }}
                    on:keydown
                    style="cursor: pointer"
                  >
                    x
                  </p>
                </div>
              </div>
              <span><hr /></span>

              <div style="padding: 0px 20px 0px 20px">
                <button
                  style="display: {showDownloads}; margin-bottom: 10px; margin-top:15px"
                  class="downloadButton"
                >
                  <a
                    href="https://github.com/sreeadithya/neutral/releases/download/1.1.0/neutral.1.1.0.msi"
                    target="_blank">installer (3mb)</a
                  >
                </button>

                <button
                  style="display: {showDownloads};"
                  class="downloadButton"
                >
                  <a
                    href="https://github.com/sreeadithya/neutral/releases/download/1.1.0/neutral.1.1.0.exe"
                    target="_blank">portable (7mb)</a
                  >
                </button>

                <br />
              </div>
            </div>
          </Draggable>
        </div>

        <p style="display: {displayMobileElements};">
          the app is currently only available for using on a web browser on a pc
          or as a windows native app. <br /> an android version is in the works
        </p>

        <Draggable>
          <div class="moreInfo" style="display: {moreInfoDisplay}">
            <div class="topBar" style="padding: 0px 20px 0px 20px">
              <div>
                <p>more info</p>
              </div>
              <div>
                <p
                  on:click={() => {
                    moreInfoDisplay = "none";
                  }}
                  on:keydown
                  style="cursor: pointer"
                >
                  x
                </p>
              </div>
            </div>

            <hr />

            <div style="padding: 15px 20px 0px 20px;  padding-bottom:40px">
              neutral is a hobby project that i’ve made out of curiosity and
              boredom. i hope you enjoy the experience i have created. <br /><br
              />

              the entire project is open source
              <a href="https://github.com/sreeadithya/neutral" target="_blank"
                >here</a
              > <br /><br />

              web version built on svelte and firebase (auth and realtime db),
              hosted on netlify <br /><br />

              desktop version made using tauri <br /><br />
              <br />

              made by
              <a href="https://translate.lol/" target="_blank">translate</a>
              <br />
              <a href="https://ko-fi.com/translate" target="_blank"
                >buy me a coffee</a
              >
            </div>
          </div>
        </Draggable>
      </div>
      <div class="bottomElementsCredit">
        <div class="leftSide">
          <p
            on:click={() => {
              if (moreInfoDisplay == "none") {
                moreInfoDisplay = "block";
              } else {
                moreInfoDisplay = "none";
              }
            }}
            on:keydown
            style="cursor: pointer"
            class="bottomElementsCredit"
          >
            <u>more info</u>
          </p>
        </div>

        <div class="rightSide">
          <p class="bottomElementsCredit" style="position: relative;">
            made by ​<u>
              <a href="https://translate.lol/" target="_blank">translate</a></u
            >
          </p>
        </div>
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
    margin-top: 15vh;
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
  .downloadButton {
    margin: 0px;
    padding-left: 0.5em;

    outline: none;
    border-color: #b0b0b0;
    border-width: 2px;
    border-style: solid;
    width: 100%;
    cursor: pointer;
    background-color: #ffffff;
    color: #000000;
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
    display: flex;
    flex-direction: row;
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
  .topBar {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  .moreInfo {
    background-color: #ffffff;
    position: relative;
    z-index: 10;
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

  #showDownloadsBox {
    position: relative;
    display: flex;
    background-color: #ffffff;
    flex-direction: column;
    z-index: 100;
    width: 180px;
    color: #000000;
  }

  #downloadText {
    position: relative;
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
    padding-top: 10vh;
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

  @media screen and (max-width: 1000px) {
    .mainWhenSignedOut {
      display: flex;
      flex-direction: column;
    }

    .bottomElementsCredit {
      position: relative;
      flex-direction: column;
      width: 100%;
    }

    .defaultButton {
      margin-top: 2vh;
    }
    .leftSide {
      width: 90%;
    }
    .rightSide {
      width: 90%;
    }
    #mainText {
      width: 90%;
      padding-top: 5vh;
    }
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
  :global(body.darkMode) .downloadButton {
    background-color: #121212;
    color: #ffffff;
  }

  :global(body.darkMode) .moreInfo {
    background-color: #121212;
    color: #ffffff;
  }

  :global(body.darkMode) #rightSide {
    background-color: #121212;
  }

  :global(body.darkMode) #showDownloadsBox {
    background-color: #121212;
    color: #ffffff;
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

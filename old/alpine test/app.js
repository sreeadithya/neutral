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

let userLoggedIn

auth.onAuthStateChanged(user => {
if (user) {
    userDetails.innerHTML = `<h3>Hello ${user.displayName}!</h3> <p>User ID: ${user.uid}</p>`;  
    userLoggedIn = true;
    console.log(userLoggedIn)
    document.getElementById('whenSignedOut').style.display = 'none'
    document.getElementById('whenSignedIn').style.display = 'block'


    const collectionRef = firestore.collection('data');
    collectionRef.get().then((querySnapshot) => {
      // Loop through each document in the collection
      querySnapshot.forEach((doc) => {
        // Get the data from each document
        const todo = doc.data().todo;
        const subtext = doc.data().subtext;
        const completed = doc.data().completed;
    
        // Log the data in the console
        console.log('Todo:', todo);
        console.log('Subtext:', subtext);
        console.log('Completed:', completed);
      });
    }).catch((error) => {
      // Handle any errors
      console.log('Error getting documents:', error);
    });

} 
else {
    userDetails.innerHTML = '';
    userLoggedIn = false;
    console.log(userLoggedIn)
    document.getElementById('whenSignedOut').style.display = 'flex'
    document.getElementById('whenSignedIn').style.display = 'none'

}
});



let dataRef
let unsubscribe
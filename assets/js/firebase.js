// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCGkoFYR8-JNAKrbVc9_mAPsdnsKGz17IM",
  authDomain: "codeman-be0aa.firebaseapp.com",
  projectId: "codeman-be0aa",
  storageBucket: "codeman-be0aa.appspot.com",
  messagingSenderId: "523056429752",
  appId: "1:523056429752:web:cf9cdbd61b8c269512124d",
  measurementId: "G-DQBXXJSVYK"
};

var authCreateForUserTypes = ["manager", "student", "lecturer"];

const firebaseApp = firebase.initializeApp(firebaseConfig);

// Get a reference to the storage service, which is used to create references in your storage bucket
//  const storage = getStorage(firebaseApp);
const storageRef = firebase.storage().ref()

// Firebase Variables
var auth = firebase.auth();
var currenctUser = auth.currentUser;
console.log(currenctUser, "================")
if (currenctUser) { localStorage.setItem("userID", currenctUser.id); }

const dbRef = firebase.database().ref();
let dataTable;

console.log(window.location.href, "=========== window.location.href")

// This function callback is responsible for checking user session whether it is active or not
// It redirects users to the login page if no active session is available.
auth.onAuthStateChanged(async (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/firebase.User
    var uid = user.uid;
    let userInfo = [{ fullName: "Demo User" }];
    console.log(window.location.href, window.location.origin, window.location.href === window.location.origin)
    const userTypes = ["managers", "students", "lecturers"]
    for (let i = 0; i < userTypes.length; i++) {
      let userType = userTypes[i];
      console.log(userType, uid, "=========== userType ===============")
      try {
        let dbRef1 = firebase.database().ref("/" + userType);
        const snapshot = await dbRef1.orderByChild("userID").equalTo(uid).once("value");
        console.log(snapshot.val(), snapshot.key, "++++++++++++++++++++++++++++");
        if (snapshot.val()) {
          userInfo = firebaseSnapshotToArrayOfObjects(snapshot.val());
          console.log(userInfo, "=============++++++++++++ userInfo ++++++++++++============")
          localStorage.setItem("userInfo", JSON.stringify(userInfo));
          localStorage.setItem("userType", userType);
          if (window.location.href === window.location.origin + "/" || window.location.href.includes("/auth/index.html")) {
            console.log("inside this if....")
            window.location.href = "/pages/" + userType + "/index.html";
            break;
          }
        }
      } catch (err) {
        console.log(err, "============ Err ============")
        window.location.href = "/pages/lecturers/index.html";
      }
    }
    let loggedInUserEles = document.getElementsByClassName("loggedInUser");
    console.log(loggedInUserEles, "+++++++++++++++++++++ loggedInUserEles ++++++++++++++++++++")
    for (let i = 0; i < loggedInUserEles.length; i++) {
      let il = loggedInUserEles[i];
      console.log(il, "=========== il ===========")
      il.innerHTML = userInfo[0].fullName;
    }
    // ...
  } else {
    // User is signed out
    // ...
    console.log("Not logged in");
    if (!window.location.href.includes("/auth/index.html")) {
      window.location.href = "/pages/auth/index.html"; // Redirects user to login page
    }
  }
});


// This function is responsible for signing out of the platform.
function clickSignoutButton() {
  localStorage.clear();
  auth.signOut()
}

if (window.location.href.includes("/logout.html")) {
  clickSignoutButton();
}



// Conditional statement to restrict 
if (window.location.href.includes("/auth/index.html")) {
  // This fetches the HTML Elements
  var signInBtn = document.querySelector("#signInBTN");
  signInBtn.addEventListener("click", login);
}

// Login function
function login() {
  var email = document.querySelector("#exampleInputEmail1").value;
  var password = document.querySelector("#exampleInputPassword1").value;
  if (!email || !password) {
    return alert("A field is empty.")
  } else {
    auth.signInWithEmailAndPassword(email, password)
      .then(async (userCredential) => {
        // Signed in
        var user = userCredential.user;

        const userTypes = ["managers", "students", "lecturers"];

        for (let i = 0; i < userTypes.length; i++) {
          let userType = userTypes[i];
          let dbRef1 = firebase.database().ref("/" + userType);
          const snapshot = await dbRef1.orderByChild("userID").equalTo(user.uid).once("value");
          console.log(snapshot.val(), snapshot.key);
          if (snapshot.val()) {
            const encodedStr = btoa(email + "-" + password);
            localStorage.setItem("xoxo", encodedStr);
            // localStorage.setItem("userInfo", JSON.stringify(firebaseSnapshotToArrayOfObjects(snapshot.val())));
            break;
          }
        }

        localStorage.setItem("user", JSON.stringify(user));
        // ...
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        alert(errorMessage);
      });
  }
}

let whatToCreate = queryingURLParams("whatToCreate");
const whatToCreateLowercase = (whatToCreate) ? whatToCreate.toLowerCase() : "";
let whatToList = queryingURLParams("whatToList");
let whatToView = queryingURLParams("whatToView");
whatToCreate = whatToCreate || "Student";
whatToList = whatToList || "Students";
whatToView = whatToView;

if (window.location.href.includes("create.html")) {
  const form = document.querySelector('#creation');
  let nonAuthHTML = `<div class="form-group">
  <label for="exampleInputName1">Name</label>
  <input type="hidden" class="form-control" id="framework" name="framework">
  <input type="text" class="form-control" id="exampleInputName1" name="name" placeholder="Name">
  </div>
  <div class="form-group">
  <label for="description">Description</label>
  <textarea rows="8" class="form-control" id="description" name="description" placeholder="description"></textarea>
  </div>`;
  let authHTML = `<div class="form-group">
      <label for="exampleInputName1">Name</label>
      <input type="text" class="form-control" id="exampleInputName1" name="fullName" placeholder="Name">
    </div>
    <div class="form-group">
      <label for="exampleInputEmail3">Email address</label>
      <input type="email" class="form-control" id="exampleInputEmail3" name="email" placeholder="Email">
    </div>
    <div class="form-group">
      <label for="exampleInputPassword4">Password</label>
      <input type="password" class="form-control" id="exampleInputPassword4" name="password" placeholder="Password">
    </div>
    <div class="form-group">
      <label for="exampleSelectGender">Gender</label>
      <select class="form-control" id="exampleSelectGender" name="gender">
        <option>Male</option>
        <option>Female</option>
      </select>
    </div>`;
  let portfolioCreateHTML = `<div class="form-group">
  <label for="name">Name</label>
  <input type="text" class="form-control" id="name" name="name" placeholder="Name">
</div>
<div class="form-group">
  <label for="description">Description</label>
  <input type="text" class="form-control" id="description" name="description" placeholder="Email">
</div>
<div class="form-group">
  <label for="exampleSelectGender">Frameworks</label>`;

  let evidenceHTML = `<div class="form-group">
  <label for="exampleInputName1">Name</label>
  <input type="text" class="form-control" id="exampleInputName1" name="name" placeholder="Name">
  </div>
  <div class="form-group">
  <label for="description">Description</label>
  <textarea rows="8" class="form-control" id="description" name="description" placeholder="description"></textarea>
  </div>`;
  if (whatToCreate.toLowerCase() === "portfolio") {
    let selectStr = ` <select class="form-control" id="exampleSelectGender" name="framework">
    <option value="--">Select framework</option>`
    let dbReff1 = firebase.database().ref("frameworks");
    const snapshot1 = await dbReff1.once("value");
    console.log("Inside here, ", snapshot1.val());
    const framworkList = firebaseSnapshotToArrayOfObjects(snapshot1.val());
    for (let i = 0; i < framworkList.length; i++) {
      selectStr += `<option value="${framworkList[i].id}">${framworkList[i].name}</option>`
    }
    selectStr += `</select></div>`;
    portfolioCreateHTML += selectStr
    console.log(selectStr, portfolioCreateHTML, "========= Select str ===========")

    let selectStr1 = ` 
    <div class="form-group">
      <label for="exampleSelectManager">Manager</label>
      <select class="form-control" id="managers" name="manager">
      <option value="--">Select manager</option>`
    let dbReff = firebase.database().ref("managers");
    const snapshot = await dbReff.once("value");
    console.log("Inside here, ", snapshot.val());
    const managersList = firebaseSnapshotToArrayOfObjects(snapshot.val());
    for (let i = 0; i < managersList.length; i++) {
      selectStr1 += `<option value="${managersList[i].userID}">${managersList[i].fullName}</option>`
    }
    selectStr1 += `</select>
    </div>`;
    portfolioCreateHTML += selectStr1
    console.log(selectStr1, portfolioCreateHTML, "========= Select str ===========")
  }



  let pageTitleEles = document.getElementsByClassName("pageTitle");
  for (let i = 0; i < pageTitleEles.length; i++) {
    let il = pageTitleEles[i];
    console.log(il, "=========== il ===========")
    il.innerHTML = whatToCreate;
  }

  if (whatToCreate.toLowerCase() === "frameworks" || whatToCreate.toLowerCase() === "competencies") {
    nonAuthHTML += `
    <button type="submit" class="btn btn-gradient-primary me-2" id="createSubmit">Submit</button>
                      <button class="btn btn-light">Cancel</button>`
    form.innerHTML = nonAuthHTML;
    const frameworkID = queryingURLParams("framework");
    document.getElementById("framework").value = frameworkID;
  } else if (whatToCreateLowercase.includes("evidence")) {
    const competencyID = queryingURLParams("competency");
    evidenceHTML += `
      <input type="hidden" name="competency" value="${competencyID}" />
      <input type="hidden" name="file" id="linkbox" />
      <div class="form-group" id="fileBox">
        <label for="description">File Upload</label>
        <input type="file" class="form-control" id="fileUploader" name="fileBoxToBeRemoved">
      </div>
      <small id="fileMessage" style="
      display: block;
      margin-bottom: .5em !important;"></small>
      <button type="submit" disabled="true" class="btn btn-gradient-primary me-2" id="createSubmit">Submit</button>
      <button class="btn btn-light">Cancel</button>`;
    form.innerHTML = evidenceHTML;

  }
  else if (whatToCreate.toLowerCase() === "portfolio") {
    portfolioCreateHTML += `<button type="submit" class="btn btn-gradient-primary me-2" id="createSubmit">Submit</button>
    <button class="btn btn-light">Cancel</button>`;
    form.innerHTML = portfolioCreateHTML;
    // document.getElementById("frameworkSelect").innerHTML = ``

  } else {
    authHTML += `
    <button type="submit" class="btn btn-gradient-primary me-2" id="createSubmit">Submit</button>
                      <button class="btn btn-light">Cancel</button>`
    form.innerHTML = authHTML;
  }


  var createSubmit = document.querySelector("#createSubmit");
  createSubmit.addEventListener("click", create);

}

if (window.location.href.includes("view.html")) {
  let id = queryingURLParams("id");
  let dbRef1 = firebase.database().ref("/" + whatToView);
  const snapshot = await dbRef1.once("value");
  if (snapshot.val()) {
    let lol = firebaseSnapshotToArrayOfObjects(snapshot.val());
    let oobj = lol.filter(x => x.id === id)[0];
    console.log(snapshot.val(), snapshot.key, oobj, "++++++++++++++++++++++++++++");
  } else {
    alert("Nothing to show here.");
    window.location.href = `./list.html?whatToList=Competencies`;
  }

}



async function create(e) {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const userID = user.uid
    const message = whatToCreate.toUpperCase() + " successfully created.";
    const form = document.querySelector('#creation');
    let obj = Object.values(form).reduce((obj, field) => { obj[field.name] = field.value; return obj }, {});
    delete obj[""];
    if (whatToCreateLowercase.includes("evidence")) {
      delete obj.fileBoxToBeRemoved;
    }
    if (authCreateForUserTypes.includes(whatToCreate.toLowerCase())) {
      const lol = await firebase.auth().createUserWithEmailAndPassword(obj.email, obj.password);
      // Signed up 
      var createdUser = lol.user;
      obj.userID = createdUser.uid;
      whatToCreate += "s"
      // auth.signOut();
      const infoo = localStorage.getItem("xoxo");
      const dInfoo = atob(infoo).split("-");
      auth.signInWithEmailAndPassword(dInfoo[0], dInfoo[1]);
    }
    // delete obj.password;
    obj.createdBy = userID;
    console.log(obj, currenctUser)
    obj = removeNull(obj);
    const creationKey = firebase.database().ref('/' + whatToCreate.toLowerCase() + '/').push(obj);
    alert(message)
    form.reset();
    return false;
  } catch (error) {
    // form.reset();
    var errorMessage = error.message;
    alert(errorMessage);
  }
}



async function deleteItem(item) {
  console.log(item, "=========== item =================");
  var listRef = firebase.database().ref("/" + whatToList.toLowerCase());
  await listRef.child(item).remove();
  window.location.reload();
}

async function list() {
  const user = JSON.parse(localStorage.getItem("user"));
  const userInfoo = JSON.parse(localStorage.getItem("userInfo"))[0];
  const userType = localStorage.getItem("userType");
  const userID = user.uid
  console.log(whatToList, userID, "=============== list() ==============");
  var listRef = "";
  if (whatToList.toLowerCase() === "portfolio") {
    listRef = firebase.database().ref("/" + whatToList.toLowerCase());
    if(userType && userType.toLowerCase() == "students"){
      listRef = listRef.orderByChild("createdBy").equalTo(userID)
    } else if(userType && userType.toLowerCase() == "managers") {
      listRef = listRef.orderByChild("manager").equalTo(userID)
    }
    listRef.on('value', (snap) => {
      console.log(snap.val(), "===========-----------------");
      var lists = (snap.val()) ? firebaseSnapshotToArrayOfObjects(snap.val()).map(x => {
        delete x.createdBy
        delete x.whatToCreate;
        delete x.userID;
        return x;
      }) : [];
      console.log(lists);
      document.getElementById("tableLoading").style.display = "none";
      generateTableFromArray(lists);
      const deletebtns = document.getElementsByClassName("deletebtn");
      for (let i = 0; i < deletebtns.length; i++) {
        let btn = deletebtns[i];
        console.log(btn, "=========== btn =================");
        btn.addEventListener("click", (el) => {
          console.log(el, "=========== el ==========");
          let elID = el["target"].id;
          deleteItem(elID);
        });
      }
    });
  } else if(whatToList.toLowerCase() === "competencies") {
    const frameworkID = queryingURLParams("id");
    listRef = firebase.database().ref("/" + whatToList.toLowerCase());
    listRef = listRef.orderByChild("framework").equalTo(frameworkID)
    listRef.on('value', (snap) => {
      console.log(snap.val(), "===========-----------------");
      var lists = (snap.val()) ? firebaseSnapshotToArrayOfObjects(snap.val()).map(x => {
        delete x.createdBy
        delete x.whatToCreate;
        delete x.userID;
        return x;
      }) : [];
      console.log(lists);
      document.getElementById("tableLoading").style.display = "none";
      generateTableFromArray(lists);
      const deletebtns = document.getElementsByClassName("deletebtn");
      for (let i = 0; i < deletebtns.length; i++) {
        let btn = deletebtns[i];
        console.log(btn, "=========== btn =================");
        btn.addEventListener("click", (el) => {
          console.log(el, "=========== el ==========");
          let elID = el["target"].id;
          deleteItem(elID);
        });
      }
    });
  } else if(whatToList.toLowerCase() === "evidence") {
    const competency = queryingURLParams("id");
    if(userType && userType.toLowerCase() == "students") {
      const createBtnHTML = `<a href="./create.html?whatToCreate=Evidence&competency=${competency}" class="btn btn-primary mb-5 mt-3">Create evidence</a>`
      document.getElementById("createBtnInListView").innerHTML = createBtnHTML;
    }
    listRef = firebase.database().ref("/" + whatToList.toLowerCase());
    listRef = listRef.orderByChild("competency").equalTo(competency)
    listRef.on('value', (snap) => {
      console.log(snap.val(), "===========-----------------");
      var lists = (snap.val()) ? firebaseSnapshotToArrayOfObjects(snap.val()).map(x => {
        delete x.createdBy
        delete x.whatToCreate;
        delete x.userID;
        return x;
      }) : [];
      console.log(lists);
      document.getElementById("tableLoading").style.display = "none";
      generateTableFromArray(lists);
      const deletebtns = document.getElementsByClassName("deletebtn");
      for (let i = 0; i < deletebtns.length; i++) {
        let btn = deletebtns[i];
        console.log(btn, "=========== btn =================");
        btn.addEventListener("click", (el) => {
          console.log(el, "=========== el ==========");
          let elID = el["target"].id;
          deleteItem(elID);
        });
      }
    });
  }  else {
    listRef = firebase.database().ref("/" + whatToList.toLowerCase());
    listRef.on('value', (snap) => {
      console.log(snap.val(), "===========-----------------");
      var lists = (snap.val()) ? firebaseSnapshotToArrayOfObjects(snap.val()).map(x => {
        delete x.createdBy
        delete x.whatToCreate;
        delete x.userID;
        return x;
      }) : [];
      console.log(lists);
      document.getElementById("tableLoading").style.display = "none";
      generateTableFromArray(lists);
      const deletebtns = document.getElementsByClassName("deletebtn");
      for (let i = 0; i < deletebtns.length; i++) {
        let btn = deletebtns[i];
        console.log(btn, "=========== btn =================");
        btn.addEventListener("click", (el) => {
          console.log(el, "=========== el ==========");
          let elID = el["target"].id;
          deleteItem(elID);
        });
      }
    });
  }
}
if (window.location.href.includes("list.html")) {
  document.getElementById("listTableTitle").innerHTML = whatToList;
  await list();
}



function queryingURLParams(el) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(el);
}

function removeNull(obj) {
  const objVals = Object.values(obj);
  const objKeys = Object.keys(obj);
  for (let i = 0; i < objVals.length; i++) {
    let val = objVals[i];
    if (!val) {
      delete obj[objKeys[i]];
    }
  }
  return obj;
}

function firebaseSnapshotToArrayOfObjects(yourObject) {
  const arrayResult = Object.keys(yourObject).map(val => {
    if (val) {
      return { id: val, ...yourObject[val] }
    }
  });
  return arrayResult;
}


function generateTableFromArray(data) {
  let table = document.querySelector("table");
  if (data.length < 1) {
    table.innerHTML = "No data to show.";
    return;
  }
  table.classList.add("table");
  table.classList.add("table-striped");
  let keyz = Object.keys(data[0]);
  generateTableHead(table, keyz);
  generateTable(table, data);
}

function generateTableHead(table, data) {
  let thead = table.createTHead();
  let row = thead.insertRow();
  for (let key of data) {
    let th = document.createElement("th");
    let text = document.createTextNode(key);
    th.appendChild(text);
    row.appendChild(th);
  }
}


function generateTable(table, data) {
  for (let element of data) {
    let row = table.insertRow();
    for (let key in element) {
      let cell = row.insertCell();
      let text = document.createTextNode(element[key]);
      cell.appendChild(text);
    }
    let cellAction = row.insertCell();
    if (whatToList.toLowerCase() === "frameworks") {
      cellAction.innerHTML = `<a href="./list.html?whatToList=Competencies&id=${element.id}" class="btn btn-info viewbtn" id="${element.id}" >View</a> <a href="./create.html?edit=true&whatToEdit=${whatToCreate}&id=${element.id}" class="btn btn-primary editbtn" id="${element.id}" >Edit</a>  <span class="btn btn-danger deletebtn" id="${element.id}">Delete</span>`;
    } else if (whatToList.toLowerCase() === "competencies") {
      cellAction.innerHTML = `<a href="./list.html?whatToList=Evidence&id=${element.id}" class="btn btn-info viewbtn" id="${element.id}" >View</a> <a href="./create.html?edit=true&whatToEdit=${whatToCreate}&id=${element.id}" class="btn btn-primary editbtn" id="${element.id}" >Edit</a>  <span class="btn btn-danger deletebtn" id="${element.id}">Delete</span>`;
    } else if (whatToList.toLowerCase() === "portfolio") {
      cellAction.innerHTML = `<a href="./list.html?whatToList=Competencies&id=${element.framework}" class="btn btn-info viewbtn" id="${element.id}" >View</a> <a href="./create.html?edit=true&whatToEdit=${whatToCreate}&id=${element.id}" class="btn btn-primary editbtn" id="${element.id}" >Edit</a>  <span class="btn btn-danger deletebtn" id="${element.id}">Delete</span>`;
    } else {
      cellAction.innerHTML = `<a href="./view.html?whatToView=${whatToList}&id=${element.id}" class="btn btn-info viewbtn" id="${element.id}" >View</a> <a href="./create.html?edit=true&whatToEdit=${whatToCreate}&id=${element.id}" class="btn btn-primary editbtn" id="${element.id}" >Edit</a>  <span class="btn btn-danger deletebtn" id="${element.id}">Delete</span>`;
    }
  }
}



function handleFileSelect(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  var file = evt.target.files[0];

  var metadata = {
    'contentType': file.type
  };

  // Push to child path.
  storageRef.child('evidences/' + file.name).put(file, metadata).then(function (snapshot) {
    console.log('Uploaded', snapshot.totalBytes, 'bytes.');
    console.log('File metadata:', snapshot.metadata);
    // Let's get a download URL for the file.
    snapshot.ref.getDownloadURL().then(function (url) {
      console.log('File available at', url);
      document.getElementById('linkbox').value = url;
      document.getElementById('fileMessage').innerHTML = '<a href="' + url + '">Click For File</a>';
      document.getElementById("createSubmit").disabled = false;
    });
  }).catch(function (error) {
    console.error('Upload failed:', error);
  });
}
if (window.location.href.includes("create.html") && whatToCreateLowercase.includes("evidence")) {
  document.getElementById('fileUploader').addEventListener('change', handleFileSelect, false);
}
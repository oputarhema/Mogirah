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

const correctNamesForHeaders = {
  Competencies: {
    name: "area",
    description: "competency"
  }
}

const inputOptions = {
  'strongly_agree': 'Strongly Agree',
  'agree': 'Agree',
  'neutral': 'Neutral',
  'disagree': 'Disagree',
  'strongly_disagree': 'Strongly Disagree'
};

const gradesObj = {
  "A1": "A1", 
  "A2": "A2", 
  "A3": "A3", 
  "A4": "A4", 
  "A5": "A5", 
  "B1": "B1", 
  "B2": "B2", 
  "B3": "B3", 
  "C1": "C1", 
  "C2": "C2", 
  "C3": "C3", 
  "D1": "D1", 
  "D2": "D2", 
  "D3": "D3", 
  "E1": "E1", 
  "E2": "E2", 
  "E3": "E3", 
  "F1": "F1", 
  "F2": "F2", 
  "F3": "F3", 
  "G1": "G1", 
  "G2": "G2", 
  "H": "H"
}

let itemToEditObj;

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
          if (!userInfo.changedPassword && !window.location.href.includes("/auth") && window.location.href.includes("logout")) {
            return window.location.href = "/pages/auth/change_password.html?email=" + userInfo.email;
          }
          console.log(userInfo, window.location.href === (window.location.origin + "/"), "=============++++++++++++ userInfo ++++++++++++============")
          localStorage.setItem("userInfo", JSON.stringify(userInfo));
          localStorage.setItem("userType", userType);
          if (!window.location.href.includes("/pages/") || window.location.href.includes("/auth/index.html") || window.location.href === (window.location.origin + "/")) {
            window.location.href = "/pages/" + userType + "/index.html";
          }
        }
      } catch (err) {
        console.log(err, "============ Err ============")
        // window.location.href = "/pages/"+userType+"/index.html";
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
    if (!window.location.href.includes("/auth") || window.location.href.includes("logout.html")) {
      window.location.href = "/pages/auth/index.html"; // Redirects user to login page
    }
  }
});


// This function is responsible for signing out of the platform.
function clickSignoutButton() {
  localStorage.clear();
  auth.signOut();
}

if (window.location.href.includes("/logout.html")) {
  clickSignoutButton();
}



// Conditional statement to restrict 
if (window.location.href.includes("/auth/index.html")) {
  // This fetches the HTML Elements
  var signInBtn = document.querySelector("#signInBTN");
  signInBtn.addEventListener("click", login);
  console.log(window.location.href === window.location.origin, window.location.href, window.location.origin)
}
// else if(!window.location.href.includes("auth") && window.location.href !== window.location.origin + "/") {
//   const userInf = JSON.parse(localStorage.getItem("user"));
//   document.getElementById("changePassword").href = "../auth/change_password.html?email="+userInf.email;
// }

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
            localStorage.setItem("userInfo", JSON.stringify(firebaseSnapshotToArrayOfObjects(snapshot.val())));
            break;
          }
        }

        localStorage.setItem("user", JSON.stringify(user));
        window.location.href = "/";
        // ...
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        alert(errorMessage);
      });
  }
}

const changePassword = () => {
  const currentPassword = document.getElementById("currentPassword").value
  const newPassword = document.getElementById("newPassword").value;
  let user = JSON.parse(localStorage.getItem("user"));
  let email = user ? user.email : null;
  email = email || document.getElementById("email").value;
  reauthenticate(email, currentPassword).then(() => {
    var user = firebase.auth().currentUser;
    user.updatePassword(newPassword).then(async () => {
      console.log("Password updated!");
      alert("Password updated!");
      // update user record
      user.changedPassword = true;
      const userType = localStorage.getItem("userType");
      let showo = firebase.database().ref(userType + '/').orderByChild("userID").equalTo(user.uid);
      showo = await showo.once("value");
      console.log(showo.val(), "============== showo.val() ==============")
      showo = firebaseSnapshotToArrayOfObjects(showo.val())
      const showobj = showo[0];
      console.log(showobj, "============== showobj =============")
      firebase.database().ref(userType + '/' + showobj.id).set({
        ...showobj,
        password: newPassword,
        changedPassword: true
      });
      window.location.href = "/";
    }).catch((error) => {
      alert(error);
      console.log(error);
    });
  }).catch((error) => {
    alert(error);
    console.log(error);
  });
}

const reauthenticate = (email, currentPassword) => {
  var user = firebase.auth().currentUser;
  console.log(user)
  var cred = firebase.auth.EmailAuthProvider.credential(
    email, currentPassword);
  return user.reauthenticateWithCredential(cred);
}

// Conditional statement to restrict 
if (window.location.href.includes("/auth/change_password.html")) {
  // This fetches the HTML Elements
  const email = queryingURLParams("email");
  if (email) {
    document.getElementById("email").value = email;
    document.getElementById("email").disabled = true;
  }
  var changePasswordBTN = document.querySelector("#changePasswordBTN");
  changePasswordBTN.addEventListener("click", changePassword);
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
  const actionIsh = queryingURLParams("action");
  if (actionIsh && actionIsh.toLowerCase() === "edit") {
    const id = queryingURLParams("id");
    const llo = (authCreateForUserTypes.includes(whatToCreate.toLowerCase())) ? whatToCreate.toLowerCase() + "s" : whatToCreate.toLowerCase()
    const listRef = firebase.database().ref("/" + llo).orderByKey().equalTo(id);
    const snapshot = await listRef.once("value");
    if (snapshot.val()) {
      const arr = firebaseSnapshotToArrayOfObjects(snapshot.val());
      const obj = arr[0];
      itemToEditObj = obj;
      delete obj.id;
      delete obj.createdBy;
      const objKeys = Object.keys(obj);
      const objVals = Object.values(obj);
      for (let i = 0; i < objKeys.length; i++) {
        console.log(objKeys[i], objVals[i], "++++++++++++++++++++++")
        let input = document.querySelector(`[name=${objKeys[i]}]`);
        if (objKeys[i] === "email") input.disabled = true;
        console.log(input);
        if(input) input.value = objVals[i];
        if (objKeys[i].toLowerCase === "file") {
          const url = objVals[i];
          document.getElementById('linkbox').value = url;
          document.getElementById('fileMessage').innerHTML = '<a href="' + url + '">Click For File</a>';
        }
      }
      console.log(objKeys, objVals, "============================");
    }
    let createOrEditEles = document.getElementsByClassName("createOrEdit");
    for (let i = 0; i < createOrEditEles.length; i++) {
      let il = createOrEditEles[i];
      console.log(il, "=========== il ===========")
      il.innerHTML = "Edit";
    }
    createSubmit.addEventListener("click", edit);
  } else {
    createSubmit.addEventListener("click", create);
  }

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
    obj.createdAt = new Date().toISOString();
    console.log(obj, currenctUser ,"=============== 470 ================================")
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

async function edit() {
  try {
    const editID = queryingURLParams("id");
    const message = whatToCreate.toUpperCase() + " successfully edited.";
    const form = document.querySelector('#creation');
    let obj = Object.values(form).reduce((obj, field) => { obj[field.name] = field.value; return obj }, {});
    delete obj[""];
    if (whatToCreateLowercase.includes("evidence")) {
      delete obj.fileBoxToBeRemoved;
    }
    console.log(obj, "============== obj ========== edited =========")
    if (authCreateForUserTypes.includes(whatToCreateLowercase)) {
      const lol = await firebase.auth().createUserWithEmailAndPassword(obj.email, obj.password);
      // Signed up 
      var createdUser = lol.user;
      obj.userID = createdUser.uid;
      whatToCreate += "s";
      // auth.signOut();
      const infoo = localStorage.getItem("xoxo");
      const dInfoo = atob(infoo).split("-");
      auth.signInWithEmailAndPassword(dInfoo[0], dInfoo[1]);
    }
    console.log(obj, currenctUser)
    obj = removeNull(obj);
    obj.updatedAt = new Date().toISOString();
    const editObj = {
      ...itemToEditObj,
      ...obj
    }
    console.log(editObj, "======+++++++++------ editObj")
    const creationKey = firebase.database().ref('/' + whatToCreate.toLowerCase() + '/' + editID).set(editObj);
    alert(message)
    form.reset();
    return false;
  } catch (error) {
    // form.reset();
    console.log(error.message, "======== error ============")
    var errorMessage = error.message;
    alert(errorMessage);
  }
}



async function deleteItem(item) {
  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  }).then(async (result) => {
    if (result.isConfirmed) {
      console.log(item, "=========== item =================");
      var listRef = firebase.database().ref("/" + whatToList.toLowerCase());
      await listRef.child(item).remove();
      // const lol = ["students", "lecturers", "managers"]
      // if(lol.includes(whatToList.toLowerCase())) {
      //   var user = firebase.auth().currentUser;
      //   await user.updateEmail(`money@qa.team`)

      // }
      Swal.fire(
        'Deleted!',
        'Record has been deleted.',
        'success'
      )
    }
  });
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
    if (userType && userType.toLowerCase() == "students") {
      listRef = listRef.orderByChild("createdBy").equalTo(userID)
    } else if (userType && userType.toLowerCase() == "managers") {
      listRef = listRef.orderByChild("manager").equalTo(userID)
    }
    listRef.on('value', (snap) => {
      console.log(snap.val(), "===========-----------------");
      var lists = (snap.val()) ? firebaseSnapshotToArrayOfObjects(snap.val()) : [];
      lists.map(x => {
        if(whatToList.toLowerCase() !== "portfolio") {
          delete obj.createdBy;
        }
        delete x.whatToCreate;
        delete x.userID;
        delete x.changedPassword;
        return x;
      })
      
      document.getElementById("tableLoading").style.display = "none";
      generateTableFromArray(lists).then(() => {
        const deletebtns = document.getElementsByClassName("deletebtn");
        for (let i = 0; i < deletebtns.length; i++) {
          let btn = deletebtns[i];
          console.log("this is btn, ", btn)
          btn.addEventListener("click", (el) => {
            let elID = el["target"].id;
            deleteItem(elID);
          });
        }
      });
    });
  } else if (whatToList.toLowerCase() === "competencies") {
    const frameworkID = queryingURLParams("id");
    console.log(frameworkID, "_----------------+++++++======")
    if (userType && userType.toLowerCase() == "lecturers") {
      const createBtnHTML = `<a href="./create.html?whatToCreate=Competencies&framework=${frameworkID}" class="btn btn-primary mb-5 mt-3">Create Competency</a>`
      document.getElementById("createBtnInListView").innerHTML = createBtnHTML;
    }
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
      generateTableFromArray(lists).then(() => {
        const deletebtns = document.getElementsByClassName("deletebtn");
        for (let i = 0; i < deletebtns.length; i++) {
          let btn = deletebtns[i];
          console.log("this is btn, ", btn)
          btn.addEventListener("click", (el) => {
            let elID = el["target"].id;
            deleteItem(elID);
          });
        }
      });
    });
  } else if (whatToList.toLowerCase() === "evidence") {
    const competency = queryingURLParams("id");
    if (userType && userType.toLowerCase() == "students") {
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
      generateTableFromArray(lists).then(() => {
        const deletebtns = document.getElementsByClassName("deletebtn");
        for (let i = 0; i < deletebtns.length; i++) {
          let btn = deletebtns[i];
          console.log("this is btn, ", btn)
          btn.addEventListener("click", (el) => {
            let elID = el["target"].id;
            deleteItem(elID);
          });
        }
      });
    });
  } else {
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
      generateTableFromArray(lists).then(() => {
        const deletebtns = document.getElementsByClassName("deletebtn");
        for (let i = 0; i < deletebtns.length; i++) {
          let btn = deletebtns[i];
          console.log("this is btn, ", btn)
          btn.addEventListener("click", (el) => {
            let elID = el["target"].id;
            deleteItem(elID);
          });
        }
      });
    });
  }
}
const openCommentBox = async (el) => {
  let elID = el["target"].id;
  console.log(el, elID, "===========+++++++++++++++------------")
  const { value: rating } = await Swal.fire({
    title: 'Rate artifact',
    input: 'select',
    inputOptions,
    inputPlaceholder: 'Rating',
    showCancelButton: true,
    inputValidator: (value) => {
      return new Promise((resolve) => {
        if (value) {
          resolve();
        } else {
          resolve('You need to rate evidence :)')
        }
      })
    }
  })

  if (rating) {
    const { value: text } = await Swal.fire({
      input: 'textarea',
      inputLabel: 'Comment',
      inputPlaceholder: 'Drop your comment here',
      inputAttributes: {
        'aria-label': 'Drop your comment here'
      },
      showCancelButton: true
    })

    if (text) {
      const commentData = {
        rating,
        message: text
      }
      firebase.database().ref('/evidence/' + elID + '/comment').set(commentData);
      console.log(commentData, "============== commentData ==============");
      Swal.fire("Thank you for dropping your comment!");
    }
  }
}

const openGradingBox = async (el) => {
  // id on the html tag will be a concantenation of competency and student id
  let elID = el["target"].id;
  const competency = elID;
  const student = queryingURLParams("stu");
  console.log(el, elID, "===========+++++++++++++++------------")
  const { value: grade } = await Swal.fire({
    title: 'Grade competency',
    input: 'select',
    inputOptions: gradesObj,
    inputPlaceholder: 'Grade',
    showCancelButton: true,
    inputValidator: (value) => {
      return new Promise((resolve) => {
        if (value) {
          resolve();
        } else {
          resolve('You need to grade :)')
        }
      });
    }
  })

  if (grade) {
    const { value: remark } = await Swal.fire({
      input: 'textarea',
      inputLabel: 'Remarks',
      inputPlaceholder: 'Drop your remarks here',
      inputAttributes: {
        'aria-label': 'Drop your remarks here'
      },
      showCancelButton: true
    });
    if(remark) {
      const oj = {
        score: grade,
        remark,
        competency,
        student
      }
      firebase.database().ref('/grading/').push(oj);
      Swal.fire("Thank you for grading!");
      list();
    }
  }
}

if (window.location.href.includes("list.html")) {
  if(whatToList.toLowerCase() === "evidence") {
    document.getElementById("listTableTitle").innerHTML = "Artifacts";
  } else {
    document.getElementById("listTableTitle").innerHTML = whatToList;
  }
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

async function generateTableFromArray(data) {
  data = makeAllObjectsInArrayHaveTheSameKeys(data);
  let table = document.querySelector("table");
  table.innerHTML = "";
  if (data.length < 1) {
    table.innerHTML = "No data to show.";
    return;
  }
  table.classList.add("table");
  table.classList.add("table-striped");
  generateTableHead(table, data[0]);
  await generateTable(table, data);
}

function generateTableHead(table, data) {
  let thead = table.createTHead();
  let row = thead.insertRow();
  data = restructureObj(data);
  data = Object.keys(data);
  for (let key of data) {
    let th = document.createElement("th");
    if(key.toLowerCase() === "comment") {
      key = "Manager's comment"
    }
    let text = document.createTextNode(key);
    th.appendChild(text);
    row.appendChild(th);
  }
}


// This handles the table listing and buttons on each row of the table
// It handles the priviledges of what to show to who.
async function generateTable(table, data) {
  const userType = localStorage.getItem("userType");
  let index = 0;
  for (let element of data) {
    element = restructureObj(element);
    let elementID = element.id;
    let elementFr = element.framework;
    let elementCo = element.competency;
    let createdBy = element.createdBy;

    let row = table.insertRow();
    for (let key in element) {
      let cell = row.insertCell();
      let text;
      if (key.toLowerCase() === "id") {
        console.log(index)
        element[key] = String(index + 1);
      }
      if (element[key]) {
        if (key.toLowerCase() === "framework") {
          console.log(key, element[key], "================");
          let dbRef1 = firebase.database().ref("/frameworks");
          const snapshot = await dbRef1.orderByKey().equalTo(element[key]).once("value");
          if (snapshot.val()) {
            const oo = firebaseSnapshotToArrayOfObjects(snapshot.val());
            console.log(oo);
            element[key] = oo[0].name || "N/A";
          } else {
            element[key] = "N/A";
          }
        } else if (key.toLowerCase() === "competency") {
          let dbRef1 = firebase.database().ref("/competencies");
          const snapshot = await dbRef1.orderByKey().equalTo(element[key]).once("value");
          if (snapshot.val()) {
            const oo = firebaseSnapshotToArrayOfObjects(snapshot.val());
            console.log(oo);
            element[key] = oo[0].name || oo[0].area || "N/A";
          } else {
            element[key] = "N/A";
          }
        } else if (key.toLowerCase() === "manager") {
          let dbRef1 = firebase.database().ref("/managers");
          const snapshot = await dbRef1.orderByKey().equalTo(element[key]).once("value");
          console.log(snapshot.val(), snapshot.key);
          if (snapshot.val()) {
            const oo = firebaseSnapshotToArrayOfObjects(snapshot.val());
            console.log(oo);
            element[key] = oo[0].fullName || "N/A";
          } else {
            element[key] = "N/A";
          }
        } else if (key.toLowerCase() === "createdby") {
          console.log("inside here for created by.")
          let dbRef1 = firebase.database().ref("/students");
          const snapshot = await dbRef1.orderByChild("userID").equalTo(element[key]).once("value");
          console.log(snapshot.val(), snapshot.key);
          if (snapshot.val()) {
            const oo = firebaseSnapshotToArrayOfObjects(snapshot.val());
            console.log(oo);
            element[key] = oo[0].fullName || "N/A";
          } else {
            element[key] = "N/A";
          }
        }
      } else {
        element[key] = "N/A";
      }
      if (String(element[key]).startsWith("https://")) {

        // Create anchor element.
        var a = document.createElement('a');

        // Create the text node for anchor element.
        var link = document.createTextNode("Click here to view");

        // Append the text node to anchor element.
        a.appendChild(link);

        // Set the title.
        a.title = "Click here to view";

        // Set the href property.
        a.href = element[key];
        text = a;
      } else {
        let textt = element[key];
        if(key.toLowerCase() === "comment") {
          textt = `
          Rating: ${inputOptions[element[key].rating]} \n
          Comment: ${element[key].message}`
        }
        if(key.toLowerCase() === "grade") {
          let student = queryingURLParams("stu");
          let dbRef1 = firebase.database().ref("/grading");
          const snapshot = await dbRef1
          .orderByChild("competency").equalTo(elementID)
          .once("value");
          console.log(elementID, snapshot.val(), "===================+++++++++++++++++")
          if (snapshot.val()) {
            console.log(snapshot.val())
            const ooo = firebaseSnapshotToArrayOfObjects(snapshot.val());
            console.log(ooo, "================= ooo ==============")
            const ooobj = ooo.filter(x => {
              return x.student === student
            });
            console.log(ooobj, "=====+++++++++++++========= ooobj")
            const llen = ooobj.length;
            if(ooobj.length > 0) {
              textt = `
              Score: ${gradesObj[ooobj[llen-1].score] || "N/A"} \n
              Remarks: ${ooobj[llen-1].remark || "N/A"}`
            } else {
              textt = `
                Score: N/A \n
                Remarks: N/A`
            }
          } else {
            textt = `
            Score: N/A \n
            Remarks: N/A`
          }
          
        }
        if(key.includes("At")) {
          console.log(element[key], `${key} =============`)
          textt = formatDate(element[key]);
          console.log(textt, "============ textt ==============");
        }
        text = document.createTextNode(textt);
      }
      cell.appendChild(text);
    }
    let cellAction = row.insertCell();
    let editt = whatToList
    if (whatToList.toLowerCase() === "students" || whatToList.toLowerCase() === "managers" || whatToList.toLowerCase() === "lecturers") {
      editt = editt.slice(0, -1);
    }
    if (whatToList.toLowerCase() === "frameworks") {
      cellAction.innerHTML = `<a href="./list.html?whatToList=Competencies&id=${elementID}" class="btn btn-info viewbtn" id="${elementID}" >View</a> 
      <a href="./create.html?action=edit&whatToCreate=${editt}&id=${elementID}" class="btn btn-primary editbtn" id="${elementID}" >Edit</a>  
      <span class="btn btn-danger deletebtn" id="${elementID}">Delete</span>`;
    } else if (whatToList.toLowerCase() === "competencies") {
      const from = queryingURLParams("from");
      if (userType === "students" || userType === "managers") {
        cellAction.innerHTML = `<a href="./list.html?whatToList=Evidence&id=${elementID}" class="btn btn-info viewbtn" id="${elementID}" >View</a> `;
      } else {
        if(from && from.toLowerCase() === "portfolio") {
          cellAction.innerHTML = `
          <a href="./list.html?whatToList=Evidence&id=${elementID}" class="btn btn-info viewbtn" id="${elementID}" >View</a> 
          <span id="${elementID}" class="swal btn btn-secondary">Grade +</span>`
          const commentBtns = document.querySelectorAll("span.swal");
          for (let o = 0; o < commentBtns.length; o++) {
            commentBtns[o].addEventListener("click", openGradingBox)
          }
        } else {
          cellAction.innerHTML = `
          <a href="./create.html?action=edit&whatToCreate=${editt}&id=${elementID}" class="btn btn-primary editbtn" id="${elementID}" >Edit</a>  
          <span class="btn btn-danger deletebtn" id="${elementID}">Delete</span>`;
        }
      }
    } else if (whatToList.toLowerCase() === "portfolio") {
      if (userType === "managers" || userType === "lecturers") {
        cellAction.innerHTML = `<a href="./list.html?whatToList=Competencies&id=${elementFr}&from=portfolio&stu=${createdBy}" class="btn btn-info viewbtn" id="${elementID}" >View</a>`;
      } else {
        cellAction.innerHTML = `<a href="./list.html?whatToList=Competencies&id=${elementFr}&from=portfolio" class="btn btn-info viewbtn" id="${elementID}" >View</a> 
        <a href="./create.html?action=edit&whatToCreate=${editt}&id=${elementID}" class="btn btn-primary editbtn" id="${elementID}" >Edit</a>  
        <span class="btn btn-danger deletebtn" id="${elementID}">Delete</span>`;
      }
    } else if (whatToList.toLowerCase() === "evidence") {
      if (userType === "managers") {
        cellAction.innerHTML = `
        <span id="${elementID}" class="swal btn btn-secondary">Comment</span>`;
        const commentBtns = document.querySelectorAll("span.swal");
        for (let o = 0; o < commentBtns.length; o++) {
          commentBtns[o].addEventListener("click", openCommentBox)
        }
      } else if(userType === "lecturers") {
        cellAction.innerHTML = "";
      } else {
        cellAction.innerHTML = `
        <a href="./create.html?action=edit&whatToCreate=${editt}&id=${elementID}" class="btn btn-primary editbtn" id="${elementID}" >Edit</a>  
        <span class="btn btn-danger deletebtn" id="${elementID}">Delete</span>`;
      }
    } else {
      cellAction.innerHTML = `
      <a href="./create.html?action=edit&whatToCreate=${editt}&id=${elementID}" class="btn btn-primary editbtn" id="${elementID}" >Edit</a>  
      <span class="btn btn-danger deletebtn" id="${elementID}">Delete</span>`;
    }
    index++;
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




const restructureObj = (obj) => {
  const keys = Object.keys(obj);
  let arr = [];
  let newObj = {}
  for (let i = 0; i < keys.length; i++) {
    if (keys[i].toLowerCase() === "name") {
      arr.splice(1, 0, keys[i]);
    } else if (keys[i].toLowerCase() === "description") {
      arr.splice(2, 0, keys[i]);
    } else {
      arr.push(keys[i])
    }
  }
  for (let j = 0; j < arr.length; j++) {
    newObj[arr[j]] = obj[arr[j]]
  }
  return newObj;
}

const makeAllObjectsInArrayHaveTheSameKeys = (arr) => {
  // const newarr = [];
  const rrr = [];
  for (let i = 0; i < arr.length; i++) {
    let x = arr[i];
    let obj = Object.keys(x);
    rrr.push(...obj);
  }

  console.log(rrr);

  let newModel = [...new Set(rrr)];
  console.log(newModel)
  const newarr = arr.map(x => {
    let newObj = {};
    for (let i = 0; i < newModel.length; i++) {
      let ky = newModel[i];
      newObj[ky] = x[ky] || ""
      if (ky === "changedPassword") {
        newObj[ky] = x[ky] || false
      }
    }
    return newObj;
  })
  console.log(newarr, "============= newarr");
  return newarr;
}

const formatDate = (iso) => {
  var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  var dt  = new Date(iso).toLocaleDateString("en-US", options);
  if(dt !== "Invalid Date") {
    return dt;
  } else {
    return "N/A";
  }
}

const dashboardCounts = async () => {
  const userType = localStorage.getItem("userType");
  const user = JSON.parse(localStorage.getItem("user"));
  const userID = user.uid
  if(userType === "lecturers") {
    const boxes = ["students", "managers", "frameworks"];
    for(let i=0; i<boxes.length; i++) {
      let dbRef1 = firebase.database().ref("/"+boxes[i]);
      let snapshot = await dbRef1.once("value");
      console.log(snapshot.val(), snapshot.numChildren(), "============")
      document.getElementById(boxes[i]+"Count").innerHTML = snapshot.numChildren();
    }
  } else if(userType === "students") {
    // portfolios created
    let listRef = firebase.database().ref("/portfolio");
    let snapshot = await listRef.orderByChild("createdBy").equalTo(userID).once("value");
    console.log(snapshot.val(), snapshot.numChildren(), "============")
    document.getElementById("portfolioCount").innerHTML = snapshot.numChildren();
  } else {
    // portfolios created
    let listRef = firebase.database().ref("/portfolio");
    let snapshot = await listRef.orderByChild("manager").equalTo(userID).once("value");
    console.log(snapshot.val(), snapshot.numChildren(), "============")
    document.getElementById("portfolioCount").innerHTML = snapshot.numChildren();
  }
}
dashboardCounts();
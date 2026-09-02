import { auth } from "./firebase.js";

import {
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const signupForm = document.getElementById("signupForm");

signupForm.addEventListener("submit", async function(event){

    event.preventDefault();

    const email = document.getElementById("email").value;

    const password = document.getElementById("password").value;

    try{

        await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        alert("登録が完了しました！");

        window.location.href = "login.html";

    }catch(error){

        alert(error.message);

    }

});
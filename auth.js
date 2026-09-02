import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// =========================
// HTML要素
// =========================

const loginForm =
    document.getElementById("loginForm");

const signupForm =
    document.getElementById("signupForm");

const showLoginButton =
    document.getElementById("showLoginButton");

const showSignupButton =
    document.getElementById("showSignupButton");


// =========================
// ログイン画面を表示
// =========================

showLoginButton.addEventListener("click", () => {

    loginForm.style.display = "block";

    signupForm.style.display = "none";


    showLoginButton.classList.add("active");

    showSignupButton.classList.remove("active");

});


// =========================
// 新規登録画面を表示
// =========================

showSignupButton.addEventListener("click", () => {

    loginForm.style.display = "none";

    signupForm.style.display = "block";


    showSignupButton.classList.add("active");

    showLoginButton.classList.remove("active");

});


// =========================
// ログイン
// =========================

loginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const email =
            document
                .getElementById("loginEmail")
                .value
                .trim();


        const password =
            document
                .getElementById("loginPassword")
                .value;


        try {

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


            alert("ログイン成功！");


            window.location.href =
                "index.html";


        } catch (error) {

            console.error(error);


            alert(
                "ログイン失敗：" +
                error.message
            );

        }

    }
);


// =========================
// 新規登録
// =========================

signupForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const email =
            document
                .getElementById("signupEmail")
                .value
                .trim();


        const password =
            document
                .getElementById("signupPassword")
                .value;


        const agreeTerms =
            document
                .getElementById("agreeTerms");


        // 利用規約に同意しているか確認
        if (!agreeTerms.checked) {

            alert(
                "利用規約とプライバシーポリシーに同意してください"
            );

            return;

        }


        try {

            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );


            alert(
                "アカウントを作成しました！"
            );


            window.location.href =
                "index.html";


        } catch (error) {

            console.error(error);


            alert(
                "新規登録に失敗しました：" +
                error.message
            );

        }

    }
);
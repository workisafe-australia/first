import { db, auth } from "./firebase.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// =========================
// Cloudinary
// =========================

const cloudName = "pebocjzw";
const uploadPreset = "sidohori_unsigned";


// =========================
// HTML要素
// =========================

const communityForm =
    document.getElementById("communityForm");

const imageInput =
    document.getElementById("images");


// 二重投稿防止
let isSubmitting = false;


// =========================
// 投稿
// =========================

communityForm.addEventListener("submit", async (event) => {

    event.preventDefault();


    // 二重投稿防止
    if (isSubmitting) {
        return;
    }


    // ログイン確認
    if (!auth.currentUser) {

        alert("ログインしてください");

        window.location.href = "login.html";

        return;
    }


    // 写真取得
    const files = Array.from(imageInput.files);


    // 最大3枚
    if (files.length > 3) {

        alert("写真は最大3枚までです");

        return;
    }


    // 投稿処理開始
    isSubmitting = true;

    const submitButton =
        communityForm.querySelector('button[type="submit"]');

    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "投稿中...";
    }


    try {

        const imageUrls = [];


        // =========================
        // 写真をCloudinaryへ
        // =========================

        for (const file of files) {

            const formData = new FormData();


            formData.append(
                "file",
                file
            );


            formData.append(
                "upload_preset",
                uploadPreset
            );


            const response = await fetch(

                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,

                {
                    method: "POST",
                    body: formData
                }

            );


            if (!response.ok) {

                throw new Error(
                    "画像のアップロードに失敗しました"
                );

            }


            const data =
                await response.json();


            imageUrls.push(
                data.secure_url
            );

        }


        // =========================
        // Firestoreへ保存
        // =========================

        await addDoc(
            collection(db, "communityPosts"),
            {

                uid:
                    auth.currentUser.uid,

                title:
                    document
                        .getElementById("title")
                        .value
                        .trim(),

                category:
                    document
                        .getElementById("category")
                        .value,

                content:
                    document
                        .getElementById("content")
                        .value
                        .trim(),

                // 写真URL
                imageUrls:
                    imageUrls,

                createdAt:
                    serverTimestamp()

            }
        );


        alert("情報を投稿しました！");


        window.location.href =
            "index.html";


    } catch (error) {

        console.error(error);


        alert(
            "投稿に失敗しました：" +
            error.message
        );


        // 失敗した場合はもう一度投稿できるようにする
        isSubmitting = false;


        if (submitButton) {

            submitButton.disabled = false;

            submitButton.textContent = "投稿する";

        }

    }

});
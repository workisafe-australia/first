import { db, auth } from "./firebase.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// Cloudinary
const cloudName = "pebocjzw";
const uploadPreset = "sidohori_unsigned";


const postForm = document.getElementById("postForm");

let isSubmitting = false;
postForm.addEventListener("submit", async (event) => {

    event.preventDefault();
    if (isSubmitting) {
        return;
    }
    
    isSubmitting = true;
    
    const submitButton = postForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = "投稿中...";


    if (!auth.currentUser) {

        alert("ログインしてください");

        window.location.href = "login.html";

        return;
    }


    // 写真を取得
    const imageInput =
        document.getElementById("images");

    const files =
        Array.from(imageInput.files);


    // 3枚を超えたら終了
    if (files.length > 3) {

        alert("写真は最大3枚までです");

        return;
    }


    try {

        const imageUrls = [];


        // =========================
        // 写真をCloudinaryへ送る
        // =========================

        for (const file of files) {

            const formData =
                new FormData();

            formData.append(
                "file",
                file
            );

            formData.append(
                "upload_preset",
                uploadPreset
            );


            const response =
                await fetch(
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
        // Firestoreへ求人を保存
        // =========================

        await addDoc(
            collection(db, "posts"),
            {

                uid:
                    auth.currentUser.uid,

                email:
                    auth.currentUser.email,


                companyName:
                    document
                        .getElementById(
                            "companyName"
                        )
                        .value,

                jobTitle:
                    document
                        .getElementById(
                            "jobTitle"
                        )
                        .value,

                location:
                    document
                        .getElementById(
                            "location"
                        )
                        .value,

                workConditions:
                    document
                        .getElementById(
                            "workConditions"
                        )
                        .value,

                jobDetails:
                    document
                        .getElementById(
                            "jobDetails"
                        )
                        .value,

                applicationInfo:
                    document
                        .getElementById(
                            "applicationInfo"
                        )
                        .value,

                notes:
                    document
                        .getElementById(
                            "notes"
                        )
                        .value,


                // 写真URL
                imageUrls:
                    imageUrls,


                createdAt:
                    serverTimestamp()

            }
        );


        alert(
            "求人を掲載しました！"
        );


        window.location.href =
            "./index.html";


    } catch (error) {
        isSubmitting = false;
        submitButton.disabled = false;
        submitButton.textContent = "求人を掲載する";
        console.error(error);

        alert(
            "投稿に失敗しました：" +
            error.message
        );

    }

});
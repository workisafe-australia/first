import { db, auth } from "./firebase.js";

import {
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// =========================
// Cloudinary
// =========================

const cloudName = "pebocjzw";
const uploadPreset = "sidohori_unsigned";


// =========================
// HTML要素
// =========================

const editForm = document.getElementById("editForm");

const companyNameInput = document.getElementById("companyName");
const jobTitleInput = document.getElementById("jobTitle");
const locationInput = document.getElementById("location");
const workConditionsInput = document.getElementById("workConditions");
const jobDetailsInput = document.getElementById("jobDetails");
const applicationInfoInput = document.getElementById("applicationInfo");
const notesInput = document.getElementById("notes");

const imageInput = document.getElementById("images");
const currentImages = document.getElementById("currentImages");


// =========================
// 投稿ID
// =========================

const params = new URLSearchParams(window.location.search);

const postId = params.get("id");


// =========================
// データ
// =========================

let currentUser = null;

// 現在残している写真
let existingImageUrls = [];


// =========================
// 現在の写真を表示
// =========================

function displayCurrentImages() {

    currentImages.innerHTML = "";

    if (existingImageUrls.length === 0) {

        currentImages.innerHTML =
            "<p>現在写真はありません。</p>";

        return;
    }


    existingImageUrls.forEach((url, index) => {

        currentImages.innerHTML += `

            <div class="edit-image-item">

                <img
                    src="${url}"
                    class="edit-image-preview"
                    alt="現在の写真">

                <button
                    type="button"
                    class="removeImageButton"
                    data-index="${index}">

                    写真を削除

                </button>

            </div>

        `;

    });

}


// =========================
// 現在の写真を削除
// =========================

currentImages.addEventListener("click", (event) => {

    if (
        !event.target.classList.contains(
            "removeImageButton"
        )
    ) {

        return;

    }


    const index =
        Number(event.target.dataset.index);


    existingImageUrls.splice(index, 1);


    displayCurrentImages();

});


// =========================
// ログイン状態確認
// =========================

onAuthStateChanged(auth, async (user) => {

    currentUser = user;


    if (!user) {

        alert("ログインしてください");

        window.location.href = "login.html";

        return;

    }


    if (!postId) {

        alert("投稿が見つかりません");

        window.location.href = "index.html";

        return;

    }


    try {

        const postRef =
            doc(db, "posts", postId);


        const snapshot =
            await getDoc(postRef);


        if (!snapshot.exists()) {

            alert("投稿が見つかりません");

            window.location.href = "index.html";

            return;

        }


        const post =
            snapshot.data();


        if (post.uid !== user.uid) {

            alert("自分の投稿だけ編集できます");

            window.location.href = "index.html";

            return;

        }


        // 文字情報を入力欄に表示
        companyNameInput.value =
            post.companyName || "";

        jobTitleInput.value =
            post.jobTitle || "";

        locationInput.value =
            post.location || "";

        workConditionsInput.value =
            post.workConditions || "";

        jobDetailsInput.value =
            post.jobDetails || "";

        applicationInfoInput.value =
            post.applicationInfo || "";

        notesInput.value =
            post.notes || "";


        // 写真を取得
        existingImageUrls =
            post.imageUrls
            ? [...post.imageUrls]
            : [];


        displayCurrentImages();


    } catch (error) {

        console.error(error);

        alert(
            "投稿の読み込みに失敗しました"
        );

    }

});


// =========================
// 編集内容を保存
// =========================

editForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        if (!currentUser) {

            alert("ログインしてください");

            return;

        }


        const newFiles =
            Array.from(imageInput.files);


        // 現在の写真＋新しい写真
        if (
            existingImageUrls.length +
            newFiles.length >
            3
        ) {

            alert(
                "写真は合計3枚までです"
            );

            return;

        }


        try {

            const newImageUrls = [];


            // =========================
            // 新しい写真をCloudinaryへ
            // =========================

            for (const file of newFiles) {

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
                        "画像アップロードに失敗しました"
                    );

                }


                const data =
                    await response.json();


                newImageUrls.push(
                    data.secure_url
                );

            }


            // 最終的に残す写真
            const finalImageUrls = [

                ...existingImageUrls,

                ...newImageUrls

            ];


            // =========================
            // Firestoreを更新
            // =========================

            const postRef =
                doc(db, "posts", postId);


            await updateDoc(postRef, {

                companyName:
                    companyNameInput
                        .value
                        .trim(),

                jobTitle:
                    jobTitleInput
                        .value
                        .trim(),

                location:
                    locationInput
                        .value
                        .trim(),

                workConditions:
                    workConditionsInput
                        .value
                        .trim(),

                jobDetails:
                    jobDetailsInput
                        .value
                        .trim(),

                applicationInfo:
                    applicationInfoInput
                        .value
                        .trim(),

                notes:
                    notesInput
                        .value
                        .trim(),

                imageUrls:
                    finalImageUrls

            });


            alert(
                "求人情報を更新しました"
            );


            window.location.href =
                "index.html";


        } catch (error) {

            console.error(error);

            alert(
                "更新に失敗しました：" +
                error.message
            );

        }

    }
);
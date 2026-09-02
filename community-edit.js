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

const uploadPreset =
    "sidohori_unsigned";


// =========================
// HTML
// =========================

const editForm =
    document.getElementById(
        "communityEditForm"
    );

const titleInput =
    document.getElementById("title");

const categoryInput =
    document.getElementById("category");

const contentInput =
    document.getElementById("content");

const imageInput =
    document.getElementById("images");

const currentImages =
    document.getElementById(
        "currentImages"
    );


// =========================
// 投稿ID
// =========================

const params =
    new URLSearchParams(
        window.location.search
    );

const postId =
    params.get("id");


// =========================
// データ
// =========================

let currentUser = null;

let existingImageUrls = [];


// =========================
// 現在の写真を表示
// =========================

function displayCurrentImages() {

    currentImages.innerHTML = "";


    if (
        existingImageUrls.length === 0
    ) {

        currentImages.innerHTML =
            "<p>現在写真はありません。</p>";

        return;

    }


    existingImageUrls.forEach(
        (url, index) => {

            currentImages.innerHTML += `

                <div class="edit-image-item">

                    <img
                        src="${url}"
                        class="edit-image-preview"
                        alt="投稿写真">

                    <button
                        type="button"
                        class="removeCommunityImageButton"
                        data-index="${index}">

                        写真を削除

                    </button>

                </div>

            `;

        }
    );

}


// =========================
// 写真削除
// =========================

currentImages.addEventListener(
    "click",
    (event) => {

        if (
            !event.target
                .classList
                .contains(
                    "removeCommunityImageButton"
                )
        ) {

            return;

        }


        const index =
            Number(
                event.target.dataset.index
            );


        existingImageUrls.splice(
            index,
            1
        );


        displayCurrentImages();

    }
);


// =========================
// ログイン確認＋投稿読み込み
// =========================

onAuthStateChanged(
    auth,
    async (user) => {

        currentUser = user;


        if (!user) {

            alert(
                "ログインしてください"
            );

            window.location.href =
                "login.html";

            return;

        }


        if (!postId) {

            alert(
                "投稿が見つかりません"
            );

            window.location.href =
                "index.html";

            return;

        }


        try {

            const postRef =
                doc(
                    db,
                    "communityPosts",
                    postId
                );


            const snapshot =
                await getDoc(postRef);


            if (!snapshot.exists()) {

                alert(
                    "投稿が見つかりません"
                );

                window.location.href =
                    "index.html";

                return;

            }


            const post =
                snapshot.data();


            // 自分の投稿だけ編集可能
            if (
                post.uid !== user.uid
            ) {

                alert(
                    "自分の投稿だけ編集できます"
                );

                window.location.href =
                    "index.html";

                return;

            }


            titleInput.value =
                post.title || "";


            categoryInput.value =
                post.category || "other";


            contentInput.value =
                post.content || "";


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

    }
);


// =========================
// 保存
// =========================

editForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        if (!currentUser) {

            alert(
                "ログインしてください"
            );

            return;

        }


        const newFiles =
            Array.from(
                imageInput.files
            );


        // 合計最大3枚
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

            for (
                const file of newFiles
            ) {

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


            // =========================
            // 最終的に残す写真
            // =========================

            const finalImageUrls = [

                ...existingImageUrls,

                ...newImageUrls

            ];


            // =========================
            // Firestore更新
            // =========================

            const postRef =
                doc(
                    db,
                    "communityPosts",
                    postId
                );


            await updateDoc(
                postRef,
                {

                    title:
                        titleInput
                            .value
                            .trim(),

                    category:
                        categoryInput
                            .value,

                    content:
                        contentInput
                            .value
                            .trim(),

                    imageUrls:
                        finalImageUrls

                }
            );


            alert(
                "投稿を更新しました"
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
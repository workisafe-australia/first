import { db } from "./firebase.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const detailContent = document.getElementById("detailContent");
const imageModal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");
const closeImageModal = document.getElementById("closeImageModal");
// URLから投稿IDを取得
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

async function loadDetail() {

    if (!id) {
        detailContent.innerHTML = "<p>求人が見つかりません。</p>";
        return;
    }

    try {

        const docRef = doc(db, "posts", id);
        const snapshot = await getDoc(docRef);

        if (!snapshot.exists()) {
            detailContent.innerHTML = "<p>求人が見つかりません。</p>";
            return;
        }

        const post = snapshot.data();

        detailContent.innerHTML = `
            <div class="card">

                <h1>${post.jobTitle || ""}</h1>

                <h2>${post.companyName || ""}</h2>
                <div class="detail-images">

                ${
                    post.imageUrls && post.imageUrls.length > 0
                        ? post.imageUrls.map(url => `
                            <img
                                src="${url}"
                                class="detail-image"
                                alt="求人写真">
                        `).join("")
                        : ""
                }
            
            </div>
                <p>📍 <strong>勤務地</strong></p>
                <p>${post.location || ""}</p>

                <p>💰 <strong>給料・勤務条件</strong></p>
                <p>${post.workConditions || ""}</p>

                <p>💼 <strong>仕事内容・応募条件</strong></p>
                <p>${post.jobDetails || ""}</p>

                <p>📩 <strong>応募方法・連絡先</strong></p>
                <p>${post.applicationInfo || ""}</p>

                ${
                    post.notes
                    ? `
                        <p>📝 <strong>補足・注意事項</strong></p>
                        <p>${post.notes}</p>
                    `
                    : ""
                }

            </div>
        `;

    } catch (error) {

        console.error(error);
        detailContent.innerHTML = "<p>求人情報を取得できませんでした。</p>";

    }
}
// 詳細ページの写真をクリックしたら拡大
document.addEventListener("click", (event) => {

    if (!event.target.classList.contains("detail-image")) {
        return;
    }

    modalImage.src = event.target.src;

    imageModal.classList.add("open");
});


// ×で閉じる
closeImageModal.addEventListener("click", () => {

    imageModal.classList.remove("open");

});


// 黒い背景をクリックして閉じる
imageModal.addEventListener("click", (event) => {

    if (event.target === imageModal) {

        imageModal.classList.remove("open");

    }

});
loadDetail();
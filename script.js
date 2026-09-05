import { db, auth } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    orderBy,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// ==================================================
// 1. 管理者
// ==================================================

const ADMIN_UID = "hLj5CZ3ZyEcQXMJsMc0pFLbHc8j2";


// ==================================================
// 2. HTML要素
// ==================================================

const postList = document.getElementById("postList");
const communityList = document.getElementById("communityList");

const jobsSection = document.getElementById("jobsSection");
const communitySection = document.getElementById("communitySection");

const jobsTab = document.getElementById("jobsTab");
const communityTab = document.getElementById("communityTab");

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");

const newPostButton = document.getElementById("newPostButton");
const communityPostButton = document.getElementById("communityPostButton");

const menuButton = document.getElementById("menuButton");
const sideMenu = document.getElementById("sideMenu");
const closeMenuButton = document.getElementById("closeMenuButton");

const imageModal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");
const closeImageModal = document.getElementById("closeImageModal");


// ==================================================
// 3. データ
// ==================================================

let posts = [];
let communityPosts = [];
let currentUser = null;
let currentTab = "jobs";


// ==================================================
// 4. 共通関数
// ==================================================

function isAdmin() {
    return Boolean(
        currentUser &&
        currentUser.uid === ADMIN_UID
    );
}


function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function formatMultiline(value) {
    return escapeHTML(value).replace(/\r?\n/g, "<br>");
}


function formatDate(timestamp) {
    if (
        !timestamp ||
        typeof timestamp.toDate !== "function"
    ) {
        return "";
    }

    return timestamp
        .toDate()
        .toLocaleString("ja-JP", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
}


function getCategoryName(category) {
    const categories = {
        sharehouse: "シェアハウス",
        life: "生活情報",
        event: "イベント",
        question: "質問",
        recommend: "おすすめ",
        other: "その他"
    };

    return categories[category] || category || "その他";
}


// ==================================================
// 5. サイドメニュー
// ==================================================

if (menuButton && sideMenu) {
    menuButton.addEventListener("click", () => {
        sideMenu.classList.add("open");
    });
}


if (closeMenuButton && sideMenu) {
    closeMenuButton.addEventListener("click", () => {
        sideMenu.classList.remove("open");
    });
}


// ==================================================
// 6. ログイン状態
// ==================================================

onAuthStateChanged(auth, async (user) => {
    currentUser = user;

    await Promise.all([
        loadPosts(),
        loadCommunityPosts()
    ]);
});


// ==================================================
// 7. 求人データ読み込み
// ==================================================

async function loadPosts() {
    posts = [];

    try {
        const postsQuery = query(
            collection(db, "posts"),
            orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(postsQuery);

        snapshot.forEach((postDoc) => {
            posts.push({
                id: postDoc.id,
                ...postDoc.data()
            });
        });

        displayPosts(posts);

    } catch (error) {
        console.error("求人読み込みエラー:", error);

        if (postList) {
            postList.innerHTML =
                "<p>求人を読み込めませんでした。</p>";
        }
    }
}


// ==================================================
// 8. 求人表示
// ==================================================

function displayPosts(list) {
    if (!postList) {
        return;
    }

    postList.innerHTML = "";

    if (list.length === 0) {
        postList.innerHTML =
            "<p>現在掲載されている求人はありません。</p>";
        return;
    }

    const html = list.map((post) => {
        const canEdit =
            currentUser &&
            currentUser.uid === post.uid;

        const canDelete =
            currentUser &&
            (
                currentUser.uid === post.uid ||
                isAdmin()
            );

        const editButton = canEdit
            ? `
                <button
                    class="editButton"
                    data-id="${escapeHTML(post.id)}"
                >
                    編集
                </button>
            `
            : "";

        const deleteButton = canDelete
            ? `
                <button
                    class="deleteButton"
                    data-id="${escapeHTML(post.id)}"
                >
                    削除
                </button>
            `
            : "";

        let imageHTML = "";

        if (
            Array.isArray(post.imageUrls) &&
            post.imageUrls.length > 0 &&
            post.imageUrls[0]
        ) {
            imageHTML = `
                <img
                    src="${escapeHTML(post.imageUrls[0])}"
                    class="job-thumbnail expandable-image"
                    alt="求人写真"
                    loading="lazy"
                >
            `;
        }

        const dateHTML = formatDate(post.createdAt);

        return `
            <article class="card">

                <h2>
                    ${escapeHTML(post.jobTitle || "職種未設定")}
                </h2>

                <h3>
                    ${escapeHTML(post.companyName || "会社名未設定")}
                </h3>

                ${imageHTML}

                <p>
                    📍 ${escapeHTML(post.location || "")}
                </p>

                <p>
                    💰 ${formatMultiline(post.workConditions || "")}
                </p>

                <p class="post-date">
                    ${escapeHTML(dateHTML)}
                </p>

                <div class="card-actions">

                    <button
                        class="detailButton"
                        data-id="${escapeHTML(post.id)}"
                    >
                        詳細を見る
                    </button>

                    ${editButton}
                    ${deleteButton}

                </div>

            </article>
        `;
    }).join("");

    postList.innerHTML = html;
}


// ==================================================
// 9. コミュニティデータ読み込み
// ==================================================

async function loadCommunityPosts() {
    communityPosts = [];

    try {
        const communityQuery = query(
            collection(db, "communityPosts"),
            orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(communityQuery);

        snapshot.forEach((postDoc) => {
            communityPosts.push({
                id: postDoc.id,
                ...postDoc.data()
            });
        });

        displayCommunityPosts(communityPosts);

    } catch (error) {
        console.error(
            "コミュニティ読み込みエラー:",
            error
        );

        if (communityList) {
            communityList.innerHTML =
                "<p>投稿を読み込めませんでした。</p>";
        }
    }
}


// ==================================================
// 10. コミュニティ表示
// ==================================================

function displayCommunityPosts(list) {
    if (!communityList) {
        return;
    }

    communityList.innerHTML = "";

    if (list.length === 0) {
        communityList.innerHTML =
            "<p>まだ投稿がありません。</p>";
        return;
    }

    const html = list.map((post) => {
        const canEdit =
            currentUser &&
            currentUser.uid === post.uid;

        const canDelete =
            currentUser &&
            (
                currentUser.uid === post.uid ||
                isAdmin()
            );

        const editButton = canEdit
            ? `
                <button
                    class="communityEditButton"
                    data-id="${escapeHTML(post.id)}"
                >
                    編集
                </button>
            `
            : "";

        const deleteButton = canDelete
            ? `
                <button
                    class="communityDeleteButton"
                    data-id="${escapeHTML(post.id)}"
                >
                    削除
                </button>
            `
            : "";

        let imageHTML = "";

        if (
            Array.isArray(post.imageUrls) &&
            post.imageUrls.length > 0
        ) {
            const images = post.imageUrls
                .filter(Boolean)
                .slice(0, 3)
                .map((url) => `
                    <img
                        src="${escapeHTML(url)}"
                        class="community-image expandable-image"
                        alt="コミュニティ写真"
                        loading="lazy"
                    >
                `)
                .join("");

            if (images) {
                imageHTML = `
                    <div class="community-images">
                        ${images}
                    </div>
                `;
            }
        }

        const dateHTML = formatDate(post.createdAt);

        return `
            <article class="card">

                <h2>
                    ${escapeHTML(post.title || "タイトルなし")}
                </h2>

                <p>
                    🏷️ ${escapeHTML(
                        getCategoryName(post.category)
                    )}
                </p>

                ${imageHTML}

                <p>
                    ${formatMultiline(post.content || "")}
                </p>

                <p class="post-date">
                    ${escapeHTML(dateHTML)}
                </p>

                <div class="card-actions">
                    ${editButton}
                    ${deleteButton}
                </div>

            </article>
        `;
    }).join("");

    communityList.innerHTML = html;
}


// ==================================================
// 11. 求人タブ
// ==================================================

if (jobsTab) {
    jobsTab.addEventListener("click", () => {
        currentTab = "jobs";

        if (jobsSection) {
            jobsSection.style.display = "block";
        }

        if (communitySection) {
            communitySection.style.display = "none";
        }

        if (searchInput) {
            searchInput.value = "";
            searchInput.placeholder =
                "会社名・職種・地域で検索";
        }

        displayPosts(posts);

        if (sideMenu) {
            sideMenu.classList.remove("open");
        }
    });
}


// ==================================================
// 12. コミュニティタブ
// ==================================================

if (communityTab) {
    communityTab.addEventListener("click", () => {
        currentTab = "community";

        if (jobsSection) {
            jobsSection.style.display = "none";
        }

        if (communitySection) {
            communitySection.style.display = "block";
        }

        if (searchInput) {
            searchInput.value = "";
            searchInput.placeholder =
                "タイトル・内容で検索";
        }

        displayCommunityPosts(communityPosts);

        if (sideMenu) {
            sideMenu.classList.remove("open");
        }
    });
}


// ==================================================
// 13. 検索
// ==================================================

if (searchButton && searchInput) {
    searchButton.addEventListener(
        "click",
        performSearch
    );

    searchInput.addEventListener(
        "keydown",
        (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                performSearch();
            }
        }
    );
}


function performSearch() {
    if (!searchInput) {
        return;
    }

    const keyword =
        searchInput.value
            .trim()
            .toLowerCase();

    if (currentTab === "jobs") {
        const result = posts.filter((post) => {
            return (
                String(post.companyName || "")
                    .toLowerCase()
                    .includes(keyword) ||

                String(post.jobTitle || "")
                    .toLowerCase()
                    .includes(keyword) ||

                String(post.location || "")
                    .toLowerCase()
                    .includes(keyword) ||

                String(post.jobDetails || "")
                    .toLowerCase()
                    .includes(keyword)
            );
        });

        displayPosts(result);
        return;
    }

    const result = communityPosts.filter((post) => {
        return (
            String(post.title || "")
                .toLowerCase()
                .includes(keyword) ||

            String(post.content || "")
                .toLowerCase()
                .includes(keyword) ||

            String(getCategoryName(post.category))
                .toLowerCase()
                .includes(keyword)
        );
    });

    displayCommunityPosts(result);
}


// ==================================================
// 14. 新規投稿ボタン
// ==================================================

if (newPostButton) {
    newPostButton.addEventListener("click", () => {
        if (!currentUser) {
            alert("ログインしてください");
            window.location.href = "login.html";
            return;
        }

        window.location.href = "post.html";
    });
}


if (communityPostButton) {
    communityPostButton.addEventListener("click", () => {
        if (!currentUser) {
            alert("ログインしてください");
            window.location.href = "login.html";
            return;
        }

        window.location.href = "community.html";
    });
}


// ==================================================
// 15. 求人：詳細・編集・削除・写真拡大
// ==================================================

if (postList) {
    postList.addEventListener("click", async (event) => {
        const target = event.target;

        if (!(target instanceof Element)) {
            return;
        }


        if (target.classList.contains("expandable-image")) {
            openImageModal(
                target.getAttribute("src") || ""
            );
            return;
        }


        if (target.classList.contains("detailButton")) {
            const id = target.dataset.id;

            if (id) {
                window.location.href =
                    `detail.html?id=${encodeURIComponent(id)}`;
            }

            return;
        }


        if (target.classList.contains("editButton")) {
            const id = target.dataset.id;

            if (id) {
                window.location.href =
                    `edit.html?id=${encodeURIComponent(id)}`;
            }

            return;
        }


        if (!target.classList.contains("deleteButton")) {
            return;
        }


        const id = target.dataset.id;

        if (!id) {
            return;
        }


        const ok = confirm(
            isAdmin()
                ? "管理者としてこの求人を削除しますか？"
                : "この求人を削除しますか？"
        );

        if (!ok) {
            return;
        }


        try {
            await deleteDoc(
                doc(db, "posts", id)
            );

            alert("削除しました");

            await loadPosts();

        } catch (error) {
            console.error(
                "求人削除エラー:",
                error
            );

            alert(
                "削除できませんでした：" +
                (error?.message || "不明なエラー")
            );
        }
    });
}


// ==================================================
// 16. コミュニティ：編集・削除・写真拡大
// ==================================================

if (communityList) {
    communityList.addEventListener(
        "click",
        async (event) => {

            const target = event.target;

            if (!(target instanceof Element)) {
                return;
            }


            if (
                target.classList.contains(
                    "expandable-image"
                )
            ) {
                openImageModal(
                    target.getAttribute("src") || ""
                );
                return;
            }


            if (
                target.classList.contains(
                    "communityEditButton"
                )
            ) {
                const id = target.dataset.id;

                if (id) {
                    window.location.href =
                        `community-edit.html?id=${encodeURIComponent(id)}`;
                }

                return;
            }


            if (
                !target.classList.contains(
                    "communityDeleteButton"
                )
            ) {
                return;
            }


            const id = target.dataset.id;

            if (!id) {
                return;
            }


            const ok = confirm(
                isAdmin()
                    ? "管理者としてこの投稿を削除しますか？"
                    : "この投稿を削除しますか？"
            );

            if (!ok) {
                return;
            }


            try {
                await deleteDoc(
                    doc(
                        db,
                        "communityPosts",
                        id
                    )
                );

                alert("削除しました");

                await loadCommunityPosts();

            } catch (error) {
                console.error(
                    "コミュニティ削除エラー:",
                    error
                );

                alert(
                    "削除できませんでした：" +
                    (error?.message || "不明なエラー")
                );
            }
        }
    );
}


// ==================================================
// 17. 写真拡大モーダル
// ==================================================

function openImageModal(url) {
    if (
        !url ||
        !imageModal ||
        !modalImage
    ) {
        return;
    }

    modalImage.src = url;

    imageModal.classList.add("open");
    imageModal.style.display = "block";

    document.body.style.overflow = "hidden";
}


function closeModal() {
    if (!imageModal) {
        return;
    }

    imageModal.classList.remove("open");
    imageModal.style.display = "none";

    if (modalImage) {
        modalImage.src = "";
    }

    document.body.style.overflow = "";
}


if (closeImageModal) {
    closeImageModal.addEventListener(
        "click",
        closeModal
    );
}


if (imageModal) {
    imageModal.addEventListener(
        "click",
        (event) => {
            if (event.target === imageModal) {
                closeModal();
            }
        }
    );
}


document.addEventListener(
    "keydown",
    (event) => {
        if (
            event.key === "Escape" &&
            imageModal &&
            imageModal.style.display === "block"
        ) {
            closeModal();
        }
    }
);
/* LocalStorage 키 */
const STORAGE_KEY = "emotionDiary";

/* 일기 목록 */
let diaryListData = [];

/* 선택된 일기 데이터 */
let selectData = {};

/* 댓글 */
let commentListData = [];

const scrollTopButton = document.getElementById("scroll-top-button");

/* 댓글 관련 요소 */
const commentInput = document.querySelector("#comment-input");
const commentForm = document.querySelector("#comment-form");
const commentList = document.querySelector(".comment-list");

/* 모달 관련 요소 */
const deleteButton =
    document.querySelector("#diary-delete-btn");

const deleteModal =
    document.querySelector("#delete-modal");

const cancelDeleteButton =
    document.querySelector("#cancel-delete-button");

const confirmDeleteButton =
    document.querySelector("#confirm-delete-button");

/* 감정 이미지 */
const getMoodImage = (mood) => {
    if (mood === "행복") return '<img src="./img/happy.png" alt="">';
    if (mood === "슬픔") return '<img src="./img/sad.png" alt="">';
    if (mood === "놀램") return '<img src="./img/suprised.png" alt="">';
    if (mood === "화남") return '<img src="./img/angry.png" alt="">';

    return '<img src="./img/etc.png" alt="">';
};


/* 감정 문구 */
const getMoodLabel = (mood) => {
    if (mood === "행복") return "행복해요";
    if (mood === "슬픔") return "슬퍼요";
    if (mood === "놀램") return "놀랐어요";
    if (mood === "화남") return "화가나요";

    return "기타";
};


/* 현재 날짜 */
const getTodayText = () => {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        today.getDate()
    ).padStart(2, "0");

    return `${year}. ${month}. ${day}`;
};


/* URL에서 id 추출 */
const params = new URLSearchParams(location.search);

const diaryId = Number(
    params.get("id")
);


/* LocalStorage에서 데이터 가져오기 */
const savedData =
    localStorage.getItem(STORAGE_KEY);


/* 저장된 데이터가 있다면 */
if (savedData !== null) {
    const parsedData =
        JSON.parse(savedData);

    diaryListData =
        parsedData.diaryList;

    commentListData =
        parsedData.commentList;
}


/* 현재 일기 찾기 */
selectData = diaryListData.find((diary) => {
    return diary.id === diaryId;
});

/* 상세 내용 화면에 출력 */
function diaryContent() {
    document.querySelector(".diary-title").innerText =
        selectData.title;

    /* 감정 문구 */
    document.querySelector(".mood-class").innerText =
        getMoodLabel(selectData.mood);

    /* 감정별 클래스 추가 */
    if (selectData.mood === "행복") {
        document.querySelector(".mood-class").className =
            "mood-class happy";
    }

    if (selectData.mood === "슬픔") {
        document.querySelector(".mood-class").className =
            "mood-class sad";
    }

    if (selectData.mood === "놀램") {
        document.querySelector(".mood-class").className =
            "mood-class surprised";
    }

    if (selectData.mood === "화남") {
        document.querySelector(".mood-class").className =
            "mood-class angry";
    }

    if (selectData.mood === "기타") {
        document.querySelector(".mood-class").className =
            "mood-class etc";
    }
    document.querySelector(".mood-class").innerText =
        getMoodLabel(selectData.mood);

    document.querySelector(".mood-img").innerHTML =
        getMoodImage(selectData.mood);

    document.querySelector(".diary-date").innerText =
        selectData.createdAt + " 작성";

    document.querySelector(".diary-content").innerText =
        selectData.content;
}

/* 다음 댓글 id */
const getNextCommentId = () => {
    if (commentListData.length === 0) {
        return 1;
    }

    const lastComment =
        commentListData[commentListData.length - 1];

    return lastComment.id + 1;
};


/* 댓글 화면에 출력 */
const renderCommentList = () => {

    /* 현재 일기의 댓글만 가져오기 */
    const diaryComments =
        commentListData.filter((comment) => {
            return comment.diaryId === diaryId;
        });


    /* 댓글이 없을 경우 */
    if (diaryComments.length === 0) {
        commentList.innerHTML = `
            <p>등록된 회고가 없습니다.</p>
        `;

        return;
    }


    /* id가 작은 순서대로 정렬 */
    diaryComments.sort((a, b) => {
        return a.id - b.id;
    });


    /* 댓글 화면에 출력 */
    commentList.innerHTML = diaryComments
        .map((comment) => {
            return `
                <div
                    class="comment-item"
                    data-id="${comment.id}"
                >
                    <span class="comment-content">
                        ${comment.content}
                    </span>

                    <span class="comment-date">
                        [${comment.createdAt}]
                    </span>
                </div>
            `;
        })
        .join("");
};


/* LocalStorage에 저장 */
const saveData = () => {
    const storageData = {
        diaryList: diaryListData,
        commentList: commentListData
    };

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(storageData)
    );
};


/* 댓글 등록 */
commentForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const content =
        commentInput.value.trim();

    if (content === "") {
        return;
    }

    const newComment = {
        id: getNextCommentId(),
        diaryId: diaryId,
        content: content,
        createdAt: getTodayText()
    };

    commentListData.push(newComment);

    saveData();

    renderCommentList();

    commentInput.value = "";
});


/* 내용 복사 */
const contentCopy =
    document.querySelector(".content-copy");

contentCopy.addEventListener("click", () => {
    const content =
        document.querySelector(".diary-content").innerText;

    navigator.clipboard.writeText(content);

    document.querySelector(".copy-toast").style.display =
        "flex";
});

/* 모달 */

deleteButton.addEventListener("click", () => {
    deleteModal.style.display = "flex";
});
cancelDeleteButton.addEventListener("click", () => {
    deleteModal.style.display = "none";
});

/* 모달 닫기 */
deleteModal.addEventListener("click", (event) => {
    if (event.target === deleteModal) {
        deleteModal.style.display = "none";
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        deleteModal.style.display = "none";
    }
});

/* 일기 삭제 */
confirmDeleteButton.addEventListener("click", () => {
    /* 현재 일기 삭제 */
    diaryListData = diaryListData.filter((diary) => {
        return diary.id !== diaryId;
    });

    /* 현재 일기의 회고 삭제 */
    commentListData = commentListData.filter((comment) => {
        return comment.diaryId !== diaryId;
    });

    saveData();

    location.href = "./index.html";
});


/* 페이지 처음 들어왔을 때 상세 내용 출력 */
if (selectData !== undefined) {
    diaryContent();
}
/* 상단 이동 */
scrollTopButton.addEventListener(
    "click",
    () => {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }
);

/* 처음 진입시 랜더링 */
renderCommentList();

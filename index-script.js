/* LocalStorage에서 사용할 키 */
const STORAGE_KEY = "emotionDiary";


/* 현재 화면에서 사용할 일기 배열 */
let diaryListData = [];

/* 댓글 배열 */
let commentListData = [];

/* 검색 타이머 */
let searchTimer = "";

/* HTML 요소 */
const diaryForm = document.getElementById("diary-form");
const diaryListArea = document.getElementById("diary-list-area");

const titleInput = document.getElementById("title-input");
const contentInput = document.getElementById("content-input");

const searchInput = document.getElementById("search-input");

const scrollTopButton = document.getElementById("scroll-top-button");

const diaryAlbum = document.getElementById("diary-album");
const photoAlbum = document.getElementById("photo-album");
const emotionFilterInputs = document.querySelectorAll('input[name="emotion-filter"]');
const emotionDropdownToggle = document.getElementById("emotion-dropdown-toggle");

const selectedEmotionText = document.getElementById("selected-emotion-text");

/* 모달 요소 */
const diaryModal = document.getElementById("diary-modal");
const openDiaryModalButton = document.getElementById("open-diary-modal-button");

const successDiaryModal = document.getElementById("success-diary-modal");
const closeSubmitDiaryButton = document.getElementById("close-submit-diary-button");

/* 다크모드 */
const darkmode = document.querySelector(".dark-toggle");
const formPanel = document.querySelector(".form-panel");
const successModal = document.querySelector(".success-modal");

/* =========================
   LocalStorage
========================= */


/* LocalStorage에서 데이터 불러오기 */
const loadData = () => {

    const savedData =
        localStorage.getItem(STORAGE_KEY);


    /* 저장된 데이터가 없을 경우 */
    if (savedData === null) {
        diaryListData = [];
        commentListData = [];

        return;
    }


    try {

        /* 문자열을 객체로 변환 */
        const parsedData =
            JSON.parse(savedData);


        /*
         * 기존에 저장했던 데이터가
         * 일기 배열만 있는 형태일 경우
         */
        if (Array.isArray(parsedData)) {
            diaryListData = parsedData;
            commentListData = [];

            return;
        }


        /*
         * 새로운 저장 형태
         * {
         *     diaryList: [],
         *     commentList: []
         * }
         */
        diaryListData =
            parsedData.diaryList || [];

        commentListData =
            parsedData.commentList || [];

    } catch {

        diaryListData = [];
        commentListData = [];
    }
};


/* LocalStorage에 데이터 저장 */
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


/* =========================
   일기 데이터 관련 함수
========================= */


/* 감정에 맞는 이모지 반환 */
const getMoodImage = (mood) => {

    if (mood === "행복") {
        return '<img src="./img/happy.png"/>';
    }

    if (mood === "슬픔") {
        return '<img src="./img/sad.png"/>';
    }

    if (mood === "놀램") {
        return '<img src="./img/suprised.png"/>';
    }

    if (mood === "화남") {
        return '<img src="./img/angry.png"/>';
    }

    return '<img src="./img/happy.png"/>';
};


/* 감정에 맞는 CSS 클래스 반환 */
const getMoodClass = (mood) => {

    if (mood === "행복") {
        return "happy";
    }

    if (mood === "슬픔") {
        return "sad";
    }

    if (mood === "놀램") {
        return "surprised";
    }

    if (mood === "화남") {
        return "angry";
    }

    return "etc";
};


/* 감정을 화면에 표시할 문장으로 변환 */
const getMoodLabel = (mood) => {

    if (mood === "행복") {
        return "행복해요";
    }

    if (mood === "슬픔") {
        return "슬퍼요";
    }

    if (mood === "놀램") {
        return "놀랐어요";
    }

    if (mood === "화남") {
        return "화가나요";
    }

    return "기타";
};


/* 현재 날짜 생성
 * YYYY. MM. DD
 */
const getTodayText = () => {

    const today = new Date();

    const year =
        today.getFullYear();

    const month = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        today.getDate()
    ).padStart(2, "0");

    return `${year}. ${month}. ${day}`;
};


/* 선택된 감정 라디오 버튼 값 가져오기 */
const getSelectedMood = () => {

    const moodInputs =
        document.querySelectorAll(
            'input[name="mood"]'
        );

    let selectedMood = "기타";


    moodInputs.forEach((input) => {

        if (input.checked) {
            selectedMood = input.value;
        }

    });


    return selectedMood;
};


/* =========================
   일기 목록 출력
========================= */

const renderDiaryList = () => {

    const selectedEmotion = getSelectedEmotionFilter();

    const keyword =
        searchInput.value
            .trim()
            .toLowerCase();


    /*
     * 감정과 검색 조건을 만족하는
     * 일기만 가져오기
     */
    const visibleList =
        diaryListData.filter((diary) => {

            const matchEmotion =
                selectedEmotion === "all" ||
                getMoodClass(diary.mood) === selectedEmotion;


            const searchText =
                `${diary.title} ${diary.content}`
                    .toLowerCase();


            const matchSearch =
                searchText.includes(keyword);


            return matchEmotion && matchSearch;
        });

    /* 조건에 맞는 일기가 없을 경우 */
    if (visibleList.length === 0) {

        diaryListArea.innerHTML = `
            <p class="diary-default-text">
                등록된 일기가 없습니다.
            </p>
        `;

        return;
    }


    /* 최신 일기부터 출력 */
    diaryListArea.innerHTML =
        visibleList
            .slice()
            .reverse()
            .map((diary) => {

                return `
                    <article
                        class="diary-card ${getMoodClass(diary.mood)}"
                        data-id="${diary.id}"
                    >

                        <button
                            type="button"
                            class="delete-button"
                            data-id="${diary.id}"
                            aria-label="일기 삭제"
                        >
                            <img
                                src="./img/close_outline_light_s.svg"
                            />
                        </button>


                        <div class="diary-image-area">

                            <div class="diary-emoji">
                                ${getMoodImage(diary.mood)}
                            </div>

                        </div>


                        <div class="diary-card-content">

                            <div class="diary-information">

                                <span class="diary-mood">
                                    ${getMoodLabel(diary.mood)}
                                </span>

                                <time class="diary-date">
                                    ${diary.createdAt}
                                </time>

                            </div>


                            <h3 class="diary-title">
                                ${diary.title}
                            </h3>


                            <p class="diary-preview">
                                ${diary.content}
                            </p>

                        </div>

                    </article>
                `;
            })
            .join("");
};


/* =========================
   일기 등록
========================= */

const handleSubmit = (event) => {

    /* form 기본 새로고침 방지 */
    event.preventDefault();


    const selectedMood =
        getSelectedMood();

    const title =
        titleInput.value.trim();

    const content =
        contentInput.value.trim();


    /* 제목 검증 */
    if (title === "") {

        alert("제목을 입력해주세요.");

        titleInput.focus();

        return;
    }


    /* 내용 검증 */
    if (content === "") {

        alert("내용을 입력해주세요.");

        contentInput.focus();

        return;
    }


    /*
     * 새로운 일기 객체
     */
    const newDiary = {

        id: Date.now(),

        mood: selectedMood,

        title: title,

        content: content,

        createdAt: getTodayText()

    };


    /* 일기 배열에 추가 */
    diaryListData.push(newDiary);


    /*
     * 일기 배열과 댓글 배열을
     * LocalStorage에 함께 저장
     */
    saveData();


    /* 목록 다시 출력 */
    renderDiaryList();


    /* 입력폼 초기화 */
    diaryForm.reset();


    /* 감정을 행복으로 초기화 */
    const firstMood =
        document.querySelector(
            'input[name="mood"][value="행복"]'
        );


    if (firstMood !== null) {
        firstMood.checked = true;
    }


    /* 등록 완료 모달 */
    openSuccessModal();
};



/* =========================
   일기 검색
========================= */


/* 감정 필터 변경 */
const getSelectedEmotionFilter = () => {

    let selectedEmotion = "all";

    emotionFilterInputs.forEach((input) => {

        if (input.checked) {
            selectedEmotion = input.value;
        }

    });

    return selectedEmotion;
};

emotionFilterInputs.forEach((input) => {

    input.addEventListener("change", (event) => {

        const selectedLabel =
            event.target
                .nextElementSibling
                .querySelector("span")
                .textContent;

        selectedEmotionText.textContent =
            selectedLabel;

        /* 드롭다운 닫기 */
        emotionDropdownToggle.checked = false;

        /* 선택한 감정으로 일기 다시 출력 */
        renderDiaryList();
    });

});

/* 검색어 입력 */
searchInput.addEventListener(
    "input",
    () => {
        clearTimeout(searchTimer);

        searchTimer = setTimeout(() => {
            renderDiaryList();
        }, 700);
    }
);


/* =========================
   일기 등록 Form
========================= */

diaryForm.addEventListener(
    "submit",
    handleSubmit
);


/* =========================
   화면 상단 이동
========================= */

scrollTopButton.addEventListener(
    "click",
    () => {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }
);


/* =========================
   페이지 최초 실행
========================= */

window.addEventListener("load", () => {

    /*
     * LocalStorage에서
     * 일기 배열과 댓글 배열 가져오기
     */
    loadData();


    /* 일기 목록 출력 */
    renderDiaryList();
});


/* =========================
   모달
========================= */

/* 다크모드 색상 변경 */
darkmode.addEventListener("change", () => {
    formPanel.classList.toggle("modal-dark");
    successModal.classList.toggle("modal-dark");

})

/* 일기 작성 모달 열기 */
function openDiaryModal() {
    diaryModal.style.display = "flex";
}


/* 일기 작성 모달 닫기 */
function closeDiaryModal() {
    diaryModal.style.display = "none";
}


/* 등록 완료 모달 열기 */
function openSuccessModal() {
    successDiaryModal.style.display = "flex";
}


/* 등록 완료 모달 닫기 */
function closeSuccessModal() {
    successDiaryModal.style.display = "none";
}


/* 일기쓰기 버튼 클릭 */
openDiaryModalButton.addEventListener(
    "click",
    () => {
        openDiaryModal();
    }
);


/* 등록 완료 확인 버튼 클릭 */
closeSubmitDiaryButton.addEventListener(
    "click",
    () => {

        closeSuccessModal();

        closeDiaryModal();

    }
);


/* 일기 작성 모달 배경 클릭 시 닫기 */
diaryModal.addEventListener(
    "click",
    (event) => {

        if (event.target === diaryModal) {
            closeDiaryModal();
        }

    }
);


/* 등록 완료 모달 배경 클릭 시 닫기 */
successDiaryModal.addEventListener(
    "click",
    (event) => {

        if (event.target === successDiaryModal) {

            closeSuccessModal();

            closeDiaryModal();

        }

    }
);


/* ESC 키로 모달 닫기 */
document.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Escape") {

            closeSuccessModal();

            closeDiaryModal();

        }

    }
);


/* =========================
   상세페이지
========================= */


/* 상세페이지 이동 */
function detail(id) {

    location.href =
        "./diary-detail.html?id=" + id;
}


diaryListArea.addEventListener("click", (event) => {

    /* 삭제 버튼 클릭 */
    const deleteButton =
        event.target.closest(".delete-button");

    if (deleteButton !== null) {

        const diaryId =
            Number(deleteButton.dataset.id);

        diaryListData =
            diaryListData.filter((diary) => {
                return diary.id !== diaryId;
            });

        commentListData =
            commentListData.filter((comment) => {
                return comment.diaryId !== diaryId;
            });

        saveData();

        renderDiaryList();

        return;
    }


    /* 일기 카드 클릭 */
    const diaryCard =
        event.target.closest(".diary-card");

    if (diaryCard === null) {
        return;
    }

    const diaryId =
        diaryCard.dataset.id;

    detail(diaryId);
});
/* banner 일기보관함 / 사진보관함 이동 */;
diaryAlbum.addEventListener("click", (event) => {
    if (location.href.includes("index.html")) {
        return;
    }
    document.location.href = "./index.html";
})

photoAlbum.addEventListener("click", (event) => {
    if(location.href.includes("./photo.html")) {
        return;
    }
    document.location.href = "./photo.html";
})
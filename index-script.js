/* 오래된 브라우저용 Element.closest() 폴리필 */
if (!Element.prototype.matches) {
    Element.prototype.matches =
        Element.prototype.msMatchesSelector ||
        Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
    Element.prototype.closest = function (selector) {
        let element = this;

        while (element && element.nodeType === 1) {
            if (element.matches(selector)) {
                return element;
            }

            element = element.parentElement;
        }

        return null;
    };
}

/* LocalStorage에서 사용할 키 */
const STORAGE_KEY = "emotionDiary";


/* 현재 화면에서 사용할 일기 배열 */
let diaryListData = [];

/* 댓글 배열 */
let commentListData = [];

/* 검색 타이머 */
let searchTimer = "";

/* 일기 개수 */
const DIARY_COUNT_PER_PAGE = 12;
/* 버튼 개수 */
const PAGE_COUNT_PER_GROUP = 10;

let startPage = 1;
let currentPage = 1;

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
const darkModeToggles = document.querySelectorAll(".dark-toggle");
const formPanel = document.querySelector(".form-panel");
const successModal = document.querySelector(".success-modal");

/* 페이지네이션 */
const pagination = document.getElementById("pagination");
const paginationNumberArea = document.getElementById("pagination-number-area");

const paginationPrevButton = document.getElementById("pagination-prev-button");
const paginationNextButton = document.getElementById("pagination-next-button");

const paginationPrevImage = document.getElementById("pagination-prev-image");
const paginationNextImage = document.getElementById("pagination-next-image");

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


        /* 기존에 저장했던 데이터가 일기 배열만 있는 형태일 경우*/
        if (Array.isArray(parsedData)) {
            diaryListData = parsedData;
            commentListData = [];

            return;
        }

        diaryListData = parsedData.diaryList || [];

        commentListData = parsedData.commentList || [];

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


    localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData)
    );
};


/* =========================
   일기 데이터 관련 함수
========================= */


/* 감정에 맞는 이모지 반환 */
const getMoodImage = (mood) => {

    if (mood === "행복") {
        return '<img src="./img/happy.png" alt=""/>';
    }

    if (mood === "슬픔") {
        return '<img src="./img/sad.png" alt=""/>';
    }

    if (mood === "놀램") {
        return '<img src="./img/suprised.png" alt=""/>';
    }

    if (mood === "화남") {
        return '<img src="./img/angry.png" alt=""/>';
    }

    return '<img src="./img/happy.png" alt=""/>';
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

    const year = today.getFullYear();

    const month = String(today.getMonth() + 1).padStart(2, "0");

    const day = String(today.getDate()).padStart(2, "0");

    return `${year}. ${month}. ${day}`;
};


/* 선택된 감정 라디오 버튼 값 가져오기 */
const getSelectedMood = () => {

    const moodInputs = document.querySelectorAll('input[name="mood"]');

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
const renderDiaryList = (clickedPage = 1) => {

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
        })
            .slice()
            .reverse();


    /* 마지막 페이지 계산 */
    const lastPage = Math.ceil(visibleList.length / DIARY_COUNT_PER_PAGE);


    /*
     * 삭제해서 현재 페이지가 없어졌을 경우
     * 마지막으로 존재하는 페이지로 이동
     */
    if (
        lastPage > 0 &&
        clickedPage > lastPage
    ) {

        clickedPage = lastPage;

        startPage = Math.floor((clickedPage - 1) / PAGE_COUNT_PER_GROUP) * PAGE_COUNT_PER_GROUP + 1;
    }


    currentPage = clickedPage;


    /* 조건에 맞는 일기가 없을 경우 */
    if (visibleList.length === 0) {

        diaryListArea.innerHTML = `<p class="diary-default-text">등록된 일기가 없습니다.</p>`;

        startPage = 1;
        currentPage = 1;

        renderPagination(0, currentPage);

        return;
    }


    /* 현재 페이지에 보여줄 일기만 가져오기 */
    const currentDiaryList =
        visibleList.filter((diary, index) => {

            const skipCount = (clickedPage - 1) * DIARY_COUNT_PER_PAGE;

            const skipIndex = skipCount - 1;


            return (skipIndex < index && index <= skipIndex + DIARY_COUNT_PER_PAGE
            );
        });


    diaryListArea.innerHTML =
        currentDiaryList.map((diary) => {
                return `
                    <article class="diary-card ${getMoodClass(diary.mood)}"data-id="${diary.id}">

                        <button type="button" class="delete-button" data-id="${diary.id}" aria-label="일기 삭제">
                            <img src="./img/close_outline_light_s.svg" alt="">
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


    /* 목록과 페이지 버튼 함께 출력 */
    renderPagination(lastPage, clickedPage);
};

/* =========================
   페이지네이션
========================= */


/* 페이지 버튼 그리기 */
const renderPagination = (lastPage, clickedPage
) => {

    /* 일기가 없을 경우 페이지네이션 숨기기 */
    if (lastPage === 0) {

        pagination.style.display = "none";

        paginationNumberArea.innerHTML = "";

        return;
    }


    pagination.style.display = "flex";


    /* 길이가 10인 배열 */
    const pageBox =
        new Array(PAGE_COUNT_PER_GROUP).fill("page");


    const pages = pageBox.map((el, index) => {

            const pageNumber =
                startPage + index;

            return pageNumber <= lastPage
                ? `
                    <button
                        type="button"
                        class="pagination-number ${clickedPage === pageNumber ? "active" : ""}"
                        onclick="renderDiaryList(${pageNumber});"
                        >
                        ${pageNumber}
                    </button>
                `
                : "";

        }).join("");


    paginationNumberArea.innerHTML = pages;


    /* 첫 번째 페이지 묶음인지 확인 */
    const isFirstGroup =
        startPage === 1;


    /* 다음 페이지 묶음이 있는지 확인 */
    const hasNextGroup = startPage + PAGE_COUNT_PER_GROUP <= lastPage;


    paginationPrevButton.disabled = isFirstGroup;

    paginationNextButton.disabled = !hasNextGroup;

    /* 화살표 숨기기 */
    if (lastPage === 1) {
        paginationPrevButton.style.display = "none";
        paginationNextButton.style.display = "none";
    } else {
        paginationPrevButton.style.display = "flex";
        paginationNextButton.style.display = "flex";
    }

    /* 이전 버튼 이미지 변경 */
    paginationPrevImage.src = isFirstGroup ? "./img/rightdisabled_outline_light_m.svg" : "./img/rightenable_outline_light_m.svg";


    /* 다음 버튼 이미지 변경 */
    paginationNextImage.src = hasNextGroup ? "./img/rightenable_outline_light_m.svg" : "./img/rightdisabled_outline_light_m.svg";
};


/* 이전 페이지 묶음으로 이동 */
const movePrevPageGroup = () => {

    if (startPage === 1) {
        return;
    }


    startPage = startPage - PAGE_COUNT_PER_GROUP;

    currentPage = startPage;


    renderDiaryList(currentPage);
};


/* 다음 페이지 묶음으로 이동 */
const moveNextPageGroup = () => {

    const selectedEmotion =
        getSelectedEmotionFilter();

    const keyword = searchInput.value
        .trim()
        .toLowerCase();


    /*
     * 현재 검색과 감정 조건을 만족하는
     * 일기만 가져오기
     */
    const visibleList = diaryListData.filter((diary) => {

        const matchEmotion =
            selectedEmotion === "all" ||
            getMoodClass(diary.mood) === selectedEmotion;


        const searchText = `${diary.title} ${diary.content}`
                .toLowerCase();


        const matchSearch = searchText.includes(keyword);


        return matchEmotion && matchSearch;
        });


    const lastPage = Math.ceil(
        visibleList.length / DIARY_COUNT_PER_PAGE
    );


    if (
        startPage + PAGE_COUNT_PER_GROUP <= lastPage
    ) {

        startPage = startPage + PAGE_COUNT_PER_GROUP;

        currentPage = startPage;


        renderDiaryList(currentPage);
    }
};
/* 이전 페이지 묶음 버튼 */
paginationPrevButton.addEventListener("click", movePrevPageGroup);


/* 다음 페이지 묶음 버튼 */
paginationNextButton.addEventListener("click", moveNextPageGroup);

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

    startPage = 1;
    currentPage = 1;

    /* 목록 다시 출력 */
    renderDiaryList(currentPage);


    /* 입력폼 초기화 */
    diaryForm.reset();


    /* 감정을 행복으로 초기화 */
    const firstMood = document.querySelector(
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

        selectedEmotionText.textContent = selectedLabel;

        /* 드롭다운 닫기 */
        emotionDropdownToggle.checked = false;

        /* 감정 필터 변경 시 1페이지로 이동 */
        startPage = 1;
        currentPage = 1;


        /* 선택한 감정으로 일기 다시 출력 */
        renderDiaryList(currentPage);
    });

});

/* 검색어 입력 */
searchInput.addEventListener("input", () => {
        clearTimeout(searchTimer);

        searchTimer = setTimeout(() => {

            /* 검색할 때 1페이지로 이동 */
            startPage = 1;
            currentPage = 1;


            renderDiaryList(currentPage);

        }, 700);
    }
);


/* =========================
   일기 등록 Form
========================= */

diaryForm.addEventListener("submit", handleSubmit);


/* =========================
   화면 상단 이동
========================= */

scrollTopButton.addEventListener("click", () => {

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


    /* 첫 화면은 1페이지부터 출력 */
    startPage = 1;
    currentPage = 1;


    /* 일기 목록 출력 */
    renderDiaryList(currentPage);
});


/* =========================
   모달
========================= */

/* 메인 화면과 모달의 다크모드를 함께 변경 */
const applyDarkMode = (isDarkMode) => {
    document.body.classList.toggle("dark-mode", isDarkMode);
    formPanel.classList.toggle("modal-dark", isDarkMode);
    successModal.classList.toggle("modal-dark", isDarkMode);

    darkModeToggles.forEach((toggle) => {
        toggle.checked = isDarkMode;
    });
};

darkModeToggles.forEach((toggle) => {
    toggle.addEventListener("change", () => {
        applyDarkMode(toggle.checked);
    });
});

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
openDiaryModalButton.addEventListener("click", () => {
        openDiaryModal();
    }
);


/* 등록 완료 확인 버튼 클릭 */
closeSubmitDiaryButton.addEventListener("click", () => {

        closeSuccessModal();

        closeDiaryModal();

    }
);


/* 일기 작성 모달 배경 클릭 시 닫기 */
diaryModal.addEventListener("click", (event) => {

        if (event.target === diaryModal) {
            closeDiaryModal();
        }

    }
);


/* 등록 완료 모달 배경 클릭 시 닫기 */
successDiaryModal.addEventListener("click", (event) => {

        if (event.target === successDiaryModal) {

            closeSuccessModal();

            closeDiaryModal();

        }

    }
);


/* ESC 키로 모달 닫기 */
document.addEventListener("keydown", (event) => {

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

    location.href = "./diary-detail.html?id=" + id;
}


diaryListArea.addEventListener("click", (event) => {

    /* 삭제 버튼 클릭 */
    const deleteButton = event.target.closest(".delete-button");

    if (deleteButton !== null) {

        const diaryId = Number(deleteButton.dataset.id);

        diaryListData = diaryListData.filter((diary) => {
            return diary.id !== diaryId;
            });

        commentListData = commentListData.filter((comment) => {
            return comment.diaryId !== diaryId;
            });

        saveData();

        renderDiaryList(currentPage);

        return;
    }


    /* 일기 카드 클릭 */
    const diaryCard = event.target.closest(".diary-card");

    if (diaryCard === null) {
        return;
    }

    const diaryId = diaryCard.dataset.id;

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

/* LocalStorage에서 사용할 키 */
const STORAGE_KEY = "emotionDiary";


/* 현재 화면에서 사용할 일기 배열 */
let diaryListData = [];


/* HTML 요소 */
const diaryForm = document.getElementById("diary-form");
const diaryListArea = document.getElementById("diary-list-area");

const titleInput = document.getElementById("title-input");
const contentInput = document.getElementById("content-input");

const emotionFilter = document.getElementById("emotion-filter");
const searchInput = document.getElementById("search-input");

const scrollTopButton = document.getElementById("scroll-top-button");
/* modal 을 위해서 추가하는 요소 */
const diaryModal = document.querySelector("#diary-modal");
const openDiaryModalButton = document.querySelector("#open-diary-modal-button");
const successDiaryModal = document.querySelector("#success-diary-modal");
const closeSubmitDiaryButton = document.querySelector("#close-submit-diary-button");

/* LocalStorage에서 일기 배열 불러오기 */
const loadDiaryList = () => {
    const savedDiaries = localStorage.getItem(STORAGE_KEY);

    /* 저장된 일기가 없으면 빈 배열 반환 */
    if (savedDiaries === null) {
        return [];
    }

    /* LocalStorage의 문자열을 배열로 변환 */
    try {
        const parsedDiaries = JSON.parse(savedDiaries);

        return Array.isArray(parsedDiaries)
            ? parsedDiaries
            : [];
    } catch {
        return [];
    }
};


/* 현재 일기 배열을 LocalStorage에 저장 */
const saveDiaryList = () => {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(diaryListData)
    );
};


/* 감정에 맞는 이모지 반환 */
const getMoodEmoji = (mood) => {
    if (mood === "행복") return '<img src="./img/happy.png"/>';
    if (mood === "슬픔") return '<img src="./img/sad.png"/>';
    if (mood === "놀램") return '<img src="./img/suprised.png"/>';
    if (mood === "화남") return '<img src="./img/angry.png"/>';

    return '<img src="./img/happy.png"/>';
};


/* 감정에 맞는 CSS 클래스 반환 */
const getMoodClass = (mood) => {
    if (mood === "행복") return "happy";
    if (mood === "슬픔") return "sad";
    if (mood === "놀램") return "surprised";
    if (mood === "화남") return "angry";

    return "etc";
};


/* 감정을 화면에 표시할 문장으로 변환 */
const getMoodLabel = (mood) => {
    if (mood === "행복") return "행복해요";
    if (mood === "슬픔") return "슬퍼요";
    if (mood === "놀램") return "놀랐어요";
    if (mood === "화남") return "화가나요";

    return "기타";
};


/* 현재 날짜 생성
* YYYY.MM.DD
*/
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


/* 선택된 감정 라디오 버튼 값 가져오기 */
const getSelectedMood = () => {
    const moodInputs = document.querySelectorAll(
        'input[name="mood"]'
    );

    let selectedMood = "기타";

    /*
     * 모든 감정 라디오 버튼을 확인해서
     * 체크된 버튼의 value를 selectedMood에 저장
     */
    moodInputs.forEach((input) => {
        if (input.checked) {
            selectedMood = input.value;
        }
    });

    return selectedMood;
};


/* 일기 검색 */
const renderDiaryList = () => {
    const selectedEmotion = emotionFilter.value;

    const keyword = searchInput.value
        .trim()
        .toLowerCase();

    /*
     * 감정과 검색 조건을 만족하는 일기만 남김
     */
    const visibleList = diaryListData.filter((diary) => {
        /*
         * 드롭다운의 value는
         * all, happy, sad 등
         */
        const matchEmotion =
            selectedEmotion === "all" ||
            getMoodClass(diary.mood) === selectedEmotion;

        /*
         * 제목과 내용을 하나의 문자열로 합친 뒤
         * 검색어가 포함되어 있는지 확인
         */
        const searchText =
            `${diary.title} ${diary.content}`
                .toLowerCase();

        const matchSearch =
            searchText.includes(keyword);

        return matchEmotion && matchSearch;
    });

    /* 조건에 맞는 일기가 없을 때 */
    if (visibleList.length === 0) {
        diaryListArea.innerHTML = `
            <p class="diary-default-text">
                등록된 일기가 없습니다.
            </p>
        `;

        return;
    }

    /*
     * slice()로 배열을 복사한 뒤 reverse()하여
     * 최신 일기부터 표시
     *
     * map()은 일기 객체를 카드 HTML로 변환
     *                   onclick="showDiaryDetail(${diary.id}
     */
    diaryListArea.innerHTML = visibleList
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
                        <img src="./img/close_outline_light_s.svg" />
                    </button>

                    <div class="diary-image-area">
                        <div class="diary-emoji">
                            ${getMoodEmoji(diary.mood)}
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

                        <p class="diary-preview">${diary.content}</p>
                    </div>
                </article>
            `;
        })
        .join("");
};



/* 일기 등록 */
const handleSubmit = (event) => {
    /* form 기본 새로고침 방지 */
    event.preventDefault();

    const selectedMood = getSelectedMood();

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

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
     * 새 일기 객체
     *
     * 감정별 CSS 클래스와 이모지는
     * getMoodClass(), getMoodEmoji()에서 계산하므로
     * 객체에는 mood만 저장
     */
    const newDiary = {
        id: Date.now(),
        mood: selectedMood,
        title: title,
        content: content,
        createdAt: getTodayText()
    };

    /* 새 일기를 배열 마지막에 추가 */
    diaryListData.push(newDiary);

    /* 변경된 배열 저장 */
    saveDiaryList();

    /* 목록 다시 출력 */
    renderDiaryList();

    /* 입력폼 초기화 */
    diaryForm.reset();
    /* 기본 상태로 초기화 */
    const firstMood = document.querySelector(
        'input[name="mood"][value="행복"]'
    );

    if (firstMood !== null) {
        firstMood.checked = true;
    }
    /* 모달 닫음 */
    // closeDiaryModal();
    /* 등록 완료됐다는 모달 */
    submitDiaryModal()
};


/* 일기 삭제 */
diaryListArea.addEventListener("click", (event) => {
    const deleteButton =
        event.target.closest(".delete-button");

    if (deleteButton === null) {
        return;
    }

    /* 이벤트 버블링 방지 */
    event.stopPropagation();

    const diaryId =
        Number(deleteButton.dataset.id);

    /*
     * 삭제할 ID와 다른 일기만 남겨
     * 새로운 배열을 생성
     */
    diaryListData = diaryListData.filter((diary) => {
        return diary.id !== diaryId;
    });

    /* 삭제된 배열 저장 */
    saveDiaryList();

    /* 화면 다시 출력 */
    renderDiaryList();
});


/* 감정 필터 변경 */
emotionFilter.addEventListener("change", () => {
    renderDiaryList();
});


/* 검색어 입력 */
searchInput.addEventListener("input", () => {
    renderDiaryList();
});


/* 일기 form 제출 */
diaryForm.addEventListener("submit", handleSubmit);


/* 플로팅 버튼 클릭 시 맨 위로 이동 */
scrollTopButton.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});


/* 페이지 최초 실행 */
window.addEventListener("load", () => {
    /*
     * LocalStorage에서 저장된 배열을 불러와
     * diaryListData에 저장
     */
    diaryListData = loadDiaryList();

    /* 일기 목록 출력 */
    renderDiaryList();
});

/* 모달 */
function openDiaryModal() {
    diaryModal.classList.add("is-open");
    document.body.classList.add("modal-open");

    diaryModal.setAttribute("aria-hidden", "false");
    titleInput.focus();
}

function closeDiaryModal() {
    diaryModal.classList.remove("is-open");
    document.body.classList.remove("modal-open");

    diaryModal.setAttribute("aria-hidden", "true");
}

function submitDiaryModal() {
    successDiaryModal.classList.add("is-open");
}
function closeSubmitDiaryModal() {
    successDiaryModal.classList.remove("is-open");
}

/* 모달 관련 eventlistener 추가*/
openDiaryModalButton.addEventListener("click", openDiaryModal);


closeSubmitDiaryButton.addEventListener("click", () => {
    closeSubmitDiaryModal();
    closeDiaryModal();
});

/* 모달 외에 영역 클릭시 닫기 */
diaryModal.addEventListener("click", (event) => {
    if (event.target === diaryModal) {
        closeDiaryModal();
    }
});

/* 등록 완료 모달 바깥 클릭 */
successDiaryModal.addEventListener("click", (event) => {
    if (event.target === successDiaryModal) {
        closeSubmitDiaryModal();
        closeDiaryModal();
    }
});
/* ESC로 닫기*/
document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
        return;
    }

    if (successDiaryModal.classList.contains("is-open")) {
        closeSubmitDiaryModal();
        closeDiaryModal();
        return;
    }

    if (diaryModal.classList.contains("is-open")) {
        closeDiaryModal();
    }
});

/* 상세페이지 이동 */
function detail(id){
    location.href="./diary-detail?id=" + id;
}
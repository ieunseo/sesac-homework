/* LocalStorage에서 사용할 키 */
const STORAGE_KEY = "emotionDiary";


/* 현재 화면에서 사용할 일기 배열 */
let diaryListData = [];


/* HTML 요소 */
const diaryForm = document.getElementById("diaryForm");
const diaryListArea = document.getElementById("diary-list-area");

const titleInput = document.getElementById("titleInput");
const contentInput = document.getElementById("contentInput");

const emotionFilter = document.getElementById("emotion-filter");
const searchInput = document.getElementById("search-input");

const scrollTopButton = document.getElementById("scroll-top-button");

const detailBox = document.getElementById("detail-box");
const clearDetailButton = document.getElementById(
    "clear-detail-button"
);


/* LocalStorage에서 일기 배열 불러오기 */
const loadDiaryList = () => {
    const savedDiaries = localStorage.getItem(STORAGE_KEY);

    /* 저장된 일기가 없으면 빈 배열 반환 */
    if (savedDiaries === null) {
        return [];
    }

    /*
     * LocalStorage의 문자열을 배열로 변환
     *
     * 저장된 값이 배열인지 확인하고,
     * 배열이 아니거나 JSON 변환에 실패하면 빈 배열 반환
     */
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
    if (mood === "행복") return "😊";
    if (mood === "슬픔") return "😢";
    if (mood === "놀램") return "😲";
    if (mood === "우울") return "😞";
    if (mood === "화남") return "😡";

    return "🤔";
};


/* 감정에 맞는 CSS 클래스 반환 */
const getMoodClass = (mood) => {
    if (mood === "행복") return "happy";
    if (mood === "슬픔") return "sad";
    if (mood === "놀램") return "surprised";
    if (mood === "우울") return "depressed";
    if (mood === "화남") return "angry";

    return "etc";
};


/* 감정을 화면에 표시할 문장으로 변환 */
const getMoodLabel = (mood) => {
    if (mood === "행복") return "행복해요";
    if (mood === "슬픔") return "슬퍼요";
    if (mood === "놀램") return "놀랐어요";
    if (mood === "우울") return "우울해요";
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


/* 일기 목록 출력 */
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
     * join("")은 카드 문자열 사이의 쉼표를 제거하고 합침
     */
    diaryListArea.innerHTML = visibleList
        .slice()
        .reverse()
        .map((diary) => {
            return `
                <article
                    class="diary-card ${getMoodClass(diary.mood)}"
                    data-id="${diary.id}"
                    onclick="showDiaryDetail(${diary.id})"
                >
                    <button
                        type="button"
                        class="delete-button"
                        data-id="${diary.id}"
                        aria-label="일기 삭제"
                    >
                        ×
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


/* 카드 클릭 시 ID로 일기를 찾아 상세보기 출력 */
window.showDiaryDetail = (id) => {
    /*
     * find()는 배열에서 조건에 맞는
     * 첫 번째 객체 하나를 반환
     */
    const diary = diaryListData.find((item) => {
        return item.id === id;
    });

    /* 해당 ID의 일기가 없으면 종료 */
    if (diary === undefined) {
        return;
    }

    detailBox.innerHTML = `
        <h3 class="detail-title">
            ${diary.title}
        </h3>

        <div class="detail-information">
            <span>
                ${getMoodEmoji(diary.mood)}
                ${getMoodLabel(diary.mood)}
            </span>

            <time>
                ${diary.createdAt}
            </time>
        </div>

        <p class="detail-content">${diary.content}</p>
    `;
};


/* 상세보기 초기화 */
const clearDiaryDetail = () => {
    detailBox.innerHTML = `
        <p class="detail-empty-text">
            일기 카드를 선택하면 상세 내용이 표시됩니다.
        </p>
    `;
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

    /* 방금 작성한 일기를 상세보기에 표시 */
    window.showDiaryDetail(newDiary.id);

    /* 입력폼 초기화 */
    diaryForm.reset();

    /*
     * reset 후 행복 감정을 다시 기본 선택
     */
    const firstMood = document.querySelector(
        'input[name="mood"][value="행복"]'
    );

    if (firstMood !== null) {
        firstMood.checked = true;
    }
};


/* 일기 삭제 */
diaryListArea.addEventListener("click", (event) => {
    const deleteButton =
        event.target.closest(".delete-button");

    /*
     * 삭제 버튼이 아닌 카드 영역을 클릭한 경우
     * 삭제 기능 실행하지 않음
     */
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

    /* 상세보기 초기화 */
    clearDiaryDetail();
});


/* 선택 해제 */
clearDetailButton.addEventListener("click", () => {
    clearDiaryDetail();
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

    /* 상세보기 초기화 */
    clearDiaryDetail();
});
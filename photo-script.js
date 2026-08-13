const STORAGE_KEY = "emotionDiary";

const diaryAlbum = document.getElementById("diary-album");
const photoAlbum = document.getElementById("photo-album");
const scrollTopButton = document.getElementById("scroll-top-button");
const photoContainer = document.getElementById("photo-container");
const darkModeToggle = document.querySelector(".dark-toggle");

darkModeToggle.addEventListener("change", () => {
    document.body.classList.toggle("dark-mode", darkModeToggle.checked);
});

diaryAlbum.addEventListener("click", () => {
    if (location.href.includes("index.html")) {
        return;
    }

    document.location.href = "./index.html";
});

photoAlbum.addEventListener("click", () => {
    if (location.href.includes("photo.html")) {
        return;
    }

    document.location.href = "./photo.html";
});

// 화면 상단 이동
scrollTopButton.addEventListener(
    "click",
    () => {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }
);

const photoFilterInputs = document.querySelectorAll('input[name="photo-filter"]');
const photoFilterToggle = document.getElementById("photo-filter-toggle");
const selectedPhotoFilterText = document.getElementById("selected-photo-filter-text");

const changePhotoRatio = (value) => {

    const photos = document.querySelectorAll(".photos");

    photos.forEach((photo) => {
        switch (value) {
            case "default":
                photo.style.aspectRatio = "1 / 1";
                break;

            case "width":
                photo.style.aspectRatio = "4 / 3";
                break;

            case "height":
                photo.style.aspectRatio = "3 / 4";
                break;
        }
    });
};

photoFilterInputs.forEach((input) => {
    input.addEventListener("change", (event) => {
        const selectedLabel = event.target
            .nextElementSibling
            .querySelector("span")
            .textContent;

        selectedPhotoFilterText.textContent = selectedLabel;
        photoFilterToggle.checked = false;

        changePhotoRatio(event.target.value);
    });
});


/* 무한스크롤 과 스로틀링 */
let scrollTimer = "throttle";

window.addEventListener("scroll", () => {
    if(scrollTimer !== "throttle") return // 바로 종료
    scrollTimer= setTimeout(() => {
            scrollTimer = "throttle" //초기화
        },700)

    const scrollPercent = document.documentElement.scrollTop / (document.documentElement.scrollHeight - document.documentElement.clientHeight)
    console.log(scrollPercent);

    if(scrollPercent >=0.7){
        fetch("https://dog.ceo/api/breeds/image/random/10").then(res => res.json().then(data => {
            const imgURL = data.message;
            document.getElementById("photo-container").innerHTML =
                imgURL.map((i) =>
                    `<img src="${i}" class="photos" alt="강아지 사진">`
                ).join("\n");

            const selectedFilter = document.querySelector('input[name="photo-filter"]:checked');
            changePhotoRatio(selectedFilter.value);
        }))
    }
})

// 화면 로딩되자마자 fetch 를 실행해야함.
const pictures = () =>{
    /* 사진 로딩 전 스켈레톤 이미지 */
    let skeletonHTML = "";

    for (let i = 0; i < 10; i++) {
        skeletonHTML += `
            <div class="photo-skeleton"></div>
        `;
    }
    document.getElementById("photo-container").innerHTML =
        skeletonHTML;
    fetch("https://dog.ceo/api/breeds/image/random/10")
        .then(res => res.json())
        .then(data => {
            const imagesURL = data.message;
            const status = data.status;

            document.getElementById("photo-container").innerHTML =
                imagesURL.map((i) =>
                    `<img src="${i}" class="photos" alt="강아지 사진">`
                ).join("\n");

            const selectedFilter = document.querySelector('input[name="photo-filter"]:checked');
            changePhotoRatio(selectedFilter.value);
        })
}
pictures();

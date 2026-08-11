const STORAGE_KEY = "emotionDiary";

const diaryAlbum = document.getElementById("diary-album");
const photoAlbum = document.getElementById("photo-album");
const scrollTopButton = document.getElementById("scroll-top-button");
const photoContainer = document.getElementById("photo-container");

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

const target = document.getElementById("photo-filter");

const changePhotoRatio = (e) => {
    const value = e.target.value;

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

target.addEventListener("change", changePhotoRatio);


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
                    `<img src="${i}" class="photos">`
                ).join("\n");
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
                    `<img src="${i}" class="photos">`
                ).join("\n");
        })
}
pictures();
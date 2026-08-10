const STORAGE_KEY = "emotionDiary";

const diaryAlbum = document.getElementById("diary-album");
const photoAlbum = document.getElementById("photo-album");
const scrollTopButton = document.getElementById("scroll-top-button");
const photoDefault = document.getElementById("photo-default");
const photoWidth = document.getElementById("photo-width");
const photoHeight = document.getElementById("photo-height");

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



const changePhotoRatio = (e) =>{
    console.log("change Photo Ratio");
    switch(e){
        case "default":
            target.style.aspectRatio=" 1 / 1";
            pictures();
            break;
        case "width":
            target.style.aspectRatio=" 4 / 3";
            pictures();
            break;
        case "height":
            target.style.aspectRatio=" 3 / 4";
            pictures();
            break;

    }
}

target.addEventListener("change", changePhotoRatio(target));

// 화면 로딩되자마자 fetch 를 실행해야함.
const pictures = () =>{
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
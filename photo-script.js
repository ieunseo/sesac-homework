const STORAGE_KEY = "emotionDiary";

let photoListData = [];

const diaryAlbum = document.getElementById("diary-album");
const photoAlbum = document.getElementById("photo-album");
const scrollTopButton = document.getElementById("scroll-top-button");

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

console.log("diaryAlbum:", diaryAlbum);
console.log("photoAlbum:", photoAlbum);
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
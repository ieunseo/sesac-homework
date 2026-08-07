/* 일기 목록 */
let diaryListData = [];
/* 선택된 일기 데이터*/
let selectData = {};
/* 댓글 */
let commentListData = [];

function diaryContent(){
    document.getElementById("title-input").innerText = selectData.title;
    document.getElementById("mood").innerText = selectData.mood;
    document.getElementById("content-input").innerText = selectData.content;
    document.getElementById("diary-date").innerText = selectData.date + " 작성";
    document.getElementById("mood-text").innerText = selectData.mood;
}

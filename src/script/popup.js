// Создаем перменную в которой храниться элемент с id="btn" из popup.html
const btn = document.getElementById("btn");

// Добовляем ивент по нажатию кнопки
btn.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true});

    // Обработка ошибки: если страница начинается с "chrome://"
    if (tab.url?.startsWith("chrome://")) return undefined;

    // Запуск скрипта grabImg, с активной страницей
    // и передаем результат в ф-цию onResult
    chrome.scripting.executeScript(
    {
        target: { tabId: tab.id, allFrames: true },
        function: grabImg,
    },
    onResult)
})

// Ф-ция запрашивает список изоброжений (с селектором img) и возращает список URL-ов
function grabImg() {
    const images = document.querySelectorAll("img");
    console.log(Array.from(images).map(images=>images.src))
    return Array.from(images).map(images=>images.src);
}

// Обработка результата
function onResult(frames) {
    // Если список пуст
    if (!frames || !frames.length || frames == null) {
        alert("Нет img файлов");
        return;
    }

    // Собираем спсики в единый массив
    const imagesUrls = frames.map(frames=>frames.result).reduce((r1, r2)=>r1.concat(r2));
    
    openImagesPage(imagesUrls);
}

function openImagesPage(urls) { 
    chrome.tabs.create({ "url": "page.html", active: false }, (tab) => {
        setTimeout(() => {
            chrome.tabs.sendMessage(tab.id, urls, (resp) => {
                chrome.tabs.update(tab.id, {active: true});
            })
        }, 500)
    })
}
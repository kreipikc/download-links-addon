chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    addImagesToContainer(message);
    sendResponse("OK");
});


// Ф-ция генерирует контейнеры с картинками
function addImagesToContainer(urls) {
    if (!urls || !urls.length) {
        return;
    }
    const container = document.querySelector(".container");
    urls.forEach(url => addImageNode(container, url));
}


// Ф-ция создаем элемент DIV для каждого изображения
function addImageNode(container, url) {
    const div = document.createElement("div");
    div.className = "imageDiv";
    const img = document.createElement("img");
    img.src = url;
    div.appendChild(img);
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.setAttribute("url", url);
    div.appendChild(checkbox);
    container.appendChild(div);
}


// Обработка флажка SelectAll (Вкл/Выкл)
document.getElementById("selectAll").addEventListener("change", (event) => {
    const items = document.querySelectorAll(".container input");
    for (let item of items) {
        item.checked = event.target.checked;
    };
});


// Обработка нажатия по кнопке Download
document.getElementById("downloadBtn").addEventListener("click", async() => {
    try {
        const urls = getSelectedUrls();
        const archive = await createArchive(urls);
        downloadArchive(archive);
    } catch (err) {
        alert(err.message);
    }
});


// Ф-ция возрощает список URL всех выбранных картинок 
function getSelectedUrls() {
    const urls = Array.from(document.querySelectorAll(".container input")).filter(item => item.checked).map(item => item.getAttribute("url"));
    if (!urls || !urls.length) {
        throw new Error("Пожалуйста, выберите хотя бы 1 картинку");
    }
    return urls;
}


// Ф-ция загружает картинки из массива urls и собирает их в ZIP-архив
async function createArchive(urls) {
    const zip = new JSZip();
    for (let index in urls) {
        const url = urls[index];
        try {
            const responce = await fetch(url);
            const blob = await responce.blob();
            zip.file(checkAndGetFileName(index, blob), blob);
        } catch (err) {
            console.error(err);
        }
    };
    return zip.generateAsync({
        type: 'blob',
        compression: "DEFLATE",
        CompressionOption: {
            level: 9
        }
    });
}


// Проверка объекта BLOB, чтобы он был не пустой, а также генерирует имя файлу
function checkAndGetFileName(index, blob) {
    let name = parseInt(index) + 1;
    const [type, extension] = blob.type.split("/");
    if (type != "image" || blob.size <= 0) {
        throw Error("Неверный контент");
    }
    return name+"."+extension.split("+").shift();
}


// Ф-ция гененирует ссылку на ZIP-архив и автоматически нажимает на неё, тем самым скачивая
function downloadArchive(archive) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(archive);
    link.download = "images.zip";
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(link.href);
    document.body.removeChild(link);
}

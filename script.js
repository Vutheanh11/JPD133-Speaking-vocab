// Tab Switching Function
function switchTab(event, lessonId) {
    // Hide all tab contents
    const tabContents = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove('active');
    }
    
    // Remove active class from all buttons
    const tabButtons = document.getElementsByClassName('tab-button');
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove('active');
    }
    
    // Show selected tab content
    document.getElementById(lessonId).classList.add('active');
    
    // Add active class to clicked button
    event.currentTarget.classList.add('active');
}

// Background Music Control
function toggleMusic() {
    const music = document.getElementById('bgMusic');
    const toggle = document.getElementById('bgMusicToggle');
    const status = document.getElementById('musicStatus');
    
    if (toggle.checked) {
        music.play().catch(e => console.log('Music play failed:', e));
        status.textContent = 'Bật';
        localStorage.setItem('musicEnabled', 'true');
    } else {
        music.pause();
        status.textContent = 'Tắt';
        localStorage.setItem('musicEnabled', 'false');
    }
}

// Dark Mode Control
function toggleDarkMode() {
    const toggle = document.getElementById('darkModeToggle');
    const status = document.getElementById('darkModeStatus');
    
    if (toggle.checked) {
        document.body.classList.add('dark-mode');
        status.textContent = 'Bật';
        localStorage.setItem('darkMode', 'true');
    } else {
        document.body.classList.remove('dark-mode');
        status.textContent = 'Tắt';
        localStorage.setItem('darkMode', 'false');
    }
}

// AI Reading Generator with Gemini API
const GEMINI_API_KEY = 'AIzaSyBgnR2T8yRS0Gf4bfiCegVliUn9b-Tk5q0';

// All available kanji from lessons 8-11
const ALL_KANJI = ['家', '族', '父', '母', '兄', '弟', '姉', '妹', '犬', '高', '短', '長', '好', '歌', '音', '楽', '車', '映', '画', '旅', '海', '外', '駅', '上', '下', '地', '図', '館', '右', '左', '道', '起', '歩', '乗', '始', '終', '勉', '強', '朝', '昼', '夜'];

// Random topics for variety
const TOPICS = [
    '家族について',
    '週末の過ごし方',
    '趣味について', 
    '毎日の生活',
    '旅行の思い出',
    '好きなこと',
    '学校生活',
    '友達と遊ぶ'
];

function getRandomKanji() {
    // Shuffle and pick 5-7 random kanji
    const shuffled = [...ALL_KANJI].sort(() => 0.5 - Math.random());
    const count = Math.floor(Math.random() * 3) + 5; // 5-7
    return shuffled.slice(0, count);
}

function getRandomTopic() {
    return TOPICS[Math.floor(Math.random() * TOPICS.length)];
}

async function generateReading() {
    const btn = document.getElementById('generateBtn');
    const btnText = document.getElementById('btnText');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const readingResult = document.getElementById('readingResult');
    const readingContent = document.getElementById('readingContent');

    // Disable button and show loading
    btn.disabled = true;
    btnText.textContent = '⏳ Đang tạo...';
    loadingSpinner.style.display = 'block';
    readingResult.style.display = 'none';

    // Get random kanji and topic
    const selectedKanji = getRandomKanji();
    const topic = getRandomTopic();
    
    const prompt = `Hãy tạo một bài đọc tiếng Nhật về chủ đề: ${topic}

YÊU CẦU QUAN TRỌNG:
1. Viết thành 1 ĐOẠN VĂN liên tục 12-15 câu (không xuống dòng giữa các câu)
2. CHỈ sử dụng 5-7 CHỮ KANJI từ list sau (không được dùng chữ nào khác): ${selectedKanji.join(', ')}
3. Tất cả Kanji PHẢI có furigana format: 家[いえ]
4. TUYỆT ĐỐI KHÔNG dùng Kanji khác ngoài list trên
5. Sử dụng lại các Kanji nhiều lần trong bài để làm dài bài đọc
6. Format:

私[わたし]の家[いえ]族[ぞく]は四[よ]人[にん]です。父[ちち]と母[はは]と兄[あに]がいます。兄[あに]は音[おん]楽[がく]が好[す]きです。週[しゅう]末[まつ]はよく家[か]族[ぞく]で映[えい]画[が]を見[み]ます。夏[なつ]に海[うみ]へ旅[りょ]行[こう]しました。

Sau đó xuống 2 dòng và viết dịch tiếng Việt:

Gia đình tôi có bốn người. Có bố, mẹ và anh trai. Anh trai thích âm nhạc. Cuối tuần thường cùng gia đình xem phim. Mùa hè đã đi du lịch biển.

LƯU Ý:
- KHÔNG xuống dòng giữa các câu tiếng Nhật
- CHỈ dùng Kanji trong list trên
- Câu văn đơn giản, ngắn gọn`;

    try {
        // Use v1beta API endpoint with gemini-2.0-flash model
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-goog-api-key': GEMINI_API_KEY
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.9,
                    maxOutputTokens: 1024
                }
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error?.message || `API Error: ${response.status}`);
        }

        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            throw new Error('Invalid response from API');
        }

        const generatedText = data.candidates[0].content.parts[0].text;

        // Format the reading content
        const formattedContent = formatReadingContent(generatedText);
        readingContent.innerHTML = formattedContent;

        // Show result
        loadingSpinner.style.display = 'none';
        readingResult.style.display = 'block';
        btnText.textContent = '🎯 START - Tạo Bài Đọc Mới';
        btn.disabled = false;

    } catch (error) {
        console.error('Error:', error);
        loadingSpinner.style.display = 'none';
        readingContent.innerHTML = `
            <div class="note" style="background: #ff6b6b; color: white; border: 6px solid #000;">
                <div class="note-title">❌ Lỗi:</div>
                <p>Không thể tạo bài đọc. Vui lòng thử lại!</p>
                <p style="font-size: 0.8em; margin-top: 10px;">Chi tiết: ${error.message}</p>
                <p style="font-size: 0.7em; margin-top: 10px;">Lưu ý: Cần kết nối internet và API key hợp lệ</p>
            </div>
        `;
        readingResult.style.display = 'block';
        btnText.textContent = '🎯 START - Tạo Bài Đọc';
        btn.disabled = false;
    }
}

let romajiVisible = false;

function toggleRomaji() {
    romajiVisible = !romajiVisible;
    const romajiBtnText = document.getElementById('romajiBtnText');
    const romajiElements = document.querySelectorAll('.romaji-text');
    const textWithRuby = document.querySelectorAll('.japanese-text-with-ruby');
    const textNoRuby = document.querySelectorAll('.japanese-text-no-ruby');
    
    if (romajiVisible) {
        romajiBtnText.textContent = '🙈 Ẩn Furigana & Romaji';
        romajiElements.forEach(el => el.style.display = 'block');
        textWithRuby.forEach(el => el.style.display = 'block');
        textNoRuby.forEach(el => el.style.display = 'none');
    } else {
        romajiBtnText.textContent = '👁️ Hiện Furigana & Romaji';
        romajiElements.forEach(el => el.style.display = 'none');
        textWithRuby.forEach(el => el.style.display = 'none');
        textNoRuby.forEach(el => el.style.display = 'block');
    }
}

function formatReadingContent(text) {
    // Split by double newline to separate Japanese paragraph from Vietnamese translation
    const parts = text.split('\n\n').filter(part => part.trim());
    let html = '';
    
    for (let part of parts) {
        const trimmedPart = part.trim();
        if (!trimmedPart) continue;

        // Check if it's Japanese text (contains hiragana/katakana/kanji)
        if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(trimmedPart)) {
            // Create two versions: with and without furigana
            let withFurigana = trimmedPart.replace(/([一-龯々]+)\[([ぁ-んァ-ン]+)\]/g, '<ruby>$1<rt>$2</rt></ruby>');
            let withoutFurigana = trimmedPart.replace(/([一-龯々]+)\[([ぁ-んァ-ン]+)\]/g, '$1');
            
            html += `<div class="example" style="margin-bottom: 25px;">
                <div class="japanese-text-no-ruby" style="font-size: 20px; line-height: 2.2; margin-bottom: 10px; text-align: justify;">${withoutFurigana}</div>
                <div class="japanese-text-with-ruby" style="display: none; font-size: 20px; line-height: 2.8; margin-bottom: 10px; text-align: justify;">${withFurigana}</div>
                <div class="romaji-text" style="display: none; color: #9966ff; font-size: 14px; margin-bottom: 10px; font-style: italic; line-height: 1.8; word-wrap: break-word; overflow-wrap: break-word;">${convertToRomaji(trimmedPart)}</div>`;
        } else if (trimmedPart.length > 0 && !trimmedPart.startsWith('#') && !trimmedPart.startsWith('**')) {
            // Vietnamese translation
            html += `<div class="meaning" style="color: #555; font-size: 15px; line-height: 1.8; text-align: justify; padding: 15px; background: rgba(153, 102, 255, 0.1); border-radius: 8px;">${trimmedPart}</div></div>`;
        }
    }

    return html || '<div class="note"><p>Không thể format bài đọc. Vui lòng thử lại!</p></div>';
}

function convertToRomaji(text) {
    // Particles that should be separated
    const particles = ['は', 'が', 'を', 'に', 'へ', 'と', 'の', 'で', 'や', 'も', 'か', 'から', 'まで', 'より'];
    
    // Hiragana to romaji map
    const hiraganaMap = {
        'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
        'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
        'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
        'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
        'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
        'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
        'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
        'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
        'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
        'わ': 'wa', 'を': 'wo', 'ん': 'n',
        'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
        'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
        'だ': 'da', 'ぢ': 'ji', 'づ': 'zu', 'で': 'de', 'ど': 'do',
        'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
        'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
        'きゃ': 'kya', 'きゅ': 'kyu', 'きょ': 'kyo',
        'しゃ': 'sha', 'しゅ': 'shu', 'しょ': 'sho',
        'ちゃ': 'cha', 'ちゅ': 'chu', 'ちょ': 'cho',
        'にゃ': 'nya', 'にゅ': 'nyu', 'にょ': 'nyo',
        'ひゃ': 'hya', 'ひゅ': 'hyu', 'ひょ': 'hyo',
        'みゃ': 'mya', 'みゅ': 'myu', 'みょ': 'myo',
        'りゃ': 'rya', 'りゅ': 'ryu', 'りょ': 'ryo',
        'ぎゃ': 'gya', 'ぎゅ': 'gyu', 'ぎょ': 'gyo',
        'じゃ': 'ja', 'じゅ': 'ju', 'じょ': 'jo',
        'びゃ': 'bya', 'びゅ': 'byu', 'びょ': 'byo',
        'ぴゃ': 'pya', 'ぴゅ': 'pyu', 'ぴょ': 'pyo',
        'っ': '',
        'ー': '-'
    };
    
    // Extract furigana from brackets and add spaces around kanji
    let cleanText = text.replace(/([一-龯々]+)\[([ぁ-んァ-ン]+)\]/g, ' $2 ');
    
    // Add space after punctuation
    cleanText = cleanText.replace(/[。、]/g, ' ');
    
    let result = '';
    let i = 0;
    let currentWord = '';
    
    while (i < cleanText.length) {
        const char = cleanText[i];
        
        // Handle spaces
        if (char === ' ') {
            if (currentWord) {
                result += currentWord + ' ';
                currentWord = '';
            }
            i++;
            continue;
        }
        
        let found = false;
        
        // Try 2-character combinations first (for ゃ, ゅ, ょ)
        if (i < cleanText.length - 1) {
            const twoChar = cleanText.substring(i, i + 2);
            if (hiraganaMap[twoChar]) {
                currentWord += hiraganaMap[twoChar];
                i += 2;
                found = true;
            }
        }
        
        // Try single character
        if (!found) {
            if (hiraganaMap[char]) {
                const romaji = hiraganaMap[char];
                
                // Check if this is a particle
                if (particles.includes(char) && currentWord) {
                    // Add space before particle
                    result += currentWord + ' ';
                    currentWord = '';
                    
                    // Special case: は as particle = wa
                    if (char === 'は') {
                        currentWord = 'wa';
                    } else if (char === 'へ') {
                        currentWord = 'e';
                    } else {
                        currentWord = romaji;
                    }
                } else {
                    currentWord += romaji;
                }
            } else {
                currentWord += char;
            }
            i++;
        }
    }
    
    // Add remaining word
    if (currentWord) {
        result += currentWord;
    }
    
    // Clean up multiple spaces
    return result.replace(/\s+/g, ' ').trim();
}

// Load saved settings on page load
window.addEventListener('DOMContentLoaded', function() {
    // Load music setting
    const musicEnabled = localStorage.getItem('musicEnabled') === 'true';
    const musicToggle = document.getElementById('bgMusicToggle');
    const musicStatus = document.getElementById('musicStatus');
    if (musicEnabled && musicToggle) {
        musicToggle.checked = true;
        musicStatus.textContent = 'Bật';
    }

    // Load dark mode setting
    const darkModeEnabled = localStorage.getItem('darkMode') === 'true';
    const darkModeToggle = document.getElementById('darkModeToggle');
    const darkModeStatus = document.getElementById('darkModeStatus');
    if (darkModeEnabled) {
        document.body.classList.add('dark-mode');
        if (darkModeToggle) {
            darkModeToggle.checked = true;
            darkModeStatus.textContent = 'Bật';
        }
    }
});

// Kanji Test System
const KANJI_DATA = {
    8: [
        {kanji: '家', meaning: 'nhà', reading: 'いえ・うち'},
        {kanji: '族', meaning: 'tộc, gia đình', reading: 'ゾク'},
        {kanji: '父', meaning: 'bố', reading: 'ちち'},
        {kanji: '母', meaning: 'mẹ', reading: 'はは'},
        {kanji: '兄', meaning: 'anh trai', reading: 'あに'},
        {kanji: '弟', meaning: 'em trai', reading: 'おとうと'},
        {kanji: '姉', meaning: 'chị gái', reading: 'あね'},
        {kanji: '妹', meaning: 'em gái', reading: 'いもうと'},
        {kanji: '犬', meaning: 'chó', reading: 'いぬ'},
        {kanji: '高', meaning: 'cao', reading: 'たか'},
        {kanji: '短', meaning: 'ngắn', reading: 'みじか'},
        {kanji: '長', meaning: 'dài', reading: 'なが'}
    ],
    9: [
        {kanji: '好', meaning: 'thích', reading: 'す'},
        {kanji: '歌', meaning: 'bài hát', reading: 'うた'},
        {kanji: '音', meaning: 'âm thanh', reading: 'おと'},
        {kanji: '楽', meaning: 'vui, nhạc', reading: 'たの・らく'},
        {kanji: '車', meaning: 'xe', reading: 'くるま'},
        {kanji: '映', meaning: 'chiếu', reading: 'うつ'},
        {kanji: '画', meaning: 'tranh, phim', reading: 'が'},
        {kanji: '旅', meaning: 'du lịch', reading: 'たび'},
        {kanji: '海', meaning: 'biển', reading: 'うみ'},
        {kanji: '外', meaning: 'ngoài', reading: 'そと'}
    ],
    10: [
        {kanji: '駅', meaning: 'ga tàu', reading: 'えき'},
        {kanji: '上', meaning: 'trên', reading: 'うえ'},
        {kanji: '下', meaning: 'dưới', reading: 'した'},
        {kanji: '地', meaning: 'đất', reading: 'ち'},
        {kanji: '図', meaning: 'bản đồ', reading: 'ず'},
        {kanji: '館', meaning: 'quán', reading: 'かん'},
        {kanji: '右', meaning: 'phải', reading: 'みぎ'},
        {kanji: '左', meaning: 'trái', reading: 'ひだり'},
        {kanji: '道', meaning: 'đường', reading: 'みち'},
        {kanji: '起', meaning: 'dậy', reading: 'お'},
        {kanji: '歩', meaning: 'đi bộ', reading: 'ある'},
        {kanji: '乗', meaning: 'lên (xe)', reading: 'の'}
    ],
    11: [
        {kanji: '始', meaning: 'bắt đầu', reading: 'はじ'},
        {kanji: '終', meaning: 'kết thúc', reading: 'お'},
        {kanji: '勉', meaning: 'cố gắng', reading: 'べん'},
        {kanji: '強', meaning: 'mạnh, học', reading: 'つよ・きょう'},
        {kanji: '朝', meaning: 'buổi sáng', reading: 'あさ'},
        {kanji: '昼', meaning: 'buổi trưa', reading: 'ひる'},
        {kanji: '夜', meaning: 'buổi tối', reading: 'よる'}
    ]
};

let currentTest = {
    lesson: 8,
    questions: [],
    currentIndex: 0,
    score: 0,
    answers: []
};

function loadKanjiTest() {
    const lesson = document.getElementById('lessonSelect').value;
    currentTest.lesson = lesson;
}

function startKanjiTest() {
    const lesson = currentTest.lesson;
    const allKanji = KANJI_DATA[lesson];
    
    // Random 5 kanji
    const shuffled = [...allKanji].sort(() => 0.5 - Math.random());
    currentTest.questions = shuffled.slice(0, 5);
    currentTest.currentIndex = 0;
    currentTest.score = 0;
    currentTest.answers = [];
    
    // Show test area
    document.getElementById('testArea').style.display = 'block';
    document.getElementById('resultArea').style.display = 'none';
    
    showQuestion();
}

function showQuestion() {
    const question = currentTest.questions[currentTest.currentIndex];
    const questionNum = currentTest.currentIndex + 1;
    
    document.getElementById('questionTitle').textContent = `Câu ${questionNum}/5`;
    document.getElementById('kanjiDisplay').textContent = question.kanji;
    
    // Generate options (1 correct + 3 wrong) - using reading instead of meaning
    const allKanji = KANJI_DATA[currentTest.lesson];
    const wrongOptions = allKanji
        .filter(k => k.kanji !== question.kanji)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
    
    const options = [question, ...wrongOptions].sort(() => 0.5 - Math.random());
    
    const optionsArea = document.getElementById('optionsArea');
    optionsArea.innerHTML = '';
    
    options.forEach((opt, index) => {
        const button = document.createElement('button');
        button.className = 'option-button';
        const span = document.createElement('span');
        span.textContent = opt.reading; // Show furigana instead of meaning
        button.appendChild(span);
        button.onclick = () => selectAnswer(opt.kanji === question.kanji, button);
        optionsArea.appendChild(button);
    });
}

function selectAnswer(isCorrect, button) {
    // Disable all buttons
    const buttons = document.querySelectorAll('.option-button');
    buttons.forEach(btn => btn.disabled = true);
    
    // Mark correct/wrong
    if (isCorrect) {
        button.classList.add('correct');
        currentTest.score++;
    } else {
        button.classList.add('wrong');
        // Highlight correct answer
        const question = currentTest.questions[currentTest.currentIndex];
        buttons.forEach(btn => {
            if (btn.textContent === question.reading) {
                btn.classList.add('correct');
            }
        });
    }
    
    // Save answer
    currentTest.answers.push({
        kanji: currentTest.questions[currentTest.currentIndex].kanji,
        reading: currentTest.questions[currentTest.currentIndex].reading,
        correct: isCorrect
    });
    
    // Next question after delay
    setTimeout(() => {
        currentTest.currentIndex++;
        if (currentTest.currentIndex < 5) {
            showQuestion();
        } else {
            showResult();
        }
    }, 1500);
}

function showResult() {
    document.getElementById('testArea').style.display = 'none';
    document.getElementById('resultArea').style.display = 'block';
    
    const scoreTitle = document.getElementById('scoreTitle');
    const resultDetails = document.getElementById('resultDetails');
    
    scoreTitle.textContent = `${currentTest.score}/5`;
    
    let html = '';
    currentTest.answers.forEach((ans, i) => {
        html += `<div class="result-item ${ans.correct ? 'correct' : 'wrong'}">
            <div class="result-kanji">${ans.kanji}</div>
            <div class="result-answer correct-answer">✓ ${ans.reading}</div>
        </div>`;
    });
    
    resultDetails.innerHTML = html;
}

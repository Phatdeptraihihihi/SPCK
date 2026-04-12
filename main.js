const API_URL = "https://69192a329ccba073ee924a89.mockapi.io/rooms";
const QUAN_LIST = ["Quận 1", "Quận 3", "Quận 7", "Quận 10", "Quận Bình Thạnh", "Quận Gò Vấp", "Quận Tân Bình"];

// Kiểm tra trạng thái đăng nhập khi vừa vào trang chủ
const loginStatus = localStorage.getItem("isLoggedIn");
const userData = JSON.parse(localStorage.getItem("currentUser"));
const navLinks = document.querySelector(".nav-links");

if (loginStatus === "true" && userData) {
    // Nếu đã đăng nhập, thay thế nút Đăng nhập bằng tên và nút Đăng xuất
    const loginBtn = document.querySelector(".btn-login");
    if (loginBtn) {
        loginBtn.parentElement.innerHTML = `
            <span style="font-weight:bold; color:#007bff">Chào, ${userData.fullName}</span>
            <a href="#" id="logout-btn" style="margin-left:15px; color:#dc3545; text-decoration:none;">Đăng xuất</a>
        `;
    }
}

// Xử lý sự kiện Đăng xuất
document.addEventListener("click", function(e) {
    if (e.target && e.target.id === "logout-btn") {
        localStorage.clear(); // Xóa toàn bộ dữ liệu đăng nhập
        alert("Đã đăng xuất thành công!");
        window.location.reload(); // Tải lại trang
    }
});

function goToDetail(roomId) {
    const user = localStorage.getItem('user'); // Kiểm tra xem đã có dữ liệu login chưa

    if (!user) {
        // Nếu chưa đăng nhập
        alert("Vui lòng đăng nhập để xem chi tiết phòng và đặt lịch!");
        window.location.href = "login.html"; // Chuyển về trang đăng nhập
    } else {
        // Nếu đã đăng nhập thì cho phép vào xem
        window.location.href = `detail.html?id=${roomId}`;
    }
}

async function init() {
    try {
        const res = await fetch(API_URL);
        const rooms = await res.json();
        
        renderPremium(rooms);
        renderDistricts(rooms);
    } catch (e) { console.error("Lỗi:", e); }
}

function renderPremium(rooms) {
    const premium = rooms.filter(r => parseInt(r.price.replace(/\./g, "")) > 15000000);
    if (premium.length > 0) {
        document.getElementById("section-premium").style.display = "block";
        const track = document.getElementById("premium-track");
        premium.forEach(room => track.innerHTML += createRoomHTML(room));
    }
}

function renderDistricts(rooms) {
    const container = document.getElementById("dynamic-districts");
    if (!container) {
        console.error("Không tìm thấy thẻ có id='dynamic-districts' trong HTML!");
        return;
    }

    // Xóa trắng container trước khi render để tránh bị lặp khi load lại
    container.innerHTML = ""; 

    QUAN_LIST.forEach(quan => {
        // Lọc thông minh: không phân biệt hoa thường
        const roomsInQuan = rooms.filter(r => 
            (r.address || "").toLowerCase().includes(quan.toLowerCase())
        );

        if (roomsInQuan.length > 0) {
            const trackId = `track-${quan.replace(/\s/g, "")}`;
            
            // Tạo HTML cho từng section
            const sectionHTML = `
                <div class="district-section" id="sec-${quan.replace(/\s/g, "")}">
                    <div class="section-title">
                        <h3>Nổi bật tại ${quan}</h3>
                        <span class="line"></span>
                    </div>
                    <div class="slider-wrapper">
                        <button class="slide-btn prev" onclick="slide('${trackId}', -1)">&#10094;</button>
                        <div class="slider-track" id="${trackId}">
                            ${roomsInQuan.map(room => createRoomHTML(room)).join('')}
                        </div>
                        <button class="slide-btn next" onclick="slide('${trackId}', 1)">&#10095;</button>
                    </div>
                </div>
            `;
            container.innerHTML += sectionHTML;
        } else {
            console.warn(`Không tìm thấy phòng nào cho: ${quan}`);
        }
    });
}

function createRoomHTML(room) {
    const statusClass = room.status === "Còn trống" ? "status-green" : "status-red";
    return `
        <div class="room-card">
            <div class="img-wrapper">
                <img src="${room.img}" class="poster">
                <span class="status-badge ${statusClass}">${room.status}</span>
            </div>
            <div class="room-content">
                <h3 class="room-name">${room.name}</h3>
                <p class="room-price">${room.price} VNĐ/tháng</p>
                <div class="room-detail">
                    <p>Diện tích: ${room.area} </p>
                    <p>${room.address}</p>
                </div>
                <button class="btn-detail" onclick="location.href='detail.html?id=${room.id}'">Xem chi tiết</button>
            </div>
        </div>
    `;
}

function slide(id, dir) {
    const el = document.getElementById(id);
    const step = el.querySelector('.room-card').offsetWidth + 20;
    el.scrollLeft += dir * step;
}

// Hàm tìm kiếm nhanh
function searchDistrict() {
    const val = document.getElementById("search-address").value.toLowerCase().replace(/\s/g, "");
    const target = document.getElementById(`sec-${val}`);
    if (target) {
        target.scrollIntoView({ behavior: "smooth" });
    } else {
        alert("Không tìm thấy khu vực này hoặc chưa có phòng!");
    }
}

init();


const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent';

let userApiKey = '';
const chatHistory = []; 

// 2. Dữ liệu thực tế từ hệ thống của bạn (Lấy từ ảnh Quản Lý Hệ Thống)
const websiteData = [
    { "tên": "Phòng Studio Ban Công", "giá": "5.500.000 VNĐ", "diện_tích": "28m2", "địa_chỉ": "Quận 1, TP.HCM", "trạng_thái": "Còn trống" },
    { "tên": "Phòng Trọ Sinh Viên Gác Lửng", "giá": "2.800.000 VNĐ", "diện_tích": "20m2", "địa_chỉ": "Quận Gò Vấp, TP.HCM", "trạng_thái": "Còn trống" },
    { "tên": "Căn Hộ Mini Hiện Đại", "giá": "6.200.000 VNĐ", "diện_tích": "35m2", "địa_chỉ": "Quận Bình Thạnh, TP.HCM", "trạng_thái": "Còn trống" },
    { "tên": "Phòng Trọ KTX Cao Cấp", "giá": "1.800.000 VNĐ", "diện_tích": "15m2", "địa_chỉ": "Quận 7, TP.HCM", "trạng_thái": "Còn trống" },
    { "tên": "Phòng Trọ Cửa Sổ Lớn", "giá": "5.600.000 VNĐ", "diện_tích": "22m2", "địa_chỉ": "Quận Tân Bình, TP.HCM", "trạng_thái": "Còn trống" }
];

// 3. Chỉ thị cho AI (System Instruction)
const systemInstruction = `Bạn là trợ lý ảo của LivingPeaceful. 
Dưới đây là danh sách phòng đang có: ${JSON.stringify(websiteData)}.
Hãy tư vấn dựa trên dữ liệu này. Nếu khách hỏi phòng không có trong danh sách, hãy báo là hiện tại chưa có khu vực đó.
Luôn trả lời thân thiện, ngắn gọn.`;

// --- CÁC HÀM XỬ LÝ GIAO DIỆN ---
function toggleChat() {
    const widget = document.getElementById('chatWidget');
    widget.style.display = (widget.style.display === 'none' || widget.style.display === '') ? 'flex' : 'none';
}

function saveApiKey() {
    const key = document.getElementById('apiKeyInput').value.trim();
    if(key) {
        userApiKey = key;
        document.getElementById('apiKeySetup').style.display = 'none';
        appendMessage('Hệ thống', '✅ Đã nhận API Key! Bạn hỏi gì đi.', 'ai');
    }
}

function handleEnter(e) {
    if (e.key === 'Enter') sendChat();
}

function appendMessage(sender, text, type) {
    const chatBody = document.getElementById('chatWidgetBody');
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg ${type}`;
    msgDiv.innerHTML = `<div class="bubble"><strong>${sender}:</strong><br>${text}</div>`;
    chatBody.appendChild(msgDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

// --- HÀM GỬI TIN NHẮN (QUAN TRỌNG NHẤT) ---
async function sendChat() {
    const inputEl = document.getElementById('chatInput');
    const text = inputEl.value.trim();
    
    if (!text) return;
    if (!userApiKey) {
        alert('Vui lòng nhập API Key trước!');
        return;
    }

    // A. Đẩy tin nhắn người dùng vào giao diện và lịch sử
    appendMessage('Bạn', text, 'user');
    chatHistory.push({ role: 'user', parts: [{ text: text }] }); 
    inputEl.value = '';

    const sendBtn = document.getElementById('sendBtn');
    sendBtn.disabled = true;

    try {
        // B. Gọi API với cấu trúc chuẩn cho bản 3.1
        const response = await fetch(`${GEMINI_API_URL}?key=${userApiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: systemInstruction }] },
                contents: chatHistory // Đây là phần "contents" bạn bị thiếu chữ "s"
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || 'Lỗi không xác định');
        }

        // C. Lấy câu trả lời và hiển thị
        const aiReply = data.candidates[0].content.parts[0].text;
        appendMessage('AI', aiReply, 'ai');
        chatHistory.push({ role: 'model', parts: [{ text: aiReply }] });

    } catch (error) {
        console.error(error);
        appendMessage('Lỗi', error.message, 'ai');
    } finally {
        sendBtn.disabled = false;
    }
}
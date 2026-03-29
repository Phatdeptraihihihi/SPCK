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
    QUAN_LIST.forEach(quan => {
        const roomsInQuan = rooms.filter(r => r.address.includes(quan));
        if (roomsInQuan.length > 0) {
            const trackId = `track-${quan.replace(/\s/g, "")}`;
            container.innerHTML += `
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
                    <p>Diện tích: ${room.area} m²</p>
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


const API_URL = "https://69192a329ccba073ee924a89.mockapi.io/rooms";

let roomsList = [];
let currentPage = 1;
const itemsPerPage = 5; // Số phòng hiển thị trên 1 trang

// Kiểm tra quyền truy cập ngay khi vào trang
function checkAdminRole() {
    const user = JSON.parse(localStorage.getItem('user')); // Giả sử bạn lưu user vào localStorage khi login

    if (!user) {
        alert("Bạn chưa đăng nhập!");
        window.location.href = "login.html";
        return;
    }

    if (user.role !== 'Admin') {
        alert("Bạn không có quyền truy cập vào khu vực quản trị!");
        window.location.href = "index.html"; // Đuổi về trang chủ
    }
}

// Gọi hàm kiểm tra ngay lập tức
checkAdminRole();

// 1. TẢI DỮ LIỆU TỪ API
async function loadData() {
    try {
        const response = await fetch(API_URL);
        roomsList = await response.json();
        renderTable();
    } catch (error) {
        alert("Lỗi không thể tải dữ liệu từ máy chủ!");
        console.error(error);
    }
}

// 2. HIỂN THỊ BẢNG & PHÂN TRANG
function renderTable() {
    const tbody = document.getElementById("admin-table-body");
    tbody.innerHTML = "";

    // Tính toán phân trang
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const currentRooms = roomsList.slice(start, end);

    // Đổ dữ liệu
    currentRooms.forEach(room => {
        const statusColor = room.status === "Còn trống" ? "#28a745" : "#dc3545";
        tbody.innerHTML += `
            <tr>
                <td><img src="${room.img}" style="width: 80px; height: 60px; object-fit: cover; border-radius: 5px;"></td>
                <td>
                    <strong>${room.name}</strong><br>
                    <span style="color: #666; font-size: 13px;">📍 ${room.address}</span>
                </td>
                <td>
                    <strong style="color: #e63946;">${room.price} VNĐ</strong><br>
                    <span style="color: #888; font-size: 13px;">📐 ${room.area} m²</span>
                </td>
                <td><span style="background-color: ${statusColor}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${room.status}</span></td>
                <td>
                    <button class="btn-warning" onclick="editRoom('${room.id}')">Sửa</button>
                    <button class="btn-danger" onclick="deleteRoom('${room.id}')">Xóa</button>
                </td>
            </tr>
        `;
    });

    renderPagination();
}

// 3. TẠO NÚT PHÂN TRANG
function renderPagination() {
    const pagination = document.getElementById("pagination-wrapper");
    pagination.innerHTML = "";
    const totalPages = Math.ceil(roomsList.length / itemsPerPage);

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.innerText = i;
        btn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        btn.onclick = () => {
            currentPage = i;
            renderTable();
        };
        pagination.appendChild(btn);
    }
}

// 4. THÊM / CẬP NHẬT PHÒNG
async function saveRoom() {
    const id = document.getElementById("room-id").value;
    
    const roomData = {
        name: document.getElementById("room-name").value,
        img: document.getElementById("room-img").value,
        price: document.getElementById("room-price").value,
        area: document.getElementById("room-area").value,
        address: document.getElementById("room-address").value,
        utility: document.getElementById("room-utility").value,
        status: document.getElementById("room-status").value
    };

    if (!roomData.name || !roomData.price) {
        alert("Vui lòng điền ít nhất Tên phòng và Giá tiền!");
        return;
    }

    const method = id ? "PUT" : "POST";
    const url = id ? `${API_URL}/${id}` : API_URL;

    try {
        await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(roomData)
        });
        
        alert(id ? "Cập nhật thành công!" : "Thêm phòng thành công!");
        toggleForm(); // Ẩn form
        loadData();   // Tải lại bảng
    } catch (error) {
        alert("Có lỗi xảy ra khi lưu!");
    }
}

// 5. ĐỔ DỮ LIỆU ĐỂ SỬA
function editRoom(id) {
    const room = roomsList.find(r => r.id === id);
    if (!room) return;

    document.getElementById("room-id").value = room.id;
    document.getElementById("room-name").value = room.name;
    document.getElementById("room-img").value = room.img;
    document.getElementById("room-price").value = room.price;
    document.getElementById("room-area").value = room.area;
    document.getElementById("room-address").value = room.address;
    document.getElementById("room-utility").value = room.utility;
    document.getElementById("room-status").value = room.status;

    document.getElementById("form-title").innerText = "Chỉnh Sửa Phòng";
    document.getElementById("form-container").style.display = "block";
    window.scrollTo(0, 0);
}

// 6. XÓA PHÒNG
async function deleteRoom(id) {
    if (confirm("Bạn có chắc chắn muốn xóa phòng này?")) {
        await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        loadData();
    }
}

// 7. ẨN / HIỆN FORM
function toggleForm() {
    const form = document.getElementById("form-container");
    if (form.style.display === "none") {
        form.style.display = "block";
        document.getElementById("form-title").innerText = "Thêm Phòng Mới";
        clearForm();
    } else {
        form.style.display = "none";
        clearForm();
    }
}

function clearForm() {
    document.getElementById("room-id").value = "";
    document.getElementById("room-name").value = "";
    document.getElementById("room-img").value = "";
    document.getElementById("room-price").value = "";
    document.getElementById("room-area").value = "";
    document.getElementById("room-address").value = "";
    document.getElementById("room-utility").value = "";
    document.getElementById("room-status").value = "Còn trống";
}

loadData();
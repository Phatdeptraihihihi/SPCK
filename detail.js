const API_URL = "https://69192a329ccba073ee924a89.mockapi.io/rooms";
const QUAN_LIST = ["Quận 1", "Quận 3", "Quận 7", "Quận 10", "Bình Thạnh", "Gò Vấp", "Tân Bình"];

async function loadRoomDetail() {
    // 1. Lấy ID phòng từ thanh URL
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('id');

    if (!roomId) {
        alert("Không tìm thấy thông tin phòng!");
        window.location.href = 'index.html';
        return;
    }

    try {
        // 2. Tải toàn bộ dữ liệu phòng
        const res = await fetch(API_URL);
        const allRooms = await res.json();

        // 3. Tìm phòng hiện tại đang xem
        const currentRoom = allRooms.find(r => r.id === roomId);
        if (!currentRoom) {
            alert("Phòng này không còn tồn tại!");
            return;
        }

        // 4. Vẽ giao diện Chi tiết phòng (Phần trên)
        renderDetailInfo(currentRoom);

        // 5. Lọc và vẽ các phòng tương tự (Phần dưới)
        renderRelatedRooms(currentRoom, allRooms);

    } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
    }
}

// HÀM VẼ THÔNG TIN CHI TIẾT (Bố cục 50/50 theo CSS của bạn)
function renderDetailInfo(room) {
    const container = document.getElementById('room-detail');
    const statusClass = room.status === "Còn trống" ? "status-green" : "status-red";

    container.innerHTML = `
        <img src="${room.img}" class="detail-img" alt="${room.name}">
        <div class="detail-content">
            <span class="status-badge ${statusClass}" style="position: static; display: inline-block; margin-bottom: 10px;">${room.status}</span>
            <h1 style="font-size: 28px; margin-bottom: 15px;">${room.name}</h1>
            <div class="price-tag">${room.price} VNĐ/tháng</div>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin-bottom: 8px;"><strong>Địa chỉ:</strong> ${room.address}</p>
                <p><strong>Diện tích:</strong> ${room.area} m²</p>
            </div>

            <div style="line-height: 1.6; color: #444; margin-bottom: 30px;">
                <h3 style="margin-bottom: 10px;">Mô tả tiện ích:</h3>
                <p>✔️ Phòng sạch sẽ, thoáng mát, khu vực an ninh cao.</p>
                <p>✔️ Có sẵn máy lạnh, tủ lạnh, giường nệm.</p>
                <p>✔️ Giờ giấc tự do, không chung chủ.</p>
            </div>

            <button class="btn-detail" style="background: #28a745; font-size: 18px;" onclick="alert('Đã gửi yêu cầu liên hệ cho chủ nhà!')">📞 Liên hệ thuê ngay</button>
        </div>
    `;
}

// HÀM TÌM VÀ VẼ CÁC PHÒNG TƯƠNG TỰ
function renderRelatedRooms(currentRoom, allRooms) {
    const track = document.getElementById('related-track');
    
    // Tìm xem phòng hiện tại thuộc Quận nào
    let currentDistrict = "";
    for (let quan of QUAN_LIST) {
        if (currentRoom.address.includes(quan)) {
            currentDistrict = quan;
            break;
        }
    }

    // Lọc ra các phòng: Cùng quận VÀ Khác ID với phòng đang xem
    let relatedRooms = allRooms.filter(room => 
        room.id !== currentRoom.id && room.address.includes(currentDistrict)
    );

    // Nếu có phòng liên quan thì hiện Section đó lên
    if (relatedRooms.length > 0) {
        document.getElementById('related-section').style.display = "block";
        
        // Tạo Card HTML (Dùng chung hàm tạo Card giống bên index để đồng bộ)
        track.innerHTML = relatedRooms.map(room => `
            <div class="room-card">
                <div class="img-wrapper">
                    <img src="${room.img}" class="poster">
                    <span class="status-badge ${room.status === 'Còn trống' ? 'status-green' : 'status-red'}">${room.status}</span>
                </div>
                <div class="room-content">
                    <h3 class="room-name">${room.name}</h3>
                    <p class="room-price">${room.price} VNĐ/tháng</p>
                    <div class="room-detail">
                        <p>${room.area} m²</p>
                        <p>${room.address}</p>
                    </div>
                    <button class="btn-detail" onclick="location.href='detail.html?id=${room.id}'">Xem chi tiết</button>
                </div>
            </div>
        `).join('');
    }
}

// HÀM TRƯỢT CAROUSEL (Dùng chung)
function slide(id, dir) {
    const el = document.getElementById(id);
    if(el.querySelector('.room-card')) {
        const step = el.querySelector('.room-card').offsetWidth + 20;
        el.scrollLeft += dir * step;
    }
}

// Chạy hàm khi trang load xong
document.addEventListener("DOMContentLoaded", loadRoomDetail);
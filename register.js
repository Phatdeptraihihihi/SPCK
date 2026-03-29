const API_USERS = "https://69192a329ccba073ee924a89.mockapi.io/users";
const registerForm = document.getElementById("register-form");
const errorMsg = document.getElementById("reg-error");

registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    // Lấy dữ liệu từ các ô input
    const fullName = document.getElementById("reg-fullname").value.trim();
    const username = document.getElementById("reg-username").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value.trim();
    const confirmPw = document.getElementById("reg-confirm").value.trim();

    // 1. Kiểm tra mật khẩu khớp nhau không
    if (password !== confirmPw) {
        errorMsg.innerText = "Mật khẩu xác nhận không khớp!";
        errorMsg.style.display = "block";
        return;
    }

    try {
        // 2. Kiểm tra xem Username đã tồn tại trên hệ thống chưa
        const response = await fetch(API_USERS);
        const users = await response.json();
        const isExisted = users.some(user => user.username === username);

        if (isExisted) {
            errorMsg.innerText = "Tên đăng nhập này đã có người sử dụng!";
            errorMsg.style.display = "block";
            return;
        }

        // 3. Nếu mọi thứ OK, tiến hành gửi dữ liệu (POST)
        const newUser = {
            fullName: fullName,
            username: username,
            password: password,
            email: email,
            role: "user", // Mặc định tài khoản mới là người thuê
            avatar: `https://i.pravatar.cc/150?u=${username}` // Tạo avatar ngẫu nhiên theo tên
        };

        const postResponse = await fetch(API_USERS, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newUser)
        });

        if (postResponse.ok) {
            alert("Chúc mừng! Bạn đã đăng ký tài khoản thành công.");
            window.location.href = "login.html"; // Chuyển sang trang đăng nhập
        }

    } catch (error) {
        console.error("Lỗi đăng ký:", error);
        errorMsg.innerText = "Đã xảy ra lỗi, vui lòng thử lại sau!";
        errorMsg.style.display = "block";
    }
});
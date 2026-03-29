const API_USERS = "https://69192a329ccba073ee924a89.mockapi.io/users";
const loginForm = document.getElementById("login-form");
const errorMsg = document.getElementById("error-msg");

loginForm.addEventListener("submit", function (event) {
    event.preventDefault(); // Ngăn trang web tải lại

    const usernameInput = document.getElementById("username").value.trim();
    const passwordInput = document.getElementById("password").value.trim();

    // 1. Gọi API lấy danh sách user
    fetch(API_USERS)
        .then(res => res.json())
        .then(users => {
            // 2. Tìm user khớp với thông tin nhập vào
            const user = users.find(u => u.username === usernameInput && u.password === passwordInput);

            if (user) {
                // 3. Nếu đúng: Lưu thông tin vào localStorage để các trang khác biết đã đăng nhập
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("currentUser", JSON.stringify({
                    fullName: user.fullName,
                    role: user.role,
                    avatar: user.avatar
                }));

                alert(`Đăng nhập thành công! Chào ${user.fullName}`);
                
                // Chuyển hướng về trang chủ
                window.location.href = "index.html";
            } else {
                // 4. Nếu sai: Hiển thị thông báo lỗi
                errorMsg.innerText = "Tên đăng nhập hoặc mật khẩu không đúng!";
                errorMsg.style.display = "block";
            }
        })
        .catch(err => {
            console.error("Lỗi kết nối API:", err);
            errorMsg.innerText = "Không thể kết nối với máy chủ!";
            errorMsg.style.display = "block";
        });
});

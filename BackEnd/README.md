# BlueMoon

**E hướng dẫn ngài cách test API nhe**

Ngài test trên Postman vẫn như bthg nhma đầu tiên ngài cần vào http://localhost:9090/api/auth/login để lấy token đã 

Ví dụ ngài vào http://localhost:9090/api/auth/login, nhập {
    "name":"hoangdarkdao",
    "password": "1234567890"
} 

**thì nó trả về token : eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiUk9MRV9VU0VSIiwic3ViIjoiaG9hbmdkYXJrZGFvIiwiaWF0IjoxNzQyNDU3NDc2LCJleHAiOjE3NDI0NjEwNzZ9.U4kwQuAoVpcJhiaDZ9KsfXgDQ0HYiwaZ3W6L-4_mZ1g**

![Alt text](image/anh1.png)

Xong rồi nếu ngài muốn test mấy API của admin với user thì phải gửi kèm theo cái token này thì mới truy cập được.

**E demo thử cái API changepassword cho User nhé**: 

1. **Nhập token trước** : ![Alt text](image/anh3.png)

2. **Đổi password** : ![Alt text](image/anh2.png)


**Final: Ngài có thể code MVC như bình thường xong r up Controller lên ChatGPT bảo nó chỉnh lại cho khớp với frontend ReactJS là nó tự generate ra RestAPI :))) Uy tín**

# CDS Evaluation System (Backend)

这是一个基于 Cloudflare Workers (JavaScript) + D1 数据库的课程评价系统后端。

## 技术栈

*   **Runtime**: Cloudflare Workers (JavaScript)
*   **Database**: Cloudflare D1 (SQLite)
*   **Auth**: JWT (HS256, 使用原生 Web Crypto API 实现) + PBKDF2 密码哈希

## 接口文档 (API Documentation)

### 基本说明
*   **Base URL**: (本地) `http://127.0.0.1:8787` / (生产) `你的Worker域名`
*   **Content-Type**: `application/json`
*   **认证方式**: 在 Header 中添加 `Authorization: Bearer <your_token>`
*   **通用响应格式**:
    ```json
    {
        "code": 200,
        "data": { ... }, // 具体数据
        "msg": "Success"
    }
    ```
    *错误响应示例*:
    ```json
    {
        "code": 400,
        "data": null,
        "msg": "Username and password required"
    }
    ```

---

### 1. 认证模块 (Auth)

#### 1.1 用户注册
*   **URL**: `/api/auth/register`
*   **Method**: `POST`
*   **权限**: 公开
*   **请求体 (Body)**:
    ```json
    {
        "username": "student1",
        "password": "password123",
        "role": "user" // 可选: "user" (默认) 或 "admin"
    }
    ```
*   **成功响应 (201)**:
    ```json
    {
        "code": 201,
        "data": {
            "message": "User registered successfully",
            "id": 1
        },
        "msg": "Success"
    }
    ```

#### 1.2 用户登录
*   **URL**: `/api/auth/login`
*   **Method**: `POST`
*   **权限**: 公开
*   **请求体 (Body)**:
    ```json
    {
        "username": "student1",
        "password": "password123"
    }
    ```
*   **成功响应 (200)**:
    ```json
    {
        "code": 200,
        "data": {
            "token": "eyJhbGciOiJIUzI1Ni...",
            "user": {
                "id": 1,
                "username": "student1",
                "role": "user"
            }
        },
        "msg": "Success"
    }
    ```

---

### 2. 课程模块 (Courses)

#### 2.1 获取课程列表
*   **URL**: `/api/courses`
*   **Method**: `GET`
*   **权限**: 公开
*   **参数 (Query Params)**:
    *   `major` (可选): 筛选专业，例如 `CS`, `ECIC`
*   **成功响应 (200)**:
    ```json
    {
        "code": 200,
        "data": [
            {
                "id": 1,
                "course_code": "CS101",
                "course_name": "Intro to CS",
                "professor": "Prof. Smith",
                "major": "CS",
                "created_at": "2023-10-01 12:00:00"
            }
        ],
        "msg": "Success"
    }
    ```

#### 2.2 获取课程详情
*   **URL**: `/api/courses/:id` (例如: `/api/courses/1`)
*   **Method**: `GET`
*   **权限**: 公开
*   **成功响应 (200)**:
    ```json
    {
        "code": 200,
        "data": {
            "id": 1,
            "course_code": "CS101",
            "course_name": "Intro to CS",
            ...
        },
        "msg": "Success"
    }
    ```

#### 2.3 创建课程
*   **URL**: `/api/courses`
*   **Method**: `POST`
*   **权限**: **管理员 (Admin)**
*   **请求体 (Body)**:
    ```json
    {
        "course_code": "CS101",
        "course_name": "Intro to CS",
        "professor": "Prof. Smith", // 选填
        "major": "CS"               // 选填
    }
    ```
*   **成功响应 (201)**:
    ```json
    {
        "code": 201,
        "data": { "id": 1 },
        "msg": "Success"
    }
    ```

#### 2.4 更新课程
*   **URL**: `/api/courses/update/:id` (例如: `/api/courses/update/1`)
*   **Method**: `POST`
*   **权限**: **管理员 (Admin)**
*   **请求体 (Body)** (仅需提供要修改的字段):
    ```json
    {
        "course_name": "Advanced CS",
        "professor": "Prof. Johnson"
    }
    ```
*   **成功响应 (200)**:
    ```json
    {
        "code": 200,
        "data": { "message": "Updated" },
        "msg": "Success"
    }
    ```

#### 2.5 删除课程
*   **URL**: `/api/courses/delete/:id` (例如: `/api/courses/delete/1`)
*   **Method**: `POST`
*   **权限**: **管理员 (Admin)**
*   **成功响应 (200)**:
    ```json
    {
        "code": 200,
        "data": { "message": "Deleted" },
        "msg": "Success"
    }
    ```

---

### 3. 评价模块 (Evaluations)

#### 3.1 创建评价
*   **URL**: `/api/evaluations`
*   **Method**: `POST`
*   **权限**: **登录用户**
*   **请求体 (Body)**:
    ```json
    {
        "course_id": 1,
        "overall_rating": 9,          // 1-10
        "teaching_difficulty": 5,     // 1-10
        "assignment_difficulty": 7,   // 1-10
        "exam_difficulty": 6,         // 1-10
        "has_tests": true,            // boolean 或 0/1
        "has_final_exam": true,       // boolean 或 0/1
        "attendance_checked": false,  // boolean 或 0/1
        "comment": "Great course!"    // 文本
    }
    ```
*   **成功响应 (201)**:
    ```json
    {
        "code": 201,
        "data": { "id": 101 },
        "msg": "Success"
    }
    ```

#### 3.2 获取某课程的所有评价
*   **URL**: `/api/courses/:course_id/evaluations` (例如: `/api/courses/1/evaluations`)
*   **Method**: `GET`
*   **权限**: 公开
*   **成功响应 (200)**:
    ```json
    {
        "code": 200,
        "data": [
            {
                "id": 101,
                "user_id": 12,
                "username": "student1", // 评价者用户名
                "overall_rating": 9,
                "comment": "Great course!",
                "created_at": "...",
                ...
            }
        ],
        "msg": "Success"
    }
    ```

#### 3.3 获取当前用户的所有评价
*   **URL**: `/api/user/evaluations`
*   **Method**: `GET`
*   **权限**: **登录用户**
*   **成功响应 (200)**:
    ```json
    {
        "code": 200,
        "data": [
            {
                "id": 101,
                "course_id": 1,
                "course_code": "CS101",
                "course_name": "Intro to CS",
                "professor": "Prof. Smith",
                "overall_rating": 9,
                "comment": "Great course!",
                ...
            }
        ],
        "msg": "Success"
    }
    ```

#### 3.4 更新评价
*   **URL**: `/api/evaluations/update/:id`
*   **Method**: `POST`
*   **权限**: **管理员 (Admin)**
*   **请求体 (Body)**:
    ```json
    {
        "comment": "Updated comment by admin",
        "overall_rating": 8
    }
    ```
*   **成功响应 (200)**:
    ```json
    {
        "code": 200,
        "data": { "message": "Updated" },
        "msg": "Success"
    }
    ```

#### 3.5 删除评价
*   **URL**: `/api/evaluations/delete/:id`
*   **Method**: `POST`
*   **权限**: **管理员 (Admin)**
*   **成功响应 (200)**:
    ```json
    {
        "code": 200,
        "data": { "message": "Deleted" },
        "msg": "Success"
    }
    ```

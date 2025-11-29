CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,           -- 用户名，唯一
    password_hash VARCHAR(255) NOT NULL,             -- 密码哈希 (不要存明文)
    role VARCHAR(255), -- 角色：普通用户或管理员
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_code VARCHAR(255) NOT NULL UNIQUE,        -- 课程编号 (如: CS101)
    course_name VARCHAR(255) NOT NULL,               -- 课程名称
    professor VARCHAR(255),                          -- 教授姓名 (选填)
    major VARCHAR(255),                         -- 专业划分 (如: ECIC, CS, FADT, STAT)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS evaluations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    -- 评分项 (1-10分)
    overall_rating INTEGER DEFAULT 0,       -- 总体评分
    teaching_difficulty INTEGER DEFAULT 0, -- 授课难度
    assignment_difficulty INTEGER DEFAULT 0, -- 作业难度
    exam_difficulty INTEGER DEFAULT 0,     -- 考试难度
    -- 是非项 (0 或 1)
    has_tests INTEGER DEFAULT 0,              -- 是否有课内测试
    has_final_exam INTEGER DEFAULT 0,    -- 是否有期末考试
    attendance_checked INTEGER DEFAULT 0, -- 是否考勤
    -- 文本评价
    comment TEXT                            -- 其他评价文本
);
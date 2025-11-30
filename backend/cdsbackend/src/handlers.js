// src/handlers.js
import { jsonResponse, errorResponse, parseBody, hashPassword, verifyPassword, createToken, requireAuth } from './utils';

// --- Auth ---

export async function register(request, env) {
  const data = await parseBody(request);
  const { username, password, role = 'user' } = data;

  if (!username || !password) {
    return errorResponse("Username and password required");
  }

  // Check existing
  const existing = await env.DB.prepare("SELECT id FROM users WHERE username = ?").bind(username).first();
  if (existing) {
    return errorResponse("User already exists");
  }

  const hashedPassword = await hashPassword(password);

  try {
    const res = await env.DB.prepare(
      "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)"
    ).bind(username, hashedPassword, role).run();

    return jsonResponse({ message: "User registered successfully", id: res.meta.last_row_id }, 201);
  } catch (e) {
    return errorResponse(e.message, 500);
  }
}

export async function login(request, env) {
  const data = await parseBody(request);
  const { username, password } = data;

  if (!username || !password) {
    return errorResponse("Username and password required");
  }

  const user = await env.DB.prepare("SELECT * FROM users WHERE username = ?").bind(username).first();
  
  if (!user || !(await verifyPassword(user.password_hash, password))) {
    return errorResponse("Invalid credentials", 401);
  }

  const token = await createToken(user, env);
  return jsonResponse({
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role
    }
  });
}

// --- Courses ---

export async function getCourses(request, env) {
  const url = new URL(request.url);
  const major = url.searchParams.get("major");

  let query = "SELECT * FROM courses";
  let args = [];

  if (major) {
    query += " WHERE major = ?";
    args.push(major);
  }

  const { results } = await env.DB.prepare(query).bind(...args).all();
  return jsonResponse(results);
}

export async function getCourseDetail(request, env, ctx, courseId) {
  const course = await env.DB.prepare("SELECT * FROM courses WHERE id = ?").bind(courseId).first();
  if (!course) {
    return errorResponse("Course not found", 404);
  }
  return jsonResponse(course);
}

export async function createCourse(request, env) {
  const user = await requireAuth(request, env, "admin");
  if (!user) return errorResponse("Unauthorized", 403);

  const data = await parseBody(request);
  if (!data.course_code || !data.course_name) {
    return errorResponse("Missing required fields");
  }

  try {
    const res = await env.DB.prepare(
      "INSERT INTO courses (course_code, course_name, professor, major) VALUES (?, ?, ?, ?)"
    ).bind(
      data.course_code,
      data.course_name,
      data.professor || null,
      data.major || null
    ).run();

    return jsonResponse({ id: res.meta.last_row_id }, 201);
  } catch (e) {
    return errorResponse(e.message);
  }
}

export async function updateCourse(request, env, ctx, courseId) {
  const user = await requireAuth(request, env, "admin");
  if (!user) return errorResponse("Unauthorized", 403);

  const data = await parseBody(request);
  const allowed = ["course_code", "course_name", "professor", "major"];
  const fields = [];
  const values = [];

  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(data[key]);
    }
  }

  if (fields.length === 0) return errorResponse("No fields to update");

  values.push(courseId);
  const query = `UPDATE courses SET ${fields.join(", ")} WHERE id = ?`;

  await env.DB.prepare(query).bind(...values).run();
  return jsonResponse({ message: "Updated" });
}

export async function deleteCourse(request, env, ctx, courseId) {
  const user = await requireAuth(request, env, "admin");
  if (!user) return errorResponse("Unauthorized", 403);

  await env.DB.prepare("DELETE FROM courses WHERE id = ?").bind(courseId).run();
  return jsonResponse({ message: "Deleted" });
}

// --- Evaluations ---

export async function createEvaluation(request, env) {
  const user = await requireAuth(request, env);
  if (!user) return errorResponse("Unauthorized", 401);

  const data = await parseBody(request);
  const required = ["course_id", "overall_rating", "teaching_difficulty", "assignment_difficulty", "exam_difficulty"];
  
  for (const key of required) {
    if (data[key] === undefined) return errorResponse(`Missing field: ${key}`);
  }

  try {
    // Check existing
    const existing = await env.DB.prepare(
      "SELECT id FROM evaluations WHERE user_id = ? AND course_id = ?"
    ).bind(user.sub, data.course_id).first();
    
    if (existing) {
      return errorResponse("You have already evaluated this course");
    }

    const query = `
      INSERT INTO evaluations (
        user_id, course_id, 
        overall_rating, teaching_difficulty, assignment_difficulty, exam_difficulty,
        has_tests, has_final_exam, attendance_checked, comment
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      user.sub, data.course_id,
      data.overall_rating, data.teaching_difficulty,
      data.assignment_difficulty, data.exam_difficulty,
      data.has_tests ? 1 : 0,
      data.has_final_exam ? 1 : 0,
      data.attendance_checked ? 1 : 0,
      data.comment || null
    ];

    const res = await env.DB.prepare(query).bind(...values).run();
    return jsonResponse({ id: res.meta.last_row_id }, 201);
  } catch (e) {
    return errorResponse(e.message);
  }
}

export async function getCourseEvaluations(request, env, ctx, courseId) {
  const query = `
    SELECT e.*, u.username 
    FROM evaluations e 
    JOIN users u ON e.user_id = u.id 
    WHERE e.course_id = ?
    ORDER BY e.created_at DESC
  `;
  const { results } = await env.DB.prepare(query).bind(courseId).all();
  return jsonResponse(results);
}

export async function getUserEvaluations(request, env) {
  const user = await requireAuth(request, env);
  if (!user) return errorResponse("Unauthorized", 401);

  const query = `
    SELECT e.*, c.course_code, c.course_name, c.professor
    FROM evaluations e
    JOIN courses c ON e.course_id = c.id
    WHERE e.user_id = ?
    ORDER BY e.created_at DESC
  `;
  const { results } = await env.DB.prepare(query).bind(user.sub).all();
  return jsonResponse(results);
}

export async function getEvaluationDetail(request, env, ctx, evalId) {
  // Allow anyone to read evaluation detail? Or just authenticated?
  // Assuming public read for now as course details are public-ish.
  // Or require auth. Let's require auth to be safe, or at least check if it exists.
  const evaluation = await env.DB.prepare("SELECT * FROM evaluations WHERE id = ?").bind(evalId).first();
  if (!evaluation) {
    return errorResponse("Evaluation not found", 404);
  }
  return jsonResponse(evaluation);
}

export async function updateEvaluation(request, env, ctx, evalId) {
  const user = await requireAuth(request, env);
  if (!user) return errorResponse("Unauthorized", 401);

  // Fetch existing evaluation to check ownership
  const evaluation = await env.DB.prepare("SELECT * FROM evaluations WHERE id = ?").bind(evalId).first();
  if (!evaluation) {
    return errorResponse("Evaluation not found", 404);
  }

  // Allow if admin or owner
  if (user.role !== 'admin' && evaluation.user_id !== user.sub) {
    return errorResponse("Unauthorized", 403);
  }

  const data = await parseBody(request);
  const allowed = [
    "overall_rating", "teaching_difficulty", "assignment_difficulty", 
    "exam_difficulty", "has_tests", "has_final_exam", 
    "attendance_checked", "comment"
  ];
  
  const fields = [];
  const values = [];

  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      // Handle boolean to int conversion if necessary, but SQLite is loose.
      // Best to be consistent.
      if (["has_tests", "has_final_exam", "attendance_checked"].includes(key)) {
          values.push(data[key] ? 1 : 0);
      } else {
          values.push(data[key]);
      }
    }
  }

  if (fields.length === 0) return errorResponse("No fields");

  values.push(evalId);
  const query = `UPDATE evaluations SET ${fields.join(", ")} WHERE id = ?`;

  await env.DB.prepare(query).bind(...values).run();
  return jsonResponse({ message: "Updated" });
}

export async function deleteEvaluation(request, env, ctx, evalId) {
  const user = await requireAuth(request, env);
  if (!user) return errorResponse("Unauthorized", 401);

  // Fetch existing evaluation to check ownership
  const evaluation = await env.DB.prepare("SELECT * FROM evaluations WHERE id = ?").bind(evalId).first();
  if (!evaluation) {
    return errorResponse("Evaluation not found", 404);
  }

  // Allow if admin or owner
  if (user.role !== 'admin' && evaluation.user_id !== user.sub) {
    return errorResponse("Unauthorized", 403);
  }

  await env.DB.prepare("DELETE FROM evaluations WHERE id = ?").bind(evalId).run();
  return jsonResponse({ message: "Deleted" });
}

// --- Statistics ---

export async function getStatistics(request, env) {
  // Course Stats: Average rating per course
  const courseStatsQuery = `
    SELECT 
      c.course_name, 
      c.course_code,
      AVG(e.overall_rating) as avg_rating, 
      COUNT(e.id) as count 
    FROM evaluations e 
    JOIN courses c ON e.course_id = c.id 
    GROUP BY c.id
    ORDER BY avg_rating DESC
  `;
  const { results: courseStats } = await env.DB.prepare(courseStatsQuery).all();

  // Comments for Word Cloud: Fetch all comments (limit if necessary)
  const commentsQuery = `
    SELECT comment 
    FROM evaluations 
    WHERE comment IS NOT NULL AND comment != ''
    ORDER BY created_at DESC 
    LIMIT 500
  `;
  const { results: comments } = await env.DB.prepare(commentsQuery).all();

  // Counts
  const userCount = await env.DB.prepare("SELECT COUNT(*) as count FROM users").first();
  const courseCount = await env.DB.prepare("SELECT COUNT(*) as count FROM courses").first();
  const evalCount = await env.DB.prepare("SELECT COUNT(*) as count FROM evaluations").first();

  return jsonResponse({
    courseStats,
    comments: comments.map(c => c.comment),
    counts: {
      users: userCount.count,
      courses: courseCount.count,
      evaluations: evalCount.count
    }
  });
}

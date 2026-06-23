const pool = require('../config/database');
const { success, failure } = require('../utils/response');

const normalizeAnswers = (answers) => {

  if (Array.isArray(answers)) {
    return answers;
  }

  if (answers && typeof answers === 'object') {
    return Object.entries(answers).map(([question_id, answer_id]) => ({
      question_id: parseInt(question_id, 10),
      answer_id,
    }));
  }

  return [];
};

const getQuizWithQuestions = async (quizId, includeCorrect = true) => {
  const [quizRows] = await pool.query(
    `SELECT q.*, u.name as creator_name,
      (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) as questions_count
     FROM quizzes q
     LEFT JOIN users u ON q.created_by = u.id
     WHERE q.id = ? LIMIT 1`,
    [quizId]
  );

  if (quizRows.length === 0) {
    return null;
  }

  const [questions] = await pool.query('SELECT * FROM questions WHERE quiz_id = ? ORDER BY id ASC', [quizId]);
  const questionIds = questions.map((q) => q.id);
  let answersByQuestion = {};

  if (questionIds.length > 0) {
    const select = includeCorrect ? 'id, question_id, answer_text, is_correct' : 'id, question_id, answer_text';
    const [answers] = await pool.query(
      `SELECT ${select} FROM answers WHERE question_id IN (?) ORDER BY id ASC`,
      [questionIds]
    );
    answersByQuestion = answers.reduce((acc, answer) => {
      if (!acc[answer.question_id]) acc[answer.question_id] = [];
      acc[answer.question_id].push(answer);
      return acc;
    }, {});
  }

  return {
    ...quizRows[0],
    creator: quizRows[0].creator_name ? { id: quizRows[0].created_by, name: quizRows[0].creator_name } : null,
    questions: questions.map((question) => ({
      ...question,
      answers: answersByQuestion[question.id] || [],
    })),
  };
};

// GET /api/quizzes
exports.index = async (req, res) => {
  try {
    const [rows] = await pool.query(

      `SELECT q.*, 
        (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) as total_questions,
        (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) as questions_count,
        u.name as creator_name
       FROM quizzes q
       LEFT JOIN users u ON q.created_by = u.id
       WHERE q.is_active = 1
       ORDER BY q.created_at DESC`
    );

    const quizzes = rows.map((row) => ({
      ...row,
      creator: row.creator_name ? { id: row.created_by, name: row.creator_name } : null,
    }));

    return success(res, { quizzes, data: quizzes });
  } catch (error) {
    console.error('Get quizzes error:', error);
    return failure(res, 'Terjadi kesalahan server', 500);
  }
};


// POST /api/quizzes
exports.store = async (req, res) => {
  try {
    const { title, description, time_limit, passing_score, is_active } = req.body;

    if (!title) {
      return failure(res, 'title wajib diisi', 400);
    }

    const [result] = await pool.query(
      'INSERT INTO quizzes (title, description, time_limit, passing_score, is_active, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [title, description || null, time_limit || 0, passing_score || 70, is_active === undefined ? 1 : (is_active ? 1 : 0), req.user.id]
    );

    const quiz = await getQuizWithQuestions(result.insertId);
    return success(res, { message: 'Quiz berhasil dibuat', quiz }, 201);
  } catch (error) {
    console.error('Store quiz error:', error);
    return failure(res, 'Terjadi kesalahan server', 500);
  }
};


// GET /api/quizzes/:id/questions
exports.questions = async (req, res) => {
  try {
    const quiz = await getQuizWithQuestions(req.params.id, req.user.role === 'guru');
    if (!quiz) {
      return failure(res, 'Quiz tidak ditemukan', 404);
    }

    return success(res, { quiz, questions: quiz.questions });
  } catch (error) {

    console.error('Get quiz questions error:', error);
    return failure(res, 'Terjadi kesalahan server', 500);
  }
};


// PUT /api/quizzes/:id
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, time_limit, passing_score, is_active } = req.body;

    const [existing] = await pool.query('SELECT id FROM quizzes WHERE id = ? LIMIT 1', [id]);
    if (existing.length === 0) {
      return failure(res, 'Quiz tidak ditemukan', 404);
    }


    await pool.query(
      `UPDATE quizzes SET
       title = COALESCE(?, title),
       description = COALESCE(?, description),
       time_limit = COALESCE(?, time_limit),
       passing_score = COALESCE(?, passing_score),
       is_active = COALESCE(?, is_active),
       updated_at = NOW()
       WHERE id = ?`,
      [
        title || null,
        description || null,
        time_limit !== undefined ? time_limit : null,
        passing_score !== undefined ? passing_score : null,
        is_active !== undefined ? (is_active ? 1 : 0) : null,
        id,
      ]
    );

    const quiz = await getQuizWithQuestions(id);
    return success(res, { message: 'Quiz berhasil diubah', quiz });
  } catch (error) {
    console.error('Update quiz error:', error);
    return failure(res, 'Terjadi kesalahan server', 500);
  }
};


// DELETE /api/quizzes/:id
exports.destroy = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM quizzes WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return failure(res, 'Quiz tidak ditemukan', 404);
    }
    return success(res, { message: 'Quiz berhasil dihapus' });
  } catch (error) {
    console.error('Delete quiz error:', error);
    return failure(res, 'Terjadi kesalahan server', 500);
  }
};


// POST /api/quizzes/:id/questions
exports.storeQuestion = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const { question_text, points, answers } = req.body;

    if (!question_text || !Array.isArray(answers) || answers.length < 2) {
      return failure(res, 'question_text dan minimal 2 answers wajib diisi', 400);
    }
    if (!answers.some((answer) => answer.is_correct)) {
      return failure(res, 'Minimal satu jawaban benar wajib dipilih', 400);
    }


    const [quizRows] = await connection.query('SELECT id FROM quizzes WHERE id = ? LIMIT 1', [id]);
    if (quizRows.length === 0) {
      return failure(res, 'Quiz tidak ditemukan', 404);
    }


    await connection.beginTransaction();
    const [questionResult] = await connection.query(
      'INSERT INTO questions (quiz_id, question_text, points, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
      [id, question_text, points || 1]
    );

    for (const answer of answers) {
      await connection.query(
        'INSERT INTO answers (question_id, answer_text, is_correct, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
        [questionResult.insertId, answer.answer_text, answer.is_correct ? 1 : 0]
      );
    }

    await connection.commit();

    const [questionRows] = await pool.query('SELECT * FROM questions WHERE id = ? LIMIT 1', [questionResult.insertId]);
    const [answerRows] = await pool.query('SELECT * FROM answers WHERE question_id = ? ORDER BY id ASC', [questionResult.insertId]);
    return success(
      res,
      {
        message: 'Soal berhasil ditambahkan',
        question: { ...questionRows[0], answers: answerRows },
      },
      201
    );
  } catch (error) {
    await connection.rollback();
    console.error('Store question error:', error);
    return failure(res, 'Terjadi kesalahan server', 500);
  } finally {
    connection.release();
  }
};


// POST /api/quizzes/:id/start
exports.start = async (req, res) => {
  try {
    const quiz = await getQuizWithQuestions(req.params.id, false);
    if (!quiz || !quiz.is_active) {
      return failure(res, 'Quiz tidak ditemukan', 404);
    }


    const totalPoints = quiz.questions.reduce((sum, question) => sum + (question.points || 1), 0);
    return success(res, {
      quiz: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        time_limit: quiz.time_limit,
        passing_score: quiz.passing_score,
        questions_count: quiz.questions.length,
        total_points: totalPoints,
      },
      questions: quiz.questions,
    });
  } catch (error) {
    console.error('Start quiz error:', error);
    return failure(res, 'Terjadi kesalahan server', 500);
  }
};

// POST /api/quizzes/:id/submit
exports.submit = async (req, res) => {
  try {
    const quiz_id = req.params.id;

    const user_id = req.body.user_id || req.user.id;
    const answers = normalizeAnswers(req.body.answers);
    const { time_taken } = req.body;

    if (!quiz_id || answers.length === 0) {
      return failure(res, 'answers wajib diisi', 400);
    }


    if (req.user.role !== 'guru' && parseInt(user_id, 10) !== req.user.id) {
      return failure(res, 'Akses ditolak', 403);
    }


    const [quizRows] = await pool.query('SELECT * FROM quizzes WHERE id = ? LIMIT 1', [quiz_id]);

    if (quizRows.length === 0) {
      return failure(res, 'Quiz tidak ditemukan', 404);
    }


    const quiz = quizRows[0];

    // Get all correct answers for this quiz
    const [correctAnswers] = await pool.query(
      `SELECT a.question_id, a.id as answer_id, a.is_correct, q.points
       FROM answers a
       JOIN questions q ON a.question_id = q.id
       WHERE q.quiz_id = ? AND a.is_correct = 1`,
      [quiz_id]
    );

    // Map correct answers by question_id
    const correctMap = {};
    correctAnswers.forEach((ca) => {
      correctMap[ca.question_id] = ca.answer_id;
    });

    // Calculate score
    let correctCount = 0;
    const totalQuestions = Object.keys(answers).length;

    // Get points per question
    const [questions] = await pool.query(
      'SELECT id, points FROM questions WHERE quiz_id = ?',
      [quiz_id]
    );

    const pointsMap = {};
    questions.forEach((q) => {
      pointsMap[q.id] = q.points || 1;
    });

    let totalPoints = 0;
    let earnedPoints = 0;

    for (const answer of answers) {
      const questionId = answer.question_id;
      const answerId = answer.answer_id;
      const pts = pointsMap[questionId] || 1;
      totalPoints += pts;
      if (correctMap[questionId] && correctMap[questionId] == answerId) {
        correctCount++;
        earnedPoints += pts;
      }
    }

    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

    // Save result
    const [result] = await pool.query(
      `INSERT INTO quiz_results 
       (user_id, quiz_id, score, total_questions, correct_answers, time_taken, answers_data, started_at, finished_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW(), NOW())`,
      [
        user_id,
        quiz_id,
        score,
        totalQuestions,
        correctCount,
        time_taken || null,
        JSON.stringify(answers),
      ]
    );

    const [savedResult] = await pool.query(
      'SELECT * FROM quiz_results WHERE id = ? LIMIT 1',
      [result.insertId]
    );

    return success(
      res,
      {
        message: 'Hasil quiz berhasil disimpan',
        result: savedResult[0],
        passed: score >= quiz.passing_score,
        summary: {
          score,
          correct_answers: correctCount,
          total_questions: totalQuestions,
          passed: score >= quiz.passing_score,
          passing_score: quiz.passing_score,
        },
      },
      201
    );

  } catch (error) {
    console.error('Submit quiz result error:', error);
    return failure(res, 'Terjadi kesalahan server', 500);
  }
};


// POST /api/quiz/hasil (legacy)
exports.submitResult = exports.submit;

// PUT /api/questions/:id
exports.updateQuestion = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const { question_text, points, answers } = req.body;

    const [existing] = await connection.query('SELECT * FROM questions WHERE id = ? LIMIT 1', [id]);
    if (existing.length === 0) {
      return failure(res, 'Soal tidak ditemukan', 404);
    }

    await connection.beginTransaction();

    await connection.query(
      'UPDATE questions SET question_text = COALESCE(?, question_text), points = COALESCE(?, points), updated_at = NOW() WHERE id = ?',
      [question_text || null, points !== undefined ? points : null, id]
    );

    if (Array.isArray(answers) && answers.length > 0) {
      await connection.query('DELETE FROM answers WHERE question_id = ?', [id]);
      for (const answer of answers) {
        await connection.query(
          'INSERT INTO answers (question_id, answer_text, is_correct, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
          [id, answer.answer_text, answer.is_correct ? 1 : 0]
        );
      }
    }

    await connection.commit();

    const [questionRows] = await connection.query('SELECT * FROM questions WHERE id = ? LIMIT 1', [id]);
    const [answerRows] = await connection.query('SELECT * FROM answers WHERE question_id = ? ORDER BY id ASC', [id]);
    return success(res, {
      message: 'Soal berhasil diubah',
      question: { ...questionRows[0], answers: answerRows },
    });
  } catch (error) {
    await connection.rollback();
    console.error('Update question error:', error);
    return failure(res, 'Terjadi kesalahan server', 500);
  } finally {
    connection.release();
  }
};

// DELETE /api/questions/:id
exports.deleteQuestion = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;

    const [existing] = await connection.query('SELECT id FROM questions WHERE id = ? LIMIT 1', [id]);
    if (existing.length === 0) {
      return failure(res, 'Soal tidak ditemukan', 404);
    }

    await connection.beginTransaction();
    await connection.query('DELETE FROM answers WHERE question_id = ?', [id]);
    await connection.query('DELETE FROM questions WHERE id = ?', [id]);
    await connection.commit();

    return success(res, { message: 'Soal berhasil dihapus' });
  } catch (error) {
    await connection.rollback();
    console.error('Delete question error:', error);
    return failure(res, 'Terjadi kesalahan server', 500);
  } finally {
    connection.release();
  }
};

// GET /api/quizzes/history/:userId
exports.history = async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await pool.query(
      `SELECT qr.*, q.title as quiz_title, q.passing_score, u.name as user_name, u.nisn, u.class
       FROM quiz_results qr
       JOIN quizzes q ON qr.quiz_id = q.id
       JOIN users u ON qr.user_id = u.id
       WHERE qr.user_id = ?
       ORDER BY qr.created_at DESC`,
      [userId]
    );

    const results = rows.map((row) => ({
      ...row,
      passed: row.score >= row.passing_score,
      quiz: { id: row.quiz_id, title: row.quiz_title, passing_score: row.passing_score },
      user: { id: row.user_id, name: row.user_name, nisn: row.nisn, class: row.class },
    }));

    return success(res, { results, data: results });
  } catch (error) {
    console.error('Get quiz history error:', error);
    return failure(res, 'Terjadi kesalahan server', 500);
  }
};


// GET /api/quizzes/:id/results
exports.results = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT qr.*, q.title as quiz_title, q.passing_score, u.name as user_name, u.nisn, u.class
       FROM quiz_results qr
       JOIN quizzes q ON qr.quiz_id = q.id
       JOIN users u ON qr.user_id = u.id
       WHERE qr.quiz_id = ?
       ORDER BY qr.created_at DESC`,
      [id]
    );

    const results = rows.map((row) => ({
      ...row,
      passed: row.score >= row.passing_score,
      quiz: { id: row.quiz_id, title: row.quiz_title, passing_score: row.passing_score },
      user: { id: row.user_id, name: row.user_name, nisn: row.nisn, class: row.class },
    }));

    return success(res, { results });
  } catch (error) {
    console.error('Get quiz results error:', error);
    return failure(res, 'Terjadi kesalahan server', 500);
  }
};


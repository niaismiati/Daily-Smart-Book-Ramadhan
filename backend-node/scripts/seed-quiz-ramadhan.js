require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');
const quizData = require('../data/quiz-ramadhan.json');

async function seed() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'smartbook_ramadan',
  });

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Insert quiz
    const quiz = quizData.quiz;
    const [quizResult] = await connection.query(
      'INSERT INTO quizzes (title, description, time_limit, passing_score, is_active, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, 1, 1, NOW(), NOW())',
      [quiz.title, quiz.description, quiz.time_limit, quiz.passing_score]
    );
    const quizId = quizResult.insertId;
    console.log(`Quiz dibuat dengan ID: ${quizId}`);

    // Insert questions and answers
    for (let i = 0; i < quizData.questions.length; i++) {
      const q = quizData.questions[i];

      const [questionResult] = await connection.query(
        'INSERT INTO questions (quiz_id, question_text, points, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
        [quizId, q.question_text, q.points]
      );
      const questionId = questionResult.insertId;

      for (const answer of q.answers) {
        await connection.query(
          'INSERT INTO answers (question_id, answer_text, is_correct, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
          [questionId, answer.text, answer.is_correct ? 1 : 0]
        );
      }

      console.log(`Soal ${i + 1} ditambahkan: ${q.question_text.substring(0, 50)}...`);
    }

    await connection.commit();
    console.log(`\nBerhasil! Quiz "${quiz.title}" dengan ${quizData.questions.length} soal telah ditambahkan ke database.`);
    console.log(`Quiz ID: ${quizId}`);
  } catch (error) {
    await connection.rollback();
    console.error('Gagal seed quiz:', error);
    process.exit(1);
  } finally {
    connection.release();
    await pool.end();
  }
}

seed();

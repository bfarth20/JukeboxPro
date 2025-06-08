import db from "#db/client";

export async function createUser(username, password) {
  const result = await db.query(
    `INSERT INTO users (username, password)
     VALUES ($1, $2)
     RETURNING *`,
    [username, password]
  );
  return result.rows[0];
}

export async function getUserByUsername(username) {
  const {
    rows: [user],
  } = await db.query(
    `SELECT * FROM users
     WHERE username = $1`,
    [username]
  );
  return user;
}

export async function getUserById(id) {
  const {
    rows: [user],
  } = await db.query(
    `SELECT * FROM users
     WHERE id = $1`,
    [id]
  );
  return user;
}

import DbMysql from './clients/db.mysql.js';

;(async () => {
  console.log('Running migration...');

  await DbMysql.query(`
      create table if not exists users
      (
          id
          bigint
          primary
          key
          auto_increment,
          name
          varchar
      (
          30
      ),
          age int,
          email VARCHAR
      (
          255
      ),
          password VARCHAR
      (
          255
      )
          );
  `);
  console.log('-> User table successfully created');

  await DbMysql.query(
    `CREATE TABLE IF NOT EXISTS tasks
    (
        id
        BIGINT
        PRIMARY
        KEY
        AUTO_INCREMENT,
        user_id
        BIGINT
        NOT
        NULL,
        title
        VARCHAR
     (
        255
     ) NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT FALSE,
        task_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
  console.log('-> Task table successfully created');

  await DbMysql.query(
    `CREATE TABLE IF NOT EXISTS task_details
    (
        id
        BIGINT
        PRIMARY
        KEY
        AUTO_INCREMENT,
        task_id
        BIGINT
        NOT
        NULL,
        priority
        ENUM
     (
        'low',
        'medium',
        'high'
     ) DEFAULT 'medium',
        location VARCHAR
     (
         255
     ),
        notes TEXT
        );`
  );
  console.log('-> Task details successfully created');
  console.log('Migration finished successfully');
})();
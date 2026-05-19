import _ from 'lodash';

import DbMysql from "../clients/db.mysql.js";

function mapRow(row) {
  if (!row) return null;

  const {
    t_priority,
    t_location,
    t_notes,
    ...task
  } = row;

  const hasDetails =
    t_priority !== null &&
    t_priority !== undefined;

  return {
    ...task,
    details: hasDetails
      ? {
        priority: t_priority,
        location: t_location,
        notes: t_notes,
      }
      : null,
  };
}

export async function create({userId, title, description, task_date, details}) {
  try {
    const [result = null] = await DbMysql.query(
      `insert into tasks (user_id, title, description, task_date)
       values (?, ?, ?, ?);`,
      [userId, title, description, task_date]
    );

    const taskId = _.get(result, 'insertId', null);

    console.log(details);
    console.log(taskId);

    if (details) {
      await DbMysql.query(
        `insert into task_details (task_id, priority, location, notes)
         values (?, ?, ?, ?);`,
        [
          taskId,
          _.get(details, 'priority', 'medium'),
          _.get(details, 'location', null),
          _.get(details, 'notes', null),
        ]
      );
    }

    return await findById(taskId, userId);
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function findById(id, userId) {
  try {
    const [rows] = await DbMysql.query(
      `
        SELECT
          t.*,
          tD.priority AS t_priority,
          tD.location AS t_location,
          tD.notes AS t_notes
        FROM tasks t
        LEFT JOIN task_details tD
          ON t.id = tD.task_id
        WHERE t.id = ?
          AND t.user_id = ?
        LIMIT 1
      `,
      [id, userId]
    );

    const row = _.head(rows);

    return mapRow(row);
  } catch (error) {
    console.error(error);

    return null;
  }
}

export async function getList(user_id, page, limit) {
  try {
    const offset = Math.ceil((page - 1) * limit);

    const [result = null] = await DbMysql.query(
      `
          SELECT t.*,
                 tD.priority AS t_priority,
                 tD.location AS t_location,
                 tD.notes    AS t_notes
          FROM tasks t
                   LEFT JOIN task_details tD
                             ON t.id = tD.task_id
          WHERE t.user_id = ?
          ORDER BY t.task_date ASC LIMIT ?
          OFFSET ?
      `,
      [user_id, limit, offset]
    );

    const [countRows = null] = await DbMysql.query(
      `
          SELECT COUNT(*) AS count
          FROM tasks t
          WHERE t.user_id = ?
      `,
      [user_id]
    );

    return {
      result: result.map(mapRow),
      count: _.get(_.head(countRows), 'count', 0),
      page,
      offset,
    };
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function getListWithDetails(user_id, page, limit) {
  try {
    const offset = Math.ceil((page - 1) * limit);

    const [result = null] = await DbMysql.query(
      `
          SELECT t.*,
                 tD.priority AS t_priority,
                 tD.location AS t_location,
                 tD.notes    AS t_notes
          FROM tasks t
                   INNER JOIN task_details tD
                              ON t.id = tD.task_id
          WHERE t.user_id = ?
          ORDER BY t.task_date ASC LIMIT ?
          OFFSET ?
      `,
      [user_id, limit, offset]
    );

    const [countRows = null] = await DbMysql.query(
      `
          SELECT COUNT(*) AS count
          FROM tasks t
              INNER JOIN task_details tD
          ON t.id = tD.task_id
          WHERE t.user_id = ?
      `,
      [user_id]
    );

    return {
      result: result.map(mapRow),
      count: _.get(_.head(countRows), 'count', 0),
      page,
      offset,
    };
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function countByDate(user_id, task_date) {
  try {
    const [result = null] = await DbMysql.query(
      `
          SELECT COUNT(*) AS count
          FROM tasks
          WHERE user_id = ?
            AND task_date = ?
      `,
      [user_id, task_date]
    );

    return _.get(_.head(result), 'count', 0);
  } catch (e) {
    console.error(e);
    return 0;
  }
}

export async function update(id, user_id, data) {
  try {
    const tasks = await findById(id, user_id);

    if (!tasks) {
      return null;
    }

    const fields = [];
    const values = [];

    if (!_.isUndefined(data.title)) {
      fields.push('title = ?');
      values.push(data.title);
    }

    if (!_.isUndefined(data.description)) {
      fields.push('description = ?');
      values.push(data.description);
    }

    if (!_.isUndefined(data.taskDate)) {
      fields.push('taskDate = ?');
      values.push(data.taskDate);
    }

    if (!_.isEmpty(fields)) {
      values.push(id);
      values.push(user_id);

      await DbMysql.query(
        `
            UPDATE tasks
            SET ${fields.join(', ')}
            WHERE id = ?
              AND user_id = ?
        `,
        values
      );
    }

    if (data.details) {
      const [result = null] = await DbMysql.query(
        `
            SELECT id
            FROM task_details
            WHERE task_id = ? LIMIT 1
        `,
        [id]
      );

      const details = _.head(result) || null;

      if (details) {
        await DbMysql.query(
          `
              UPDATE task_details
              SET priority = ?,
                  location = ?,
                  notes    = ?
              WHERE task_id = ?
          `,
          [
            _.get(data, 'details.priority', 'medium'),
            _.get(data, 'details.location', null),
            _.get(data, 'details.notes', null),
            id,
          ]
        );
      } else {
        await DbMysql.query(
          `
              INSERT INTO task_details (task_id,
                                        priority,
                                        location,
                                        notes)
              VALUES (?, ?, ?, ?)
          `,
          [
            id,
            _.get(data, 'details.priority', 'medium'),
            _.get(data, 'details.location', null),
            _.get(data, 'details.notes', null),
          ]
        );
      }
    }

    return await findById(id, user_id);
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function deleteTask(id, userId) {
  try {
    await DbMysql.query(
      `
          DELETE FROM task_details
          WHERE task_id = ?
      `,
      [id]
    );

    console.log('task id:', id);
    console.log('user id:', userId);

    const [result] = await DbMysql.query(
      `
          DELETE FROM tasks
          WHERE id = ?
            AND user_id = ?
      `,
      [id, userId]
    );

    return _.get(result, 'affectedRows', 0) > 0;
  } catch (e) {
    console.error(e);
    return false;
  }
}

export default {
  create,
  findById,
  getList,
  getListWithDetails,
  countByDate,
  update,
  deleteTask,
};
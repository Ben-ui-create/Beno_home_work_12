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

export async function create({userId, title, description, taskDate, details}) {
  try {
    const [result = null] = await DbMysql.query(
      `insert into tasks (userId, title, description, taskDate)
       values (?, ?, ?, ?);`,
      [userId, title, description, taskDate]
    );

    const taskId = _.get(result, '0.insertId', null);

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
    const [result = null] = await DbMysql.query(
      `
          SELECT t.*,
                 tD.priority AS t_priority,
                 tD.location AS t_location,
                 tD.notes    AS t_notes
          FROM tasks t
                   LEFT JOIN task_details tD
                             ON t.id = tD.task_id
          WHERE t.id = ?
            AND t.user_id = ? LIMIT 1
      `,
      [id, userId]
    );

    const res = _.head(result);

    return mapRow(res);
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function getList(userId, page, limit) {
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
      [userId, limit, offset]
    );

    const [countRows = null] = await DbMysql.query(
      `
          SELECT COUNT(*) AS count
          FROM tasks t
          WHERE t.user_id = ?
      `,
      [userId]
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

export async function getListWithDetails(userId, page, limit) {
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
      [userId, limit, offset]
    );

    const [countRows = null] = await DbMysql.query(
      `
          SELECT COUNT(*) AS count
          FROM tasks t
              INNER JOIN task_details tD
          ON t.id = tD.task_id
          WHERE t.user_id = ?
      `,
      [userId]
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

export async function countByDate(userId, taskDate) {
  try {
    const [result = null] = await DbMysql.query(
      `
          SELECT COUNT(*) AS count
          FROM tasks
          WHERE user_id = ?
            AND task_date = ?
      `,
      [userId, taskDate]
    );

    return _.get(_.head(result), 'count', 0);
  } catch (e) {
    console.error(e);
    return 0;
  }
}

export async function update(id, userId, data) {
  try {
    const tasks = await findById(id, userId);

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
      values.push(userId);

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

    return await findById(id, userId);
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function deleteTask(id, userId) {
  try {
    await DbMysql.query(
      `
          DELETE
          FROM task_details
          WHERE task_id = ?
      `,
      [id]
    );

    const [result = null] = await DbMysql.query(
      `
          DELETE
          FROM tasks
          WHERE id = ?
            AND user_id = ?
      `,
      [id, userId]
    );

    return _.get(result, 'affectedRows', 0) > 0;
  } catch (e) {
    console.error(e);
    return null;
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
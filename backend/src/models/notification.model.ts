import { db } from "../config/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

export interface NotificationRow extends RowDataPacket {
  id: number;
  title: string | null;
  body: string | null;
  target_role: string | null;
  publish_from: string | null;
  publish_to: string | null;
  created_by: number | null;
  created_at: string;
}

export type NotificationInput = Omit<NotificationRow, "id" | "created_at">;

export const getAllNotifications = async () => {
  const [rows] = await db.query<NotificationRow[]>("SELECT * FROM notifications");
  return rows;
};

export const getNotificationById = async (id: number) => {
  const [rows] = await db.query<NotificationRow[]>(
    "SELECT * FROM notifications WHERE id = ?",
    [id]
  );
  return rows[0] ?? null;
};

export const createNotification = async (data: NotificationInput) => {
  const {
    title,
    body,
    target_role,
    publish_from,
    publish_to,
    created_by,
  } = data;

  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO notifications
    (title, body, target_role, publish_from, publish_to, created_by)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [title, body, target_role, publish_from, publish_to, created_by]
  );

  return getNotificationById(result.insertId);
};

export const updateNotification = async (
  id: number,
  data: Partial<NotificationInput>
) => {
  const fields = Object.keys(data) as (keyof NotificationInput)[];

  if (!fields.length) {
    return getNotificationById(id);
  }

  const setClause = fields.map((field) => `${field} = ?`).join(", ");
  const values = fields.map((field) => data[field]);

  await db.query(
    `UPDATE notifications SET ${setClause} WHERE id = ?`,
    [...values, id]
  );

  return getNotificationById(id);
};

export const deleteNotification = async (id: number) => {
  await db.query("DELETE FROM notifications WHERE id = ?", [id]);
};


import { existsSync } from "node:fs";
import { Database } from "bun:sqlite";

export type ChattyMessage = {
	id: number;
	threadId: number;
	senderId: number | null;
	sender: string;
	body: string;
	time: number;
	direction: number;
};

type RawMessageRow = {
	id: number;
	thread_id: number;
	sender_id: number | null;
	sender_username: string | null;
	sender_alias: string | null;
	message_user_alias: string | null;
	body: string;
	time: number;
	direction: number;
};

export type UseDBOptions = {
	path?: string;
};

export function useDB(options: UseDBOptions = {}) {
	const dbPath = options.path ?? process.env.CHATTY_DB ?? "/data/chatty-history.db";

	if (!existsSync(dbPath)) {
		throw new Error(`Chatty DB 不存在: ${dbPath}`);
	}

	function openReadonly() {
		return new Database(dbPath, {
			readonly: true,
		});
	}

	function getLatestMessageId(): number {
		const db = openReadonly();

		try {
			const row = db
				.query<{ max_id: number }, []>(
					"select coalesce(max(id), 0) as max_id from messages",
				)
				.get();

			return row?.max_id ?? 0;
		} finally {
			db.close();
		}
	}

	function getIncomingMessagesAfter(id: number): ChattyMessage[] {
		const db = openReadonly();

		try {
			const rows = db
				.query<RawMessageRow, [number]>(
					`
					select
						m.id,
						m.thread_id,
						m.sender_id,
						u.username as sender_username,
						u.alias as sender_alias,
						m.user_alias as message_user_alias,
						m.body,
						m.time,
						m.direction
					from messages m
					left join users u on u.id = m.sender_id
					where m.id > ?
					  and m.direction = 1
					  and length(m.body) > 0
					order by m.id asc
					`,
				)
				.all(id);

			return rows.map((row) => ({
				id: row.id,
				threadId: row.thread_id,
				senderId: row.sender_id,
				sender:
					row.sender_alias?.trim() ||
					(row.sender_id != null ? `sender_id:${row.sender_id}` : "unknown"),
				body: row.body,
				time: row.time,
				direction: row.direction,
			}));
		} finally {
			db.close();
		}
	}

	return {
		path: dbPath,
		getLatestMessageId,
		getIncomingMessagesAfter,
	};
}

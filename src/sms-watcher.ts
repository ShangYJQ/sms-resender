import { watchFile } from "node:fs";
import { useDB, type ChattyMessage } from "./db";

export type UseSmsWatcherOptions = {
	dbPath?: string;
	interval?: number;
	onMessage: (message: ChattyMessage) => void | Promise<void>;
};

export function useSmsWatcher(options: UseSmsWatcherOptions) {
	const db = useDB({
		path: options.dbPath,
	});

	let lastMessageId = db.getLatestMessageId();
	let timer: NodeJS.Timeout | undefined;
	let running = false;

	console.log(`[短信监听端] DB: ${db.path}`);
	console.log(`[短信监听端] 初始 lastMessageId = ${lastMessageId}`);

	async function check() {
		if (running) return;

		running = true;

		try {
			const messages = db.getIncomingMessagesAfter(lastMessageId);

			for (const message of messages) {
				lastMessageId = Math.max(lastMessageId, message.id);
				await options.onMessage(message);
			}
		} catch (error) {
			console.error("[短信监听端] 查询新短信失败:", error);
		} finally {
			running = false;
		}
	}

	function start() {
		watchFile(
			db.path,
			{
				interval: options.interval ?? 1000,
			},
			() => {
				if (timer) clearTimeout(timer);

				timer = setTimeout(() => {
					check().catch((error) => {
						console.error("[短信监听端] 处理新短信失败:", error);
					});
				}, 300);
			},
		);

		console.log("[短信监听端] 已启动");
	}

	return {
		start,
		check,
		getLastMessageId: () => lastMessageId,
	};
}

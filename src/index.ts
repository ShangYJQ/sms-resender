import { napcat } from "./bot";
import { useSmsWatcher } from "./sms-watcher";
import type { ChattyMessage } from "./db";

let connected: boolean = false;

const qqUserId = Number(process.env.QQ_USER_ID);

async function senderSms(message: ChattyMessage) {
	try {

		let { sender, body, time } = message;

		console.log(`[短信接收端] 收到来自 ${sender} 的短信`);

		const forwardText = [
			"SMS / New Message",
			"",
			`From: ${sender}`,
			`Time: ${time
				? new Date(time * 1000).toLocaleString("zh-CN", { hour12: false })
				: new Date().toLocaleString("zh-CN", { hour12: false })
			}`,
			"",
			"――――――――――",
			body,
		].join("\n");

		if (connected) {
			await napcat.send_private_msg({
				user_id: qqUserId,
				message: [
					{
						type: "text",
						data: { text: forwardText },
					},
				],
			});
		} else {
			console.error("连接到 napcat 失败")
		}
	} catch (error) {
		console.error("转发短信失败:", error);
	}
};

async function napcat_loop() {
	napcat.on("socket.connecting", () => console.log("连接中..."));

	napcat.on("socket.open", async () => {
		console.log("连接成功");
		connected = true;

		await napcat.send_private_msg({
			user_id: qqUserId,
			message: [
				{
					type: "text",
					data: {
						text: "sms 转发服务已经启动！",
					},
				},
			],
		});
	});

	napcat.on("socket.error", (error) => {
		console.error("NapCat 连接错误:", error);
		connected = false;
	});

	napcat.on("socket.close", () => {
		console.log("连接断开");
		connected = false;
	});

	await napcat.connect();
}

const smsWatcher = useSmsWatcher({
	onMessage: senderSms,
});

await napcat_loop();
smsWatcher.start();

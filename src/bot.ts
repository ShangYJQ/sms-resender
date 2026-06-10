import { NCWebsocket } from "node-napcat-ts";

export const napcat = new NCWebsocket(
	{
		protocol: "ws",
		host: "192.168.99.1",
		port: 3001,
		accessToken: "FsI-l41PMdvjneML",
		// ↓ 自动重连(可选)
		reconnection: {
			enable: true,
			attempts: 10,
			delay: 5000,
		},
	},
	// ↓ 是否开启 DEBUG 模式
	false,
);

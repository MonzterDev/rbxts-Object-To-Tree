import { ApiClass, ApiDump } from "api";
import Feedback from "feedback";

const HttpService = game.GetService("HttpService");

let apiDump: ReadonlyMap<string, ApiClass> | undefined;

export = function () {
	if (apiDump) {
		return apiDump;
	} else {
		new Feedback("Fetching API data...");
		// alternative "https://anaminus.github.io/rbx/json/api/latest.json"
		const request = pcall(() =>
			HttpService.GetAsync(
				"https://raw.githubusercontent.com/CloneTrooper1019/Roblox-Client-Watch/roblox/API-Dump.json",
			),
		);

		if (request[0]) {
			const apiRequest = pcall(() => HttpService.JSONDecode(request[1]) as ApiDump);

			if (apiRequest[0]) {
				const dumpMap = new Map<string, ApiClass>();

				for (const rbxClass of apiRequest[1].Classes) {
					const superclass = dumpMap.get(rbxClass.Superclass);
					if (superclass) {
						for (const rbxMember of superclass.Members) {
							rbxClass.Members.push(rbxMember);
						}
					}

					dumpMap.set(rbxClass.Name, rbxClass);
				}

				return (apiDump = dumpMap);
			} else {
				new Feedback("[FATAL] Failed to decode API data.");
			}
		} else {
			new Feedback("Failed to fetch API data. Please enable HttpService.HttpEnabled.");
		}
	}
};

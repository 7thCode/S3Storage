import {Injectable} from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class IpcService {

	constructor() {
	}

	public openDevTools() {
		window.api.electronIpcSend('dev-tools');
	}

	public getSystemInfoAsync(): Promise<any> {
		return new Promise((resolve, reject) => {
			window.api.electronIpcOnce('systeminfo', (event:any, arg:any) => {
				const systemInfo: any = JSON.parse(arg);
				resolve(systemInfo);
			});
			window.api.electronIpcSend('request-systeminfo');
		});
	}
}

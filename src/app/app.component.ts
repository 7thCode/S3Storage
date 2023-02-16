import {Component, NgZone} from '@angular/core';
import {IpcService} from './ipc.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent {
	public title = 'storage-2';

	public arch = '-';
	public hostname = '-';
	public platform = '-';
	public release = '-';

	constructor(private ipcService: IpcService, private ngZone: NgZone) {
	}

	public ngOnInit() {
		console.log("Init");
		this.ipcService.getSystemInfoAsync()
			.then(systemInfo => {
				this.ngZone.run(() => {
					this.arch = systemInfo.Arch;
					this.hostname = systemInfo.Hostname;
					this.platform = systemInfo.Platform;
					this.release = systemInfo.Release;
				});
			});

	}
}

/**
 * Copyright (c) 2019 7thCode.(http://seventh-code.com/)
 * This software is released under the MIT License.
 * opensource.org/licenses/mit-license.php
 *
 */

// Electron Forge
// https://www.electronjs.org/ja/docs/latest/tutorial/tutorial-packaging

"use strict";


import {WebContents} from "electron";
import * as os from 'os';

const {app, Menu, BrowserWindow, webFrame, ipcMain, dialog, WebContents} = require("electron");

const {AppImageUpdater, MacUpdater, NsisUpdater} = require('electron-updater');
const log = require('electron-log');

const AWS = require('aws-sdk');

const endpoint = new AWS.Endpoint('https://kr.object.ncloudstorage.com');
const region = 'kr-standard';
const access_key = 'ACCESS_KEY';
const secret_key = 'SECRET_KEY';

const S3 = new AWS.S3({
	endpoint,
	region,
	credentials: {
		accessKeyId: access_key,
		secretAccessKey: secret_key
	}
});


namespace Main {

	const path: any = require("path");
	const express: any = require("express");
	const http: any = require("http");
	const url: any = require("url");

	const isSingleton: boolean = app.requestSingleInstanceLock();
	if (isSingleton) {

		const port: number = 80;
		let mainWindow: any = null;
		let mainMenu: any = null;

		// Electron

		const createWindow: () => void = (): void => {

			mainWindow = new BrowserWindow({
				minWidth: 1600,
				minHeight: 940,
				width: 1600,
				height: 940,
		// 		titleBarStyle: "hidden",
		// 		title: "XXX",
		// 		resizable: true,
		// 		minimizable: false,
		// 		fullscreenable: true,
		// 		skipTaskbar: true,
				webPreferences: {
					// nodeIntegration: true,
					nodeIntegrationInWorker: true,
					backgroundThrottling: false,

					// contextIsolation: false,

					// Disabled Node integration
					nodeIntegration: false,
					// protect against prototype pollution
					contextIsolation: true,
					// turn off remote
				// 	enableRemoteModule: false,

					preload: path.join(app.getAppPath(), 'dist/preload', 'preload.js')
				},
			});
			// Permission
			const windowSession = mainWindow.webContents.session;
			windowSession.setPermissionRequestHandler((webContents: WebContents, permission: string, callback: any) => {
				callback(true);
			});

			const menuTemplate: any = [
				{
					label: "ファイル",
					submenu: [
						{
							label: "AAA...",
							click: () => {
								showAboutBox(null);
							},
						},
						{type: "separator"},
						{
							id: 'config-menu',
							label: "設定...",
							click: () => {
								mainWindow.webContents.send("configure");
							},
							enabled: true
						},
						{
							label: "印刷...",
							click: () => {

								mainWindow.webContents.send("print");

								const options = {
									silent: false,
									printBackground: false,
									color: false,
									landscape: true,
									scaleFactor: 80,
									pagesPerSheet: 1,
									copies: 1,
								}
								mainWindow.webContents.print(options, (success: boolean, failureReason: string) => {
								});
							},
						},
						{type: "separator"},
						{
							label: "quit",
							click: () => {
								app.quit();
							},
						},
					],
				},
				{
					label: "編集",
					submenu: [
						{label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:"},
						{label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:"},
						{type: "separator"},
						{label: "カット", accelerator: "CmdOrCtrl+X", selector: "cut:"},
						{label: "コピー", accelerator: "CmdOrCtrl+C", selector: "copy:"},
						{label: "ペースト", accelerator: "CmdOrCtrl+V", selector: "paste:"},
						{label: "すべて選択", accelerator: "CmdOrCtrl+A", selector: "selectAll:"},
					],
				},
				{
					label: "デバッグ",
					submenu: [
						{
							label: "DevTools",
							click: () => {
								mainWindow.webContents.openDevTools({mode: "detach"});
							},
						},
					],
				},
			];
			mainMenu = Menu.buildFromTemplate(menuTemplate);
			mainWindow.webContents.openDevTools({mode: "detach"});

			Menu.setApplicationMenu(mainMenu);

			const manager = true;
			Menu.getApplicationMenu().getMenuItemById('config-menu').enabled = manager;


			/*
			* for コンテキストメニュー
			* Close
			* */
			ipcMain.on("mouseup", (event: any, arg: any): void => {
				mainMenu.closePopup(mainWindow);
				event.returnValue = {};
			});

			mainWindow.loadURL(
				url.format({
					pathname: path.join(__dirname, "public/index.html"),
					protocol: "file:",
					slashes: true,
				}),
			);

			mainWindow.on("closed", () => {
				mainWindow = null;
			});

		};

		const showAboutBox: (window: any) => void = (mainWindow): void => {

			const detail: string = "v1.4.0" + "\n" +
				"home: " + app.getPath('home') + "\n" +
				"appData: " + app.getPath('appData') + "\n" +
				"userData: " + app.getPath('userData') + "\n" +
				"temp: " + app.getPath('temp') + "\n" +
				"exe: " + app.getPath('exe') + "\n" +
				"module: " + app.getPath('module') + "\n" +
				// 	"log: " + app.getPath('temp') + "aig_logs/request.log" + "\n" +
				"windows app log:  " + "%USERPROFILE%\\AppData\\Roaming\\aig-bridge\\logs\\main.log" + "\n" +
				"MacOS app log:  " + "~/Library/Logs/aig-bridge/main.log" + "\n" +
				"Linux app log:  " + "~/.config/aig-bridge/logs/main.log" + "\n" +
				"cookie: " + path.join(path.join(app.getPath("appData"), "aig-bridge2"), "cookies.json") + "\n";

			const options: any = {
				type: "info",
				buttons: ["OK", "Copy"],
				title: "XXX",
				message: "XXX",
				detail: detail
			};

			dialog.showMessageBox(mainWindow, options).then((button: any) => {
				switch (button.response) {
					case 1:
						Electron.clipboard.writeText(detail);
						break;
					default:
				}
			});
		};

		app.on("ready", () => {
			createWindow();
		});

		app.on("window-all-closed", () => {
			if (process.platform !== "darwin") {
				app.quit();
			}
		});

		app.on("activate", () => {
			if (BrowserWindow.getAllWindows().length === 0) {
				createWindow();
			}
		});

		ipcMain.on('request-systeminfo', () => {
			const systemInfo: any = {};
			systemInfo.Arch = os.arch();
			systemInfo.Hostname = os.hostname();
			systemInfo.Platform = os.platform();
			systemInfo.Release = os.release();
			const systemInfoString: string = JSON.stringify(systemInfo);
			console.log("hoge");
			if (mainWindow) {
				mainWindow.webContents.send('systeminfo', systemInfoString);
			}
		});

	} else {
		app.quit();
	}

	process.on('uncaughtException', (err) => {
		log.error(err);
		app.quit();     // アプリを終了する (継続しない方が良い)
	});

	const createBucket = () => {

	}

}















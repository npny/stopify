const electron = require("electron");
const app = electron.app;
let window;

// Add Chromium's Widevine plugin back into Electron
const widevinePath = require("child_process").execSync("find '/Applications/Google Chrome.app' -name widevinecdmadapter.plugin").toString().split("\n")[0];
app.commandLine.appendSwitch("widevine-cdm-path", widevinePath)
app.commandLine.appendSwitch("widevine-cdm-version", "0")

// Lauch the app
app.on("ready", function(){
	// Open the main window
	window = new electron.BrowserWindow({
		width: 1280,
		height: 800,
		titleBarStyle: "hidden-inset",
		title: "Stopify",
		backgroundColor: "#070707",
		webPreferences: {plugins: true}
	});

	// Load Spotify
	window.loadURL("https://open.spotify.com/collection/playlists");

	// Blacklist ads
	const blacklist = [
		"https://*.cloudfront.net/mp3-ad/*",
		"https://spclient.wg.spotify.com/ads/*"
	]
	window.webContents.session.webRequest.onBeforeRequest({urls: blacklist}, (details, callback) => callback({cancel: true}))

	// Tweak CSS
	window.webContents.on("did-finish-load", () => window.webContents.insertCSS(`
		.ads-container, .download-item { display: none !important; }
		.nav-bar-container { padding-top: 40px !important; }
		body::before {
			display: block;
			content: "";
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			height: 40px;
			z-index: 1;
			-webkit-user-select: none;
			-webkit-app-region: drag;
		}
	`));

	// Bind global key shortcuts for media control
	const bindButton = (key, element) => electron.globalShortcut.register(key, () => window.webContents.executeJavaScript(`document.querySelector("${element}").click()`));
	bindButton("MediaNextTrack", ".player-controls [title=Next]");
	bindButton("MediaPreviousTrack", ".player-controls [title=Previous]");
	bindButton("MediaPlayPause", ".player-controls [title=Play], .player-controls [title=Pause]");

	// Bind local key shortcuts for navigation and paste
	electron.Menu.setApplicationMenu(electron.Menu.buildFromTemplate([
		{
			label: "Stopify",
			submenu: [
				{label: "Close", accelerator: "CmdOrCtrl+W", click: () => app.quit()},
				{label: "Close all", accelerator: "CmdOrCtrl+Shift+W", click: () => app.quit()},
				{label: "Quit", accelerator: "CmdOrCtrl+Q", click: () => app.quit()},
			]
		},
		{
			label: "Edit",
			submenu: [
				{label: "Cut", accelerator: "CmdOrCtrl+X", role: "cut"},
				{label: "Copy", accelerator: "CmdOrCtrl+C", role: "copy"},
				{label: "Paste", accelerator: "CmdOrCtrl+V", role: "paste"},
				{label: "Select All", accelerator: "CmdOrCtrl+A", role: "selectall"},
			]
		},
		{
			label: "Navigation",
			submenu: [
				{label: "Reload", accelerator: "CmdOrCtrl+R", click: () => window.webContents.reloadIgnoringCache()},
				{label: "Back", accelerator: "CmdOrCtrl+Left", click: () => window.webContents.goBack()},
				{label: "Forward", accelerator: "CmdOrCtrl+Right", click: () => window.webContents.goForward()},
				{label: "Search", accelerator: "CmdOrCtrl+F", click: () => window.webContents.executeJavaScript(`document.querySelector('a[href="/search"]').click();`)},
			]
		},
	]))

	// Bind quit
	app.on("window-all-closed", () => app.quit());
});

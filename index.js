const electron = require("electron");
const app = electron.app;
let window;

// Add Chromium's Widevine plugin back into Electron
const widevinePath = require("child_process").execSync("find '/Applications/Google Chrome.app' -name widevinecdmadapter.plugin").toString().split("\n")[0];
app.commandLine.appendSwitch("widevine-cdm-path", widevinePath)
app.commandLine.appendSwitch("widevine-cdm-version", "0")

// Lauch the app
app.on("ready", function(){
	app.on("window-all-closed", () => app.quit());

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

	// Bind global key shortcuts
	const bind = (key, element) => electron.globalShortcut.register(key, () => window.webContents.executeJavaScript(`document.querySelector("${element}").click()`));
	bind("MediaNextTrack", ".player-controls [title=Next]");
	bind("MediaPreviousTrack", ".player-controls [title=Previous]");
	bind("MediaPlayPause", ".player-controls [title=Play], .player-controls [title=Pause]");
});

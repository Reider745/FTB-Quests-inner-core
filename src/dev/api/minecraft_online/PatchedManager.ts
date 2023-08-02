class PathEvent {
	public buildConfig(ui: UiDialogSetting): void {

	}
	public closeConfig(): void {

	}
	public buildVersion(ui: UiDialogSetting): void {

	}
	public openVersion(ui: UiDialogSetting): void {

	}
	public openNewVersion(ui: UiDialogSetting): void {

	}
	public getInformation(): {name: string} {
		return {name: "Not name"};
	}
	public getLog(): void {

	}
	public preInit(): void {

	}
	public postInit(): void {

	}

	public open(window: UI.Window){

	}

	public close(window: UI.Window){
		
	}
}

class PatchedManager {
	constructor(){
		
	}
}

/*function PathManager(initization, system, path, loaded){
	if(isConnection()) void function(){
		let patcheds = FileTools.ReadJSON(path+".info");
		for(let key in patcheds)
			patcheds[key] = false;
			
		for(let key in loaded){
			patcheds["."+key] = true;
			FileTools.WriteText(path+".files/."+key, system.getFile(loaded[key]));
		}
		FileTools.WriteJSON(path+".info", patcheds, true);
	}();
	
	let cache_path = {};
	
	this.updateCache = function(){
		cache_path = {};
		let all = this.getActivePath();
		for(let i in all)
			cache_path[all[i]] = FileTools.ReadText(path+".files/"+all[i]);
	}
	
	this.getAllPath = function(){
		return Object.keys(FileTools.ReadJSON(path+".info"));
	}
	
	this.getActivePath = function(){
		let result = [];
		let info = FileTools.ReadJSON(path+".info");
		let custom = FileTools.ReadJSON(path+".custom");
		
		for(let key in info)
			if(custom[key] === undefined ? info[key] : custom[key])
				result.push(key);
		for(let key in custom)
			if(info[key] === undefined && custom[key])
				result.push(key);
		
		return result;
	}
	
	this.getUserSetting = function(){
		return FileTools.ReadJSON(path+".custom");
	}
	
	this.setUserSetting = function(setting){
		FileTools.WriteJSON(path+".custom", setting, true);
	}
	
	let events = [];
	this.addEvent = function(event){
		events.push(event);
	}
	
	this.invokeEvent = function(name, args){
		args = args || [];
		for(let i in events){
			let event = events[i];
			event[name].apply(event, args);
		}
	}
	
	this.deloaded = function(){
		events = [];
	}
	
	this.loaded = function(){
		this.updateCache();
		for(let key in cache_path)
			initization.load(cache_path[key]);
	}
	
	this.restart = function(){
		this.deloaded();
		this.loaded();
	}
}*/
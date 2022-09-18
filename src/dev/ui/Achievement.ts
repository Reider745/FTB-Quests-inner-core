var JAVA_ANIMATOR = android.animation.ValueAnimator;
var JAVA_HANDLER = android.os.Handler;
var LOOPER_THREAD = android.os.Looper;
var JAVA_HANDLER_THREAD: any = new JAVA_HANDLER(LOOPER_THREAD.getMainLooper());

function createAnimation(_duration: number, _updateFunc: (value: number, animation: globalAndroid.animation.ValueAnimator) => void): android.animation.ValueAnimator {
	let animation: any = JAVA_ANIMATOR.ofFloat([0,1]);
	animation.setDuration(_duration);
	if(_updateFunc)
		animation.addUpdateListener({
			onAnimationUpdate(updatedAnim) {
				_updateFunc(updatedAnim.getAnimatedValue(), updatedAnim);
			}
		});
	JAVA_HANDLER_THREAD.post({
		run() {
			animation.start();
		}
	})
	return animation;
}
function setTimeout(func: () => void, tick: number){
	Updatable.addUpdatable({
		tick: 0,
		update() {
			this.tick++;
			if(tick >= tick){
				func();
				this.remove = true;
			}
		},
	})
}
class AchievementAPI {
	private start: UI.Window;
	private window: UI.Window;
	private end: UI.Window;
	private item: ItemInstance;
	private title: string;
	private decription: string;
	private time: number;
	private pause: number;

	constructor(){
		this.window = new UI.Window({
			drawing: [],
			elements: {}
		});
		this.end = new UI.Window({
			drawing: [],
			elements: {}
		});
		this.start = new UI.Window({
			drawing: [],
			elements: {}
		});

		this.window.setDynamic(true);
		this.window.setAsGameOverlay(true);
		this.window.setTouchable(false);

		this.setTitle("Test Display Name");
		this.setDescrption("Test super puper description\nnew line");
		this.setItemInstance({
			id: 1,
			count: 1,
			data: 0
		});
		this.setTime(3000, 110);
	}

	public setTitle(title: string): AchievementAPI {
		this.title= title;
		return this;
	}

	public getTitle(): string {
		return this.title;
	}

	public setDescrption(description: string): AchievementAPI {
		this.decription = description;
		return this;
	}

	public getDescription(): string {
		return this.decription
	}

	public setItemInstance(item: ItemInstance): AchievementAPI {
		this.item = item;
		return this;
	}

	public getItemInstance(): ItemInstance {
		return this.item;
	}

	public setTime(time: number, pause: number): AchievementAPI {
		this.time = time;
		this.pause = pause;
		return this;
	}

	public getTime(): number {
		return this.time;
	}

	public getPause(): number {
		return this.pause;
	}

	public updateUi(window: UI.Window, end: boolean): void {
		let content = window.getContent();

		let title = UiDialogBase.getSize(this.title, 30);
		let decription = UiDialogBase.getSize(this.decription, 20);

		let width = Math.max(title.width+85, decription.width);
		const size_slot = 60;
		let heigth = decription.height+size_slot+15;
		
		const x = 1000-width, y = end ? 5 : -heigth;

		content.elements.title = {type: "text", text: this.title, font: {size: 30, color: android.graphics.Color.WHITE, shadow: .5}, x: x+75, y: y+10};
		content.elements.decription = {type: "text", text: this.decription, font: {size: 20, color: android.graphics.Color.GREEN}, multiline: true, x: x + 15, y: y+size_slot+10};
		content.elements.item = {type: "slot", bitmap: "challenge_completed", x: x+10, y: y+10, size: size_slot, visual: true, source: this.getItemInstance()};
		content.drawing = [
			{type: "color", color: android.graphics.Color.argb(0, 0, 0, 0)},
			{type: "frame", x: x, y: y, width: width, height: heigth, bitmap: "achievement_frame", scale: 3},
			{type: "frame", x: x, y: y, width: width, height: size_slot, bitmap: "default_completed", scale: 3}
		];

		window.setContent(content);
	}

	private update(start: UI.Window, end: UI.Window, value: number){
		let content: any = this.window.getContent();
		let e_content: any = end.getContent();
		let s_content: any = start.getContent();
		for(let i in content.drawing){
			const element = content.drawing[i];
			if(element.y)
				element.y = s_content.drawing[i].y + (e_content.drawing[i].y - s_content.drawing[i].y)*value;
		}
		for(let key in content.elements){
			const element = content.elements[key];
			element.y = s_content.elements[key].y + (e_content.elements[key].y - s_content.elements[key].y)*value;
		}
		this.window.setContent(content);
		this.window.forceRefresh();
	}

	public giveClient(): AchievementAPI {
		this.updateUi(this.start, false);
		this.updateUi(this.window, false);
		this.updateUi(this.end, true);
		this.window.open();
		
		let self = this;
		let animation: any = createAnimation(this.time, function(value: number, animation: globalAndroid.animation.ValueAnimator){
			self.update(self.start, self.end, value);
		});
		animation.addListener({
			onAnimationEnd(){
				setTimeout(function(){
					animation = createAnimation(self.time, function(value: number, animation: globalAndroid.animation.ValueAnimator){
						self.update(self.end, self.start, value);
					});
					animation.addListener({
						onAnimationEnd(){
							self.window.close();
						}
					});
				}, self.pause);
			}
		});
		return this;
	}
	static instance: AchievementAPI = new AchievementAPI();
	static giveClient(): void {
		AchievementAPI.instance.giveClient();
	}
};
/*function AchievementAPI(){
	let container = new UI.Container();
	let window = new UI.Window({
		location: {
			x: 650,
			width: 350,
			y: 0,
			height: 150
		},
		drawing: [{type: "color", color: android.graphics.Color.argb(0, 0, 0, 0)}],
		elements: {}
	});
	window.setDynamic(true);
	window.setAsGameOverlay(true);
	window.setTouchable(false);
	
	
	let time = 1000;
	let y_max = 15;
	let y_default = 0;
	let expectation = 60;
	let style = {background: "achievement_background", title: 55, description: 50};
	
	this.setTime = function(time, expectation){
		this.time = time;
		this.expectation = expectation;
	}
	this.setStyle = function(obj) {
		style = obj;
	}
	this.getGui = function(title, description, item){
		item = item || {};
		y_default = -600;
		let content = window.getContent();
		content.elements.background = {type: "image", bitmap: style.background, x: 0, y:y_default, scale: 1.5}
		content.elements.slot = {type: "slot", bitmap: "_default_slot_empty", x: 13, y: y_default-5, size: 160};
		content.elements.title = {type: "text", text: title, x: 170, y: y_default+45, font: {color: android.graphics.Color.argb(1, 1, 1, 1), size: style.title}}
		content.elements.description = {type: "text", text: description, x: 20, y: y_default+250, font: {color: android.graphics.Color.argb(1, 0, 1, 0), size: style.description}}
		container.setSlot("slot", item.id||0, 1, item.data||0)
	}
	this.give = function(title, description, item){
		try{
		let content = window.getContent();
		this.getGui(title, description, item);
		container.openAs(window);
		let animation = createAnimation(time, function(value){
			content.elements.background.y = y_default+((y_max-y_default) * value);
			content.elements.title.y = (y_default+((y_max-y_default) * value))+20;
			content.elements.slot.y = (y_default+((y_max-y_default) * value));
			content.elements.description.y = (y_default+((y_max-y_default) * value))+170;
			window.forceRefresh();
		});
		animation.addListener({
			onAnimationEnd(){
				setTimeout(function(){
					let anim = createAnimation(time, function(value){
						let keys = Object.keys(content.elements);
						for(let i in keys)
							content.elements.background.y = y_default+((y_max-y_default) * (1-value));
							content.elements.title.y = (y_default+((y_max-y_default) * (1-value)))+20;
							content.elements.slot.y = (y_default+((y_max-y_default) * (1-value)));
							content.elements.description.y = (y_default+((y_max-y_default) * (1-value)))+170;
						window.forceRefresh();
					});
					animation.addListener({
						onAnimationEnd(){
							container.close();
						}
					});
				}, expectation);
			}
		});
		}catch(e){
			
		}
	}
}
let Achievement = new AchievementAPI();*/
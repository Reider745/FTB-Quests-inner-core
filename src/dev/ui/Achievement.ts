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
			if(this.tick >= tick){
				func();
				this.remove = true;
			}
		},
	})
}
class AchievementStyle {
	public frame: string = "default_completed";
	public slot: string = "challenge_completed";
	public bacground: string = "achievement_frame";
	public title_color: number = android.graphics.Color.WHITE;
	public description_color: number = android.graphics.Color.GREEN;
};

interface AchievementAPICache {
	title: string;
	description: string;
	item: ItemInstance;
};

Network.addClientPacket("AchievementAPI.giveClient", function(data: AchievementAPICache){
	AchievementAPI.giveClient(data.title, data.description, data.item);
});

class AchievementAPI {
	private start: UI.Window;
	private window: UI.Window;
	private end: UI.Window;
	private item: ItemInstance;
	private title: string;
	private decription: string;
	private time: number;
	private pause: number;
	private isOpen: boolean = false;
	private style: AchievementStyle = new AchievementStyle();
	private animatiom_type: number;
	public width: number;
	public heigth: number;
	private end_y: number;

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

		this.setTitle("");
		this.setDescrption("");
		this.setItemInstance({
			id: 1,
			count: 1,
			data: 0
		});
		this.setTime(2000, 60);
		this.setPosEnd(5);
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

	public setAnimationType(type: number): AchievementAPI {
		this.animatiom_type = type;
		return this;
	}

	public getAnimationType(): number {
		return this.animatiom_type;
	}

	public setPosEnd(y: number): AchievementAPI {
		this.end_y = y;
		return this;
	}

	public updateUi(window: UI.Window, end: boolean): void {
		let content = window.getContent();

		let title = UiDialogBase.getSize(this.title, 25);
		let decription = UiDialogBase.getSize(this.decription, 15);

		let width = Math.max(title.width+85, decription.width);
		const size_slot = 55;
		let heigth = decription.height+size_slot+15;
		if(this.animatiom_type = 0)
			var x = 1000-width, y = end ? this.end_y : -heigth;
		else
			var x = end ? 1000-width : 1000+width, y = this.end_y;

		content.elements.title = {type: "text", text: this.title, font: {size: 25, color: this.style.title_color, shadow: .5}, x: x+75, y: y+10};
		content.elements.decription = {type: "text", text: this.decription, font: {size: 15, color: this.style.description_color}, multiline: true, x: x + 15, y: y+size_slot+10};
		content.elements.item = {type: "slot", bitmap: this.style.slot, x: x+10, y: y+10, size: size_slot, visual: true, source: this.getItemInstance()};
		content.drawing = [
			{type: "color", color: android.graphics.Color.argb(0, 0, 0, 0)},
			{type: "frame", x: x, y: y, width: width, height: heigth, bitmap: this.style.bacground, scale: 3},
			{type: "frame", x: x, y: y, width: width, height: size_slot, bitmap: this.style.frame, scale: 3}
		];
		this.width = width;
		this.heigth = heigth;
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
			if(element.x)
				element.x = s_content.drawing[i].x + (e_content.drawing[i].x - s_content.drawing[i].x)*value;
		}
		for(let key in content.elements){
			const element = content.elements[key];
			element.y = s_content.elements[key].y + (e_content.elements[key].y - s_content.elements[key].y)*value;
			element.x = s_content.elements[key].x + (e_content.elements[key].x - s_content.elements[key].x)*value;
		}
		this.window.setContent(content);
		this.window.forceRefresh();
	}

	public canOpen(): boolean {
		return this.isOpen;
	}

	private handler_end: () => void;

	public setHandlerEnd(end: ()=>void): AchievementAPI{
		this.handler_end = end;
		return this;
	}

	public giveClient(): AchievementAPI {
		if(this.isOpen) return this;
		this.isOpen = true;
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
							self.isOpen = false;
							self.heigth = 0;
							self.width = 0;
							self.handler_end();
						}
					});
				}, self.pause);
			}
		});
		return this;
	}
	static max = 10;
	static instances: AchievementAPI[] = [];
	static cache: AchievementAPICache[] = []
	static {
		for(let i = 0;i < AchievementAPI.max;i++){
			let instance = new AchievementAPI()
				.setAnimationType(1);
			AchievementAPI.instances[i] = instance;
		}
	}
	static giveClient(title: string, description: string, item: ItemInstance): void {
		let height = 5;
		for(const i in AchievementAPI.instances){
			let element = AchievementAPI.instances[i];
			if(!element.canOpen() && height <= element.window.location.height){
				element.setTitle(title);
				element.setDescrption(description);
				element.setItemInstance(item);
				element.setPosEnd(height);
				element.setHandlerEnd(() => {
					if(AchievementAPI.cache.length >= 1){
						let cache = AchievementAPI.cache.shift();
						AchievementAPI.giveClient(cache.title, cache.description, cache.item);
					}
				});
				element.giveClient();
				return;
			}
			height += (element.heigth||0) + 5;
		}
		AchievementAPI.cache.push({
			title: title,
			description: description,
			item: item
		});
	}
	static give(player: number, title: string, description: string, item: ItemInstance){
		let client = Network.getClientForPlayer(player);
		if(client != null)
			client.send("AchievementAPI.giveClient", {
				title: title,
				description: description,
				item: item
			});
	}
};
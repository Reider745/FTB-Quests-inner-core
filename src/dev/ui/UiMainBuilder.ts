/// <reference path="./UiStyle.ts"/>

let height = (function(){
    let size = new android.graphics.Point();
    UI.getContext().getWindowManager().getDefaultDisplay().getSize(size);
    return size.y;
})();
let width = (function(){
    let size = new android.graphics.Point();
    UI.getContext().getWindowManager().getDefaultDisplay().getSize(size);
    return size.x;
})();

Network.addClientPacket("", function(data: any){
    if(data.player != Player.get())
        UiMainBuilder.quests = data.quests;
});

class UiMainBuilder {
    public group: UI.WindowGroup;
    public main: UI.Window;
    public style: UiStyle;
    public ui_left: UiTabsBuilder;
    public ui_right: UiTabsBuilder;
    public client_name: string;
    static quests: {[key: string]: {[key: string]: boolean}} = {};

    constructor(client_name:string){
        this.main = new UI.Window();
        this.style = new UiStyle();
        this.ui_left = new UiTabsBuilder("left", true);
        this.ui_right = new UiTabsBuilder("right", false);
        this.client_name = client_name;

        this.ui_left.setUiMainBuilder(this, new UI.Window());
        this.ui_right.setUiMainBuilder(this, new UI.Window());
    }

    public getTab(isLeft: boolean, tab: string): StandartTabElement {
        if(isLeft)
            return this.ui_left.getTab(tab);
        return this.ui_right.getTab(tab);
    }

    public getQuest(isLeft: boolean, tab: string, quest: string): Quest {
        let _tab = this.getTab(isLeft, tab);
        if(_tab != null)
            return _tab.getQuest(quest);
        return null;
    }

    public isGive(isLeft: boolean, tab: string, quest: string, player: number = Player.get()): boolean {
        let check = this.getQuest(isLeft, tab, quest);
        let lines = check.getLines();

        for(const element of lines)
            if(!this.canQuests(isLeft, tab, element, player) || !this.isGive(isLeft, tab, element, player)) return false;

        return true;
    }

    public giveQuest(isLeft: boolean, tab: string, quest: string, player: number = Player.get(), value: boolean = true, is: boolean = true): UiMainBuilder {
        if(!UiMainBuilder.quests[this.client_name+":"+player])
            UiMainBuilder.quests[this.client_name+":"+player] = {};
        if(is && this.isGive(isLeft, tab, quest, player))
            UiMainBuilder.quests[this.client_name+":"+player][isLeft+":"+tab+":"+quest] = value;
        else if(!is)
            UiMainBuilder.quests[this.client_name+":"+player][isLeft+":"+tab+":"+quest] = value;
        Callback.invokeCallback("QuestGive", this.client_name, isLeft, tab, quest, player, value, is);
        Network.sendToAllClients("QuestGive", {
            quests: UiMainBuilder.quests,
            player: Number(Player.get())
         });
        return this;
    }
    public canQuests(isLeft: boolean, tab: string, quest: string, player: number = Player.get()): boolean {
        return !!UiMainBuilder.quests[this.client_name+":"+player] && !!UiMainBuilder.quests[this.client_name+":"+player][isLeft+":"+tab+":"+quest];
    }

    public selectedTab(builder: UiTabsBuilder, element: StandartTabElement){
        this.ui_left.selectedTab(builder, element);
        this.ui_right.selectedTab(builder, element);
    }
    public getUiLeft(): UiTabsBuilder {
        return this.ui_left;
    }
    public getUiRight(): UiTabsBuilder {
        return this.ui_right;
    }
    public addRenderLeft(element: StandartTabElement){
        this.ui_left.addRender(element);
    }
    public addRenderRight(element: StandartTabElement){
        this.ui_right.addRender(element);
    }
    public setStyle(style: UiStyle): UiMainBuilder {
        this.style = style;
        return this;
    }
    public getStyle(): UiStyle {
        return this.style;
    }

    public buildServer(container: ItemContainer): void {
        this.ui_left.buildServer(container);
        this.ui_right.buildServer(container);
    }
    public build(container: ItemContainer): UI.WindowGroup {
        this.group = new UI.WindowGroup();
        let self = this;
        let paint = new android.graphics.Paint();
        let background = self.style.bitmap;
        let _x = Math.ceil(width / background.getWidth())+1;
        let _y = Math.ceil(height / background.getHeight())+1;
        this.main.setContent({
            drawing: [
                {type: "color", color: android.graphics.Color.argb(0, 0, 0, 0)},
                {type: "custom", onDraw(canvas, scale) {
                    paint.setAlpha(255*.8);
                    for(let x = 0;x < _x;x++)
                        for(let y = 0;y < _y;y++)
                            canvas.drawBitmap(background, x*background.getWidth(), y*background.getHeight(), paint);
                }},
                {type: "frame", bitmap: this.style.tab.frame, x: 0, y: 0, width: this.ui_left.getMaxSize(), height: height, color: android.graphics.Color.argb(.5, 0, 0, 0), scale: this.style.tab.scale},
                {type: "frame", bitmap: this.style.tab.frame, x: 1000-this.ui_right.getMaxSize(), y: 0, width: this.ui_right.getMaxSize(), height: height, color: android.graphics.Color.argb(.5, 0, 0, 0), scale: this.style.tab.scale}
            ],
            elements: {
                //"close": {type: "closeButton", bitmap: this.style.close_main.bitmap, x: 950, y: 0, scale: this.style.close_main.scale}
            }
        })
        this.group.addWindowInstance("background", this.main);
        this.group.addWindowInstance("main", new UI.Window({
            location: {
                padding: {
                    left: this.ui_left.getMaxSize()+3,
                    right: this.ui_right.getMaxSize()-3
                },
                forceScrollY: true,
                forceScrollX: true
            },
            drawing: [
                {type: "color", color: android.graphics.Color.argb(0, 0, 0, 0)}
            ],
            elements: {}
        }));
        this.group.addWindowInstance("left", this.ui_left.build(container, 0, 1000-this.ui_left.getMaxSize()).ui);
        this.group.addWindowInstance("right", this.ui_right.build(container, 1000-this.ui_right.getMaxSize(), 0).ui);
        let win = this.group.getWindow("main");
        onSystemUiVisibility(win);
        win.setCloseOnBackPressed(true);
        return this.group;
    }

    public getUi(): UI.WindowGroup{
        return this.group;
    }
};
/// <reference path="./UiStyle.ts"/>
/// <reference path="./quest_editor/TabEditor.ts"/>
/// <reference path="./quest_editor/QuestEditor.ts"/>

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
    private debug: boolean = false;
    public container: ItemContainer;

    static all_main: {[key: string]: UiMainBuilder} = {};
    static getUiMainByName(name: string): Nullable<UiMainBuilder> {
        return UiMainBuilder.all_main[name];
    }

    public setDebug(debug: boolean): UiMainBuilder {
        this.debug = debug;
        return this;
    }

    public isDebug(): boolean {
        return this.debug;
    }

    public path: string;

    constructor(client_name:string){
        this.main = new UI.Window();
        this.style = new UiStyle();
        this.ui_left = new UiTabsBuilder("left", true);
        this.ui_right = new UiTabsBuilder("right", false);
        this.client_name = client_name;

        this.ui_left.setUiMainBuilder(this, new UI.Window());
        this.ui_right.setUiMainBuilder(this, new UI.Window());
        let self = this;
        Callback.addCallback("MainRegister", function(name: string){
            if(client_name == name && self.isDebug()){
                self.addRenderLeft(new TabEditor("tab_added"));
                self.addRenderRight(new QuestEditor("quest_added"));
            }
        });

        UiMainBuilder.all_main[client_name] = this;
    }

    public getClientName(): string {
        return this.client_name;
    }

    public getIdTab(id: string, count: number = 0, org_id = id): string {
        let tabs = this.ui_left.getAllTab();
        for(let i in tabs)
            if(tabs[i] == id){
                count++;
                return this.getIdTab(org_id+"_"+count, count, org_id);
            }
        
        tabs = this.ui_right.getAllTab();
        for(let i in tabs)
            if(tabs[i] == id){
                count++;
                return this.getIdTab(org_id+"_"+count, count, org_id);
            }
        return id;
    }

    public getTabsBuilder(isLeft: boolean){
        if(isLeft)
            return this.ui_left;
        return this.ui_right;
    }

    public getTab(isLeft: boolean, tab: string): StandartTabElement {
        return this.getTabsBuilder(isLeft).getTab(tab);
    }

    public getAllQuest(isLeft: boolean, tab: string): string[] {
        return this.getTab(isLeft, tab).getAllQuest();
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
            if(!this.canQuest(isLeft, tab, element, player) || !this.isGive(isLeft, tab, element, player)) return false;

        return true;
    }

    public giveQuest(isLeft: boolean, tab: string, quest: string, player: number = Player.get(), value: boolean = true, is: boolean = true): boolean {
        let result = true;
        if(!UiMainBuilder.quests[this.client_name])
            UiMainBuilder.quests[this.client_name] = {};
        if(is && this.isGive(isLeft, tab, quest, player))
            UiMainBuilder.quests[this.client_name][isLeft+":"+tab+":"+quest+":"+player] = value;
        else if(!is)
            UiMainBuilder.quests[this.client_name][isLeft+":"+tab+":"+quest+":"+player] = value;
        else 
            result = false;
        Callback.invokeCallback("QuestGive", this, isLeft, tab, quest, player, value, is, result);
        Network.sendToAllClients("QuestGive", {
            quests: UiMainBuilder.quests,
            player: Number(Player.get())
         });
        return result;
    }
    public give(isLeft: boolean, tab: string, quest: string, player: number = Player.get(), description: string, title: string){
        if(!this.canQuest(isLeft, tab, quest, player) && this.giveQuest(isLeft, tab, quest, player, true, true) && description != undefined && title != undefined)
			AchievementAPI.give(player, title,description, this.getQuest(isLeft, tab, quest).getItem());
    }
    public canQuest(isLeft: boolean, tab: string, quest: string, player: number = Player.get()): boolean {
        return !!UiMainBuilder.quests[this.client_name] && !!UiMainBuilder.quests[this.client_name][isLeft+":"+tab+":"+quest+":"+player];
    }
    public registerSave(): UiMainBuilder {
        let self = this;
        Saver.addSavesScope("FTBQuests."+this.client_name, 
            function(scope: any){
                UiMainBuilder.quests[self.client_name]= scope.quests || {};
            },
            function(){
                return {
                    quests: UiMainBuilder.quests[self.client_name]
                };
            }
        );
        Callback.addCallback('LevelLeft', function(){
            UiMainBuilder.quests[self.client_name] = {};
        });        
        return this;
    }
    public registerItem(id: number | string): UiMainBuilder {
        let self = this;
        ItemContainer.registerScreenFactory("FTBQuests."+id+"."+self.client_name, (container) => {
            return self.build(container);
        });
        Item.registerUseFunction(id, function(coords, item, block, player){
            let container: ItemContainer = new ItemContainer();
            self.buildServer(container);
            container.setClientContainerTypeName("FTBQuests."+id+"."+self.client_name);
            container.openFor(Network.getClientForPlayer(player), "main");
        });
        return this;
    }

    public selected_tab: StandartTabElement = null;

    public selectedTab(builder: UiTabsBuilder, element: StandartTabElement){
        this.selected_tab = element;
        this.ui_left.selectedTab(builder, element);
        this.ui_right.selectedTab(builder, element);
    }
    public openTab(builder: UiTabsBuilder, element: StandartTabElement, id?: string){
        this.selectedTab(builder, element);
        if(builder.ui.content.elements[builder.prefix+"_"+id])
            builder.ui.content.elements[builder.prefix+"_"+id].bitmap = element.getTextureSelected(this.style);
        builder.buildTabInformation(element, this.group, this.style);
        return this;
    }
    public getUiLeft(): UiTabsBuilder {
        return this.ui_left;
    }
    public getUiRight(): UiTabsBuilder {
        return this.ui_right;
    }
    public addRender(isLeft: boolean, element: StandartTabElement){
        if(isLeft)
            return this.addRenderLeft(element);
        return this.addRenderRight(element);
    }
    public addRenderLeft(element: StandartTabElement): UiMainBuilder{
        this.ui_left.addRender(element);
        return this;
    }
    public addRenderRight(element: StandartTabElement): UiMainBuilder{
        this.ui_right.addRender(element);
        return this;
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
        this.container = container
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
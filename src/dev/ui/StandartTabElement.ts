class StandartTabElement {
    protected id: string;
    protected quests: Quest[];
    public tab: UiTabsBuilder;

    public path: string;

    constructor(id: string){
        this.id = id;
        this.quests = [];
    }

    public setUiTabsBuilder(tab: UiTabsBuilder): StandartTabElement{
        this.tab = tab;
        return this;
    }

    public addQuest(quest: Quest): StandartTabElement {
        this.quests.push(quest);
        return this;
    }

    public getQuest(name: string): Quest {
        for(const quest of this.quests)
            if(quest.getId() == name)
                return quest;
        return null;
    }

    public build(window: UI.Window): void {
        let content = window.getContent();
        content.drawing = [{type: "color", color: android.graphics.Color.argb(0, 0, 0, 0)}];
        content.elements = {};

        let width: number = 0;
        let heigth: number = 0;
        this.quests.forEach(element => {
            element.tab = this;
            let object = element.build(window);
            width = Math.max(width, object.x+object.size);
            heigth = Math.max(heigth, object.y+object.size);
            content.elements[element.getId()] = object;
        });
        window.setContent(content);
        window.forceRefresh();
        let location = window.getLocation();
        location.setScroll(width, heigth);
        window.updateScrollDimensions();
    }

    public getId(): string {
        return this.id;
    }
    private name: string;
    public getDisplayName(): string {
        return this.name || "Display Name";
    }
    public setDisplayName(name: string): StandartTabElement {
        this.name = name;
        return this;
    }
    public isDisplay(): boolean {
        return true;
    }

    private item: ItemInstance;
    public getItem(): ItemInstance {
        let items = Object.keys(ItemID)
        return this.item || {id: 0, count: 1, data: 0};
    }
    public setItem(item: ItemInstance): StandartTabElement {
        this.item = item;
        return this;
    }

    public updateSlotItem(container: ItemContainer): void {}
    public updateSlotClient(container: ItemContainer): void {}
    public getTextureSlot(style: UiStyle): string{
        return style.tab.tab_slot;
    }
    public getTextureSelected(style: UiStyle): string{
        return style.tab.tab_selected;
    }
    public getSize(): number {
        return 60;
    }
    public onClick(position: Vector, container: ItemContainer, tileEntity: TileEntity, window: UI.Window, canvas: android.graphics.Canvas, scale: number): boolean {
        return true;
    }
    public onLongClick(position: Vector, container: ItemContainer, tileEntity: TileEntity, window: UI.Window, canvas: android.graphics.Canvas, scale: number): boolean {
        return true;
    }
};
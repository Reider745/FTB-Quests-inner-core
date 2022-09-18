class StandartTabElement {
    protected id: string;
    protected quests: Quest[];
    public tab: UiTabsBuilder;

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

    public build(window: UI.Window): void {
        let content = window.getContent();
        content.drawing = [{type: "color", color: android.graphics.Color.argb(0, 0, 0, 0)}];
        content.elements = {};
        this.quests.forEach(element => {
            element.tab = this;
            content.elements[element.getId()] = element.build(window);
        });
        window.setContent(content);
        window.forceRefresh();
    }

    public getId(): string {
        return this.id;
    }
    public getDisplayName(): string {
        return "Display Name";
    }
    public isDisplay(): boolean {
        return true;
    }
    public getItem(): ItemInstance {
        let items = Object.keys(ItemID)
        return {id: ItemID[items[Math.floor(Math.random() * items.length)]], count: 1, data: 0};
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
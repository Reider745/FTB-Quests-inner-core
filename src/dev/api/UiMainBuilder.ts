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
interface IQuest {
    id: string,
    x: number,
    y: number,
    size?: number,
    item?: ItemInstance,
    texture?: string
}
class Quest {
    protected description: IQuest;
    constructor(description: IQuest){
        this.description = description;
    }
    public getId(): string {
        return this.description.id;
    }
    public getItem(): ItemInstance {
        return this.description.item === undefined ? {id: 0, count: 1, data: 0} : this.description.item
    }
    public getX(): number {
        return this.description.x;
    }
    public getY(): number {
        return this.description.y;
    }
    public getSize(): number {
        return this.description.size === undefined ? 50 : this.description.size;
    }
    public getTexture(style: UiStyle): string {
        return this.description.texture === undefined ? style.tab.quest : this.description.texture;
    }
    
    public build(style: UiStyle): any {
        return {type: "slot", bitmap: this.getTexture(style), source: this.getItem(), x: this.getX(), y: this.getY(), size: this.getSize(), visual: true};
    }
};
class StandartTabElement {
    protected id: string;
    protected quests: Quest[];

    constructor(id: string){
        this.id = id;
        this.quests = [];
    }

    public addQuest(quest: Quest): StandartTabElement {
        this.quests.push(quest);
        return this;
    }

    public build(window: UI.Window, style: UiStyle): void {
        let content = window.getContent();
        content.elements = {};
        this.quests.forEach(element => {
            content.elements[element.getId()] = element.build(style);
        });
        window.setContent(content);
        window.forceRefresh();
    }

    public getId(): string {
        return this.id;
    }
    public getDisplayName(): string {
        return "";
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

class UiTabsBuilder {
    private style: UiStyle;
    private elements: StandartTabElement[];
    private prefix: string;
    private content: UI.ElementSet;

    constructor(prefix: string){
        this.elements = [];
        this.prefix = prefix;
    }
    public addRender(element: StandartTabElement): UiTabsBuilder {
        this.elements.push(element);
        return this;
    }
    public setStyle(style: UiStyle){
        this.style = style;
    }
    public buildServer(container: ItemContainer): UiTabsBuilder {
        this.elements.forEach(element => {
            if(element.isDisplay())
                element.updateSlotItem(container);
        });
        return this;
    }
    protected buildTabInformation(element: StandartTabElement, group: UI.WindowGroup, style: UiStyle){
        element.build(group.getWindow("main"), style);
    }
    protected onClick(element: StandartTabElement, group: UI.WindowGroup, location: UI.WindowLocation, style: UiStyle, position, container, tileEntity, window, canvas, scale): void {
        if(element.onClick(position, container, tileEntity, window, canvas, scale)){
            this.elements.forEach(element => {
                this.content[this.prefix+"_"+element.getId()].bitmap = element.getTextureSlot(style);
            });
            this.content[this.prefix+"_"+element.getId()].bitmap = element.getTextureSelected(style);
            this.buildTabInformation(element, group, style);
        }
    }
    protected onLongClick(element: StandartTabElement, group: UI.WindowGroup, location: UI.WindowLocation, style: UiStyle, position, container, tileEntity, window, canvas, scale): void {
        if(element.onLongClick(position, container, tileEntity, window, canvas, scale)){
            this.elements.forEach(element => {
                this.content[this.prefix+"_"+element.getId()].bitmap = element.getTextureSlot(style);
            });
            this.content[this.prefix+"_"+element.getId()].bitmap = element.getTextureSelected(style);
            this.buildTabInformation(element, group, style);
        }
    }
    public build(container: ItemContainer, location: UI.WindowLocation, group: UI.WindowGroup, style: UiStyle): UI.ElementSet{
        let elements: UI.ElementSet = {};
        let self = this;
        let y = 0;
        this.elements.forEach(element => {
            if(element.isDisplay()){
                let size = location.globalToWindow(element.getSize());
                elements[this.prefix+"_"+element.getId()] = {type: "slot", x: 0, y: y, size: size, visual: true, bitmap: element.getTextureSlot(this.style), clicker: {
                    onClick(position, container, tileEntity, window, canvas, scale) {
                        self.onClick(element, group, location, style, position, container, tileEntity, window, canvas, scale);
                    },
                    onLongClick(position, container, tileEntity, window, canvas, scale) {
                        self.onLongClick(element, group, location, style, position, container, tileEntity, window, canvas, scale)
                    },
                }, source: element.getItem()};
                element.updateSlotClient(container);
                y+=size;
            }
        });
        this.content = elements;
        return elements;
    }
    public getMaxSize(): number {
        let max = 0;
        this.elements.forEach(element => {
            if(element.isDisplay() && max < element.getSize())
                max = element.getSize();
        });
        return max;
    }
    public getHeight(): number {
        let y = 0;
        this.elements.forEach(element => {
            if(element.isDisplay())
                y += element.getSize();
        });
        return y;
    }
};

class UiMainBuilder {
    private group: UI.WindowGroup;
    private main: UI.Window;
    private style: UiStyle;
    private ui_left: UiTabsBuilder;
    private ui_right: UiTabsBuilder;


    constructor(){
        this.main = new UI.Window();
        this.style = new UiStyle();
        this.ui_left = new UiTabsBuilder("left");
        this.ui_right = new UiTabsBuilder("right");

        this.ui_left.setStyle(this.style);
        this.ui_right.setStyle(this.style);
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

    protected buildTabFrame(left: number, right: number, builder: UiTabsBuilder, container: ItemContainer, group: UI.WindowGroup): UI.Window {
        let location = new UI.WindowLocation({
            padding: {
                right: right,
                left: left
            }
        });
        let frame = new UI.Window({
            location: {
                padding: {
                    right: right,
                    left: left
                },
                scrollY: builder.getHeight()
            },
            drawing: [
                {type: "color", color: android.graphics.Color.argb(0, 0, 0, 0)}
            ],
            elements:builder.build(container, location, group, this.style),
        });
        return frame;
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
        this.group.addWindowInstance("left", this.buildTabFrame(0, 1000-this.ui_left.getMaxSize(), this.ui_left, container, this.group));
        this.group.addWindowInstance("right", this.buildTabFrame(1000-this.ui_right.getMaxSize(), 0, this.ui_right, container, this.group));
        this.group.addWindowInstance("main", new UI.Window({
            location: {
                padding: {
                    left: this.ui_left.getMaxSize()+3,
                    right: this.ui_right.getMaxSize()-3
                }
            },
            drawing: [
                {type: "color", color: android.graphics.Color.argb(0, 0, 0, 0)}
            ],
            elements: {}
        }))
        return this.group;
    }
};
interface IQuest {
    id: string,
    x: number,
    y: number,
    size?: number,
    item?: ItemInstance,
    texture?: string
    lines?: string[]
}

let LineDraw = WRAP_JAVA("com.reider.ftb.Line");
let Vec2 = WRAP_JAVA("com.reider.ftb.Vec2");

class Quest {
    protected description: IQuest;
    public tab: StandartTabElement;

    constructor(description: IQuest){
        this.description = description;
        this.description.lines = this.description.lines === undefined ? [] : this.description.lines;
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
    public getLines(): string[] {
        return this.description.lines;
    }

    public onClick(position: Vector, container: ItemContainer, tileEntity: TileEntity, window: UI.Window, canvas: android.graphics.Canvas, scale: number){
        let dialog = new UiDialog("Тестовый квест и сообщение.\nOk?\nНу как тебе от 0 до 5?", "Описание квеста\nОк?");
        dialog.style.background = [.25, 0, 0, 0];
        dialog.openCenter();
    }
    public onLongClick(position: Vector, container: ItemContainer, tileEntity: TileEntity, window: UI.Window, canvas: android.graphics.Canvas, scale: number){
        
    }

    public buildLine(window: UI.Window, x1: number, y1: number, x2: number, y2: number, size1: number, size2: number): void {
        let self = this;
        window.getContent().drawing.push({type:"custom", onDraw(canvas, scale) {
            let line = new LineDraw(new Vec2(x1*scale, y1*scale), new Vec2(x2*scale, y2*scale));
            line.drawLine(canvas, scale);
        }})
    }
    
    public build(window: UI.Window): any {
        let self: Quest = this;
        let content = window.getContent();
        for(let i in this.description.lines){
            let name: string = this.description.lines[i];
            content.elements[name].x 
            this.buildLine(window, content.elements[name].x, content.elements[name].y, this.getX(), this.getY(), content.elements[name].size, this.getSize());
        }
        let slot: UI.UISlotElement = {type: "slot", bitmap: this.getTexture(this.tab.tab.main.style), source: this.getItem(), x: this.getX(), y: this.getY(), size: this.getSize(), visual: true, clicker: {
            onClick(position, container: any, tileEntity, window: any, canvas, scale) {
                self.onClick(position, container, tileEntity, window, canvas, scale);
            },
            onLongClick(position, container: any, tileEntity, window: any, canvas, scale) {
                self.onLongClick(position, container, tileEntity, window, canvas, scale);
            },
        }};
        return slot;
    }
};
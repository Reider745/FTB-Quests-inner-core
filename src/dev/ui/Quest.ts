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
    public tab: StandartTabElement;

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

    public onClick(position: Vector, container: ItemContainer, tileEntity: TileEntity, window: UI.Window, canvas: android.graphics.Canvas, scale: number){
        let dialog = new UiDialog("Тестовый квест и сообщение.\nOk?\nНу как тебе от 0 до 5?", "Описание квеста\nОк?");
        dialog.style.background = [.25, 0, 0, 0];
        dialog.openCenter();
    }
    public onLongClick(position: Vector, container: ItemContainer, tileEntity: TileEntity, window: UI.Window, canvas: android.graphics.Canvas, scale: number){
        
    }
    
    public build(style: UiStyle): any {
        let self: Quest = this;
        let slot: UI.UISlotElement = {type: "slot", bitmap: this.getTexture(style), source: this.getItem(), x: this.getX(), y: this.getY(), size: this.getSize(), visual: true, clicker: {
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
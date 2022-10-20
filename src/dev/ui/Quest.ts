interface IQuest {
    id: string,
    x: number,
    y: number,
    size?: number,
    item?: ItemInstance,
    texture?: string
    texturePost?: string
    lines?: string[]
}

let LineDraw = WRAP_JAVA("com.reider.ftb.Line");
let Vec2 = WRAP_JAVA("com.reider.ftb.Vec2");

class Quest {
    protected description: IQuest;
    public tab: StandartTabElement;
    public quest?: IUiQuest;

    public path: string;

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
    public getTexturePost(style: UiStyle): string {
        return this.description.texturePost === undefined ? style.tab.questPost : this.description.texturePost;
    }
    public getLines(): string[] {
        return this.description.lines === undefined ? [] : this.description.lines;
    }

    public dialog: UiDialogBase = new UiDialog("", "");

    public setDialog(dialog: UiDialogBase): Quest{
        dialog.quest = this;
        this.dialog = dialog;
        return this;
    }

    public onClick(position: Vector, container: ItemContainer, tileEntity: TileEntity, window: UI.Window, canvas: android.graphics.Canvas, scale: number): void{
        this.dialog.style.background = [.25, 0, 0, 0];
        this.dialog.openCenter();
    }
    public onLongClick(position: Vector, container: ItemContainer, tileEntity: TileEntity, window: UI.Window, canvas: android.graphics.Canvas, scale: number): void{
        if(this.tab.tab.main.isDebug()){
            let self = this;
            let ui = new UiDialogSetting("What?")
                .addElement(new SettingButtonTextElement(Translation.translate("Delete")).setClick(function(){
                    self.tab.deleteQuest(self.getId());
                    ui.close();
                    self.tab.tab.main.open();
                }))
                .addElement(new SettingButtonTextElement(Translation.translate("Edit")).setClick(function(){
                    ui.close();
                    QuestEditor.openEditor(self.tab.tab.main, self, false);
                }))
                .setEnableExitButton(false);
            ui.openCenter();
        }
    }

    public buildLine(window: UI.Window, x1: number, y1: number, x2: number, y2: number, size1: number, size2: number, name: string): void {
        let self = this;
        let color = android.graphics.Color.WHITE;
        if(this.tab.tab.main.canQuest(this.tab.tab.canLeft(), this.tab.getId(), name)){
            color = android.graphics.Color.YELLOW;
            if(this.tab.tab.main.canQuest(this.tab.tab.canLeft(), this.tab.getId(), this.getId()))
                color = android.graphics.Color.GREEN;
        }
        window.getContent().drawing.push(line([x1+size1/2, y1+size1/2], [x2+size2/2, y2+size2/2], 15, color));
    }
    
    public build(window: UI.Window): any {
        let self: Quest = this;
        let content = window.getContent();
        for(let i in this.description.lines){
            let name: string = this.description.lines[i];
            this.buildLine(window, content.elements[name].x, content.elements[name].y, this.getX(), this.getY(), content.elements[name].size, this.getSize(), name);
        }
        let slot: UI.UISlotElement = {type: "slot", bitmap: this.tab.tab.main.canQuest(this.tab.tab.canLeft(), this.tab.getId(), this.getId()) ? this.getTexturePost(this.tab.tab.main.style) : this.getTexture(this.tab.tab.main.style), source: this.getItem(), x: this.getX(), y: this.getY(), size: this.getSize(), visual: true, clicker: {
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
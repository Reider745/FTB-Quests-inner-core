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

class Quest {
    protected description: IQuest;
    public tab: StandartTabElement;
    public quest?: IUiQuest;
    public client_type: string = "base";

    public path: string;

    constructor(description: IQuest){
        this.description = description;
        this.description.lines = this.description.lines === undefined ? [] : this.description.lines;
    }

    public getTab(): StandartTabElement {
        return this.tab;
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

    public getDialog(): UiDialogBase {
        return this.dialog;
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

        for(let i in this.description.lines){
            let name: string = this.description.lines[i];
            let quest = this.tab.getQuest(name);
            quest && this.buildLine(window, quest.getX(), quest.getY(), this.getX(), this.getY(), quest.getSize(), this.getSize(), name);
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

    public onAddedQuest(): boolean {
        return true;
    }

    public onRemoveQuest(): boolean {
        return true;
    }

    public canExternal(): boolean {
        return false;
    }

    public externalPacket(): IQuest {
        return this.description;
    }

    public getClientType(): string {
        return this.client_type;
    }

    public static clients: {[key: string]: typeof Quest} = {};
    public static registerClient(type: string, clazz: typeof Quest): void {
        Quest.clients[type] = clazz;
    }

    public static buildForServer(type: string, data: IQuest, dialog: UiDialogBase): Quest {
        let clazz = Quest.clients[type];
        if(clazz){
            let res = new clazz(data);
            dialog && res.setDialog(dialog);
            return res;
        }
        return null;
    }
};

class ExternalQuest extends Quest {
    public canExternal(): boolean {
        return true;
    }
}

Quest.registerClient("base", ExternalQuest);
class TabSetting extends StandartTabElement {
    public texture: string;
    public setting: UiDialogSetting;
    public han: (config: {[key: string]: any}) => void = () => {};

    constructor(id: string, texture: string, path: string){
        super(id);
        this.texture = texture;

        let save = {};
        if(FileTools.isExists(path))
            save = FileTools.ReadJSON(path);
        this.setting = new UiDialogSetting("Setting");
        
        
        this.setting.add(new SettingTextElement("Quest editor"));
        this.setting.add(new SettingSwitchElement("quest_editor"));
        
        this.setting.setConfig(save);
        this.setting.setCloseHandler((setting) => {
            FileTools.WriteJSON(path, setting.getConfig(), true);
            this.han(setting.getConfig());
        });
    }

    public apply(): TabSetting {
        this.han(this.setting.getConfig());
        return this;
    }

    public isEdit(): boolean {
        return false;
    }

    public setHandlerClose(han: (config: {[key: string]: any}) => void): TabSetting {
        this.han = han;
        return this;
    }

    public getSetting(): UiDialogSetting {
        return this.setting;
    }

    public getConfig(): {[key: string]: any} {
        return this.setting.getConfig();
    }

    public getItem(): ItemInstance {
        return ItemAir;
    }

    public getTextureSelected(style: UiStyle): string {
        return this.getTextureSlot(style);
    }

    public getTextureSlot(style: UiStyle): string {
        return this.texture;
    }

    public onClick(position: Vector, container: ItemContainer, tileEntity: TileEntity, window: UI.Window, canvas: globalAndroid.graphics.Canvas, scale: number): boolean {
        this.setting.openCenter();
        return false;
    }

    public onLongClick(position: Vector, container: ItemContainer, tileEntity: TileEntity, window: UI.Window, canvas: globalAndroid.graphics.Canvas, scale: number): boolean {
        return false;
    }
}
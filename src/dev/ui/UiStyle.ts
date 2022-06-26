let Color = android.graphics.Color;
class UiDialogStyle {
    public frame: string;
    public max: number;
    public size: number;
    public scale: number;
    public color: [number, number, number];

    constructor(){
        this.frame = "default_container_frame";
        this.max = 150;
        this.size = 20;
        this.scale = 3;
        this.color = [1, 1, 1];
    }
}
class CloseButtonStyle {
    public bitmap: string;
    public scale: number;

    constructor(bitmap: string = "missing_image"){
        this.bitmap = bitmap;
        let image = TextureSource.get(bitmap);
        this.scale = 50 / image.getWidth();
    }
};
class UiTabStyle {
    public frame: string;
    public tab_slot: string;
    public tab_selected: string;
    public scale: number;
    public quest: string;

    constructor(){
        this.frame = "default_container_frame";
        this.tab_slot = "_default_slot_empty";
        this.tab_selected = "default_container_frame";
        this.scale = 1;
        this.quest = "offline";
    }
};
class UiStyle {
    public bitmap: android.graphics.Bitmap;
    public close_main: CloseButtonStyle;
    public tab: UiTabStyle;
    constructor(){
        this.setMainBackground("background_squares");
        this.close_main = new CloseButtonStyle();
        this.tab = new UiTabStyle();
    }
    public setMainBackground(bitmap: string) {
        this.bitmap = TextureSource.get(bitmap);
    }
    public setCloseButton(button: CloseButtonStyle) {
        this.close_main = button;
    }
};
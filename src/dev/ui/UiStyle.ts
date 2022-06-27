let Color = android.graphics.Color;
class UiDialogBaseStyle {
    public frame: string;
    public size: number;
    public scale: number;
    public color: [number, number, number, number];
    public text: [number, number, number];
    public background: [number, number, number, number];

    constructor(frame: string = "default_container_frame", size: number = 20, scale: number = .5, color: [number, number, number, number] = [.25, 0, 0, 0], text: [number, number, number] = [1, 1, 1], background: [number, number, number, number] = [.25, 0, 0, 0]){
        this.frame = frame;
        this.size = size;
        this.scale = scale;
        this.color = color;
        this.text = text;
        this.background = background;
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
        this.tab_selected = "default_container_frame_alpha";
        this.scale = .5;
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
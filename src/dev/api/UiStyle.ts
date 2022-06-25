let TextureSource = WRAP_JAVA("com.zhekasmirnov.innercore.api.mod.ui.TextureSource").instance;
let Color = android.graphics.Color;
const MAX_SIZE = 50;
class CloseButtonStyle {
    public bitmap: string;
    public scale: number;

    constructor(bitmap: string = "missing_image"){
        this.bitmap = bitmap;
        let image = TextureSource.get(bitmap);
        this.scale = MAX_SIZE / image.getWidth();
    }
};
class UiTabStyle {
    public frame: string;
    constructor(){
        this.frame = "default_container_frame";
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
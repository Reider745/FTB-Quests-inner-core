class MinecraftDialogStyle extends UiDialogBaseStyle {
    constructor(text?: [number, number, number], background?: [number, number, number, number]){
        super("minecraft_frame", 20, 1, [1, 0, 0, 0], text, background);
    }
}
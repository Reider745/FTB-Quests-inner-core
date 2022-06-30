IMPORT("TextureWorker");
let TextureSource = WRAP_JAVA("com.zhekasmirnov.innercore.api.mod.ui.TextureSource").instance;

let uiOptions = android.view.View.SYSTEM_UI_FLAG_LAYOUT_STABLE
| android.view.View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
| android.view.View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
| android.view.View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
| android.view.View.SYSTEM_UI_FLAG_FULLSCREEN
| android.view.View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY;
let open = false
function onSystemUiVisibilityChange(layout: any, is: boolean = true): void{
    layout.setOnSystemUiVisibilityChangeListener({
        onSystemUiVisibilityChange: function (visibility: number): void {
            if ((visibility & android.view.View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION) == 0)
                layout.setSystemUiVisibility(uiOptions);
            
        }
    });
}
function onSystemUiVisibility(win: UI.Window): void{
    win.setEventListener({
        onClose(window) {},
        onOpen(window) {
            onSystemUiVisibilityChange(win.layout, true);
        },
    })
}
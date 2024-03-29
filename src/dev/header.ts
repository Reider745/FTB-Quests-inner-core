IMPORT("TextureWorker");
let TextureSource = WRAP_JAVA("com.zhekasmirnov.innercore.api.mod.ui.TextureSource").instance;

let uiOptions = android.view.View.SYSTEM_UI_FLAG_LAYOUT_STABLE
| android.view.View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
| android.view.View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
| android.view.View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
| android.view.View.SYSTEM_UI_FLAG_FULLSCREEN
| android.view.View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY;

function runUi(func: () => void){
    let context: any = UI.getContext();
    context.runOnUiThread({
        run(){
            func();
        }
    });
}
let open = false
function onSystemUiVisibilityChange(layout: any, is: boolean = true): void{
    runUi(() => layout.setOnSystemUiVisibilityChangeListener({
        onSystemUiVisibilityChange: function (visibility: number): void {
            if ((visibility & android.view.View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION) == 0)
                layout.setSystemUiVisibility(uiOptions);
            
        }
    }));
}
function onSystemUiVisibility(win: UI.Window): void{
    win.setEventListener({
        onClose(window) {},
        onOpen(window) {
            onSystemUiVisibilityChange(win.layout, true);
        },
    })
}

/*
Союз нерушимый республик свободных
Сплотила навеки Великая Русь
Да здравствует созданный волей народов
Единый, могучий Советский Союз!
Славься, Отечество наше свободное
Дружбы народов надёжный оплот!
Партия Ленина — сила народная
Нас к торжеству коммунизма ведёт!
Сквозь грозы сияло нам солнце свободы
И Ленин великий нам путь озарил
На правое дело он поднял народы
На труд и на подвиги нас вдохновил
Славься, Отечество наше свободное
Дружбы народов надёжный оплот!
Партия Ленина — сила народная
Нас к торжеству коммунизма ведёт!
В победе бессмертных идей коммунизма
Мы видим грядущее нашей страны
И Красному знамени славной Отчизны
Мы будем всегда беззаветно верны!
Славься, Отечество наше свободное
Дружбы народов надёжный оплот!
Партия Ленина — сила народная
Нас к торжеству коммунизма ведёт!
*/
const ItemAir: ItemInstance = {id: 0, count: 0, data: 0};
let LineBuilder = WRAP_JAVA("com.ftbquests.LineBuilder");

LineBuilder.boot();

function line(posParent: number[], posChild: number[], width: number, color: number): any{
    return {
        type: 'custom',
        isLine: true,
        onDraw: function (canvas, scale) {
            LineBuilder.buildLine(canvas, color, posChild, posParent, scale, width);
        }
    };
}
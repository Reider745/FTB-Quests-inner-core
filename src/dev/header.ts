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

let line = (function () {
    let Rect = android.graphics.Rect
    let RectF = android.graphics.RectF
    let Paint = android.graphics.Paint
    let lineBitmap = android.graphics.Bitmap.createBitmap(20 * 64, 64, android.graphics.Bitmap.Config.ARGB_8888)
    let lineSrc = new Rect(0, 0, 20 * 64, 64)
    Callback.addCallback('PostLoaded', function () {
        let bitmap = UI.TextureSource.getNullable('dependency')
        if (bitmap === null) return
        let canvas = new android.graphics.Canvas(lineBitmap)
        for (let x = 0; x < 20; x++) {
            canvas.drawBitmap(bitmap, x * 64, 0, null)
        }
    })
    return function (posParent, posChild, width, color): any {
        if (typeof width !== 'number' || width <= 0) width = 10
        let argb = [(color >>> 24) & 0xff, (color >>> 16) & 0xff, (color >>> 8) & 0xff, (color >>> 0) & 0xff]
        let deltaPos = [posChild[0] - posParent[0], posChild[1] - posParent[1]]
        let dis = Math.sqrt(deltaPos[0] * deltaPos[0] + deltaPos[1] * deltaPos[1])
        //if (dis <= width) return {}
        let angle = Math.acos(Math.max(Math.min(deltaPos[0]/dis, 1), -1)) * (180 / Math.PI)
        if (deltaPos[1] < 0) angle = -angle
        return {
            type: 'custom',
            onDraw: function (canvas, scale) {
                let paint = new Paint()
                paint.setStyle(Paint.Style.FILL)
                paint.setAntiAlias(true)
                paint.setARGB(argb[0], argb[1], argb[2], argb[3])
                canvas.save()
                canvas.translate(posParent[0] * scale, posParent[1] * scale)
                canvas.rotate(angle)
                canvas.translate(0, -width * scale / 2)
                canvas.drawRect(new RectF(0, 0, dis * scale, width * scale), paint)
                let left = 0
                for (let w = dis / width; w > 0; w -= 20) {
                    if (w <= 20) {
                        canvas.drawBitmap(lineBitmap,
                            new Rect(0, 0, Math.floor(w * 64), 64),
                            new RectF(left * scale, 0, (left + w * width) * scale, width * scale),
                            null)
                        break
                    } else {
                        canvas.drawBitmap(lineBitmap, lineSrc,
                            new RectF(left * scale, 0, (left + 20 * width) * scale, width * scale),
                            null)
                        left += 20 * width
                    }
                }
                canvas.restore()
            }
        };
    }
})();
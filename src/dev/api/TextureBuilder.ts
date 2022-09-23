interface IPaint {
    bitmap: string,
    color: [number, number, number]
}
declare var TextureWorker: any;
class TextureBuilder {
    static paintTextures(result: string, bitmaps: IPaint[], x: number, y: number){
        TextureSource.put(result, TextureWorker._createTextureWithOverlays({
            bitmap: {
                width: x, 
                height: y
            },
            overlays: bitmaps
        }));
    }
    static setAlphaTexture(input: string, result: string, alpha: number, xx: number, yy: number){
        let inp: android.graphics.Bitmap = TextureSource.get(input);
        let out: android.graphics.Bitmap = android.graphics.Bitmap.createBitmap(xx, yy, android.graphics.Bitmap.Config.ARGB_8888);
        for(let x = 0;x < inp.getWidth();x++)
            for(let y = 0;y < inp.getHeight();y++){
                let color = inp.getPixel(x, y);
                out.setPixel(x, y, android.graphics.Color.argb(alpha, android.graphics.Color.red(color), android.graphics.Color.green(color), android.graphics.Color.blue(color)));
            }
        TextureSource.put(result, out);
    }
};
TextureBuilder.paintTextures("ftbquests_default_quest", [
    {
        bitmap: "shapes.circle.background",
        color: [87, 87, 87]
    },{
        bitmap: "shapes.circle.outline",
        color: [66, 66, 66]
    }
], 128, 128);
TextureBuilder.paintTextures("ftbquests_default_quest_post", [
    {
        bitmap: "shapes.circle.background",
        color: [46, 122, 49]
    },{
        bitmap: "shapes.circle.outline",
        color: [44, 115, 44]
    }
], 128, 128);
TextureBuilder.setAlphaTexture("default_container_frame", "default_container_frame_alpha", .3, 16, 16);
TextureBuilder.setAlphaTexture("_button_next_48x24", "_button_next_48x24_alpha", .4, 48, 24);
TextureBuilder.setAlphaTexture("_button_next_48x24p", "_button_next_48x24p_alpha", .4, 48, 24);
TextureBuilder.setAlphaTexture("_button_prev_48x24", "_button_prev_48x24_alpha", .4, 48, 24);
TextureBuilder.setAlphaTexture("_button_prev_48x24p", "_button_prev_48x24p_alpha", .4, 48, 24);
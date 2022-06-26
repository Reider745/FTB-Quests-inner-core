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
TextureBuilder.paintTextures("test", [
    {
        bitmap: "shapes.circle.background",
        color: [220, 219, 219]
    },{
        bitmap: "shapes.circle.outline",
        color: [128, 255, 0]
    }
], 128, 128);
TextureBuilder.setAlphaTexture("default_container_frame", "default_container_frame_alpha", .3, 16, 16);
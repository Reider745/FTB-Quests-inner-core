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
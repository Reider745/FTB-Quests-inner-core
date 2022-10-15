package com;

import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.Rect;
import android.graphics.RectF;
import com.zhekasmirnov.innercore.api.mod.ui.TextureSource;

public class LineBuilder {
    private static Bitmap lineBitmap;
    private static Rect lineSrc;

    public static void boot(){
        Bitmap lineBitmap = Bitmap.createBitmap(20 * 64, 64, android.graphics.Bitmap.Config.ARGB_8888);
        Rect lineSrc = new Rect(0, 0, 20 * 64, 64);

        Bitmap bitmap = TextureSource.instance.get("dependency");
        Canvas canvas = new Canvas(lineBitmap);
        for (int x = 0; x < 20; x++)
            canvas.drawBitmap(bitmap, x * 64, 0, null);
        LineBuilder.lineBitmap = lineBitmap;
        LineBuilder.lineSrc = lineSrc;
    }

    public static void buildLine(Canvas canvas, int color, int[] posChild, int[] posParent, float scale, int width){
        int[] deltaPos = new int[]{posChild[0] - posParent[0], posChild[1] - posParent[1]};
        double dis = Math.sqrt(deltaPos[0] * deltaPos[0] + deltaPos[1] * deltaPos[1]);
        float angle = (float) (Math.acos(Math.max(Math.min(deltaPos[0]/dis, 1), -1)) * (180 / Math.PI));
        if (deltaPos[1] < 0) angle = -angle;

        Paint paint = new Paint();
        paint.setStyle(Paint.Style.FILL);
        paint.setAntiAlias(true);
        paint.setColor(color);
        canvas.save();
        canvas.translate(posParent[0] * scale, posParent[1] * scale);
        canvas.rotate(angle);
        canvas.translate(0, -width * scale / 2);
        canvas.drawRect(new RectF(0, 0, (float) (dis * scale), width * scale), paint);
        float left = 0;
        for (double w = dis / width; w > 0; w -= 20) {
            if (w <= 20) {
                canvas.drawBitmap(lineBitmap, new Rect(0, 0, (int) Math.floor(w * 64), 64), new RectF(left * scale, 0, (float) ((left + w * width) * scale), width * scale), null);
                break;
            }
            canvas.drawBitmap(lineBitmap, lineSrc, new RectF(left * scale, 0, (left + 20 * width) * scale, width * scale), null);
            left += 20 * width;
        }
        canvas.restore();
    }
}

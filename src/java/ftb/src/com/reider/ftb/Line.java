package com.reider.ftb;

import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;

public class Line {
    public static final double LINE = 0.2;
    public static final Paint paint = new Paint();
    public static final int SIZE = 5;

    Vec2 pos1, pos2;
    int color1, color2;

    public Line(Vec2 pos1, Vec2 pos2){
        this.pos1 = pos1;
        this.pos2 = pos2;

        this.color1 = Color.argb(1f, 1f, 1f, 1f);
        this.color2 = Color.argb(1f, 0f, 1f, 0f);
    }
    private static double math(double v1,double v2) {
        if(v1 >= v2)
            return v2;
        else if(v1 <= -v2)
            return -v2;
        return 0;
    }
    public void drawPixel(Canvas canvas, int x, int y, double maxX, double minX, double maxY, double minY, Vec2 vec, Vec2 size, float scale){
        double _y = math(vec.y-(vec.y * .25), .5 * scale);
        double _x = math(vec.x-(vec.x * .25), .5 * scale);
        for(int i = 1;i <= SIZE*2;i++)
            for(int ii = 1;ii <= SIZE*2-i;ii++)
                canvas.drawPoint((float) (minX+x-(ii*_x)), (float) (minY+y-(ii*_y)), paint);
    }

    public void drawLine(Canvas canvas, float scale) {
        double minX = this.pos1.minX(pos2), maxX = this.pos1.maxX(pos2), minY = this.pos1.minY(pos2), maxY = this.pos1.maxY(pos2);
        Vec2 size = new Vec2(maxX - minX, maxY - minY);
        Vec2 vector = new Vec2(100 / size.x*LINE*maxX, 100 / size.y*LINE*maxY);

        paint.setStrokeWidth(SIZE * scale);
        paint.setColor(color1);
        canvas.drawLine((float) this.pos1.x, (float) this.pos1.y, (float) this.pos2.x, (float) this.pos2.y, paint);

        paint.setStrokeWidth(.5f * scale);
        paint.setColor(color2);
        for(int x = 0, y = 0; x < size.x || y < size.y;x+=vector.x, y+=vector.y)
            drawPixel(canvas, x, y, maxX, minX, maxY, minY, vector, size, scale);
    }
}
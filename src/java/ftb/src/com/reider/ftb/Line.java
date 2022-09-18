package com.reider.ftb;

import com.zhekasmirnov.horizon.runtime.logger.Logger;

import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Matrix;
import android.graphics.Paint;

public class Line {
    public static final double LINE = 0.15;
    public static final Paint paint = new Paint();
    public static final int SIZE = 5;
    public static final String[] LINE_COLORS = new String[]{
       "00000100000",//1
       "00001110000",//2
       "00011111000",//3
       "00111111100",//4
       "01111011110",//5
       "11100000111",//6
       "11000000011",//7
       "10000000001",//8
       "10000000001",//9
       "00000000000",//10
       "00000000000"//11
    };

    Vec2 pos1, pos2;
    int color1, color2;
    Bitmap bitmap;

    public Line(Vec2 pos1, Vec2 pos2){
        this.pos1 = pos1;
        this.pos2 = pos2;

        this.color1 = Color.argb(1f, 1f, 1f, 1f);
        this.color2 = Color.argb(1f, 0f, 1f, 0f);

        bitmap = Bitmap.createBitmap(11, 11, Bitmap.Config.ARGB_8888);
        for(int y = 0;y < 11;y++){
            char[] symbols = LINE_COLORS[y].toCharArray();
            for(int x = 0;x < 11;x++)
                if(symbols[x] == '1')
                    bitmap.setPixel(x, y, color2);
        }
    }

    public void drawPixel(Canvas canvas, int x, int y, double maxX, double minX, double maxY, double minY, Vec2 vec, Vec2 size, Matrix matrix, float scale){
        canvas.drawBitmap(Bitmap.createBitmap(bitmap, 0, 0, bitmap.getWidth(), bitmap.getHeight(), matrix, true), (float) (minX+x), (float) (minY+y), paint);
    }

    public void drawLine(Canvas canvas, float scale) {
        double minX = this.pos1.minX(pos2), maxX = this.pos1.maxX(pos2), minY = this.pos1.minY(pos2), maxY = this.pos1.maxY(pos2);
        Vec2 size = new Vec2(maxX - minX, maxY - minY);
        Vec2 vector = new Vec2(100 / size.x*LINE*maxX, 100 / size.y*LINE*maxY);

        paint.setStrokeWidth(SIZE * scale);
        paint.setColor(color1);
        canvas.drawLine((float) this.pos1.x, (float) this.pos1.y, (float) this.pos2.x, (float) this.pos2.y, paint);
        paint.reset();

        Matrix matrix = new Matrix();
        matrix.setScale(scale * (SIZE/11), scale * (SIZE/11));
        matrix.setRotate((int)(Math.cos(size.y/size.x) * 180.0d / Math.PI)+90);
        
        for(int x = 0, y = 0; x < size.x || y < size.y;x+=vector.x, y+=vector.y)
            drawPixel(canvas, x, y, maxX, minX, maxY, minY, vector, size, matrix, scale);
    }
}
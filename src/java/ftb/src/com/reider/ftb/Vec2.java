package com.reider.ftb;

public class Vec2 {
    double x, y;
    public Vec2(double x, double y){
        this.x = x;
        this.y = y;
    }

    public double maxX(Vec2 pos){
        return Math.max(x, pos.x);
    }

    public double minX(Vec2 pos){
        return Math.min(x, pos.x);
    }

    public double maxY(Vec2 pos){
        return Math.max(y, pos.y);
    }

    public double minY(Vec2 pos){
        return Math.min(y, pos.y);
    }
}

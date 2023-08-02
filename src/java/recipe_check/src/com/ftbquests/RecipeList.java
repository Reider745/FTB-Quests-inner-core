package com.ftbquests;

public class RecipeList {
    native public static void add(long player, int id);
    native public static void clear();
    native public static boolean is(long player, int[] ids);
    native public static int[] get(long player);
    native public static long[] getPlayers();
}

#include <map>
#include <vector>
#include <jni.h>
#include <java.h>
#include <logger.h>

int indexOf(std::vector<int> arr, int value){
    for (int i = 0;i < arr.size();i++)
        if(arr.at(i) == value)
            return i;
    return -1;
}

class RecipesList {
    private:
        static std::map<long long, std::vector<int>> ids;
    public:
        static std::vector<int>& getIds(long long player){
            if(ids.find(player) == ids.end())
                ids[player] = std::vector<int>();
            return ids.find(player)->second;
        }
        static void add(long long player, int id){
            std::vector<int>& ids = getIds(player);
            if(indexOf(ids, id) == -1)
                ids.push_back(id);
        }
        static jintArray get(JNIEnv* env, long long player) {
            std::vector<int>& ids = getIds(player);
            jintArray array = env->NewIntArray(ids.size());
            env->SetIntArrayRegion(array, 0, ids.size(), (jint*) ids.data());
            return array;
        }
        static jlongArray get(JNIEnv* env) {
            std::vector<long long> players;
            auto it = ids.begin();
            while(it != ids.end()){
                players.push_back(it->first);
                it++;
            }
            jlongArray array = env->NewLongArray(players.size());
            env->SetLongArrayRegion(array, 0, players.size(), (jlong*) players.data());
            
            return array;
        }
        static bool is(long long player, std::vector<int>& items){
            std::vector<int>& ids = getIds(player);
            std::vector<int> array(ids);
            auto it = array.begin();
            while (it != array.end()){
                int id = *it;
                int i = indexOf(items, id);
                if(i != -1)
                    items.erase(items.begin() + i);
                it++;
            }
            return items.size() == 0;
        }
        static void clear(){
            ids.clear();
        }
};

#include <mod.h>
class SkyFactoryModule : public Module {
    public:
        SkyFactoryModule(): Module("skyfactory"){}
        virtual void initialize(){

        }
};

MAIN {
    new SkyFactoryModule();
};

std::map<long long, std::vector<int>> RecipesList::ids;

extern "C" {
    JNIEXPORT void JNICALL Java_com_skyfactory_RecipeList_add(JNIEnv* env, jobject obj, jlong player, jint value){
        RecipesList::add((long long) player, (int) value);
    }
    JNIEXPORT void JNICALL Java_com_skyfactory_RecipeList_clear(JNIEnv* env, jobject obj){
        RecipesList::clear();
    }
    JNIEXPORT jintArray JNICALL Java_com_skyfactory_RecipeList_get(JNIEnv* env, jobject obj, jlong player){
        return RecipesList::get(env, (long long) player);
    }
    JNIEXPORT jlongArray JNICALL Java_com_skyfactory_RecipeList_getPlayers(JNIEnv* env, jobject obj){
        return RecipesList::get(env);
    }
    JNIEXPORT jboolean JNICALL Java_com_skyfactory_RecipeList_is(JNIEnv* env, jobject obj, jlong player, jintArray items){
        jsize size = env->GetArrayLength(items);
        std::vector<int> arr(size);
        env->GetIntArrayRegion(items, 0, size, &arr[0]);
        return RecipesList::is((long long) player, arr) ? JNI_TRUE : JNI_FALSE;
    }
}
#include <iostream>
#include <vector>
#include <list>
#include <map>
#include <string>
#include <memory>
#include <unordered_map>

int main() {
    int* p = new int(5);

    std::unique_ptr<int> q = std::make_unique<int>(10);

    delete p;

    int* r = (int*)malloc(sizeof(int));

    free(r);

    std::list<int> l;

    std::vector<int> v;

    v.push_back(10);

    std::map<int,int> m;

    std::unordered_map<int,int> um;

    std::string s = "Hello";

    s += " World";

    std::string t("Test");
    
    t.compare("Other");

    for (int i = 0; i < 10; i++) {
        for (int j = 0; j < 5; j++) {
            std::cout << i << j << std::endl;
        }
    }

    /* 
    for(int i = 0; i < 10; i++) {
        std::cout << i;
    } 
    */

    return 0;
}

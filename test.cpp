#include <iostream>
#include <vector>
#include <list>
#include <map>
#include <string>
#include <memory>
#include <unordered_map>


int main() {
    // MEMORY MANAGEMENT
    int* p = new int(5); // Deve ser detectado

    std::unique_ptr<int> q = std::make_unique<int>(10); // Não deve ser detectado

    delete p; // Deve ser detectado

    int* r = (int*)malloc(sizeof(int)); // Deve ser detectado

    free(r); // Deve ser detectado

    // STL USAGE
    std::list<int> l; // Deve ser detectado

    std::vector<int> v;

    v.push_back(10); // Deve ser detectado (se não tiver reserve)

    std::map<int,int> m; // Deve ser detectado

    std::unordered_map<int,int> um; // Não deve ser detectado

    // STRING OPERATIONS
    std::string s = "Hello";

    s += " World"; // Deve ser detectado

    std::string t("Test"); // Pode ser detectado
    
    t.compare("Other"); // Deve ser detectado

    // LOOP NESTING
    for (int i = 0; i < 10; i++) { // Deve ser detectado
        for (int j = 0; j < 5; j++) { // Deve ser detectado como loop duplo
            std::cout << i << j << std::endl;
        }
    }

    /* 
    for(int i = 0; i < 10; i++) { // Não deve ser detectado (comentado)
        std::cout << i;
    } 
    */

    return 0;
}

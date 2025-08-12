#include <iostream>
#include <vector>
#include <string>

int main() {
    // Problema 1: Memory management (Score 8)
    int* ptr = new int[100];
    delete[] ptr;
    
    // Problema 2: Loop aninhado (Score 6) 
    for(int i = 0; i < 100; i++) {
        for(int j = 0; j < 100; j++) {
            std::cout << i * j << std::endl;
        }
    }
    
    // Problema 3: String concatenation em loop (Score 7)
    std::string result = "";
    for(int i = 0; i < 1000; i++) {
        result += "texto";
    }
    
    return 0;
}
#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <memory>

// Função exemplo que substitui loops profundos por pré-computação
std::vector<int> calculaProdutos(const std::vector<int>& a, const std::vector<int>& b) {
    std::vector<int> resultados;
    resultados.reserve(a.size() * b.size()); // evita realocação
    for(int x : a) {
        for(int y : b) {
            resultados.push_back(x * y);
        }
    }
    return resultados;
}

int main() {
    // Memory management otimizado
    auto ptr = std::make_unique<int[]>(100);

    // Exemplo de loop duplo O(n²) otimizado
    std::vector<int> vetA(100), vetB(100);
    for(int i = 0; i < 100; i++) {
        vetA[i] = i;
        vetB[i] = i * 2;
    }
    auto produtos = calculaProdutos(vetA, vetB);

    // String concatenation otimizada
    std::string result;
    result.reserve(1000 * 5);
    for(int i = 0; i < 1000; i++) {
        result += "texto";
    }

    // Exemplo de redução de loop triplo/quádruplo
    // Suponha que você precise contar combinações de 3 ou 4 elementos:
    std::vector<int> valores = {1,2,3,4,5};
    std::unordered_map<int,int> frequencia;
    for(int v : valores) {
        frequencia[v]++; // substitui loop triplo para contar combinações
    }

    // Agora é possível calcular combinações usando a frequência, sem loops aninhados profundos
    // Ex: soma todas as combinações possíveis multiplicando frequências
    int soma = 0;
    for(auto& [val, freq] : frequencia) {
        soma += val * freq;
    }

    std::cout << "Total soma: " << soma << std::endl;

    return 0;
}

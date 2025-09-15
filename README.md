# Ambar - C++ Energy Analyzer 🔋⚡

Extensão do VS Code que analisa código C++ em tempo real, avaliando sua **eficiência energética**.  
O analisador identifica padrões de código que podem gerar consumo excessivo de recursos, classifica cada ocorrência por nível de severidade (baixo, médio, alto) e sugere **otimizações sustentáveis** sem comprometer a funcionalidade.

---

## ✨ Funcionalidades
- Detecta uso de **ponteiros crus (`new`/`delete`/`malloc`)**.
- Avalia **aninhamento de loops** e sugere otimizações de complexidade.
- Analisa containers da **STL** (`std::list`, `std::map`, `push_back` sem reserve).
- Identifica más práticas em **operações de string** (`+=`, parâmetros por valor, `compare`).
- Destaca problemas diretamente no editor com **decorações coloridas**.
- Exibe diagnósticos no painel de **Problems** do VS Code.
- Oferece comandos para **análise manual** e **ativação/desativação da análise em tempo real**.

---

## 📦 Instalação em ambiente de desenvolvimento

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 16 ou superior).
- [Visual Studio Code](https://code.visualstudio.com/) (>= 1.74).
- TypeScript instalado no projeto.

### Passos
1. Clone o repositório:

```bash
   git clone https://github.com/Ambar-Project/Ambar-extension.git
```

2. Instale as dependências:

```bash
   npm install
```

3. Compile o código TypeScript:
   
```bash
   npm run compile
```

4. Abra o projeto no VS Code:

```bash
   code .
```

5. Pressione `F5` para iniciar uma nova janela do VS Code (*Extension Development Host*).
   Essa janela já carrega a extensão.
---
## ▶️ Como usar

1. Abra um arquivo C++ (`.cpp`, `.cc`, `.cxx` ou `.c`).

2. A análise será feita em tempo real (se estiver ativada).

3. Use a paleta de comandos (`Ctrl+Shift+P`) para:

   * **Analisar Consumo Energético** → executa análise manual do arquivo aberto.
   * **Ativar/Desativar Análise em Tempo Real** → liga/desliga monitoramento automático.

4. Verifique os resultados:

   * Destaques no editor (vermelho, laranja, amarelo).
   * Diagnósticos no painel *Problems* do VS Code.

---

## 🧪 Exemplo de análise

```cpp
int* p = new int(5);    // ⚠ Uso de raw pointer (new)
delete p;               // ⚠ Delete manual

std::list<int> lista;   // ⚠ std::list pode ser ineficiente
std::map<int,int> mapa; // ⚠ Considere unordered_map

std::string s = "oi";
s += " mundo";          // ⚠ Concatenação com +=

for (int i = 0; i < 10; i++) {
    for (int j = 0; j < 10; j++) {
        for (int k = 0; k < 10; k++) {
            // ⚠ Loop altamente aninhado
        }
    }
}
```

---

## ⚙️ Configurações

No `settings.json` do VS Code, você pode ajustar:

```json
{
  "ambar.enableRealTimeAnalysis": true,
  "ambar.highlightSeverity": "medium"
}
```

* `ambar.enableRealTimeAnalysis` → habilita/desabilita análise em tempo real.
* `ambar.highlightSeverity` → define severidade mínima para destacar (`low`, `medium`, `high`).

---

## 📌 Próximos Passos

* Suporte a análise semântica via [tree-sitter](https://tree-sitter.github.io/tree-sitter/).
* Mais regras de eficiência energética e otimização.
* Integração com relatórios de sustentabilidade de software.

---

## 📄 Licença

Distribuído sob a licença ISC.
Feito com ❤️ pelo **Ambar Project**.

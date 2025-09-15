"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
// Classe principal do analisador
class CppEnergyAnalyzer {
    decorationTypes = new Map();
    diagnosticsCollection;
    constructor() {
        this.diagnosticsCollection = vscode.languages.createDiagnosticCollection('ambar-cpp-energy');
        this.initializeDecorationTypes();
    }
    initializeDecorationTypes() {
        // Decorações para diferentes níveis de severidade
        this.decorationTypes.set('high', vscode.window.createTextEditorDecorationType({
            backgroundColor: new vscode.ThemeColor('errorBackground'),
            border: '1px solid red',
            borderRadius: '3px'
        }));
        this.decorationTypes.set('medium', vscode.window.createTextEditorDecorationType({
            backgroundColor: new vscode.ThemeColor('warningBackground'),
            border: '1px solid orange',
            borderRadius: '3px'
        }));
        this.decorationTypes.set('low', vscode.window.createTextEditorDecorationType({
            backgroundColor: new vscode.ThemeColor('infoBackground'),
            border: '1px solid yellow',
            borderRadius: '3px'
        }));
    }
    stripComments(line, inBlockComment) {
        let code = line;
        // Detectar início de comentário de bloco
        if (inBlockComment.value) {
            const endIndex = code.indexOf('*/');
            if (endIndex >= 0) {
                code = code.slice(endIndex + 2);
                inBlockComment.value = false;
            }
            else {
                return ''; // Linha inteira é comentário
            }
        }
        // Remover comentários de bloco dentro da linha
        let blockStart = code.indexOf('/*');
        while (blockStart >= 0) {
            const blockEnd = code.indexOf('*/', blockStart + 2);
            if (blockEnd >= 0) {
                code = code.slice(0, blockStart) + code.slice(blockEnd + 2);
                blockStart = code.indexOf('/*');
            }
            else {
                code = code.slice(0, blockStart);
                inBlockComment.value = true;
                break;
            }
        }
        // Remover comentários de linha
        const lineCommentIndex = code.indexOf('//');
        if (lineCommentIndex >= 0) {
            code = code.slice(0, lineCommentIndex);
        }
        return code;
    }
    // Principal função de análise que percorre o documento e aplica os diagnósticos
    analyzeDocument(document) {
        const issues = [];
        const text = document.getText();
        const lines = text.split('\n');
        // Cria o objeto que acompanha se estamos dentro de um comentário de bloco
        const inBlockComment = { value: false };
        for (let i = 0; i < lines.length; i++) {
            const originalLine = lines[i];
            // Remove comentários da linha (linha limpa)
            const line = this.stripComments(originalLine, inBlockComment);
            // Ignora linhas vazias ou totalmente comentadas
            if (line.trim().length === 0)
                continue;
            // 1. Memory Management Analysis
            issues.push(...this.analyzeMemoryManagement(line, i));
            // 2. STL Container Efficiency
            issues.push(...this.analyzeSTLUsage(line, i));
            // 3. String Operations
            issues.push(...this.analyzeStringOperations(line, i));
        }
        // Preparar linhas limpas para análise de aninhamento de loops
        inBlockComment.value = false; // Resetar estado de comentário de bloco
        const cleanLines = lines.map(line => this.stripComments(line, inBlockComment));
        // 4. Loop Nesting Analysis (análise completa do documento)
        issues.push(...this.analyzeLoopNesting(cleanLines));
        return issues;
    }
    // 1. MEMORY MANAGEMENT ANALYSIS
    analyzeMemoryManagement(line, lineNumber) {
        const issues = [];
        // Detectar new/delete sem smart pointers
        const newMatch = line.match(/\bnew\s+\w+/g);
        if (newMatch) {
            const column = line.indexOf('new');
            issues.push({
                line: lineNumber,
                column: column,
                length: newMatch[0].length,
                severity: 'high',
                message: 'Uso de raw pointer com "new"',
                category: 'Memory Management',
                suggestion: 'Use smart pointers (std::unique_ptr, std::shared_ptr)',
                score: 8
            });
        }
        // Detectar delete
        const deleteMatch = line.match(/\bdelete\s+\w+/g);
        if (deleteMatch) {
            const column = line.indexOf('delete');
            issues.push({
                line: lineNumber,
                column: column,
                length: deleteMatch[0].length,
                severity: 'high',
                message: 'Uso de delete manual',
                category: 'Memory Management',
                suggestion: 'Use RAII e smart pointers para gerenciamento automático',
                score: 8
            });
        }
        // Detectar malloc/free
        const mallocMatch = line.match(/\bmalloc\s*\(/g);
        if (mallocMatch) {
            const column = line.indexOf('malloc');
            issues.push({
                line: lineNumber,
                column: column,
                length: 6,
                severity: 'high',
                message: 'Uso de malloc (C-style)',
                category: 'Memory Management',
                suggestion: 'Use std::vector ou smart pointers em C++',
                score: 9
            });
        }
        return issues;
    }
    // 2. LOOP NESTING ANALYSIS
    analyzeLoopNesting(lines) {
        const issues = [];
        const loopStack = [];
        // Objeto que mantém o estado de comentários de bloco
        const inBlockComment = { value: false };
        for (let i = 0; i < lines.length; i++) {
            const originalLine = lines[i];
            // Remove comentários de linha e bloco
            const line = this.stripComments(originalLine, inBlockComment);
            // Ignora linhas vazias
            if (line.trim().length === 0)
                continue;
            // Detectar início de loops
            const loopPattern = /\b(for|while)\s*\(/g;
            let loopMatch;
            while ((loopMatch = loopPattern.exec(line)) !== null) {
                const column = loopMatch.index;
                const loopType = loopMatch[1];
                // Adicionar loop à pilha
                loopStack.push({ line: i, column: column, type: loopType });
                // Verificar nível de aninhamento atual
                const nestingLevel = loopStack.length;
                if (nestingLevel >= 3) {
                    issues.push({
                        line: i,
                        column: column,
                        length: loopMatch[0].length,
                        severity: 'high',
                        message: `Loop altamente aninhado (nível ${nestingLevel}) - Complexidade O(n^${nestingLevel})`,
                        category: 'Algorithmic Complexity',
                        suggestion: 'Considere refatorar o algoritmo ou usar estruturas de dados mais eficientes',
                        score: Math.min(10, 7 + nestingLevel)
                    });
                }
                else if (nestingLevel === 2) {
                    issues.push({
                        line: i,
                        column: column,
                        length: loopMatch[0].length,
                        severity: 'medium',
                        message: 'Loop duplo - Complexidade O(n²)',
                        category: 'Algorithmic Complexity',
                        suggestion: 'Verifique se pode ser otimizado com algoritmos mais eficientes',
                        score: 6
                    });
                }
            }
            // Detectar fechamento de blocos para remover loops da pilha
            const openBraces = (line.match(/\{/g) || []).length;
            const closeBraces = (line.match(/\}/g) || []).length;
            for (let j = 0; j < closeBraces && loopStack.length > 0; j++) {
                loopStack.pop();
            }
        }
        return issues;
    }
    // 3. STL CONTAINER ANALYSIS
    analyzeSTLUsage(line, lineNumber) {
        const issues = [];
        // Detectar std::list em operações que deveriam usar vector
        const listMatch = line.match(/std::list<.*>/g);
        if (listMatch) {
            const column = line.indexOf('std::list');
            issues.push({
                line: lineNumber,
                column: column,
                length: listMatch[0].length,
                severity: 'medium',
                message: 'std::list pode ser ineficiente para acesso sequencial',
                category: 'STL Efficiency',
                suggestion: 'Use std::vector se não precisar de inserção/remoção no meio',
                score: 5
            });
        }
        // Detectar uso de map quando unordered_map seria melhor
        const mapMatch = line.match(/std::map<.*>/g);
        if (mapMatch && !line.includes('unordered_map')) {
            const column = line.indexOf('std::map');
            issues.push({
                line: lineNumber,
                column: column,
                length: mapMatch[0].length,
                severity: 'low',
                message: 'std::map tem complexidade O(log n)',
                category: 'STL Efficiency',
                suggestion: 'Considere std::unordered_map (O(1)) se não precisar de ordenação',
                score: 4
            });
        }
        // Detectar push_back sem reserve
        const pushBackMatch = line.match(/\.push_back\s*\(/g);
        if (pushBackMatch) {
            const column = line.indexOf('.push_back');
            issues.push({
                line: lineNumber,
                column: column,
                length: 10,
                severity: 'low',
                message: 'push_back pode causar realocações',
                category: 'STL Efficiency',
                suggestion: 'Use reserve() se souber o tamanho aproximado',
                score: 3
            });
        }
        return issues;
    }
    // 4. STRING OPERATIONS ANALYSIS - VERSÃO MELHORADA
    analyzeStringOperations(line, lineNumber) {
        const issues = [];
        // Detectar concatenação de strings com += (possível problema se em loop)
        const stringConcatMatch = line.match(/\w+\s*\+=\s*["'].*["']/g);
        if (stringConcatMatch) {
            const column = line.indexOf('+=');
            issues.push({
                line: lineNumber,
                column: column,
                length: 2,
                severity: 'low',
                message: 'Concatenação de string com +=',
                category: 'String Operations',
                suggestion: 'Se em loop, considere std::stringstream ou reserve()',
                score: 4
            });
        }
        // Detectar uso de std::string quando string_view seria suficiente
        const stringParamMatch = line.match(/\bstd::string\s+\w+\s*\)/g);
        if (stringParamMatch) {
            const column = line.indexOf('std::string');
            issues.push({
                line: lineNumber,
                column: column,
                length: 11,
                severity: 'low',
                message: 'Parâmetro std::string por valor',
                category: 'String Operations',
                suggestion: 'Use const std::string& ou std::string_view para parâmetros',
                score: 3
            });
        }
        // Detectar comparação de strings desnecessárias
        const stringCompareMatch = line.match(/\w+\.compare\s*\(/g);
        if (stringCompareMatch) {
            const column = line.indexOf('.compare');
            issues.push({
                line: lineNumber,
                column: column,
                length: 8,
                severity: 'low',
                message: 'Use operadores == != em vez de compare()',
                category: 'String Operations',
                suggestion: 'Operadores são mais eficientes e legíveis',
                score: 2
            });
        }
        return issues;
    }
    updateDecorations(editor, issues) {
        const decorationMap = new Map();
        decorationMap.set('high', []);
        decorationMap.set('medium', []);
        decorationMap.set('low', []);
        issues.forEach(issue => {
            const range = new vscode.Range(issue.line, issue.column, issue.line, issue.column + issue.length);
            decorationMap.get(issue.severity)?.push(range);
        });
        // Aplicar decorações
        decorationMap.forEach((ranges, severity) => {
            const decorationType = this.decorationTypes.get(severity);
            if (decorationType) {
                editor.setDecorations(decorationType, ranges);
            }
        });
    }
    updateDiagnostics(document, issues) {
        const diagnostics = issues.map(issue => {
            const range = new vscode.Range(issue.line, issue.column, issue.line, issue.column + issue.length);
            const severity = issue.severity === 'high' ? vscode.DiagnosticSeverity.Error :
                issue.severity === 'medium' ? vscode.DiagnosticSeverity.Warning :
                    vscode.DiagnosticSeverity.Information;
            const diagnostic = new vscode.Diagnostic(range, `[${issue.category}] ${issue.message} (Score: ${issue.score}/10)\n💡 ${issue.suggestion}`, severity);
            diagnostic.source = 'Ambar - C++ Energy Analyzer';
            return diagnostic;
        });
        this.diagnosticsCollection.set(document.uri, diagnostics);
    }
    dispose() {
        this.diagnosticsCollection.dispose();
        this.decorationTypes.forEach(decoration => decoration.dispose());
    }
}
let analyzer;
let isRealTimeEnabled = true;
let analyzeTimeout;
function activate(context) {
    analyzer = new CppEnergyAnalyzer();
    // Comando para analisar arquivo atual
    const analyzeCommand = vscode.commands.registerCommand('ambar-extension.analyzeFile', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor && (editor.document.languageId === 'cpp' || editor.document.languageId === 'c')) {
            analyzeCurrentDocument(editor);
            vscode.window.showInformationMessage('Análise de consumo energético concluída!');
        }
        else {
            vscode.window.showWarningMessage('Abra um arquivo C++ para análise.');
        }
    });
    // Comando para toggle da análise em tempo real
    const toggleCommand = vscode.commands.registerCommand('ambar-extension.toggleAnalysis', () => {
        isRealTimeEnabled = !isRealTimeEnabled;
        const status = isRealTimeEnabled ? 'ativada' : 'desativada';
        vscode.window.showInformationMessage(`Análise em tempo real ${status}`);
        const editor = vscode.window.activeTextEditor;
        if (!isRealTimeEnabled) {
            // Cancelar timeout pendente
            if (analyzeTimeout)
                clearTimeout(analyzeTimeout);
            // Limpar decorações e diagnósticos
            if (editor) {
                analyzer.updateDecorations(editor, []);
                analyzer.updateDiagnostics(editor.document, []);
            }
        }
        else {
            // Se reativou, analisar o documento atual imediatamente
            if (editor && (editor.document.languageId === 'cpp' || editor.document.languageId === 'c')) {
                analyzeCurrentDocument(editor);
            }
        }
    });
    // Análise em tempo real
    const onDidChangeTextDocument = vscode.workspace.onDidChangeTextDocument(event => {
        if (!isRealTimeEnabled)
            return;
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.document === event.document &&
            (event.document.languageId === 'cpp' || event.document.languageId === 'c')) {
            // Debounce: cancela timeout anterior
            if (analyzeTimeout)
                clearTimeout(analyzeTimeout);
            analyzeTimeout = setTimeout(() => {
                analyzeCurrentDocument(editor);
            }, 500);
        }
    });
    // Análise quando arquivo é aberto
    const onDidOpenTextDocument = vscode.workspace.onDidOpenTextDocument(document => {
        if (!isRealTimeEnabled)
            return;
        if (document.languageId === 'cpp' || document.languageId === 'c') {
            const editor = vscode.window.activeTextEditor;
            if (editor && editor.document === document) {
                analyzeCurrentDocument(editor);
            }
        }
    });
    context.subscriptions.push(analyzeCommand, toggleCommand, onDidChangeTextDocument, onDidOpenTextDocument, analyzer);
    vscode.window.showInformationMessage('Ambar - C++ Energy Analyzer ativado! 🔋⚡');
}
function analyzeCurrentDocument(editor) {
    const issues = analyzer.analyzeDocument(editor.document);
    analyzer.updateDecorations(editor, issues);
    analyzer.updateDiagnostics(editor.document, issues);
}
function deactivate() {
    if (analyzer) {
        analyzer.dispose();
    }
}
//# sourceMappingURL=extension.js.map
document.addEventListener('DOMContentLoaded', function() {
    const examplesContainer = document.getElementById('examples-accordion');
    
    // Simulação da leitura de diretórios. Adicione o nome de novas pastas de exemplo aqui.
    const exampleFolders = ['exemplo-01']; 

    // Função para buscar o conteúdo de um arquivo
    async function fetchFileContent(path) {
        try {
            const response = await fetch(path);
            if (!response.ok) return ''; // Retorna string vazia se o arquivo não for encontrado
            return await response.text();
        } catch (error) {
            console.error('Erro ao buscar arquivo:', error);
            return '';
        }
    }

    // Função para criar e inicializar um bloco de exemplo
    async function createExampleBlock(folderName, index) {
        const exampleId = `example-${index}`;
        
        // Busca os conteúdos dos arquivos em paralelo
        const [htmlContent, cssContent, jsContent] = await Promise.all([
            fetchFileContent(`../examples/${folderName}/index.html`),
            fetchFileContent(`../examples/${folderName}/style.css`),
            fetchFileContent(`../examples/${folderName}/script.js`)
        ]);

        // Cria o HTML para o item do acordeão
        const accordionItem = document.createElement('div');
        accordionItem.className = 'accordion-item';
        accordionItem.innerHTML = `
            <h2 class="accordion-header" id="heading-${exampleId}">
                <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${exampleId}" aria-expanded="${index === 0 ? 'true' : 'false'}" aria-controls="collapse-${exampleId}">
                    ${folderName}
                </button>
            </h2>
            <div id="collapse-${exampleId}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" aria-labelledby="heading-${exampleId}" data-bs-parent="#examples-accordion">
                <div class="accordion-body">
                    <div class="example-wrapper">
                        <div class="row g-4">
                            <!-- Coluna do Editor -->
                            <div class="col-md-6 d-flex flex-column">
                                <ul class="nav nav-tabs editor-tabs">
                                    <li class="nav-item"><button class="nav-link active" data-bs-toggle="tab" data-bs-target="#html-pane-${exampleId}">index.html</button></li>
                                    <li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#css-pane-${exampleId}">style.css</button></li>
                                    <li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#js-pane-${exampleId}">script.js</button></li>
                                </ul>
                                <div class="tab-content">
                                    <div class="tab-pane fade show active" id="html-pane-${exampleId}"><textarea id="html-code-${exampleId}"></textarea></div>
                                    <div class="tab-pane fade" id="css-pane-${exampleId}"><textarea id="css-code-${exampleId}"></textarea></div>
                                    <div class="tab-pane fade" id="js-pane-${exampleId}"><textarea id="js-code-${exampleId}"></textarea></div>
                                </div>
                            </div>
                            <!-- Coluna da Visualização -->
                            <div class="col-md-6 d-flex flex-column">
                                <iframe id="output-frame-${exampleId}" class="w-100 h-100" title="Resultado do Código"></iframe>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        examplesContainer.appendChild(accordionItem);

        // Inicializa os editores CodeMirror para este bloco
        const editorOptions = { lineNumbers: true, theme: 'dracula', readOnly: true };
        const htmlEditor = CodeMirror.fromTextArea(document.getElementById(`html-code-${exampleId}`), { ...editorOptions, mode: 'xml', htmlMode: true });
        const cssEditor = CodeMirror.fromTextArea(document.getElementById(`css-code-${exampleId}`), { ...editorOptions, mode: 'css' });
        const jsEditor = CodeMirror.fromTextArea(document.getElementById(`js-code-${exampleId}`), { ...editorOptions, mode: 'javascript' });

        // Preenche os editores com o conteúdo
        htmlEditor.setValue(htmlContent);
        cssEditor.setValue(cssContent);
        jsEditor.setValue(jsContent);

        // Renderiza o output inicial
        const outputFrame = document.getElementById(`output-frame-${exampleId}`);
        const source = `
            <html><head><style>${cssContent}</style></head>
            <body>${htmlContent}<script>${jsContent}<\/script></body></html>
        `;
        const doc = outputFrame.contentWindow.document;
        doc.open();
        doc.write(source);
        doc.close();
    }

    // Carrega todos os exemplos
    exampleFolders.forEach(createExampleBlock);
});

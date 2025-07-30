document.addEventListener('DOMContentLoaded', async function() {
    const examplesContainer = document.getElementById('examples-accordion');

    // Função para buscar a lista de exemplos do ficheiro JSON
    async function getExampleFolders() {
        try {
            const response = await fetch('../examples/examples.json');
            if (!response.ok) {
                console.error('Ficheiro examples.json não encontrado.');
                return [];
            }
            const data = await response.json();
            return data.folders || [];
        } catch (error) {
            console.error('Erro ao ler o ficheiro examples.json:', error);
            return [];
        }
    }

    // Função para buscar o conteúdo de um arquivo
    async function fetchFileContent(path) {
        try {
            const response = await fetch(path);
            if (!response.ok) {
                console.warn(`Arquivo não encontrado: ${path}`);
                return ''; // Retorna string vazia se o arquivo não for encontrado
            }
            return await response.text();
        } catch (error) {
            console.error(`Erro ao buscar o arquivo ${path}:`, error);
            return '';
        }
    }

    // Função para criar e inicializar um bloco de exemplo
    async function createExampleBlock(folderName, index) {
        const exampleId = `example-${index}`;
        
        const [htmlContent, cssContent, jsContent] = await Promise.all([
            fetchFileContent(`../examples/${folderName}/index.html`),
            fetchFileContent(`../examples/${folderName}/style.css`),
            fetchFileContent(`../examples/${folderName}/script.js`)
        ]);

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
                                <div class="editor-header">
                                    <ul class="nav nav-tabs editor-tabs">
                                        <li class="nav-item"><button class="nav-link active" data-bs-toggle="tab" data-bs-target="#html-pane-${exampleId}">index.html</button></li>
                                        <li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#css-pane-${exampleId}">style.css</button></li>
                                        <li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#js-pane-${exampleId}">script.js</button></li>
                                    </ul>
                                    <button class="btn btn-outline-primary btn-sm download-btn" title="Exportar código da guia atual"><i class="bi bi-download"></i></button>
                                </div>
                                <div class="tab-content">
                                    <div class="tab-pane fade show active" id="html-pane-${exampleId}"><textarea id="html-code-${exampleId}"></textarea></div>
                                    <div class="tab-pane fade" id="css-pane-${exampleId}"><textarea id="css-code-${exampleId}"></textarea></div>
                                    <div class="tab-pane fade" id="js-pane-${exampleId}"><textarea id="js-code-${exampleId}"></textarea></div>
                                </div>
                            </div>
                            <!-- Coluna da Visualização -->
                            <div class="col-md-6 d-flex flex-column">
                                <div class="output-header">
                                    <div class="output-controls d-flex align-items-center">
                                        <span class="me-2">Zoom:</span>
                                        <button class="btn btn-outline-secondary btn-sm zoom-out-btn"><i class="bi bi-zoom-out"></i></button>
                                        <button class="btn btn-outline-secondary btn-sm ms-1 zoom-in-btn"><i class="bi bi-zoom-in"></i></button>
                                    </div>
                                </div>
                                <div class="output-frame-wrapper">
                                    <iframe id="output-frame-${exampleId}" title="Resultado do Código"></iframe>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        examplesContainer.appendChild(accordionItem);

        const editorOptions = { lineNumbers: true, theme: 'dracula', readOnly: true, lineWrapping: false };
        const htmlEditor = CodeMirror.fromTextArea(document.getElementById(`html-code-${exampleId}`), { ...editorOptions, mode: 'xml', htmlMode: true });
        const cssEditor = CodeMirror.fromTextArea(document.getElementById(`css-code-${exampleId}`), { ...editorOptions, mode: 'css' });
        const jsEditor = CodeMirror.fromTextArea(document.getElementById(`js-code-${exampleId}`), { ...editorOptions, mode: 'javascript' });

        htmlEditor.setValue(htmlContent);
        cssEditor.setValue(cssContent);
        jsEditor.setValue(jsContent);

        const outputFrame = document.getElementById(`output-frame-${exampleId}`);
        // CORREÇÃO: Quebra a tag </script> para evitar erro de parsing do navegador
        const source = `
            <html>
                <head><style>${cssContent}</style></head>
                <body>${htmlContent}<script>${jsContent}</` + `script></body>
            </html>
        `;
        const doc = outputFrame.contentWindow.document;
        doc.open();
        doc.write(source);
        doc.close();

        // Lógica dos botões de zoom
        const zoomInBtn = accordionItem.querySelector('.zoom-in-btn');
        const zoomOutBtn = accordionItem.querySelector('.zoom-out-btn');
        let currentZoom = 1;
        zoomInBtn.addEventListener('click', () => {
            currentZoom += 0.1;
            outputFrame.style.transform = `scale(${currentZoom})`;
        });
        zoomOutBtn.addEventListener('click', () => {
            if (currentZoom > 0.2) {
                currentZoom -= 0.1;
                outputFrame.style.transform = `scale(${currentZoom})`;
            }
        });

        // Lógica do botão de download
        const downloadBtn = accordionItem.querySelector('.download-btn');
        downloadBtn.addEventListener('click', () => {
            const activeTab = accordionItem.querySelector('.editor-tabs .nav-link.active');
            let content = '';
            let filename = '';
            let mimeType = 'text/plain';

            if (activeTab.textContent === 'index.html') {
                content = htmlEditor.getValue();
                filename = 'index.html';
                mimeType = 'text/html';
            } else if (activeTab.textContent === 'style.css') {
                content = cssEditor.getValue();
                filename = 'style.css';
                mimeType = 'text/css';
            } else if (activeTab.textContent === 'script.js') {
                content = jsEditor.getValue();
                filename = 'script.js';
                mimeType = 'application/javascript';
            }

            if (content.trim() === '') return;

            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }

    async function loadAllExamples() {
        const exampleFolders = await getExampleFolders();
        if (exampleFolders.length === 0) {
            examplesContainer.innerHTML = '<p class="text-center">Nenhum exemplo encontrado.</p>';
            return;
        }
        exampleFolders.forEach(createExampleBlock);
    }

    loadAllExamples();
});

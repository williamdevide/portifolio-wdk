document.addEventListener('DOMContentLoaded', async function() {
    const examplesContainer = document.getElementById('examples-container');
    let editors = {}; // Armazena todas as instâncias do CodeMirror

    // Função para buscar a lista de exemplos do ficheiro JSON
    async function getExampleFolders() {
        try {
            const response = await fetch('../examples/examples.json');
            if (!response.ok) {
                console.error('Ficheiro examples.json não encontrado.');
                return [];
            }
            const data = await response.json();
            // Ordena as pastas em ordem alfabética
            return (data.folders || []).sort((a, b) => a.localeCompare(b));
        } catch (error) {
            console.error('Erro ao ler o ficheiro examples.json:', error);
            return [];
        }
    }

    // Função para buscar o conteúdo de um arquivo
    async function fetchFileContent(path) {
        try {
            const response = await fetch(path);
            if (!response.ok) return '';
            return await response.text();
        } catch (error) {
            console.error(`Erro ao buscar o arquivo ${path}:`, error);
            return '';
        }
    }

    // Função para criar e inicializar um bloco de exemplo (card + visualização expandida)
    async function createExampleBlock(folderName, index) {
        const exampleId = `example-${index}`;
        const [htmlContent, cssContent, jsContent] = await Promise.all([
            fetchFileContent(`../examples/${folderName}/index.html`),
            fetchFileContent(`../examples/${folderName}/style.css`),
            fetchFileContent(`../examples/${folderName}/script.js`)
        ]);

        const wrapper = document.createElement('div');
        wrapper.className = 'col-lg-4 col-md-6 mb-4 example-card-wrapper';
        wrapper.id = `wrapper-${exampleId}`;

        // Cria o card e a visualização expandida
        wrapper.innerHTML = `
            <!-- Card View -->
            <div class="card h-100 shadow-sm example-card">
                <div class="card-img-wrapper">
                    <iframe scrolling="no" title="Preview for ${folderName}"></iframe>
                </div>
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${folderName}</h5>
                    <button class="btn btn-primary mt-auto expand-btn">Expandir</button>
                </div>
            </div>

            <!-- Expanded View (Hidden by default) -->
            <div class="example-expanded-view">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h3>${folderName}</h3>
                    <button class="btn btn-secondary collapse-btn">Recolher</button>
                </div>
                <div class="row g-4">
                    <div class="col-md-6 d-flex flex-column">
                        <div class="editor-header">
                             <ul class="nav nav-tabs editor-tabs">
                                <li class="nav-item"><button class="nav-link active" data-bs-toggle="tab" data-bs-target="#html-pane-${exampleId}">index.html</button></li>
                                <li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#css-pane-${exampleId}">style.css</button></li>
                                <li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#js-pane-${exampleId}">script.js</button></li>
                            </ul>
                        </div>
                        <div class="tab-content">
                            <div class="tab-pane fade show active" id="html-pane-${exampleId}"><textarea id="html-code-${exampleId}"></textarea></div>
                            <div class="tab-pane fade" id="css-pane-${exampleId}"><textarea id="css-code-${exampleId}"></textarea></div>
                            <div class="tab-pane fade" id="js-pane-${exampleId}"><textarea id="js-code-${exampleId}"></textarea></div>
                        </div>
                    </div>
                    <div class="col-md-6 d-flex flex-column">
                         <div class="output-header"></div>
                         <div class="output-frame-wrapper">
                            <iframe class="output-frame-full" title="Resultado do Código"></iframe>
                        </div>
                    </div>
                </div>
            </div>
        `;
        examplesContainer.appendChild(wrapper);
        
        // Preenche o iframe de preview no card
        const previewFrame = wrapper.querySelector('.card-img-wrapper iframe');
        const previewDoc = previewFrame.contentWindow.document;
        previewDoc.open();
        previewDoc.write(`<html><head><style>${cssContent}</style></head><body>${htmlContent}</body></html>`);
        previewDoc.close();

        // Inicializa os editores na visualização expandida
        const editorOptions = { lineNumbers: true, theme: 'dracula', readOnly: true, lineWrapping: false };
        editors[exampleId] = {
            html: CodeMirror.fromTextArea(wrapper.querySelector(`#html-code-${exampleId}`), { ...editorOptions, mode: 'xml', htmlMode: true }),
            css: CodeMirror.fromTextArea(wrapper.querySelector(`#css-code-${exampleId}`), { ...editorOptions, mode: 'css' }),
            js: CodeMirror.fromTextArea(wrapper.querySelector(`#js-code-${exampleId}`), { ...editorOptions, mode: 'javascript' })
        };
        editors[exampleId].html.setValue(htmlContent);
        editors[exampleId].css.setValue(cssContent);
        editors[exampleId].js.setValue(jsContent);

        // Lógica para expandir
        wrapper.querySelector('.expand-btn').addEventListener('click', () => {
            // Recolhe qualquer outro item que esteja expandido
            document.querySelectorAll('.example-card-wrapper.is-expanded').forEach(el => {
                el.classList.remove('is-expanded');
                el.classList.add('col-lg-4', 'col-md-6');
            });
            
            wrapper.classList.add('is-expanded');
            wrapper.classList.remove('col-lg-4', 'col-md-6');
            
            // Preenche o iframe da visualização expandida e refresca os editores
            const fullOutputFrame = wrapper.querySelector('.output-frame-full');
            const fullDoc = fullOutputFrame.contentWindow.document;
            fullDoc.open();
            fullDoc.write(`<html><head><style>${cssContent}</style></head><body>${htmlContent}<script>${jsContent}<\/` + `script></body></html>`);
            fullDoc.close();
            
            setTimeout(() => {
                Object.values(editors[exampleId]).forEach(editor => editor.refresh());
            }, 200); // Atraso para garantir que a transição CSS terminou
        });

        // Lógica para recolher
        wrapper.querySelector('.collapse-btn').addEventListener('click', () => {
            wrapper.classList.remove('is-expanded');
            wrapper.classList.add('col-lg-4', 'col-md-6');
        });
    }

    // Função principal para carregar tudo
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

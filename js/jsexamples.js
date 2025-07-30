document.addEventListener('DOMContentLoaded', async function() {
    const examplesContainer = document.getElementById('examples-container');
    const filterContainer = document.getElementById('filter-container');
    const searchInput = document.getElementById('search-input');
    let editors = {};
    let allExamplesData = [];
    let activeKeyword = 'Todos';
    let searchTerm = '';

    // Função para buscar os dados dos exemplos do ficheiro JSON
    async function getExamplesData() {
        try {
            const response = await fetch('../examples/examples.json');
            if (!response.ok) {
                console.error('Ficheiro examples.json não encontrado.');
                return [];
            }
            const data = await response.json();
            return (data.examples || []).sort((a, b) => a.name.localeCompare(b.name));
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
    
    // Função para aplicar os filtros e a pesquisa
    function applyFilters() {
        let filteredExamples = allExamplesData;

        // 1. Filtra por palavra-chave ativa
        if (activeKeyword !== 'Todos') {
            filteredExamples = filteredExamples.filter(ex => ex.keywords.includes(activeKeyword));
        }

        // 2. Filtra pelo termo de pesquisa
        if (searchTerm) {
            filteredExamples = filteredExamples.filter(ex => {
                const searchLower = searchTerm.toLowerCase();
                const nameMatch = ex.name.toLowerCase().includes(searchLower);
                const keywordMatch = ex.keywords.some(kw => kw.toLowerCase().includes(searchLower));
                return nameMatch || keywordMatch;
            });
        }
        
        renderCards(filteredExamples);
    }

    // Função para renderizar os cards na tela
    function renderCards(examplesToRender) {
        examplesContainer.innerHTML = '';
        if (examplesToRender.length === 0) {
            examplesContainer.innerHTML = '<p class="text-center text-muted">Nenhum exemplo corresponde aos seus critérios de pesquisa.</p>';
            return;
        }
        examplesToRender.forEach((exampleData, index) => {
            createExampleBlock(exampleData, index);
        });
    }

    // Função para criar os botões de filtro
    function createFilterButtons() {
        const allKeywords = new Set();
        allExamplesData.forEach(example => {
            example.keywords.forEach(keyword => allKeywords.add(keyword));
        });

        filterContainer.innerHTML = '';
        
        const allButton = document.createElement('button');
        allButton.className = 'btn btn-primary';
        allButton.textContent = 'Todos';
        allButton.addEventListener('click', () => {
            document.querySelectorAll('#filter-container .btn').forEach(btn => btn.classList.remove('btn-primary'));
            allButton.classList.add('btn-primary');
            activeKeyword = 'Todos';
            applyFilters();
        });
        filterContainer.appendChild(allButton);

        Array.from(allKeywords).sort().forEach(keyword => {
            const button = document.createElement('button');
            button.className = 'btn btn-outline-primary';
            button.textContent = keyword;
            button.addEventListener('click', () => {
                document.querySelectorAll('#filter-container .btn').forEach(btn => btn.classList.remove('btn-primary'));
                button.classList.add('btn-primary');
                activeKeyword = keyword;
                applyFilters();
            });
            filterContainer.appendChild(button);
        });
    }

    // Adiciona o "ouvinte" para a caixa de pesquisa
    searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value.trim();
        applyFilters();
    });

    // Função para criar e inicializar um bloco de exemplo
    async function createExampleBlock(exampleData, index) {
        const { folder, name, keywords } = exampleData;
        const exampleId = `example-${folder}-${index}`;
        const [htmlContent, cssContent, jsContent] = await Promise.all([
            fetchFileContent(`../examples/${folder}/index.html`),
            fetchFileContent(`../examples/${folder}/style.css`),
            fetchFileContent(`../examples/${folder}/script.js`)
        ]);

        const wrapper = document.createElement('div');
        wrapper.className = 'col-lg-4 col-md-6 mb-4 example-card-wrapper';
        wrapper.id = `wrapper-${exampleId}`;
        
        wrapper.innerHTML = `
            <div class="card h-100 shadow-sm example-card">
                <div class="card-img-wrapper"><iframe scrolling="no"></iframe></div>
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${name}</h5>
                    <div class="mt-2 mb-3"><small class="text-muted">${keywords.join(', ')}</small></div>
                    <button class="btn btn-primary mt-auto expand-btn">Expandir</button>
                </div>
            </div>
            <div class="example-expanded-view"></div>
        `;
        examplesContainer.appendChild(wrapper);

        const previewFrame = wrapper.querySelector('.card-img-wrapper iframe');
        const previewDoc = previewFrame.contentWindow.document;
        previewDoc.open();
        previewDoc.write(`<html><head><style>${cssContent}</style></head><body>${htmlContent}</body></html>`);
        previewDoc.close();

        wrapper.querySelector('.expand-btn').addEventListener('click', () => {
            expandView(wrapper, exampleId, name, htmlContent, cssContent, jsContent);
        });
    }

    // Lógica para a visualização expandida
    function expandView(wrapper, exampleId, name, htmlContent, cssContent, jsContent) {
        document.querySelectorAll('.example-card-wrapper.is-expanded').forEach(el => {
            el.classList.remove('is-expanded');
            el.querySelector('.example-expanded-view').innerHTML = '';
        });

        wrapper.classList.add('is-expanded');
        const expandedViewContainer = wrapper.querySelector('.example-expanded-view');
        
        expandedViewContainer.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h3>${name}</h3>
                <button class="btn btn-secondary collapse-btn">Recolher</button>
            </div>
            <div class="row g-4">
                <div class="col-md-6 d-flex flex-column">
                    <div class="editor-header">
                         <ul class="nav nav-tabs editor-tabs">
                            <li class="nav-item"><button class="nav-link active" data-bs-toggle="tab" data-bs-target="#html-pane-${exampleId}" data-editor="html">index.html</button></li>
                            <li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#css-pane-${exampleId}" data-editor="css">style.css</button></li>
                            <li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#js-pane-${exampleId}" data-editor="js">script.js</button></li>
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
        `;

        const editorOptions = { lineNumbers: true, theme: 'dracula', readOnly: true, lineWrapping: false };
        editors[exampleId] = {
            html: CodeMirror.fromTextArea(expandedViewContainer.querySelector(`#html-code-${exampleId}`), { ...editorOptions, mode: 'xml', htmlMode: true }),
            css: CodeMirror.fromTextArea(expandedViewContainer.querySelector(`#css-code-${exampleId}`), { ...editorOptions, mode: 'css' }),
            js: CodeMirror.fromTextArea(expandedViewContainer.querySelector(`#js-code-${exampleId}`), { ...editorOptions, mode: 'javascript' })
        };
        editors[exampleId].html.setValue(htmlContent);
        editors[exampleId].css.setValue(cssContent);
        editors[exampleId].js.setValue(jsContent);

        const fullOutputFrame = expandedViewContainer.querySelector('.output-frame-full');
        const fullDoc = fullOutputFrame.contentWindow.document;
        fullDoc.open();
        fullDoc.write(`<html><head><style>${cssContent}</style></head><body>${jsContent ? `<script>${jsContent}<\/script>` : ''}${htmlContent}</body></html>`);
        fullDoc.close();

        setTimeout(() => Object.values(editors[exampleId]).forEach(editor => editor.refresh()), 250);

        expandedViewContainer.querySelector('.collapse-btn').addEventListener('click', () => {
            wrapper.classList.remove('is-expanded');
            expandedViewContainer.innerHTML = '';
        });
    }

    // Função principal para carregar tudo
    async function loadAllExamples() {
        allExamplesData = await getExamplesData();
        if (allExamplesData.length === 0) {
            examplesContainer.innerHTML = '<p class="text-center">Nenhum exemplo encontrado.</p>';
            return;
        }
        createFilterButtons();
        renderCards(allExamplesData);
    }

    loadAllExamples();
});

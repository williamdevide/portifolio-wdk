document.addEventListener('DOMContentLoaded', function() {
    // Configuração comum para todos os editores
    const editorOptions = {
        lineNumbers: true,
        theme: 'dracula',
        tabSize: 4,
        indentWithTabs: true,
        lineWrapping: false
    };

    // Inicializa os editores CodeMirror
    const htmlEditor = CodeMirror.fromTextArea(document.getElementById('html-code'), { ...editorOptions, mode: 'xml', htmlMode: true });
    const cssEditor = CodeMirror.fromTextArea(document.getElementById('css-code'), { ...editorOptions, mode: 'css' });
    const jsEditor = CodeMirror.fromTextArea(document.getElementById('js-code'), { ...editorOptions, mode: 'javascript' });

    const outputFrame = document.getElementById('output-frame');

    function renderOutput() {
        const source = `
            <html>
                <head>
                    <style>${cssEditor.getValue()}</style>
                </head>
                <body>
                    ${htmlEditor.getValue()}
                    <script>${jsEditor.getValue()}<\/script>
                </body>
            </html>
        `;
        const doc = outputFrame.contentWindow.document;
        doc.open();
        doc.write(source);
        doc.close();
    }

    // Renderiza o output sempre que houver uma alteração em qualquer editor
    htmlEditor.on('change', renderOutput);
    cssEditor.on('change', renderOutput);
    jsEditor.on('change', renderOutput);

    // Lógica dos botões de limpar
    const clearActiveBtn = document.getElementById('clear-active-btn');
    const clearAllBtn = document.getElementById('clear-all-btn');

    clearAllBtn.addEventListener('click', function() {
        htmlEditor.setValue('');
        cssEditor.setValue('');
        jsEditor.setValue('');
    });

    clearActiveBtn.addEventListener('click', function() {
        const activeTabId = document.querySelector('.editor-tabs .nav-link.active').id;
        switch (activeTabId) {
            case 'html-tab':
                htmlEditor.setValue('');
                break;
            case 'css-tab':
                cssEditor.setValue('');
                break;
            case 'js-tab':
                jsEditor.setValue('');
                break;
        }
    });

    // Lógica dos botões de zoom
    const zoomInBtn = document.getElementById('zoom-in-btn');
    const zoomOutBtn = document.getElementById('zoom-out-btn');
    let currentZoom = 1;

    zoomInBtn.addEventListener('click', function() {
        currentZoom += 0.1;
        outputFrame.style.transform = `scale(${currentZoom})`;
    });

    zoomOutBtn.addEventListener('click', function() {
        if (currentZoom > 0.2) { // Evita zoom muito pequeno
            currentZoom -= 0.1;
            outputFrame.style.transform = `scale(${currentZoom})`;
        }
    });

    // Lógica do botão de exportar
    const exportBtn = document.getElementById('export-btn');

    exportBtn.addEventListener('click', function() {
        const activeTabId = document.querySelector('.editor-tabs .nav-link.active').id;
        let content = '';
        let filename = '';
        let mimeType = 'text/plain';

        switch (activeTabId) {
            case 'html-tab':
                content = htmlEditor.getValue();
                filename = 'index.html';
                mimeType = 'text/html';
                break;
            case 'css-tab':
                content = cssEditor.getValue();
                filename = 'style.css';
                mimeType = 'text/css';
                break;
            case 'js-tab':
                content = jsEditor.getValue();
                filename = 'script.js';
                mimeType = 'application/javascript';
                break;
        }

        if (content.trim() === '') {
            // Não exibe alerta para não ser intrusivo
            console.log('Não há conteúdo para exportar.');
            return;
        }

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

    // Renderização inicial
    renderOutput();
});

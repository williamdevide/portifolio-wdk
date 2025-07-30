function mudarCor() {
    const cores = ['#f0f8ff', '#faebd7', '#d3f8d3', '#e6e6fa'];
    const corAtual = document.body.style.backgroundColor;
    let novaCor = cores[Math.floor(Math.random() * cores.length)];
    
    // Garante que a nova cor seja diferente da atual
    while (novaCor === corAtual) {
      novaCor = cores[Math.floor(Math.random() * cores.length)];
    }
    
    document.body.style.backgroundColor = novaCor;
  }
  
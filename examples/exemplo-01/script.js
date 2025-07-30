function mudarCor() {
  const cores = ['#f0f8ff', '#faebd7', '#d3f8d3', '#e6e6fa'];
  const corAtualRGB = window.getComputedStyle(document.body).backgroundColor;

  // Converte RGB para Hex para comparação
  function rgbToHex(rgb) {
    let sep = rgb.indexOf(",") > -1 ? "," : " ";
    rgb = rgb.substr(4).split(")")[0].split(sep);
    let r = (+rgb[0]).toString(16),
        g = (+rgb[1]).toString(16),
        b = (+rgb[2]).toString(16);
    if (r.length == 1) r = "0" + r;
    if (g.length == 1) g = "0" + g;
    if (b.length == 1) b = "0" + b;
    return "#" + r + g + b;
  }

  const corAtualHex = rgbToHex(corAtualRGB);
  
  let novaCor = cores[Math.floor(Math.random() * cores.length)];
  
  // Garante que a nova cor seja diferente da atual
  while (novaCor === corAtualHex) {
    novaCor = cores[Math.floor(Math.random() * cores.length)];
  }
  
  document.body.style.backgroundColor = novaCor;
}
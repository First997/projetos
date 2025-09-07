/* ========== CONFIG / DADOS ========== */

/*
  Substitua 'SEU_USUARIO' pelo seu usuário GitHub se quiser carregar dados reais.
  Obs: GitHub tem rate limits sem token; para uso pessoal é suficiente.
*/
const GITHUB_USER = "SEU_USUARIO"; // <<-- troque aqui

// Dados iniciais de exemplo (edite conforme seus projetos)
const anos = ['2021','2022','2023','2024','2025'];
let projetosPorAno = [2,5,7,10,8];

const habilidadesSeries = {
  labels: anos,
  datasets: [
    { label: 'JavaScript', data: [40,55,70,85,95], borderColor:'#ff7a00', backgroundColor:'rgba(255,122,0,0.12)', tension:0.3 },
    { label: 'HTML/CSS',    data: [60,75,85,90,96], borderColor:'#27ae60', backgroundColor:'rgba(39,174,96,0.12)', tension:0.3 },
    { label: 'Node.js',     data: [10,30,50,70,85], borderColor:'#2980b9', backgroundColor:'rgba(41,128,185,0.12)', tension:0.3 }
  ]
};

const linguagensData = {
  labels: ['JavaScript','HTML/CSS','Python','Node.js'],
  data: [40,30,20,10]
};

const radarData = {
  labels: ['Lógica','Front-end','Back-end','Banco de Dados','DevOps'],
  data: [85,80,65,60,40]
};

/* ========== HELPERS ========== */

function getThemeColors() {
  const isDark = document.body.getAttribute('data-theme') === 'dark';
  return {
    text: isDark ? '#dbe6ff' : '#10203a',
    muted: isDark ? '#9aa6c3' : '#55607a',
    bg: isDark ? '#0b1220' : '#f5f7fb'
  };
}

function updateStat(id, value){
  const el = document.getElementById(id);
  if(el) el.textContent = value;
}

/* ========== CHARTS ========== */

let chartProjetos, chartHabilidades, chartLinguagens, chartRadar;

function createCharts(){
  /* Projetos (barra) */
  const ctxP = document.getElementById('chartProjetos').getContext('2d');
  if(chartProjetos) chartProjetos.destroy();
  chartProjetos = new Chart(ctxP, {
    type: 'bar',
    data: {
      labels: anos,
      datasets: [{
        label: 'Projetos Concluídos',
        data: projetosPorAno,
        backgroundColor: 'rgba(42,82,152,0.85)',
        borderRadius: 6
      }]
    },
    options: {
      responsive:true,
      plugins:{ legend:{ display:false } },
      scales:{ y:{ beginAtZero:true, ticks:{stepSize:5} } }
    }
  });

  /* Habilidades (linha múltipla) */
  const ctxH = document.getElementById('chartHabilidades').getContext('2d');
  if(chartHabilidades) chartHabilidades.destroy();
  chartHabilidades = new Chart(ctxH, {
    type:'line',
    data: {
      labels: habilidadesSeries.labels,
      datasets: habilidadesSeries.datasets.map(d => ({
        label: d.label,
        data: d.data,
        borderColor: d.borderColor,
        backgroundColor: d.backgroundColor,
        fill: true,
        tension: d.tension
      }))
    },
    options:{ responsive:true, plugins:{ legend:{position:'top'} } }
  });

  /* Linguagens (donut) */
  const ctxL = document.getElementById('chartLinguagens').getContext('2d');
  if(chartLinguagens) chartLinguagens.destroy();
  chartLinguagens = new Chart(ctxL, {
    type:'doughnut',
    data: { labels: linguagensData.labels, datasets:[{ data: linguagensData.data, backgroundColor:['#ff7a00','#27ae60','#8e44ad','#2980b9'] }] },
    options:{ responsive:true, plugins:{ legend:{position:'bottom'} } }
  });

  /* Radar */
  const ctxR = document.getElementById('chartRadar').getContext('2d');
  if(chartRadar) chartRadar.destroy();
  chartRadar = new Chart(ctxR, {
    type:'radar',
    data: { labels: radarData.labels, datasets:[{ label:'Competência', data:radarData.data, backgroundColor:'rgba(42,82,152,0.2)', borderColor:'#2a5298', borderWidth:2 }] },
    options:{ responsive:true, scales:{ r:{ beginAtZero:true, max:100 } } }
  });
}

/* ========== EXPORT (PNG) ========== */

function exportChartAsImage(chartInstance, filename = 'chart.png') {
  try {
    const url = chartInstance.toBase64Image('image/png', 1);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (err) {
    alert('Erro ao exportar gráfico: ' + err.message);
  }
}

/* exportar todos */
function exportAll(){
  exportChartAsImage(chartProjetos, 'projetos.png');
  setTimeout(()=> exportChartAsImage(chartHabilidades, 'habilidades.png'), 300);
  setTimeout(()=> exportChartAsImage(chartLinguagens, 'linguagens.png'), 600);
  setTimeout(()=> exportChartAsImage(chartRadar, 'radar.png'), 900);
}

/* ========== FILTROS / CONTROLES ========== */

document.getElementById('filterYear').addEventListener('change', (e) => {
  const val = e.target.value;
  if(val === 'all'){
    projetosPorAno = [2,5,7,10,8];
  } else {
    projetosPorAno = anos.map(y => (y === val ?  (val === '2023' ? 7 : (val === '2024' ? 10 : (val === '2025' ? 8 : 0))) : 0));
  }
  chartProjetos.data.datasets[0].data = projetosPorAno;
  chartProjetos.update();
});

/* export buttons */
document.addEventListener('click', (e) => {
  const el = e.target;
  if(el.matches('.export')){
    const chartName = el.dataset.chart;
    if(chartName && window[chartName]) exportChartAsImage(window[chartName], `${chartName}.png`);
  }
  if(el.id === 'btnDownloadAll') exportAll();
  if(el.id === 'btnReset'){
    document.getElementById('filterYear').value = 'all';
    projetosPorAno = [2,5,7,10,8];
    createCharts();
  }
});

/* theme toggle */
document.getElementById('toggleTheme').addEventListener('click', () => {
  const cur = document.body.getAttribute('data-theme');
  const next = cur === 'dark' ? 'light' : 'dark';
  document.body.setAttribute('data-theme', next);
  document.getElementById('toggleTheme').textContent = next === 'dark' ? '🌙' : '☀️';
});

/* carregar GitHub: simples fetch público */
async function fetchGitHubStats() {
  if(!GITHUB_USER || GITHUB_USER === 'https://github.com/First997?tab=repositories') {
    alert('Coloque seu usuário do GitHub em script.js (GITHUB_USER).');
    return;
  }

  try {
    const res = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100`);
    if(!res.ok) throw new Error('Erro ao buscar GitHub: ' + res.status);
    const repos = await res.json();

    const repoCount = repos.length;
    const stars = repos.reduce((s, r) => s + (r.stargazers_count||0), 0);
    // linguagens: contamos linguagem principal dos repos
    const langs = {};
    repos.forEach(r => { if(r.language) langs[r.language] = (langs[r.language]||0) + 1; });
    const langList = Object.keys(langs).slice(0,4).join(', ') || '—';

    updateStat('gh-repos', repoCount);
    updateStat('gh-stars', stars);
    updateStat('gh-langs', langList);

    // opcional: atualiza gráfico de linguagens se quiser
    const langsLabels = Object.keys(langs).slice(0,6);
    const langsValues = langsLabels.map(l => langs[l]);
    if(langsLabels.length) {
      chartLinguagens.data.labels = langsLabels;
      chartLinguagens.data.datasets[0].data = langsValues;
      chartLinguagens.update();
    }

  } catch (err) {
    console.error(err);
    alert('Falha ao carregar dados do GitHub. Veja console.');
  }
}

document.getElementById('btnFetchGit').addEventListener('click', fetchGitHubStats);

/* onload */
window.addEventListener('load', () => {
  createCharts();
  // expõe instâncias globalmente para export buttons funcionarem com data-chart
  window.chartProjetos = chartProjetos;
  window.chartHabilidades = chartHabilidades;
  window.chartLinguagens = chartLinguagens;
  window.chartRadar = chartRadar;

  // inicializa com tema salvo (se quiser)
  const saved = localStorage.getItem('theme');
  if(saved) {
    document.body.setAttribute('data-theme', saved);
    document.getElementById('toggleTheme').textContent = saved === 'dark' ? '🌙' : '☀️';
  }
});

/* salva preferência de tema */
document.getElementById('toggleTheme').addEventListener('click', () => {
  localStorage.setItem('theme', document.body.getAttribute('data-theme'));
});

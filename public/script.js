var myChart;

const ufs_nfe = ['ac','al','am','ap','ba','ce','df','es','go','ma','mg','ms','mt',
'pa','pb','pe','pi','pr','rj','rn','ro','rr','rs','sc','se','sp','to'];
const document_types = ['nfe','nfce'];

function render_buttons(uf){
    return ('<button class="button_uf" onclick="getData('+uf+')">' +ufs_nfe[uf].toUpperCase()+ '</button>');
}
async function getData(uf) {
    const data = { uf : ufs_nfe[uf]};
    const option={
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body : JSON.stringify(data)
    };
    fetch('/consulta', option)
    .then(response => response.json())
    .then(response =>{
        let datax = [], statusy = [];
        response.forEach(data => {
            const minutes = new Date(data.datahora).getMinutes() + '';
            datax.push(new Date(data.datahora).getHours() + ':'+ ((minutes.length == 2) ? minutes : '0' + minutes) );
            statusy.push(data.tempo)
        });
        if (myChart) myChart.destroy();
        create_charth(datax, statusy, ufs_nfe[uf].toUpperCase());
    }).catch(() => {
        console.log('Chamada deu errado')
    });
}

async function create_charth(x, y, uf) {
    var ctx = document.getElementById('myChart').getContext('2d');
    ctx.height = 50;
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: x,
            datasets: [{
                label: 'Monitor de ' + uf,
                data: y,
                backgroundColor: [
                    'rgba(75, 192, 192, 0.2)',
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

let element = document.getElementById('ufs');
// for (uf  of ufs_nfe){
//     element.innerHTML += render_buttons(uf);
// };

// ufs_nfe.forEach(uf => {
//     element.innerHTML += render_buttons(uf.parseInt());
// });

for(index in ufs_nfe) {
    element.innerHTML += render_buttons(index);
}



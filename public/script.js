var myChart;

const ufs_nfe = ['ac','al','am','ap','ba','ce','df','es','go','ma','mg','ms','mt',
'pa','pb','pe','pi','pr','rj','rn','ro','rr','rs','sc','se','sp','to'];
const document_types = ['nfe','nfce'];
let document_type = 1;
let notifica = 0;
let erros_recentes = [];

if (Notification.permission === "granted"){
    notifica = 1;
}else if(Notification.permission === "default"){
    Notification.requestPermission().then(permissao => {
        if (permissao === "granted"){
            notifica = 1;
        }
    });
}

function notificacao(){
    if(notifica ===1 && erros_recentes != [] ){
        const notification = new Notification("Monitor Sefaz notifica:",{
            body: "Os seguintes servidores apresentaram erro: " + erros_recentes +".",
        });
        erros_recentes = [];
    }
}


function render_buttons(uf){
    return ('<button class="button_uf" onclick="getData('+uf+')">' +ufs_nfe[uf].toUpperCase()+ '</button>');
}


function button_uf(numero){
    if(numero == 0 && document_type != 0){
        document.getElementById("nfe").style.backgroundColor ="rgb(63, 206, 206)";
        document.getElementById("nfce").style.backgroundColor="rgb(179, 218, 218)";
        document_type = 0;
        if(myChart){ 
            myChart.destroy();
        }
    }else{
        if(document_type !=1){
            document.getElementById("nfce").style.backgroundColor ="rgb(63, 206, 206)";
            document.getElementById("nfe").style.backgroundColor="rgb(179, 218, 218)";
            document_type = 1;
            if(myChart){ 
                myChart.destroy();
            }
        }
    } 
}
 
async function getErrors(uf = '',documentType='',tempo=''){
    console.log('eu estou executando');
    const option={
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
    };
    fetch('/erros', option)
    .then(response => response.json())
    .then(response =>{
        response.forEach(element => {
            console.log(element);
            console.log(element.uf);
            erros_classe.innerHTML += render_errors(element.uf,element.document_type,element.erro);
            erros_para_notificar(element);    
        });
    notificacao()
    }).catch(() => {
        console.log('Chamada de erros não ironicamente errado')
    });
}



async function erros_para_notificar(erro){
    console.log("varios vacilao q testa nossa fé");
    console.log(erro.notificar);
    if(erro.notificar){
        console.log(erro.uf + erro.document_type);
        erros_recentes.push(erro.uf + erro.document_type);
    }
}


//setInterval(getErrors(),120000);

async function getData(uf) {
    console.log(document_types[document_type])
    const data = { 
        uf : ufs_nfe[uf],
        doc: document_types[document_type]
    };
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
            datax.push(new Date(data.datahora).getHours() + ':'+ ((minutes.length == 2) ? minutes : '0' + minutes));
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
button_uf(0);
let element = document.getElementById('ufs');
let erros_classe = document.getElementById('erros');
// for (uf  of ufs_nfe){
//     element.innerHTML += render_buttons(uf);
// };

// ufs_nfe.forEach(uf => {
//     element.innerHTML += render_buttons(uf.parseInt());
// });

for(index in ufs_nfe) {
    element.innerHTML += render_buttons(index);
}

//function render_errors(elemento){
//    return('<h3 class="erro">O servidor'+elemento[0].uf+' '+elemento[0].document_type+' apresentou '+elemento[0].erro+'</h3>');
//}
function render_errors(uf,document_type,erro){
    console.log(uf);
    return('<h3 class="erro">O servidor '+uf+document_type+' apresentou: '+erro+' | </h3>');
}




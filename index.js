const express = require('express');
const Datastore = require('nedb');
const fetch = require('node-fetch');
const ufs_nfe = ['ac','al','am','ap','ba','ce','df','es','go','ma','mg','ms','mt',
'pa','pb','pe','pi','pr','rj','rn','ro','rr','rs','sc','se','sp','to'];
const ufs_nfce = ['ac','al','am','ap','ba','df','es','go','ma','mg','ms','mt',
'pa','pb','pe','pi','pr','rj','rn','ro','rr','rs','se','sp','to'];
const document_types = ['nfe','nfce'];
let last_errors = [];
const app = express();
app.use(express.json())
app.listen(8080,() => console.log('listening at 8080'));
app.use(express.static('public'));
const database = new Datastore('database.db');
const erros_db = new Datastore('erros.db');
erros_db.loadDatabase();
database.loadDatabase();

app.get('/', function (req, res) {
    res.render('index', {});
  });
app.post('/consulta', async (request, response)=>{
    database.find({"id_worker":"sefaz_"+request.body.doc+"_envio_"+request.body.uf})
    .sort({ "datahora": -1 })
    .limit(10)
    .exec((err,data)=>{
        data.sort(GetSortOrder("datahora"));
        console.log(data);
        response.json(data);  
    })
});

app.post('/erros', async (request, response)=>{
    erros_db.find({})
    .limit(10)
    .exec((err,data)=>{
        data.sort(GetSortOrder("tempo"));
        console.log(data);
        response.json(data);  
    })
});

async function get_data_and_store(document_type,uf){
    let api_url = 'http://monitor.tecnospeed.com.br/monitores?current=true&worker_id=sefaz_'+ document_type +'_envio_'+uf;
    await fetch(api_url)
    
    .then(resposta => resposta.json())
    .then(resposta =>{
        find_errors(resposta, document_type, uf);
        database.insert(resposta);
    }).catch(() => {
        console.log("Erro ao pegar dados de: " +document_type +uf);
    });
};

function GetSortOrder(prop) {    
    return function(a, b) {    
        if (a[prop] > b[prop]) {    
            return 1;    
        } else if (a[prop] < b[prop]) {    
            return -1;    
        }    
        return 0;    
    }    
} 

async function find_errors(response,document_type,uf){
    //console.log(response)
    console.log("estou validando dados de" +uf +document_type);
    //console.log(response[0].tempo);
    if(response[0].erro){
        erros_db.insert({'uf':uf,'document_type': document_type, 'erro': response[0].erro, 'tempo': response[0].datahora, 'notificar': true})
        //console.log("O servidor"+uf+document_type+"Apresentou erro: "+response.erro);
        last_errors.push(uf+document_type)
    }else if(response[0].tempo >= 100 && response[0].tempo < 300 ){
        erros_db.insert({'uf':uf,'document_type': document_type, 'erro': 'Lentidão', 'tempo': response[0].datahora, 'notificar': false})
        //console.log("O servidor "+uf+ document_type +" apresentou lentidão");
    }else if(response[0].tempo >= 300){
        erros_db.insert({'uf':uf,'document_type': document_type, 'erro': 'Muita Lentidão', 'tempo': response[0].datahora, 'notificar': true})
        //console.log("O servidor "+uf+ document_type + " está muito lento");
        last_errors.push(uf+document_type)
    }
}

async function retrieve_all_data(){
    console.log('recebendo dados');
    ufs_nfe.forEach(uf => {
        console.log(uf + 'nfe')
        get_data_and_store('nfe',uf)
    });
    ufs_nfce.forEach(uf => {
        console.log(uf + 'nfce')
        get_data_and_store('nfce',uf)
    });
}

retrieve_all_data();
setInterval(retrieve_all_data,120000);
//setInterval(clear_errors,1200000);

/*function get_last(document_type,uf){
        database.find({"id_worker":"sefaz_"+document_type+"_envio_"+uf})
        .sort({ "datahora": -1 })
        .limit(10)
        .exec((err,data)=>{
                let data_output = [];
                console.log(data);
                data.sort(GetSortOrder("datahora"));
                data.forEach(element => {
                    data_output.push(element.tempo)
                });
                console.log(data_output);
        });   
}

get_last("nfe","sc");
*/

function clear_errors(){
    erros_db.remove({ }, { multi: true }, function (err, numRemoved) {
        erros_db.loadDatabase(function (err) {
        });
      });
}


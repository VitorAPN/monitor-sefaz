const express = require('express');
const Datastore = require('nedb');
const fetch = require('node-fetch');
const ufs_nfe = ['ac','al','am','ap','ba','ce','df','es','go','ma','mg','ms','mt',
'pa','pb','pe','pi','pr','rj','rn','ro','rr','rs','sc','se','sp','to'];
const ufs_nfce = ['ac','al','am','ap','ba','df','es','go','ma','mg','ms','mt',
'pa','pb','pe','pi','pr','rj','rn','ro','rr','rs','se','sp','to'];
const document_types = ['nfe','nfce'];
const app = express();
app.listen(3000,() => console.log('listening at 3000'));
app.use(express.static('public'));

const database = new Datastore('database.db')
database.loadDatabase();

//database.insert({nome: 'Djonga'})

/*app.get('/monitor', async (request, response)=>{
    const api_url = 'http://monitor.tecnospeed.com.br/monitores?current=true&worker_id=sefaz_nfe_envio_pr';
    fetch(api_url)
    .then(resposta => resposta.json())
    .then(resposta =>{
        console.log(resposta);
        database.insert(resposta);
    });
    response.end;
});*/

async function get_data_and_store(document_type,uf){
    let api_url = 'http://monitor.tecnospeed.com.br/monitores?current=true&worker_id=sefaz_'+ document_type +'_envio_'+uf;
    await fetch(api_url)
    .then(resposta => resposta.json())
    .then(resposta =>{
        database.insert(resposta);
    });
};

async function retrieve_all_data(){
    console.log('nois q voa bruxoso');
    ufs_nfe.forEach(uf => {
        console.log('madona')
        get_data_and_store('nfe',uf)
    });
    ufs_nfce.forEach(uf => {
        console.log('bruce lee')
        get_data_and_store('nfce',uf)
    });
}

setInterval(retrieve_all_data,360000);


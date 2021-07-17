
let api_url = 'https://cors-anywhere.herokuapp.com/http://monitor.tecnospeed.com.br/monitores?current=true&worker_id=sefaz_nfe_envio_sc';
let podeissoarnaldo = 0;
let current_data;
let uf =  document.getElementById('uf');
let status = document.getElementById('status');
let response_time = document.getElementById('tempo_resposta');
let default_uf = uf.innerHTML;
let default_status = status.innerHTML;
let default_response_time = response_time.innerHTML;

async function getData(){
    const response = await fetch(api_url);
    const data = await response.json();
    console.log(data[0]);
    return data[0];
}

async function change_uf(new_uf){
    if(new_uf == 'sc' && podeissoarnaldo != 1){
        api_url = api_url.replace('pr','sc');
        podeissoarnaldo = 1;
        current_data = await getData();
        change_data();
    }
    else if(new_uf == 'pr' && podeissoarnaldo != 2){
        api_url = api_url.replace("sc","pr");
        console.log(api_url)
        podeissoarnaldo = 2;
        current_data = await getData();
        change_data();
    }
}

function change_data(){
    status.innerHTML = default_status + current_data.status;
    response_time.innerHTML = default_response_time + current_data.tempo;
}


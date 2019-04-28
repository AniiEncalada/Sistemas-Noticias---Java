var URL = "https://silvanamendozasebas.000webhostapp.com/noticias/servidorNoticias.php";
var URL_SERVER = "https://silvanamendozasebas.000webhostapp.com/noticias/";

function showAlert(text ,type){
    $('#alert_msg').html('<div class="alert alert-'+type+' fade show" role="alert"><span class="msg">'+text+'</span><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>');
}

function cleanData(texto) {
    texto = texto.replace(/<[^>]*>?/g, '');
    texto = texto.replace(/['"]+/g, '');
    texto = texto.replace(/\n|\r/g, ""); 
    return texto; 
}
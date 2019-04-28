var cont = 1;

$(document).ready(function(){
    $('#login_form').trigger("reset");
    verifySession();
    loginFunctions();
    addNews();
    search();

    $('#news_form button[type="reset"]').on('click', function(e){
        $('#news_form').removeAttr('data-id');
        $('#news_form button[type="submit"]').text('Añadir Noticia');
    });

    $('#search_form button[type="reset"]').on('click', function(){
        $(this).addClass('hidden');
        listar();
    });
});

//Verificar Sesión
function verifySession(){    
    if(sessionStorage.getItem('user')){
        $('#sign_in').addClass('hidden');
        $('#news-box').removeClass('hidden');
        $('#logout').removeClass('hidden');
        $('#alert_empty').addClass('hidden');
        $('#search_form').removeClass('hidden');
        listar();
    }else{
        $('#sign_in').removeClass('hidden');
        $('#news-box').addClass('hidden');
        $('#logout').addClass('hidden');
        $('#alert_empty').removeClass('hidden');
        $('#search_form').addClass('hidden');

        //Añadir a funcion para limpiar
        $('#search_form').trigger('reset');
        $('#search_form button[type="reset"]').addClass('hidden');
        $('#news_form').trigger('reset');
        $('#news_form').removeAttr('data-id');
    }
}

//Iniciar - Cerrar Sesión
function loginFunctions(){
    $('#login_form').submit(function(e){
        showAlert('Cargando...', 'success');
        var input_user = $('#login_account').val(),
            input_pass = $('#login_pass').val();

        if(input_user.trim() != '' && input_pass.trim() != ''){
            $.ajax({
                url: URL,
                method: 'POST',
                dataType: 'json',
                data: { 'action': 'autenticar', 'usuario': input_user, 'password': input_pass },
                success: function(data,textStatus,jqXHR){
                    if (data[0] && data[0].usuario != ''){
                        sessionStorage.setItem('user',data[0].usuario);
                        sessionStorage.setItem('password',data[0].password);
                        verifySession();
                        if(!$('#login_alert').hasClass('hidden'))
                            $('#login_alert').addClass('hidden');                        
                    }else{
                        $('#login_alert').html('¡La cuenta no existe!');
                        $('#login_alert').removeClass('hidden');
                    }
                    $('#alert_msg .alert').alert('close');                    
                },
                error: function (jqXHR,textStatus,errorThrown){
                    $('#login_alert').html('Ocurrió un error.');
                    $('#login_alert').removeClass('hidden');
                    $('#alert_msg .alert').alert('close');                    
                }
            });
        }else{
            $('#login_alert').html('¡Datos Vacíos!')
            $('#login_alert').removeClass('hidden');
            $('#alert_msg .alert').alert('close');
        }
        $('#login_form').trigger("reset");
        e.preventDefault();
    });

    $('#logout').on('click', function(e){
        sessionStorage.clear();
        verifySession();
        $('#news_table tbody').html('');
        e.preventDefault();
    });
}

// Añadir Noticias
function addNews(){
    $('#news_form').submit(function(e){
        showAlert('Cargando...', 'success');
        var text = $('#news_input').val();
        if(text.trim()){
            if($(this).attr('data-id')){
                var disData = {
                    action: 'modificaNoticia',
                    usuario: sessionStorage.getItem('user'),
                    password: sessionStorage.getItem('password'),
                    noticia: cleanData(text),
                    external: $(this).attr('data-id')
                };
                $.ajax({
                    url: URL,
                    method: 'POST',
                    dataType: 'json',
                    data: disData,
                    success: function(data,textStatus,jqXHR){
                        $('#news_form').removeAttr('data-id');
                        $('#news_form').trigger('reset');
                        $('#news_form button[type="submit"]').text('Añadir Noticia');
                        listar();
                        showAlert('Se ha modificado correctamente.', 'success');
                        setTimeout(function(){ $('#alert_msg .alert').alert('close'); }, 3000);
                    },error: function (jqXHR,textStatus,errorThrown){
                        showAlert('Ha ocurrido un error...', 'danger');
                        setTimeout(function(){ $('#alert_msg .alert').alert('close'); }, 3000);
                        console.log(errorThrown);
                    }
                });
            }else{
                var disData = {
                    action: 'nuevaNoticia',
                    texto: text,
                    usuario: sessionStorage.getItem('user'),
                    password: sessionStorage.getItem('password')
                }, html = "";
                $.ajax({
                    url: URL + '?fbclid=IwAR3cHwxmW8gtYIOYtTs9kwIHdfFXZvh86hE1c2WgaBKtpkCR11wKq4Ez4vE',
                    method: 'POST',
                    dataType: 'json',
                    data: disData,
                    success:  function(data,textStatus,jqXHR){
                        if(data){
                            html += '<tr>';
                            html += '<td>'+cont+'</td>';
                            html += '<td>'+disData.texto+'</td>';
                            html += '<td><a href="#" class="btn btn-info">Ver</a><a href="#" class="btn btn-success">Editar</a><a href="#" class="btn btn-danger">Eliminar</a></td>';
                            html += '</tr>';
                            $('#news_table tbody').append(html);
                            cont++;
                            $('#news_form').trigger('reset');
                            showAlert('Se ha guardado correctamente.', 'success');
                            setTimeout(function(){ $('#alert_msg .alert').alert('close'); }, 3000);
                        }
                    },error: function (jqXHR,textStatus,errorThrown){
                        showAlert('Ha ocurrido un error...', 'danger');
                        setTimeout(function(){ $('#alert_msg .alert').alert('close'); }, 3000);
                        console.log(errorThrown);
                    }
                });
            }
        }else{
            showAlert('Existen campos vacíos...','danger');
            setTimeout(function(){ $('#alert_msg .alert').alert('close'); }, 3000);
        }
        e.preventDefault();
    });
}

function editNews(){
    $('#news_table .button_edit').on('click', function(e){
        var obj = $(this).parent().parent();
        $('#news_form').attr('data-id', obj.attr('data-id'));
        $('#news_input').val(cleanData(obj.find('td:nth-child(2)').html()));
        $('html').scrollTop(0);
        $('#news_input').trigger('focus');

        $('#news_form button[type="submit"]').text('Guardar Cambios');
        e.preventDefault();
    });
}

function search(){
    $('#search_form').submit(function(e){
        showAlert('Cargando...', 'success');
        var txt = $('#search_input').val(),
            url = URL + "?action=refrescaNoticia";
        cont = 1;
        if(txt.trim()){
            $.ajax({
                url: url,
                method: 'GET',
                dataType: 'json',
                success: function(data){
                    var html = '';
                    $.each(data, function(i, item){
                        if((item.texto).includes(txt)){
                            html += '<tr data-id="'+item.external_id+'">';
                            html += '<td>'+cont+'</td>';
                            html += '<td>'+item.texto+'</td>';
                            html += '<td><a href="#" class="btn btn-info">Ver</a><a href="#" class="btn btn-success button_edit">Editar</a><a href="#" class="btn btn-danger">Eliminar</a></td>';
                            html += '</tr>';
                            cont++;
                        }
                    });
                    $('#news_table tbody').html(html);                    
                    editNews();
                    $('#search_form button[type="reset"]').removeClass('hidden');

                    showAlert('¡Listo!', 'success');
                    setTimeout(function(){ $('#alert_msg .alert').alert('close'); }, 3000);
                },error: function (jqXHR,textStatus,errorThrown){
                    showAlert('Ha ocurrido un error...', 'danger');
                    setTimeout(function(){ $('#alert_msg .alert').alert('close'); }, 3000);
                    console.log(errorThrown);
                }
            });
        }
        e.preventDefault();
    });
}

function listar(){
    showAlert('Cargando...', 'success');
    var url = URL + "?action=refrescaNoticia";
    cont = 1;
    $.ajax({
        url: url,
        method: 'GET',
        dataType: 'json',
        success: function(data){
            var html = '';
            $.each(data, function(i, item){
                html += '<tr data-id="'+item.external_id+'">';
                html += '<td>'+cont+'</td>';
                html += '<td>'+item.texto+'</td>';
                html += '<td><a href="#" class="btn btn-info">Ver</a><a href="#" class="btn btn-success button_edit">Editar</a><a href="#" class="btn btn-danger">Eliminar</a></td>';
                html += '</tr>';
                cont++;
            });
            $('#news_table tbody').html(html);
            editNews();

            showAlert('¡Listo!', 'success');
            setTimeout(function(){ $('#alert_msg .alert').alert('close'); }, 3000);
        },error: function (jqXHR,textStatus,errorThrown){
            showAlert('Ha ocurrido un error...', 'danger');
            setTimeout(function(){ $('#alert_msg .alert').alert('close'); }, 3000);
            console.log(errorThrown);
        }
    });
}

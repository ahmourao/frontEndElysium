

$(document).on("pagecreate", "#loginPage", function () {
  $('#loginForm').on('submit', function (event) {

    const usuarioMsg = $('#usuario-home');
    event.preventDefault();
    const username = $('#username').val();
    const password = $('#password').val();

    // Substitua a URL abaixo pela URL real do seu servidor de autenticação
    const authenticationUrl = 'https://itelysium.onrender.com/authenticate';

    // Mostrar loader enquanto aguarda resposta do servidor
    $.mobile.loading("show", {
      text: "Enviando...",
      textVisible: true,
      theme: "b",
      textonly: false
    });

    // Simulação de requisição de autenticação
    $.ajax({
      url: authenticationUrl,
      method: 'POST',
      data: { username: username, password: password },
      success: function (data) {
        // Ocultar loader após a resposta do servidor
        $.mobile.loading("hide");

        if (data.authenticated) {
          // Se autenticado com sucesso, exiba a página inicial
          showHomePage();
          let url = `https://itelysium.onrender.com/aluno?id=${parseInt(username)}`;

          // Mostrar loader novamente para a segunda chamada assíncrona
          $.mobile.loading("show", {
            text: "Carregando dados...",
            textVisible: true,
            theme: "b",
            textonly: false
          });

          $.ajax({
            url: url,
            method: "GET",
            dataType: "json",
            success: function (data) {

              // Ocultar loader após a resposta do segundo servidor
              $.mobile.loading("hide");


              //ADICIONAR O NOME DO USUÁRIO NA PÁGINA HOME
              if (data.nomeAluno && data.sobrenomeAluno) {
                let nomeCompleto = data.nomeAluno + ' ' + data.sobrenomeAluno;
                usuarioMsg.text(nomeCompleto);
                console.log(nomeCompleto);
              }

            },
            error: function (error) {
              console.log(error);

              // Ocultar loader em caso de erro
              $.mobile.loading("hide");

            }
          });
        } else {
          // Ocultar loader em caso de falha na autenticação
          $.mobile.loading("hide");
          alert('Falha na autenticação. Verifique suas credenciais.');
        }
      },
      error: function () {
        // Ocultar loader em caso de erro de comunicação
        $.mobile.loading("hide");
        alert('Erro ao se comunicar com o servidor de autenticação.');
      }
    });
  });

  function showHomePage() {
    $.mobile.changePage('#homePage', { transition: 'slide' });
  }

});

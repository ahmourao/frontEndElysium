

$(document).on("pagecreate", "#loginPage", function () {

  // Inicio da Função para exibir um popup personalizado
  function showCustomPopup(message) {
    // Crie um popup com a mensagem de erro
    var popup = $("<div>").popup({
      dismissible: true, // Tornar o popup clicável para fechar
      history: false,
      theme: "b",
      overlayTheme: "b",
      transition: "pop"
    });

    // Adicione o conteúdo ao popup
    var popupText = $("<p>").addClass("popup-text").text(message);
    var popupBtnContainer = $("<div>").addClass("popup-btn-container");
    var popupBtn = $("<a>").attr({
      href: "#",
      class: "ui-btn ui-corner-all ui-shadow ui-btn-a ui-icon-check ui-btn-icon-left ui-btn-b popup-btn",
      "data-rel": "back"
    }).text("OK");

    popup.append(popupText).append(popupBtnContainer.append(popupBtn));

    // Associe o popup à página ativa
    popup.popup("open").enhanceWithin();

    // Remova o popup do DOM após ser fechado
    popup.on("popupafterclose", function () {
      $(this).remove();
    });
  }
  // Fim da Função para exibir um popup personalizado


  // Adicionar funcionalidade para alternar a visibilidade da senha
  $('#togglePassword').on('click', function () {
    const passwordInput = $('#password');
    const passwordType = passwordInput.attr('type');

    if (passwordType === 'password') {
      passwordInput.attr('type', 'text');
    } else {
      passwordInput.attr('type', 'password');
    }
  });

  //Inicio da ação de submeter o formulário
  $('#loginForm').on('submit', function (event) {

    event.preventDefault();
    // Função para evitar o comportamento padrão do formulário

    const usuarioMsg = $('#usuario-home');
    const username = $('#username').val();
    const password = $('#password').val();

    // Substitua a URL abaixo pela URL do seu servidor de autenticação
    const authenticationUrl = 'https://itelysium.onrender.com/authenticate';

    // Mostrar loader enquanto aguarda resposta do servidor
    $.mobile.loading("show", {
      text: "Validando...",
      textVisible: true,
      theme: "b",
      textonly: false
    });

    // Inicio da Requisição de autenticação do login
    $.ajax({
      url: authenticationUrl,
      method: 'POST',
      data: { username: username, password: password },
      success: function (data) {

        if (data.authenticated) {

          // É feito uma nova requisição para exibir o nome do usuário na página inicial, na mensagem de boas vindas
          let url = `https://itelysium.onrender.com/aluno?id=${parseInt(username)}`;

          // Inicio da Requisição de nome do usuário
          $.ajax({
            url: url,
            method: "GET",
            dataType: "json",
            success: function (data) {

              // Ocultar loader após a resposta do servidor
              $.mobile.loading("hide");

              // Mudança html para adicionar o nome do usuário na página inicial
              if (data.nomeAluno && data.sobrenomeAluno) {
                let nomeCompleto = data.nomeAluno + ' ' + data.sobrenomeAluno;
                usuarioMsg.text(nomeCompleto);
                console.log(nomeCompleto);

                // Se autenticado com sucesso, exiba a página inicial
                showHomePage();
              }

            },
            error: function (xhr, status, error) {
              console.log(error);
              // Ocultar loader em caso de erro de comunicação ou timeout
              $.mobile.loading("hide");

              if (status === "timeout") {
                showCustomPopup('Tempo limite de conexão atingido. Tente novamente mais tarde.');
              } else {
                showCustomPopup('Sem comunicação com o servidor.');
              }

            }
          });
          //fim da requisição do nome do usuário

        }
        //Fim da condição if de autenticação de login

        else {
          // Ocultar loader em caso de falha na autenticação
          $.mobile.loading("hide");
          showCustomPopup('Login Inválido! Tente novamente');
        }
        //Fim da condição else de autenticação de login


      },
      // Fim do success da requisição de login

      error: function (xhr, status, error) {
        // Ocultar loader em caso de erro de comunicação ou timeout
        $.mobile.loading("hide");

        if (status === "timeout") {
          showCustomPopup('Tempo limite de conexão atingido. Tente novamente mais tarde.');
        } else {
          showCustomPopup('Sem comunicação com o servidor.');
        }

      }
      // Fim do error da requisição de login

    });
    // Fim da Requisição de autenticação do login

  });
  //Fim da ação de submeter o formulário

  function showHomePage() {
    $.mobile.changePage('#homePage', { transition: 'slide' });
  }

});

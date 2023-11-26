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


$(document).on("pagecreate", "#loginPage", function () {

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

    // Limpar o localStorage ao entrar na página de login
    localStorage.clear();

    let usuarioMsg = $('#usuario-home');
    let username = $('#username').val();
    let password = $('#password').val();

    // Substitua a URL abaixo pela URL do seu servidor de autenticação
    let authenticationUrl = 'https://itelysium.onrender.com/authenticate';

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

              // Armazene os dados do aluno no localStorage
              localStorage.setItem('alunoInfo', JSON.stringify(data));

              // Ocultar loader após a resposta do servidor
              $.mobile.loading("hide");

              // Mudança html para adicionar o nome do usuário na página inicial
              if (data.nomeAluno && data.sobrenomeAluno) {

                let nomeCompleto = data.nomeAluno + ' ' + data.sobrenomeAluno;
                usuarioMsg.text(nomeCompleto);
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
                showCustomPopup('Sem comunicação com o servidor2.');
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
          showCustomPopup('Sem comunicação com o servidor1.');
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

$(document).on('pagecontainerbeforechange', function (event, ui) {
  var toPage = ui.toPage;

  // Verifique se o usuário está indo para a página de login
  if (toPage && toPage.attr('id') === 'loginPage') {
    // Verifique se o usuário está autenticado
    // Substitua a condição abaixo pela lógica real de verificação de autenticação
    var isAuthenticated = false; // Substitua pelo seu método de verificação de autenticação

    if (isAuthenticated) {
      // Se autenticado, redirecione para a página desejada (por exemplo, homePage)
      $.mobile.pageContainer.pagecontainer('change', '#homePage', { transition: 'slide' });
      event.preventDefault(); // Evita a transição padrão para a página de login
    }
  }
});



$(document).on('pagebeforeshow', '#homePage', function () {
  // Verificar se há dados de aluno no localStorage
  if (!localStorage.getItem('alunoInfo')) {
    // Se não houver, redirecionar para a página de login
    $.mobile.changePage('#loginPage', { transition: 'slide' });
  }
});


$(document).on("pagecreate", "#homePage", function () {

  // Evento de clique no card
  $('.card-link').on('click', function () {
    // Obtenha o identificador único do card clicado
    const cardId = $(this).data('card-id');

    // Navegue para a nova página de detalhes do aluno com base no identificador único
    navigateToPage(cardId);
  });

  function navigateToPage(cardId) {
    // Use um switch para determinar para qual página redirecionar com base no cardId
    switch (cardId) {
      case 'card0':
        $.mobile.changePage('#alunoDetalhesPage', { transition: 'slide' });
        break;
      case 'card2':
        $.mobile.changePage('#boletimPage', { transition: 'slide' });
        break;
      case 'card6': {
        // Limpe o local storage
        localStorage.removeItem('alunoInfo');

        // Navegue para a página de login
        $.mobile.changePage('#loginPage', { transition: 'slide' });
        break;
      }
      // Adicione mais casos conforme necessário para outros cards

      default:
        console.log('Card não reconhecido.');
    }
  }
});

$(document).on("pageshow", "#alunoDetalhesPage", function () {
  // Limpar os campos ao entrar na página
  $('#nomeAluno').val("");
  $('#generoAluno').val("");
  $('#telefoneAluno').val("");

  // Obtenha as informações do aluno do localStorage
  let alunoInfo = JSON.parse(localStorage.getItem('alunoInfo'));

  // Popule os campos do formulário com as informações do aluno
  let nomeCompleto = alunoInfo.nomeAluno + ' ' + alunoInfo.sobrenomeAluno;
  $('#nomeAluno').val(nomeCompleto);
  $('#generoAluno').val(alunoInfo.sexoAluno);
  $('#telefoneAluno').val(alunoInfo.telefoneAluno);

  // Adicione código semelhante para outros campos conforme necessário
});


$(document).on("pagecreate", "#alunoDetalhesPage", function () {
  // Obtenha as informações do aluno do localStorage
  let alunoInfo = JSON.parse(localStorage.getItem('alunoInfo'));

  // Popule os campos do formulário com as informações do aluno
  let nomeCompleto = alunoInfo.nomeAluno + ' ' + alunoInfo.sobrenomeAluno;
  $('#nomeAluno').val(nomeCompleto);
  $('#generoAluno').val(alunoInfo.sexoAluno);
  $('#telefoneAluno').val(alunoInfo.telefoneAluno);

  // Adicione código semelhante para outros campos conforme necessário
});

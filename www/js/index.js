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
  $('#telefoneAluno').val("");
  $('#cepAluno').val("");
  $('#ruaAluno').val("");
  $('#numeroAluno').val("");
  $('#bairroAluno').val("");
  $("#complementoAluno").val("");
  $('#cidadeAluno').val("");
  $('#estadoAluno').val("");

  // Obtenha as informações do aluno do localStorage
  let alunoInfo = JSON.parse(localStorage.getItem('alunoInfo'));

  // Popule os campos do formulário com as informações do aluno
  let nomeCompleto = alunoInfo.nomeAluno + ' ' + alunoInfo.sobrenomeAluno;
  $('#nomeAluno').val(nomeCompleto);
  $('#telefoneAluno').val(alunoInfo.telefoneAluno);
  $('#cepAluno').val(alunoInfo.cep);
  $('#ruaAluno').val(alunoInfo.nomeRua);
  $('#numeroAluno').val(alunoInfo.numeroRua);
  $('#bairroAluno').val(alunoInfo.nomeBairro);
  // Acesse a propriedade complementoMoradia e substitua por espaço em branco se for nulo
  let complementoMoradia = alunoInfo.complementoMoradia !== null ? alunoInfo.complementoMoradia : '';
  $('#complementoAluno').val(complementoMoradia);
  $('#cidadeAluno').val(alunoInfo.nomeCidade);
  $('#estadoAluno').val(alunoInfo.siglaEstado);


  // Adicione código semelhante para outros campos conforme necessário
});

// Função para preencher os campos de endereço usando a API ViaCEP
function preencherEndereco(cep) {
  $.ajax({
    url: `https://viacep.com.br/ws/${cep}/json/`,
    dataType: 'json',
    success: function (data) {
      if (!data.erro) {
        $('#ruaAluno').val(data.logradouro);
        $('#bairroAluno').val(data.bairro);
        $('#cidadeAluno').val(data.localidade);
        $('#estadoAluno').val(data.uf);
        // Preencha outros campos conforme necessário
      } else {
        showCustomPopup('CEP não encontrado');
      }
    },
    error: function () {
      showCustomPopup("Erro ao buscar o CEP. Verifique sua conexão com a internet.");
    }
  });
}

// Evento de clique no botão "Validar CEP"
$('#validarCep').on('click', function () {
  const cep = $('#cepAluno').val().replace(/\D/g, ''); // Remove caracteres não numéricos
  if (cep.length === 8) {
    preencherEndereco(cep);
  } else {
    alert('CEP inválido. Informe os 8 dígitos do CEP.');
  }
});



$(document).on("pagecreate", "#alunoDetalhesPage", function () {
  // Obtenha as informações do aluno do localStorage
  let alunoInfo = JSON.parse(localStorage.getItem('alunoInfo'));

  // Popule os campos do formulário com as informações do aluno
  let nomeCompleto = alunoInfo.nomeAluno + ' ' + alunoInfo.sobrenomeAluno;
  $('#nomeAluno').val(nomeCompleto);
  $('#telefoneAluno').val(alunoInfo.telefoneAluno);

  $('#cepAluno').val(alunoInfo.cep);
  $('#ruaAluno').val(alunoInfo.nomeRua);
  $('#numeroAluno').val(alunoInfo.numeroRua);
  $('#bairroAluno').val(alunoInfo.nomeBairro);
  // Acesse a propriedade complementoMoradia e substitua por espaço em branco se for nulo
  let complementoMoradia = alunoInfo.complementoMoradia !== null ? alunoInfo.complementoMoradia : '';
  $('#complementoAluno').val(complementoMoradia);
  $('#cidadeAluno').val(alunoInfo.nomeCidade);
  $('#estadoAluno').val(alunoInfo.siglaEstado);


  $('#alunoDetalhesForm').on('submit', function (event) {


    event.preventDefault();
    // Obtenha os valores dos campos do formulário
    let ra = alunoInfo.ra;

    let telefoneAluno = $('#telefoneAluno').val();
    let cepAluno = $('#cepAluno').val();
    let ruaAluno = $('#ruaAluno').val();
    let numeroAluno = $('#numeroAluno').val();
    let bairroAluno = $('#bairroAluno').val();
    let complementoAluno = $('#complementoAluno').val();
    let cidadeAluno = $('#cidadeAluno').val();
    let estadoAluno = $('#estadoAluno').val();

    // Validação do número de telefone com regex
    var telefoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    if (!telefoneRegex.test(telefoneAluno)) {
      // Se o número de telefone não estiver no formato correto, exiba uma mensagem de erro
      alert('Por favor, insira um número de telefone válido no formato (xx) xxxxx-xxxx ou (xx) xxxx-xxxx');
      return false; // Impede o envio do formulário
    } else {

      // Criação do objeto com as informações a serem enviadas
      let dadosAluno = {
        ra: ra,
        telefoneAluno: telefoneAluno,
        cepAluno: cepAluno,
        ruaAluno: ruaAluno,
        numeroAluno: numeroAluno,
        bairroAluno: bairroAluno,
        complementoAluno: complementoAluno,
        cidadeAluno: cidadeAluno,
        estadoAluno: estadoAluno
      };
      console.log(dadosAluno);
      // Convertendo o objeto para JSON
      let jsonData = JSON.stringify(dadosAluno);

      // Mostrar loader enquanto aguarda resposta do servidor
      $.mobile.loading("show", {
        text: "Validando...",
        textVisible: true,
        theme: "b",
        textonly: false
      });

      // Inicio da Requisição de nome do usuário
      let url = "https://itelysium.onrender.com/aluno/alterar";
      $.ajax({
        url: url,
        method: "PUT",
        dataType: "json",
        data: jsonData,
        contentType: "application/json",
        success: function (data) {

          // Armazene os dados do aluno no localStorage
          localStorage.setItem('alunoInfo', JSON.stringify(data));

          // Ocultar loader após a resposta do servidor
          $.mobile.loading("hide");

          // Redirecionar para a homePage após o sucesso
          $.mobile.changePage('#homePage', { transition: 'slide' });
        },
        error: function (xhr, status, error) {
          // Função chamada em caso de erro
          console.error('Erro:', status, error);
          console.log(xhr.responseText); // Adicione esta linha para imprimir a resposta do servidor
          // Ocultar loader em caso de erro de comunicação ou timeout
          $.mobile.loading("hide");
          console.log('Enviando requisição para:', url);
          console.log('Dados do Aluno:', jsonData);


          if (status === "timeout") {
            showCustomPopup('Tempo limite de conexão atingido. Tente novamente mais tarde.');
          } else {
            showCustomPopup('Sem comunicação com o servidor2.');
          }
        }
      });
      //fim da requisição do nome do usuário
    }


  });

  // Adicione código semelhante para outros campos conforme necessário
});

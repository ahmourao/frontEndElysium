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
                showCustomPopup('Verifique sua conexão novamente.');
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
          showCustomPopup('Verifique sua conexão novamente.');
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
  //NÃO PODE ENTRAR NA HOME SEM TER LOGIN
  // Verificar se há dados de aluno no localStorage
  if (!localStorage.getItem('alunoInfo')) {
    // Se não houver, redirecionar para a página de login
    $.mobile.changePage('#loginPage', { transition: 'slide' });
  }
});


$(document).on("pagecreate", "#homePage", function () {

  // Evento de clique no card
  $('.card-link').on('click', function () {
    // Obtendo o identificador único do card clicado
    const cardId = $(this).data('card-id');

    // Navegue para a nova página com base no identificador único
    navigateToPage(cardId);
  });

  function navigateToPage(cardId) {
    // Switch para determinar para qual página redirecionar com base no cardId
    switch (cardId) {
      case 'card0':

        $.mobile.changePage('#alunoDetalhesPage', { transition: 'slide' });
        break;

      case 'card2': {
        // Obtendo as informações do aluno do localStorage
        let alunoInfo = JSON.parse(localStorage.getItem('alunoInfo'));

        $.mobile.loading("show", {
          text: "Carregando informações...",
          textVisible: true,
          theme: "b",
          textonly: false
        });


        $.ajax({
          url: `https://itelysium.onrender.com/matricula/boletim?id=${parseInt(alunoInfo.ra)}`,
          method: 'GET',
          dataType: 'json',
          contentType: "application/json",
          success: function (data) {
            console.log(data);
            //Função para preencher a tabela na página de histórico escolar
            preencherTabelaBoletim(data);
            $.mobile.loading("hide");
            // Navegue para a página de histórico escolar
            $.mobile.changePage('#boletimPage', { transition: 'slide' });

          },
          error: function (xhr, status, error) {
            $.mobile.loading("hide");
            console.error('Erro:', status, error);
            console.log(xhr.responseText); // imprimir a resposta do servidor
            console.error('Erro ao obter dados do boletim:', status, error);
          }
        });
        break;
      }

      case 'card6': {

        // o card 6 é o de sair então tem que limpar o armazenamento
        localStorage.removeItem('alunoInfo');

        $.mobile.changePage('#loginPage', { transition: 'slide' });
        break;

      }
      case 'card3': {

        // Obtendo as informações do aluno do localStorage
        let alunoInfo = JSON.parse(localStorage.getItem('alunoInfo'));

        $.mobile.loading("show", {
          text: "Carregando informações...",
          textVisible: true,
          theme: "b",
          textonly: false
        });


        $.ajax({
          url: `https://itelysium.onrender.com/historicoEscolar?id=${parseInt(alunoInfo.ra)}`,
          method: 'GET',
          dataType: 'json',
          contentType: "application/json",
          success: function (data) {

            //Função para preencher a tabela na página de histórico escolar
            preencherTabelaHistoricoEscolar(data);
            $.mobile.loading("hide");
            // Navegue para a página de histórico escolar
            $.mobile.changePage('#historicoEscolarPage', { transition: 'slide' });

          },
          error: function (xhr, status, error) {
            $.mobile.loading("hide");
            console.error('Erro:', status, error);
            console.log(xhr.responseText); // imprimir a resposta do servidor
            console.error('Erro ao obter dados do histórico escolar:', status, error);
          }
        });
        break;

      }

      case 'card4':
        // Desabilitar todos os cards, exceto o card5 e o card6
        $('.card-link').not('[data-card-id="card5"]').not('[data-card-id="card6"]').css('pointer-events', 'none');
        break;

      case 'card5':
        // Habilitar todos os cards
        $('.card-link').css('pointer-events', 'auto');
        break;

      default:
        console.log('Card não reconhecido.');
    }
  }
});


// Função para preencher a tabela com dados do histórico escolar
function preencherTabelaHistoricoEscolar(data) {
  var table = $('#historicoTable');

  // Limpar a tabela antes de adicionar novos registros
  table.empty();

  // Criar a tabela novamente
  table.append('<thead><tr><th>Disciplina</th><th>Freq.</th><th>N1</th><th>N2</th><th>Média</th><th>Situação</th></tr></thead>');
  var tableBody = $('<tbody>').attr('id', 'historicoBody');
  table.append(tableBody);

  // Iterar sobre os dados e adicionar linhas à tabela
  data.forEach(function (registro) {
    var disciplina = registro.disciplina.nomeDisciplina;
    var frequencia = registro.frequencia;
    var nota1 = registro.nota1;
    var nota2 = registro.nota2;
    var media = registro.media;
    var situacao = registro.situacao;

    // Adicionar uma nova linha à tabela
    var newRow = $('<tr>').append(
      $('<td>').text(disciplina),
      $('<td>').text(frequencia),
      $('<td>').text(nota1),
      $('<td>').text(nota2),
      $('<td>').text(media),
      $('<td>').text(situacao)
    );

    // Adicionar a nova linha ao corpo da tabela
    tableBody.append(newRow);
  });

}

// Função para preencher a tabela com dados do histórico escolar
function preencherTabelaBoletim(data) {
  var table = $('#boletimTable');

  // Limpar a tabela antes de adicionar novos registros
  table.empty();

  // Criar a tabela novamente
  table.append('<thead><tr><th>Disciplina</th><th>Freq.</th><th>N1</th><th>N2</th><th>Média</th><th>Situação</th></tr></thead>');
  var tableBody = $('<tbody>').attr('id', 'boletimBody');
  table.append(tableBody);

  // Iterar sobre os dados e adicionar linhas à tabela
  data.forEach(function (registro) {
    var disciplina = registro.disciplina.nomeDisciplina;
    var frequencia = registro.frequencia;
    var nota1 = registro.nota1;
    var nota2 = registro.nota2;
    var media = registro.media;
    var situacao = registro.situacao;

    // Adicionar uma nova linha à tabela
    var newRow = $('<tr>').append(
      $('<td>').text(disciplina),
      $('<td>').text(frequencia),
      $('<td>').text(nota1),
      $('<td>').text(nota2),
      $('<td>').text(media),
      $('<td>').text(situacao)
    );

    // Adicionar a nova linha ao corpo da tabela
    tableBody.append(newRow);
  });


}

function voltarHomePage() {
  $.mobile.changePage('#homePage', { transition: 'slide' });
}


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

  // Obtendo as informações do aluno do localStorage
  let alunoInfo = JSON.parse(localStorage.getItem('alunoInfo'));

  // Preenchendo os campos do formulário com as informações do aluno
  let nomeCompleto = alunoInfo.nomeAluno + ' ' + alunoInfo.sobrenomeAluno;
  $('#nomeAluno').val(nomeCompleto);
  $('#telefoneAluno').val(alunoInfo.telefoneAluno);
  $('#cepAluno').val(alunoInfo.cep);
  $('#ruaAluno').val(alunoInfo.nomeRua);
  $('#numeroAluno').val(alunoInfo.numeroRua);
  $('#bairroAluno').val(alunoInfo.nomeBairro);
  // Substituindo propriedade complementoMoradia por espaço em branco se for nulo
  let complementoMoradia = alunoInfo.complementoMoradia !== null ? alunoInfo.complementoMoradia : '';
  $('#complementoAluno').val(complementoMoradia);
  $('#cidadeAluno').val(alunoInfo.nomeCidade);
  $('#estadoAluno').val(alunoInfo.siglaEstado);

});


// Função para preencher os campos de endereço usando a API ViaCEP
function preencherEndereco(cep) {

  // Mostrar loader enquanto aguarda resposta do servidor
  $.mobile.loading("show", {
    text: "Validando CEP...",
    textVisible: true,
    theme: "b",
    textonly: false
  });

  $.ajax({
    url: `https://viacep.com.br/ws/${cep}/json/`,
    dataType: 'json',
    success: function (data) {

      // Ocultar loader após a resposta do servidor
      $.mobile.loading("hide");
      if (!data.erro) {

        $('#ruaAluno').val(data.logradouro);
        $('#bairroAluno').val(data.bairro);
        $('#cidadeAluno').val(data.localidade);
        $('#estadoAluno').val(data.uf);

      } else {

        showCustomPopup('CEP não encontrado');

      }
    },
    error: function () {
      // Ocultar loader após a resposta do servidor
      $.mobile.loading("hide");
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
    showCustomPopup("CEP inválido. Informe os 8 dígitos do CEP.");
  }
});



$(document).on("pagecreate", "#alunoDetalhesPage", function () {
  // Obtendo as informações do aluno do localStorage
  let alunoInfo = JSON.parse(localStorage.getItem('alunoInfo'));

  // Populando os campos do formulário com as informações do aluno
  let nomeCompleto = alunoInfo.nomeAluno + ' ' + alunoInfo.sobrenomeAluno;
  $('#nomeAluno').val(nomeCompleto);
  $('#telefoneAluno').val(alunoInfo.telefoneAluno);

  $('#cepAluno').val(alunoInfo.cep);
  $('#ruaAluno').val(alunoInfo.nomeRua);
  $('#numeroAluno').val(alunoInfo.numeroRua);
  $('#bairroAluno').val(alunoInfo.nomeBairro);
  // Substituindo propriedade complementoMoradia por espaço em branco se for nulo
  let complementoMoradia = alunoInfo.complementoMoradia !== null ? alunoInfo.complementoMoradia : '';
  $('#complementoAluno').val(complementoMoradia);
  $('#cidadeAluno').val(alunoInfo.nomeCidade);
  $('#estadoAluno').val(alunoInfo.siglaEstado);


  $('#alunoDetalhesForm').on('submit', function (event) {

    event.preventDefault();
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
      showCustomPopup('Por favor, insira um número de telefone válido no formato (xx) xxxxx-xxxx ou (xx) xxxx-xxxx');
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

      // Convertendo o objeto para JSON
      let jsonData = JSON.stringify(dadosAluno);

      // Mostrar loader enquanto aguarda resposta do servidor
      $.mobile.loading("show", {
        text: "Validando...",
        textVisible: true,
        theme: "b",
        textonly: false
      });

      // Inicio da Requisição de alterar o cadastro
      let url = "https://itelysium.onrender.com/aluno/alterar";
      $.ajax({
        url: url,
        method: "PUT",
        dataType: "json",
        data: jsonData,
        contentType: "application/json",
        success: function (data) {

          // Altero o dado local do aluno
          localStorage.setItem('alunoInfo', JSON.stringify(data));

          // Ocultar loader após a resposta do servidor
          $.mobile.loading("hide");

          // Redirecionar para a homePage após o sucesso
          $.mobile.changePage('#homePage', { transition: 'slide' });
        },
        error: function (xhr, status, error) {

          console.error('Erro:', status, error);
          console.log(xhr.responseText); // Adicione esta linha para imprimir a resposta do servidor
          // Ocultar loader em caso de erro de comunicação ou timeout
          $.mobile.loading("hide");

          if (status === "timeout") {
            showCustomPopup('Tempo limite de conexão atingido. Tente novamente mais tarde.');
          } else {
            showCustomPopup('Sem comunicação com o servidor.');
          }
        }
      });
      //fim da requisição da alteração do aluno
    }


  });

});

const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const app = express();
 
const db = require ('./database');

app.use(express.static('public'));//arquivos estatios sao armazenados na pasta public, navegador pode accesar os arquivos sem o servidor processar
app.use(bodyParser.urlencoded({ extended: true })); //os dados que sao informados no formulario chegam para o servidor como um ojbeto js. O extend true perimite trabalhar com objetos mais complexos
app.use(cookieParser()); // vai ler os cookies acessados pelo cliente quando insere algu dado, pode criar ou modificar os cookies que serão enviados ao cliente
app.use(
  session({
    secret: 'chave-super-secreta', // chave secreta para que algum outro usuario babaca nao consiga alterar o cookie
    resave: false, //servidor vai salvar uma sessão novamente no armazenamento somente se ela for modificada.
    saveUninitialized: false, //vai criar uma sessão para o usuario mesmo se ele nao tiver inserido nenhum dado.
    cookie: { maxAge: 30 * 60 * 1000 }, // 30 minutos
  })
);

let users = [];
let messages = [];

const requireLogin = (req, res, next) => {
    if (req.session.loggedIn) {
      return next();  // Usuário logado, permite continuar para a próxima função
    } else {
      res.redirect('/login.html');  // Usuário não logado, redireciona para o login
    }
  };

app.get('/usuarios', (req, res) => {
    res.json(users);  // Retorna a lista de usuários como JSON
  });

  app.get('/',requireLogin, (req, res) => {
    const lastAccess = req.cookies.lastAccess || 'Primeiro acesso';
    res.send(`
      <h1>Bem-vindo, ${req.session.user || 'Usuário'}</h1>
      <p>Último acesso: ${lastAccess}</p>
      <a href="/cadastroUsuario.html">Cadastro de Usuários</a><br>
      <a href="/batePapo.html">Bate-papo</a><br>
      <a href="/logout">Logout</a>
    `);
  });

  
  /*---------------------Login--------------------*/
  app.post('/login', (req, res) => {
    const { username, password } = req.body; // o req.body vai ter os dados que foram enviados do formulario, usa desestruturação.
    if (username === 'admin' && password === 'password') {
      req.session.loggedIn = true; // usuario logado, pode acessar o chat
      req.session.user = username;
      res.cookie('lastAccess', new Date().toLocaleString()); // criar um cookie(lastAcess) para armazazenar os dados de horario do ultimo acesso. 
      res.redirect('/'); // redireciona para a pagina principal
    } else {
      res.send('<h1>Dados Incorretos</h1><a href="/login.html">Tentar novamente</a>');
    }
  });

/*---------------------Logout--------------------*/

  app.get('/logout', (req, res) => {
    req.session.destroy(); // exclui a sessão e consequentemente os dados inseridos
    res.redirect('/login.html');
  });


 /*---------------------Cadastrar--------------------*/ 
  app.post('/cadastrarUsuario', requireLogin, (req, res) => {
    const { nome, dataNascimento, apelido } = req.body; // armazena os dados do nome data de nascimento e apelido no req.body, usando desestruturação
  
    if (!nome || !dataNascimento || !apelido) {
      return res.send('<h1>Preencha todos os Campos!</h1><a href="/cadastroUsuario.html">Voltar</a>');
    }
  
    db.addUser({ nome, dataNascimento, apelido }); // chamando a funcao de adicionar usuarios.
    const users = db.getUsers(); //funcao que mostra a lista dos usuarios cadastrado.
    res.send(`
      <h1>Usuários Cadastrados:</h1>
      <ul>${users.map(user => `<li>${user.nome} (${user.apelido})</li>`).join('')}</ul> 
      <a href="/cadastroUsuario.html">Novo Cadastro</a><br>
      <a href="/">Menu</a>
    `); // lista os nomes e apelidos dos usuarios cadastrados    
  });

       /*---------------------Chat-------------------*/ 
       

       /*---------------------Mostrar Mensagem - Chat--------------------*/ 
  app.get('/batePapo.html',(req,res)=> {
    const lastAcess = req.cookies.lastAccess || 'Primeiro Acesso';
    res.send( `
         <h1>Bate-papo</h1>
    <form method="POST" action="/postarMensagem">
      <label>Usuário:</label>
      <select name="usuario" required id="usuarioSelect">
        <!-- Os usuários serão preenchidos pelo JavaScript -->
      </select><br>
      <label>Mensagem:</label><textarea name="mensagem" required></textarea><br>
      <button type="submit">Enviar</button>
    </form>
    <h2>Mensagens</h2>
    <ul>${messages.map(msg => `<li>[${msg.dataHora}] ${msg.usuario}: ${msg.mensagem}</li>`).join('')}</ul>
    <a href="/">Menu</a>

    <script>
      // Popula o select com os usuários cadastrados
      fetch('/usuarios')
        .then(response => response.json())
        .then(users => {
          const select = document.getElementById('usuarioSelect');
          users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.apelido;
            option.textContent = user.nome;
            select.appendChild(option);
          });
        })
        .catch(error => console.error('Erro ao carregar usuários:', error));
    </script>`)
  })

       /*---------------------Postar Mensagem - Chat--------------------*/ 
       
  app.post('/postarMensagem', (req, res) => {
    const { usuario, mensagem } = req.body; // armazena o usuario e a mensagem no req.body
    if (!usuario || !mensagem) {
      return res.send('<h1>Usuário e mensagem são obrigatórios</h1><a href="/batePapo.html">Voltar</a>');
    }
    messages.push({ usuario,
                    mensagem,
                    dataHora: new Date().toLocaleString() ,// adicionar mensagem no "banco de dados" na hora exata em que for postada(dataHora: new Date().toLocaleString())})
   }); 
  });

  app.listen(3000, () => {
    console.log('servidor rodando em http:S//localhost:3000');
  });
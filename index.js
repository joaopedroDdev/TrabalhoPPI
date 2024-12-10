const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

app.use(express.urlencoded({ extended: true })); // processar dados enviados por formulários
app.use(express.json()); // Para processar JSON 
app.use(express.static('public'));//arquivos estatios sao armazenados na pasta public, navegador pode accesar os arquivos sem o servidor processar
app.use(bodyParser.urlencoded({ extended: true })); //os dados que sao informados no formulario chegam para o servidor como um ojbeto js. O extend true perimite trabalhar com objetos mais complexos
app.use(bodyParser.json());
app.use(cookieParser()); // vai ler os cookies acessados pelo cliente quando insere algu dado, pode criar ou modificar os cookies que serão enviados ao cliente
app.use(
  session({
    secret: 'chave-super-secreta', // chave secreta para que algum outro usuario babaca nao consiga alterar o cookie
    resave: false, //servidor vai salvar uma sessão novamente no armazenamento somente se ela for modificada.
    saveUninitialized: false, //vai criar uma sessão para o usuario mesmo se ele nao tiver inserido nenhum dado.
    cookie: { maxAge: 30 * 60 * 1000 }, // 30 minutos
  })
);



var usuarios  = [];
var mensagens = [];

app.get('/', (req, res) => {
  res.redirect('/login.html'); 
});


app.get('/api/user-info', (req, res) => {
  if (!req.session || !req.session.user) {
    // usuário não logado
    return res.status(401).json({ error: 'Usuário não está logado' });
  }

  // Pegando o último acesso dos cookies ou o primeirp
  const lastAccess = req.cookies.lastAccess || 'Primeiro acesso';

  // Enviando a resposta em formato JSON
  res.json({
    user: req.session.usuario, // usuario logado
    lastAccess: lastAccess, // ultimo acesso
  });
});

const requireLogin = (req, res, next) => {
    if (req.session.loggedIn) {
      return next();  // usuariop logado, permite continuar para a próxima função
    } else {
      res.redirect('/login.html');  // usuario não logado, redireciona para o login
    }
  };

app.get('/usuarios', (req, res) => {
    res.json(usuarios);  // Retorna a lista de usuários como JSON
  });


  /*---------------------Menu--------------------*/


  app.get('/menu', (req, res) => {
    if (!req.session.user) {
      return res.redirect('/login.html');
    }
  
    const Agora = new Date().toLocaleString();
    res.cookie('lastAccess', Agora, { maxAge: 1800000, path: '/menu.html' }); 
  
    res.sendFile(path.join(__dirname, 'public', 'menu.html'));
  });
  


  
  /*---------------------Login--------------------*/
  app.post('/login', (req, res) => {
    const { email, senha } = req.body; // o req.body vai ter os dados que foram enviados do formulario, usa desestruturação.
    if (email === 'email@exemploppi.com' && senha === 'trabalhofinal') {
      req.session.user = email; 
      req.session.loggedIn = true;
      res.redirect('/menu.html'); // redireciona para a pagina de menu
      } 
      else {
      res.send('<h1>Dados Incorretos</h1><a href="/login.html">Tentar novamente</a>');
    }
  });

/*---------------------Logout--------------------*/

  app.get('/logout', (req, res) => {
    req.session.destroy(); // exclui a sessão e consequentemente os dados inseridos
    res.redirect('/login.html');
  });


 /*---------------------Cadastrar--------------------*/ 

 app.get('/cadastro_Usuario.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cadastro_Usuario.html'));
});

app.post('/cadastrarUsuario', (req, res) => {
  const { nome, dataNascimento, apelido } = req.body;

  if (!nome || !dataNascimento || !apelido) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios!' });
  }

  if (new Date(dataNascimento) > new Date()) {
    return res.status(400).json({ error: 'Data de nascimento não pode ser no futuro!' });
}

  usuarios.push({ nome, dataNascimento, apelido });
  res.json({ success: true, message: 'Usuário cadastrado com sucesso!' });
});


       

  
       /*---------------------Mostrar Mensagem - Chat--------------------*/ 

 app.get('api/usuarios',(req, res)=>{ // lista de usuarios
  res.json({usuarios})

  app.get('/mensagens', (req, res) => {
    res.json(mensagens); 
  });

 app.post('/postarMensagem', requireLogin, (req,res)=>{
  const { usuario, mensagem } = req.body;  

  if(!usuario || !mensagem){
    return res.status(400).send('Usuario e mensagem são obrigatórios!!  </h1><a href="/chat.html">Voltar</a>')
  }
 })
const novaMesnagem = {
  usuario,
  mensagem,
  dataHora: new Date().toLocaleString()
}

 mensagens.push(novaMesnagem);

 res.redirect('/chat.html');
})

  app.listen(3001, () => {
    console.log('servidor rodando em http:S//localhost:3001');
  });
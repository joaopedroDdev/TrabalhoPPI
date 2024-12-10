const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const app = express();
const path = ('path');

app.use(express.urlencoded({ extended: true })); // processar dados enviados por formulários
app.use(express.json()); // Para processar JSON


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

let usuarios  = [];
let mensagens = [];

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
    user: req.session.user, // usuario logado
    lastAccess: lastAccess, // ultimo acesso
  });
});

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


  /*---------------------Menu--------------------*/


  app.get('/menu', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login.html');
    }

    const lastAccess = req.cookies.lastAccess || 'Primeiro acesso';
    res.cookie('lastAccess', new Date().toLocaleString(), { maxAge: 1800000 }); // cookie armazena as informaçõpes por 30 min
    res.sendFile(path.join(__dirname, 'public', 'menu.html'));
});


  
  /*---------------------Login--------------------*/
  app.post('/login', (req, res) => {
    const { email, senha } = req.body; // o req.body vai ter os dados que foram enviados do formulario, usa desestruturação.
    if (email === 'email@exemploppi.com' && password === 'trabalhofinal') {
      req.session.userf = email; 
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
  app.post('/cadastrarUsuario', requireLogin, (req, res) => {
    const { nome, dataNascimento, apelido } = req.body; // armazena os dados do nome data de nascimento e apelido no req.body, usando desestruturação
  
    if (!nome || !dataNascimento || !apelido) {
      return res.send('<h1>Preencha todos os Campos!</h1><a href="/cadastroUsuario.html">Voltar</a>');
    }
  
    usuarios.push({ nome, apelido, nascimento });

    const users = db.getUsers(); //funcao que mostra a lista dos usuarios cadastrado.
    res.redirect('/cadastro_Usuario.html')     
  });
       

       /*---------------------Mostrar Mensagem - Chat--------------------*/ 
 app.get('api/usuarios',(req, res)=>{ // lista de usuarios
  res.json({usuarios})
 

 app.post('/postarMensagem', (req,res)=>{
  const { usuario, mensagem } = req.body;  

  if(!usuario || !mensagem){
    return res.status(400).send('Usuario e mensagem são obrigatórios!!')
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

  app.listen(3000, () => {
    console.log('servidor rodando em http:S//localhost:3000');
  });
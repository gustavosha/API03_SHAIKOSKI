//eliminar uma task existente
//inserir uma nova task


//1 requires
const express = require("express");
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const mysql_config = require('./inc/mysql_config');
const functions = require('./inc/functions');

const API_AVAILABILITY = true;
const API_VERSION = '3.0.0';

const app = express();
app.listen(3000, () => {
    console.log("API está executando");
});

app.use(bodyParser.json());

app.use((req, res, next) => {
    if (API_AVAILABILITY) {
        next();
    } else {
        res.json(functions.response('atenção', 'API está em manutenção. Sinto muito', 0, null));
    }
});

const connection = mysql.createConnection(mysql_config);

app.use(cors());

//tratamento dos posts params
app.use(json());
//instrução que pede que o express trate os dados com o json

app.use(express.urlencoded({extended:true}));
//quando é enviado um pedido através do método host, os dados enviados 
//através de um formulário podem ser interpretados 
//SEM ESSES DOIS MIDLEWARE NÃO SERIA POSSÍVEL BUSCAR OS PARÂMETROS


//rotas
//rotas de entrada
app.get('/', (req, res) => {
    res.json(functions.response('sucesso', 'API está rodando', 0, null));
});

//rotas para pegar todas todas as tarefas
app.get("/tasks", (req, res) => {
    connection.query('SELECT * FROM tasks', (err, rows) => {
        if (!err) {
            res.json(functions.response('sucesso', 'Tarefas recuperadas com sucesso', rows.length, rows));
        } else {
            res.json(functions.response('erro', err.message, 0, null));
        }
    });
});

// rota para pegar a task pelo id
app.get('/tasks/:id', (req, res) => {
    const id = req.params.id;
    connection.query('SELECT * FROM tasks WHERE id = ?', [id], (err, rows) => {
        if (!err) {
            // devolver os dados da task
            if (rows.length > 0) {
                res.json(functions.response('sucesso', 'Sucesso na pesquisa', rows.length, rows));
            } else {
                res.json(functions.response('atenção', 'Não foi possível encontrar a task solicitada', 0, null));
            }
        } else {
            res.json(functions.response('erro', err.message, 0, null));
        }
    });
});

// Atualizar o status de uma task . método put
app.put('/tasks/:id/status', (req, res) => {
    const id = req.params.id;
    const status = req.body.status; // status deve ser passado no corpo da requisição

    // Lógica para atualizar o status da task
    connection.query('UPDATE tasks SET status = ? WHERE id = ?', [status, id], (err, results) => {
        if (!err) {
            if (results.affectedRows > 0) {
                res.json(functions.response('sucesso', 'Status atualizado com sucesso', results.affectedRows, null));
            } else {
                res.json(functions.response('atenção', 'Task não encontrada', 0, null));
            }
        } else {
            res.json(functions.response('erro', err.message, 0, null));
        }
    });
});

//rota para deletar uma tarefa
app.delete('/tasks/:id/delete', (req, res)=>{
    const id = req.params.id;
    connection.query('DELETE FROM tasks WHERE id=?',[id],(err,rows)=>{
        if(!err){
            if(rows.affecteddRows>0){
                res.json(functions.response('sucesso','Task deletada',rows.affectedRows, null))
            }
            else{
                res.json(functions.response('atenção','Task não encontrada', 0, null))
            }
        }
        else{
            res.json(functions.response('Erro',err.message,0,null))
        }
    })
})
//rota para inserir uma nova task

app.put('/tasks/create', (req,res)=>{
    //midleware para a recepção dos dados da tarefa(tasks)

    //pegando os dados da request
    const post_data = req.body;

    //checar para ver se não estamos recebendo uma json vazia
    if(post_data==undefined){
        res.json(functions.response('Atenção','Sem dados de uma nova task',0,null))
        return;
    }
    const task = post_data.task;
    const status = post_data.status;


    //inserindo a nova task
    connection.query('INSERT INTO tasks(task,status,created_at,updated_at) VALUES(?,?,NOW(),NOW()',[task,status],(err,rows)=>{
        if(!err){
            res.json('Sucesso','task cadastrada com alegria no banco',rows,affectedRows,null)
        }
        else{
            res.json(functions.response('Erro',err.message,0,null))
        }
    })
})


// middleware para caso alguma rota não seja encontrada
app.use((req, res) => {
    res.status(404).json(functions.response('atenção', 'Rota não encontrada', 0, null));
});
